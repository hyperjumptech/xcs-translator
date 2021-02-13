import express from 'express'
import * as http from 'http'
import { logger } from './internal/logger'
import errorHandler from './internal/middleware/error-handler'
import uploads from './service/uploads'

import { cfg } from './config'
import { endPool, getConnection } from './database/mariadb'
import { AppError, commonHTTPErrors } from './internal/app-error'
import { PoolConnection } from 'mariadb'

const app = express()
const port = cfg.port

app.use(express.static('public'))

let conns: PoolConnection[]

app.get('/health', async (_, res, next) => {
  try {
    for (let i = 0; i < cfg.db.length; i++) {
      const con = await getConnection(cfg.db[i].id)
      if (con) {
        con.query('SELECT 1')
        conns.push(con)
      }
    }
  } catch (error) {
    const err = new AppError(
      commonHTTPErrors.unprocessableEntity,
      'Database is not connected',
      false,
    )
    next(err)
  } finally {
    for (const con of conns) {
      con.release()
    }
    return
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
    endPool()
    logger.close()
    server.close()
  }
}

// gracefully shutdown system if these processes is occured
process.on('SIGINT', stopServer)
process.on('SIGTERM', stopServer)
