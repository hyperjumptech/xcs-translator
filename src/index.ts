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

import express from 'express'
import * as http from 'http'
import { PoolConnection } from 'mariadb'
import { logger } from './internal/logger'
import errorHandler from './internal/middleware/error-handler'
import uploads from './service/uploads'
import { cfg } from './config'
import { endPool, getConnection } from './database/mariadb'
import { AppError, commonHTTPErrors } from './internal/app-error'
import { initStorage } from './internal/storageInitializer'

// create and initialize storage directory if not exist
initStorage()

const app = express()
const port = cfg.port

app.use(express.static('public'))

app.get('/health', async (_, res, next) => {
  let conns: PoolConnection[] = []
  try {
    await Promise.all(
      cfg.db.map(async database => {
        if (!database.id) {
          throw new Error('Database id is not found')
        }
        const conn = await getConnection(database.id)
        if (conn) {
          conns.push(conn)
          await conn.query('SELECT 1')
        }
      }),
    )

    res.status(200).json({ alive: true, is_all_db_connected: true })
  } catch (error) {
    const err = new AppError(
      commonHTTPErrors.unprocessableEntity,
      `Database is not connected: ${error.message}`,
      false,
    )
    next(err)
  } finally {
    conns.forEach(conn => conn.release())
  }
})
app.use(uploads)
app.use(errorHandler())

let server: http.Server
;(async () => {
  server = app.listen(port, () => {
    logger.info(`  Listening on port ${port} in ${cfg.env} mode`)
    logger.info('  Press CTRL-C to stop\n')
  })
})()

const stopServer = async () => {
  logger.info('  Shutting down the server . . .')
  if (server.listening) {
    await endPool()
    logger.close()
    server.close()
  }
}

// gracefully shutdown system if these processes is occured
process.on('SIGINT', stopServer)
process.on('SIGTERM', stopServer)
