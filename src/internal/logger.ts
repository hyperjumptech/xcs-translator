import winston from 'winston'
import { cfg } from '../config'

const transports = [
  new winston.transports.Console({
    level: cfg.env === 'production' ? 'info' : 'debug',
  }),
]

const options: winston.LoggerOptions = {
  transports,
}

export const logger = winston.createLogger(options)
logger.debug('  Logging initialized at debug level')
