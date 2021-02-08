import express from 'express'
import * as http from 'http'
import { logger } from './utils/logger'

import { cfg } from './config'

const app = express()
const port = cfg.port

app.use(express.static('public'))

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
    logger.close()
    server.close()
  }
}

// gracefully shutdown system if these processes is occured
process.on('SIGINT', stopServer)
process.on('SIGTERM', stopServer)
