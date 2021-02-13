import dotenv from 'dotenv'

dotenv.config()

interface dbConfig {
  host: string | undefined
  port: number
  database: string | undefined
  user: string | undefined
  password: string | undefined
  connectionLimit: number | undefined
}

interface Config {
  env: string
  port: string
  db1: dbConfig
  db2: dbConfig
}

export const cfg: Config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || '8080',
  db1: {
    host: process.env.DB_HOST,
    port: parseInt(String(process.env.DB_PORT), 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionLimit: parseInt(String(process.env.DB_CONNECTION_LIMIT), 10),
  },
  db2: {
    host: process.env.DB2_HOST,
    port: parseInt(String(process.env.DB2_PORT), 10) || 3307,
    database: process.env.DB2_NAME,
    user: process.env.DB2_USER,
    password: process.env.DB2_PASSWORD,
    connectionLimit: parseInt(String(process.env.DB2_CONNECTION_LIMIT), 10),
  },
}

export { sheetConfig } from './sheet'
