# XCS Translator

XCS Translator is a conversion tools to help you upload an EXCEL file, it will then convert the uploaded file into JSON and also SQL. Enabling you to quickly upload EXCEL sheet into your database.

First you need to define your excel template in `sheetconfig.json` file. All uploaded data will be validated against the template definition. You can also add format constraints for each column using [validate.js](https://validatejs.org/#validators) syntax.

The uploaded files will be availabe in `storage` directory with following structure:

```bash
storage
├── data1
│   ├── archive
│   │   ├── excel
│   │   └── json
│   ├── excel
│   ├── failed
│   │   ├── excel
│   │   └── json
│   └── json
└── data2
    ├── archive
    │   ├── excel
    │   └── json
    ├── excel
    ├── failed
    │   ├── excel
    │   └── json
    └── json
```

While it's processed, the uploaded file resides under `data1` or `data2` (depends on which data is uploaded) inside `excel` directory for raw file, and `json` directory after it's converted to json. Then it will move to `archive` directory if no error happens and data is successfully inserted into database, or to `failed` directory if there is error. The failed files should be fixed manually and uploaded again.

## Requirements

You need [Node.js](https://nodejs.org/en/) v10.22 or greater to be available in your system.

## Run in development mode

- Run `cp .env.example .env`
- Edit .env placeholder value
- Edit sheetconfig.json file
- Run `npm run ci`
- Run `npm run dev`
- Server is running in configured port (default to 8080)

## Run in production mode

- Run `cp .env.example .env`
- Edit .env placeholder value
- Edit sheetconfig.json file
- Run `npm run ci`
- Run `npm start`
- Server is running in configured port (default to 8080)

## Going to production practices

- Set NODE_ENV=production in .env file
- Use [PM2](https://pm2.keymetrics.io/) to manage Node.js process

## Clear archive directory

- Run `npm run clear-archive`
