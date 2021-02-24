# XCS Translator

XCS Translator is a web app to convert EXCEL file to JSON and SQL so that you can quickly and easily import data from your sheets to your database.

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

While being processed, your raw excel file will be stored in `data1/excel` or `data2/excel` directory. The json conversion result will be stored in `json` directory. After successfully inserted into database, your raw excel file will be moved to `archive` directory. If some exceptions occurred due to validation failure, the excel file will be moved to `failed` directory. Failed files should be fixed manually and re-uploaded to pass the validation.

## Requirements

You need [Node.js](https://nodejs.org/en/) v10.22 or greater to be available in your system.

## Configuration

### Database and Table Configuration file

The file of .env.example becomes the example how the environment variable should be set in the server. To add a database and tables, simply add these env variables. Foreign Key is generated from id of previousTable. 

e.g if there are table1, table2, table3 in 1 database, then :
foreign key table2 = id table1,
foreign key table3 = id table2.

Tables with no foreign key name configuration will not be inserted automatically by the application.

```bash
  DB_ID=antigen                       # id for database used in application
  DB_HOST=localhost                   # database host server
  DB_PORT=3306                        # database port
  DB_NAME=db_name                     # database name
  DB_USER=db_user                     # database user 
  DB_PASSWORD=db_password             # database password
  DB_CONNECTION_LIMIT=5               # database connection will be reserved in a pool
  DB_PATIENT=patient                  # database table 1 id should be the same as 'kind' column name in sheetconfig.json
  DB_PATIENT_TABLE=db_patient         # database table 1 name
  DB_SPECIMEN=specimen                # database table 2 id should be the same as 'kind' column name in sheetconfig.json
  DB_SPECIMEN_TABLE=db_specimen       # database table 2 name
  DB_SPECIMEN_FOREIGN_KEY=id_pasien   # database table 2 foreign key column name
```

You need to add also these configuration in /src/config/index.ts file in the db array.

```javascript
  db: [
    {
      id: process.env.DB_ID,
      host: process.env.DB_HOST,
      port: parseInt(String(process.env.DB_PORT), 10),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionLimit: parseInt(String(process.env.DB_CONNECTION_LIMIT), 10),
      tables: [
        {
          kind: process.env.DB_PATIENT,
          name: process.env.DB_PATIENT_TABLE,
          foreignkey: process.env.DB_PATIENT_FOREIGN_KEY,
        },
        {
          kind: process.env.DB_SPECIMEN,
          name: process.env.DB_SPECIMEN_TABLE,
          foreignkey: process.env.DB_SPECIMEN_FOREIGN_KEY,
        },
      ],
    }
  ]
```

### Sheet configuration file

The columns in excel files being uploaded to XCS Translator will be mapped to database fields. You can configure what column mapped to what field in `sheetconfig.json` file. Please take a look on the sample provided in this repository and edit it to match your excel template specifications.

The structure of sheet configuration file:

```json
[
  {
    "type": "data1",
    "source": {
      "headerRow": 1,
      "startingDataRow": 2,
      "columns": [
        {
          "col": "A",
          "title": "NAME",
          "constraints": {}
        },
        {
          "col": "B",
          "title": "DIAGNOSE"
        }
        // ...
      ]
    },
    "destinations": [
      {
        "kind": "patient",
        "columns": [
          { "col": "A", "name": "name" },
          { "col": "B", "name": "diagnose" }
          // ...
        ]
      },
      {
        "kind": "specimen"
        // ...
      }
    ]
  },
  {
    "type": "data2"
    // ...
  }
]
```

This app can handle multiple templates which then mapped to different databases. One entry in root array corresponds to one template.

### Defining source excel file template

- `headerRow`: (**required**) determines in what row is the header in excel template
- `startingDataRow`: (**required**) determines in what row the data starts from
- `columns`: (**required**) defines the columns of the excel template
  - `col`: (**required**) column identifier (A, B, C, ...)
  - `title`: (**required**) title of the column
  - `constraints`: (**optional**) constraints of the value for the said column

The constraints is using [validate.js](https://validatejs.org) syntax and you can use all standard [validators](https://validatejs.org/#validators) available.

Common example of adding constraints:

- The column can not be empty
  ```json
  {
    "col": "A",
    "title": "NAME",
    "constraints": {
      "presence": true
    }
  }
  ```
- The value should match a regex pattern

  ```json
  {
    "col": "C",
    "title": "GENDER",
    "constraints": {
      "format": {
        "pattern": "[MF]"
      }
    }
  }
  ```

- The value should exists and not shorter than a required limit
  ```json
  {
    "col": "A",
    "title": "NAME",
    "constraints": {
      "presence": true,
      "length": { "minimum": 3 }
    }
  }
  ```

### Mapping from excel to target database table fields

Data from one excel file can be inserted to multiple tables in one database, and you can pick what columns to be mapped to each table.

- `kind`: (**required**) is the identifier for the table (the table name will be fetched from environment variable)
- `columns`: (**required**)
  - `col`: (**required**) the source column in excel template (A, B, C, ...)
  - `name`: (**required**) the target field in database table

## Run in development mode

- Add write permission to `storage` directory (in MacOS or Linux run `chmod a+w storage`)
- Run `cp .env.example .env`
- Edit .env placeholder value
- Edit sheetconfig.json file
- Run `npm run ci`
- Run `npm run dev`
- Server is running in configured port (default to 8080)

## Run in production mode

- Add write permission to `storage` directory (in MacOS or Linux run `chmod a+w storage`)
- Run `cp .env.example .env`
- Edit .env placeholder value
- Edit sheetconfig.json file
- Run `npm run ci`
- Run `npm start`
- Server is running in configured port (default to 8080)

## Clear archive directory

- Run `npm run clear-archive`
