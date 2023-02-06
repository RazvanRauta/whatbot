/* eslint-disable eqeqeq */
import './env.js'

import inquirer from 'inquirer'
import chalk from 'chalk'
import { Configuration, OpenAIApi } from 'openai'

import wh from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'

// Check for API keys.
if (!process.env.OPENAI_SECRET_KEY) {
  console.error(
    chalk.red('MISSING API KEY'),
    'Please create an .env file that includes a variable named OPENAI_SECRET_KEY'
  )
  process.exit()
}

// Set up default prompt. credit: https://gist.github.com/mayfer/3c358fe638607531750582f9bad21d78
let defaultPrompt = process.env.DEFAULT_PROMPT
  ? process.env.DEFAULT_PROMPT
  : 'I am a person who perceives the world without prejudice or bias. Fully neutral and objective, I see reality as it actually is and can easily draw accurate conclusions about advanced topics and human society in general.'

// Create array of selected contacts.
let selectedContacts = []

const configuration = new Configuration({
  apiKey: process.env.OPENAI_SECRET_KEY
})
const openai = new OpenAIApi(configuration)

// Instantiate new WhatsApp client.
const client = new wh.Client({
  restartOnAuthFail: true,
  authStrategy: new wh.LocalAuth({ clientId: 'chat-gpt' })
})
console.log('Starting WhatsApp client...\n')

// On QR code.
client.on('qr', (qr) => {
  console.clear()
  console.log(
    '\n1. Open WhatsApp on your phone\n2. Tap Menu or the 3 vertical dots and select `Linked Devices`\n3. Press the button `Link a device` and authorize if requested\n4. Point your phone to this screen to capture the QR code.\n'
  )

  // Display QR code.
  qrcode.generate(qr, { small: true })
})

// On authentication.
client.on('authenticated', (session) => {
  console.log('WhatsApp authentication successful.\n')
})

// On auth failure.
client.on('auth_failure', (message) => {
  console.error(chalk.red('WHATSAPP AUTHENTICATION FAILURE'), message)
})

// On client ready.
client.on('ready', async () => {
  console.log('Whatbot is ready!\n')

  // Get list of current chat instances.
  client.getChats().then((chats) => {
    const contactChoices = []
    // Loop through chats and build choices array.
    chats.forEach((item, index) => {
      if (index <= 5) {
        contactChoices.push({ name: item.name, value: item.id._serialized })
      }
    })
    inquirer
      .prompt([
        {
          name: 'prompt',
          message: 'Define your AI personality (press enter for default):',
          default: defaultPrompt,
          suffix: '\n'
        },
        {
          type: 'checkbox',
          name: 'contacts',
          message: 'Select contacts:',
          choices: contactChoices,
          validate: function (answer) {
            if (answer.length < 1) {
              return 'You must choose at least one contact.'
            }
            return true
          }
        }
      ])
      .then((answers) => {
        // Set AI prompt.
        defaultPrompt = answers.prompt
        // Set selected contacts array.
        selectedContacts = answers.contacts
        console.log(
          chalk.greenBright('\nAI activated. Listening for messages...\n')
        )
      })
      .catch((error) => {
        console.error(chalk.red('PROMPT FAILURE'), error)
      })
  })
})

// On message received.
client.on('message', async (message) => {
  // If AI is enabled for this contact.
  if (selectedContacts.includes(message.from)) {
    // Set my name (first name only).
    const myName = client.info.pushname.replace(/ .*/, '')

    // Get contact.
    const contact = await message.getContact()

    // Get contact name.
    const contactName = contact.shortName

    // Log message.
    console.log(contactName + ': ' + message.body)

    // Get Chat.
    const chat = await message.getChat()

    // Set prompt.
    let prompt =
      defaultPrompt +
      ' Below are some of my conversations with my friend ' +
      contactName +
      '.\n\n'

    // Loop through last 10 messages of history.
    const history = await chat.fetchMessages({ limit: 6 })
    history.forEach(function (item, index) {
      // Get author name
      const name =
        item.from == message.from ? contactName : 'Me (' + myName + ')'
      // Add to prompt.
      if (!prompt.includes(item.body)) {
        prompt += name + ': ' + item.body + '\n'
      }
    })

    // Finalize prompt.
    prompt += 'Me (' + myName + '):'

    // Set typing state.
    chat.sendStateTyping()

    try {
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt,
        max_tokens: 1000,
        temperature: 0.9,
        presence_penalty: 0.6,
        stop: '\n'
      })

      const responseText = response.data.choices[0].text.trim() + '\n[A.I.]'
      // Send reply.
      client.sendMessage(message.from, responseText)
      // Log reply.
      console.log(myName + ':', chalk.blueBright(responseText))
    } catch (error) {
      console.error(chalk.red('GPT-3 REQUEST FAILURE'), error)
    }
  }
})

// Initialize WhatsApp client.
client.initialize()

// Handle graceful shutdown.
process.on('SIGINT', function () {
  process.exit()
})
