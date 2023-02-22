#-------Deps-------#

FROM node:lts-alpine AS deps

ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

RUN apk add --no-cache libc6-compat chromium 

WORKDIR /app

COPY ./package*.json ./

RUN npm install


#-------Runner-------#

FROM node:lts-alpine as runner

RUN apk add chromium

WORKDIR /app

ENV NODE_ENV production

COPY --from=deps /app/node_modules ./node_modules

RUN cd ./node_modules/puppeteer && npm run install

RUN npm install -g pm2

EXPOSE 3001

CMD ["pm2-runtime", "index.js"]