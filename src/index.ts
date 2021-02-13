import express from 'express'
import * as http from 'http'
import { logger } from './internal/logger'
import errorHandler from './internal/middleware/error-handler'
import uploads from './service/uploads'

import { cfg } from './config'
import { endPool, getConnection } from './database/mariadb'
import { AppError, commonHTTPErrors } from './internal/app-error'

const app = express()
const port = cfg.port

app.use(express.static('public'))

app.get('/health', async (_, res, next) => {
  let connDB1, connDB2
  try {
    ;[connDB1, connDB2] = await Promise.all([
      getConnection('antigen'),
      getConnection('pcr'),
    ])
    await Promise.all([connDB1.query('SELECT 1'), connDB2.query('SELECT 1')])

    res.status(200).json({ alive: true, is_all_db_connected: true })
  } catch (error) {
    const err = new AppError(
      commonHTTPErrors.unprocessableEntity,
      'Database is not connected',
      false,
    )
    next(err)
  } finally {
    if (connDB1) connDB1.release()
    if (connDB2) connDB2.release()
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
