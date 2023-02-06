# About The Project

[Updated the dependencies to the latest version, uses ES Modules and `openai` library]

This is a basic chat bot for WhatsApp which uses the OpenAI API (GPT-3). It is written in JavaScript using Node.js.

## Prerequisites

* npm

```sh
npm install npm@latest -g
```

* API keys from OpenAI at [Api Keys](https://platform.openai.com/account/api-keys).

## Installation

1. Clone the repo

```sh
git clone https://github.com/theshanergy/whatbot.git
```

2. Install NPM packages

```sh
npm install
```

3. Create an .env file (see [.env.sample](./.env.sample)) containing your OpenAI secret API key as follows:

```sh
OPENAI_SECRET_KEY="<Secret key>"
```

4. Optionally set a default prompt in your .env file to give your bot a different personality:

```sh
DEFAULT_PROMPT="<Your custom prompt here>"
```

## Example Prompts

Prompts should be written in the first person and are used to define your bots personality and ego. ie:

> My name is Albert Einstein. I am a theoretical physicist who developed the theory of relativity.

The more detail you offer in your prompt, the better your responses will be.

## Usage

1. Run the bot:

```sh
npm run start
```

1. Open WhatsApp on your phone, select 'Linked devices' from the Menu, then scan the provided QR code.
2. Choose from the list of recent chats which you would like to activate the bot for. Use space key to select.
3. Sit back and watch the bot respond automatically to incoming messages from your selected contacts.
