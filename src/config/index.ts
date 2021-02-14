import dotenv from 'dotenv'

dotenv.config()

interface dbConfig {
  id: string
  host: string
  port: number
  database: string | undefined
  user: string | undefined
  password: string | undefined
  connectionLimit: number | undefined
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
      id: process.env.DB_ID || 'data1',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(String(process.env.DB_PORT), 10) || 3306,
      database: process.env.DBNAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionLimit: 5,
    },
    {
      id: process.env.DB2_ID || 'data2',
      host: process.env.DB2_HOST || 'localhost',
      port: parseInt(String(process.env.DB2_PORT), 10) || 3307,
      database: process.env.DB2_NAME,
      user: process.env.DB2_USER,
      password: process.env.DB2_PASSWORD,
      connectionLimit: 5,
    },
  ],
}

export { sheetConfig, SheetConfig } from './sheet'
