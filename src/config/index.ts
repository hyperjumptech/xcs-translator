import dotenv from 'dotenv'

dotenv.config()

interface dbConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
  connectionLimit: number
}

interface Config {
  env: string
  port: string
  antigenDatabase: dbConfig
  PCRDatabase: dbConfig
}

// TODO: Remove hardcode
export const cfg: Config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || '8080',
  antigenDatabase: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(String(process.env.DB_PORT), 10) || 3306,
    database: process.env.DBNAME || 'covid_antigen',
    user: process.env.DB_USER || 'dt_user',
    password: process.env.DB_PASSWORD || 'dt_password',
    connectionLimit: 5,
  },
  PCRDatabase: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(String(process.env.DB_PORT), 10) || 3307,
    database: process.env.DBNAME || 'covid19',
    user: process.env.DB_USER || 'dt_user',
    password: process.env.DB_PASSWORD || 'dt_password',
    connectionLimit: 5,
  },
}

export { sheetConfig } from './sheet'
