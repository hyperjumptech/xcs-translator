import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { NextFunction, Request, Response } from 'express'
import { AppError, commonHTTPErrors } from '../../internal/app-error'
import PubSub from '../../internal/pubsub'
import { logger } from '../../internal/logger'
import { convertFromFilePath } from '../../internal/xlsToCsv'

const pubsub = new PubSub()
const rename = promisify(fs.rename)

export function upload(req: Request, res: Response, next: NextFunction) {
  if (!req.file) {
    const err = new AppError(
      commonHTTPErrors.badRequest,
      'File is required',
      true,
    )
    next(err)
    return
  }

  const correlationID = req.headers['x-correlation-id']
  pubsub.publish('fileUploaded', { filePath: req.file.path, correlationID })

  res.status(202).send({ correlationID })
}

pubsub.subscribe('fileUploaded', async ({ message, _ }: any) => {
  const { filePath, correlationID } = message
  const getFileName = (filePath: string) => {
    const splitFileName = filePath.split('/')
    const fileName = splitFileName[splitFileName.length - 1]

    return fileName
  }
  const removeExtension = (fileName: string) => {
    const splitFileName = fileName.split('.')
    const fileNameWithoutExtension = splitFileName.filter(
      (_, index) => index !== splitFileName.length - 1,
    )

    return fileNameWithoutExtension
  }
  const fileName = getFileName(filePath)
  const csvFileName = removeExtension(fileName)

  try {
    // convert excel to csv
    convertFromFilePath(
      filePath,
      path.join(__dirname, `../../storage/csv/${csvFileName}.csv`),
    )

    // move excel file to archive directory
    await rename(
      filePath,
      path.join(__dirname, `../../storage/excel/archive/${fileName}`),
    )
  } catch (err) {
    logger.error(
      `Process with correlation id: ${correlationID}, file: ${filePath}, error: ${err.message}`,
    )
  }

  pubsub.publish('convertedToCSV', { correlationID })
})

pubsub.subscribe('convertedToCSV', ({ message, _ }: any) => {
  // To do: Convert to sql, archive csv file
  const { correlationID } = message
  pubsub.publish('convertedToSQL', { correlationID })
})

pubsub.subscribe('convertedToSQL', ({ message, _ }: any) => {
  const { correlationID } = message
  logger.info(`correlation ID: ${correlationID} is done`)
})
