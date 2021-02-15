import dotenv from 'dotenv'

dotenv.config()

interface dbConfig {
  id: string | undefined
  host: string | undefined
  port: number
  database: string | undefined
  user: string | undefined
  password: string | undefined
  connectionLimit: number | undefined
  patientTable: string | undefined
  specimentTable: string | undefined
}

interface Config {
  env: string
  port: string
  db: dbConfig[]
}

export const cfg: Config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || '8080',
  db: [
    {
      id: process.env.DB_ID,
      host: process.env.DB_HOST,
      port: parseInt(String(process.env.DB_PORT), 10),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionLimit: parseInt(String(process.env.DB_CONNECTION_LIMIT), 10),
      patientTable: process.env.DB_PATIENT_TABLE,
      specimentTable: process.env.DB_SPECIMEN_TABLE,
    },
    {
      id: process.env.DB2_ID,
      host: process.env.DB2_HOST,
      port: parseInt(String(process.env.DB2_PORT), 10),
      database: process.env.DB2_NAME,
      user: process.env.DB2_USER,
      password: process.env.DB2_PASSWORD,
      connectionLimit: parseInt(String(process.env.DB2_CONNECTION_LIMIT), 10),
      patientTable: process.env.DB2_PATIENT_TABLE,
      specimentTable: process.env.DB2_SPECIMEN_TABLE,
    },
  ],
}

export { sheetConfig, SheetConfig } from './sheet'
