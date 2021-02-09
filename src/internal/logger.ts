import winston from 'winston'
import expressWinston from 'express-winston'
import { cfg } from '../config'

const transports = [
  new winston.transports.Console({
    level: cfg.env === 'production' ? 'info' : 'debug',
  }),
]

const options: winston.LoggerOptions = {
  transports,
}

export const requestLogger = expressWinston.logger({
  transports,
  format: winston.format.combine(winston.format.json()),
  expressFormat: true,
  colorize: false,
  level: 'debug',
})

export const expressErrorLogger = expressWinston.errorLogger({
  transports,
  format: winston.format.combine(winston.format.json()),
  msg:
    '{{err.message}} {{res.statusCode}} {{req.method}} with error: {{err}} and request: {{req}} and response: {{res}}',
})

export const logger = winston.createLogger(options)
logger.debug('Logging initialized at debug level')
