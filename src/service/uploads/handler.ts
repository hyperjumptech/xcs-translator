import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { NextFunction, Request, Response } from 'express'
import { readFile, utils } from 'xlsx'
import { AppError, commonHTTPErrors } from '../../internal/app-error'
import PubSub from '../../internal/pubsub'
import { logger } from '../../internal/logger'
import { letterRangeToArrayOfIndex } from '../../internal/rangeConverter'
import { sheetConfig } from '../../config'

const pubsub = new PubSub()
const rename = promisify(fs.rename)
const writeFile = promisify(fs.writeFile)
const fsReadFile = promisify(fs.readFile)

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
  pubsub.publish('onFileUploaded', {
    filePath: req.file.path,
    type: req.body['type'],
    correlationID,
  })

  res.status(202).send({ correlationID })
}

// excel to csv worker
pubsub.subscribe('onFileUploaded', async ({ message, _ }: any) => {
  const { filePath, type, correlationID } = message
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

  // convert excel to json
  const workbook = readFile(filePath)
  const worksheetname = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[worksheetname]
  const json = utils.sheet_to_json(worksheet, {
    range: 1,
    header: 1,
  })

  const { destinations } = sheetConfig[type as string]

  // convert json to csv
  for (let { columnRange, columnNames, kind } of destinations) {
    const dataColumnIndices = letterRangeToArrayOfIndex(columnRange)

    const data = json.map(record => {
      const values = dataColumnIndices.map(
        index => (record as any[])[index] || null,
      )
      let object: Record<string, unknown> = {}
      columnNames.forEach((col, index) => {
        object[col] = values[index]
      })
      return object
    })

    // write json file
    await writeFile(
      path.join(__dirname, `../../storage/json/${kind}/${csvFileName}.json`),
      JSON.stringify(data, null, 2),
    )

    // write csv file
    const writeStream = fs.createWriteStream(
      path.join(__dirname, `../../storage/csv/${kind}/${csvFileName}.csv`),
    )
    data.forEach((record: any) => {
      const row = Object.values(record).join(',') + '\n'
      writeStream.write(row)
    })
    writeStream.end()

    pubsub.publish('onConvertedToCSV', {
      csvFileName,
      type, // pcr or antigen
      kind, // patient or specimen
      correlationID,
    })
  }

  try {
    // move excel file to archive directory
    await rename(
      filePath,
      path.join(__dirname, `../../storage/archive/excel/${fileName}`),
    )
  } catch (err) {
    logger.error(
      `Process with correlation id: ${correlationID}, file: ${filePath}, error: ${err.message}`,
    )
  }
})

// csv to sql worker
pubsub.subscribe('onConvertedToCSV', async ({ message, _ }: any) => {
  const { csvFileName, type, kind, correlationID } = message
  const filePath = path.join(
    __dirname,
    `../../storage/json/${kind}/${csvFileName}.json`,
  )

  try {
    // read json file
    const data = await fsReadFile(filePath)
    const dataJSON = JSON.parse(String(data))
    const sqlFilePath = path.join(
      __dirname,
      `../../storage/sql/${kind}/${csvFileName}.sql`,
    )
    const getTableName = (
      pcrOrAntigen: string,
      patientOrSpeciment: string,
    ): string => {
      switch (patientOrSpeciment) {
        case 'patient':
          return `dt_${pcrOrAntigen}_pasien`
        case 'specimen':
          return `dt_${pcrOrAntigen}_sampel`
        default:
          return ''
      }
    }

    // write convert json to sql
    const writeStream = fs.createWriteStream(sqlFilePath)
    dataJSON.forEach((data: any) => {
      const tableName = getTableName(type, kind)
      const tableColumns = Object.keys(data).join(', ')
      const tableValues = Object.values(data)
        .map(value => `'${value}'`)
        .join(', ')
      const sqlStatement = `INSERT INTO ${tableName} (${tableColumns}) VALUES (${tableValues})\n`

      writeStream.write(sqlStatement)
    })
    writeStream.end()

    // move csv file to archive directory
    const filePathCSV = path.join(
      __dirname,
      `../../storage/csv/${kind}/${csvFileName}.csv`,
    )
    await rename(
      filePathCSV,
      path.join(
        __dirname,
        `../../storage/archive/csv/${kind}/${csvFileName}.csv`,
      ),
    )

    // move json file to archive directory
    await rename(
      filePath,
      path.join(
        __dirname,
        `../../storage/archive/json/${kind}/${csvFileName}.json`,
      ),
    )
  } catch (err) {
    logger.error(
      `Process with correlation id: ${correlationID}, file: ${filePath}, error: ${err.message}`,
    )
  }

  logger.info(`correlation ID: ${correlationID} is done`)
})
