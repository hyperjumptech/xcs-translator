/**********************************************************************************
 *                                                                                *
 *    Copyright (C) 2021  XCS TRANSLATOR Contributors                             *
 *                                                                                *
 *   This program is free software: you can redistribute it and/or modify         *
 *   it under the terms of the GNU Affero General Public License as published     *
 *   by the Free Software Foundation, either version 3 of the License, or         *
 *   (at your option) any later version.                                          *
 *                                                                                *
 *   This program is distributed in the hope that it will be useful,              *
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of               *
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                *
 *   GNU Affero General Public License for more details.                          *
 *                                                                                *
 *   You should have received a copy of the GNU Affero General Public License     *
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.       *
 *                                                                                *
 **********************************************************************************/

import { transports, format, LoggerOptions, createLogger } from 'winston'
import expressWinston from 'express-winston'
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

export const requestLogger = expressWinston.logger({
  transports: options.transports as transports.ConsoleTransportInstance[],
  expressFormat: true,
  level: 'info',
})

export const logger = createLogger(options)
logger.debug('  Logging initialized at debug level')
