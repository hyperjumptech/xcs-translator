import dotenv from 'dotenv'

dotenv.config()

interface Config {
  env: string
  port: string
}

export const cfg: Config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || '8080',
}

export { sheetConfig } from './sheet'
