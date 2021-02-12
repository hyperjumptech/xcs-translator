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
  // TODO: Remove hardcode
  let connAntigen, connPCR
  try {
    ;[connAntigen, connPCR] = await Promise.all([
      getConnection('antigen'),
      getConnection('pcr'),
    ])
    await Promise.all([
      connAntigen.query('SELECT 1'),
      connPCR.query('SELECT 1'),
    ])

    res.status(200).json({ alive: true, is_all_db_connected: true })
  } catch (error) {
    const err = new AppError(
      commonHTTPErrors.unprocessableEntity,
      'Database is not connected',
      false,
    )
    next(err)
  } finally {
    if (connAntigen) return connAntigen.release()
    if (connPCR) return connPCR.release()
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
