import { transports, format, LoggerOptions, createLogger } from 'winston'
import { cfg } from '../config'
const { combine, timestamp, colorize, simple, json, printf } = format

const productionTransport = [
  new transports.Console({
    level: 'info',
    format: combine(
      timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      json(),
    ),
  }),
  new transports.File({
    filename: 'error.log',
    level: 'error',
    format: combine(
      timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      simple(),
      printf(msg => `${msg.timestamp} - ${msg.level}: ${msg.message}`),
    ),
  }),
]
const developmentTransport = [
  new transports.Console({
    level: 'debug',
    format: combine(
      timestamp(),
      simple(),
      printf(msg =>
        colorize().colorize(
          msg.level,
          `${msg.timestamp} - ${msg.level}: ${msg.message}`,
        ),
      ),
    ),
  }),
]
const options: LoggerOptions = {
  transports:
    cfg.env === 'production' ? productionTransport : developmentTransport,
}

export const logger = createLogger(options)
logger.debug('  Logging initialized at debug level')
