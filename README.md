# xcs-translator

## Requirements

[Node.js](https://nodejs.org/en/) v10.22 or greater

## Run in development mode

- Run `cp .env.example .env`
- Edit .env placeholder value
- Run `npm run ci`
- Run `npm run dev`
- Server is running in configured port (default to 8080)

## Run in production mode

- Run `cp .env.example .env`
- Edit .env placeholder value
- Run `npm run ci`
- Run `npm start`
- Server is running in configured port (default to 8080)

## Going to production practices

- Set NODE_ENV=production in .env file
- Use [PM2](https://pm2.keymetrics.io/) to manage Node.js process

## Clear archive directory

- Run `npm run clear-archive`
