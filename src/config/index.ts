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
      id: process.env.ANTIGEN_DB_ID || 'antigen',
      host: process.env.ANTIGEN_DB_HOST || 'localhost',
      port: parseInt(String(process.env.ANTIGEN_DB_PORT), 10) || 3306,
      database: process.env.ANTIGEN_DBNAME || 'covid_antigen',
      user: process.env.ANTIGEN_DB_USER || 'dt_user',
      password: process.env.ANTIGEN_DB_PASSWORD || 'dt_password',
      connectionLimit: 5,
    },
    {
      id: process.env.PCR_DB_ID || 'pcr',
      host: process.env.PCR_DB_HOST || 'localhost',
      port: parseInt(String(process.env.PCR_DB_PORT), 10) || 3307,
      database: process.env.PCR_DBNAME || 'covid19',
      user: process.env.PCR_DB_USER || 'dt_user',
      password: process.env.PCR_DB_PASSWORD || 'dt_password',
      connectionLimit: 5,
    },
  ],
}

export { sheetConfig } from './sheet'
