import fs from 'fs'
import path from 'path'
import { NextFunction, Request, Response } from 'express'
import { AppError, commonHTTPErrors } from '../../internal/app-error'
import PubSub from '../../internal/pubsub'
import { convertFromFilePath } from '../../internal/xlsToCsv'

const pubsub = new PubSub()

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

  try {
    // convert excel to csv
    convertFromFilePath(
      filePath,
      path.join(__dirname, `../../storage/csv/${correlationID}.csv`),
    )

    // remove excel file
    fs.unlinkSync(filePath)
  } catch (err) {
    console.error(`Process with correlation id: ${correlationID}: ${err}`)
  }

  pubsub.publish('convertedToCSV', { correlationID })
})

pubsub.subscribe('convertedToCSV', ({ message, context }: any) => {
  // To do: Convert to sql, delete csv file
  const { correlationID } = message
  pubsub.publish('convertedToSQL', { correlationID })
})

pubsub.subscribe('convertedToSQL', ({ message, _ }: any) => {
  const { correlationID } = message
  console.info(`correlation ID: ${correlationID} is done`)
})
