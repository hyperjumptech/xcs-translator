# XCS Translator

XCS Translator is a conversion tools to help you upload an EXCEL file, it will then convert the uploaded file into JSON and also SQL. Enabling you to quickly upload EXCEL sheet into your database.

First you need to define your excel template in `sheetconfig.json` file. All uploaded data will be validated against the template definition. You can also add format constraints for each column using [validate.js](https://validatejs.org/#validators) syntax.

The uploaded files will be available in `storage` directory with following structure:

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

While being processed, your raw excel file will be stored in data1/excel or data2/excel directory. The json conversion result will be stored in json directory. After successfully inserted into database, your raw excel file will be moved to archive directory. If some exceptions occurred due to validation failure, the excel file will be moved to failed directory. Failed files should be fixed manually and re-uploaded to pass the validation.

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
