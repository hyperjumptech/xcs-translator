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

export function upload(req: Request, res: Response, next: NextFunction) {
  const correlationID = req.headers['x-correlation-id']

  if (!req.file) {
    const err = new AppError(
      commonHTTPErrors.badRequest,
      'File is required',
      true,
    )
    next(err)
    return
  }

  pubsub.publish('onFileUploaded', {
    filePath: req.file.path,
    type: req.body['type'],
    correlationID,
  })

  res.status(202).send({ correlationID })
}

// excel to sql worker
pubsub.subscribe('onFileUploaded', async ({ message, _ }: any) => {
  const { filePath, type, correlationID } = message
  const fileName = removeExtension(getFileName(filePath))

  // read excel and convert to json
  const workbook = readFile(filePath)
  const worksheetname = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[worksheetname]
  const json = utils.sheet_to_json(worksheet, {
    range: 1,
    header: 1,
    blankrows: false,
  })

  // map json with database column
  const { destinations } = sheetConfig[type as string]
  const mappedData = json.map(record => {
    const data: any = {}
    for (let { columnRange, columnNames, kind } of destinations) {
      const dataColumnIndices = letterRangeToArrayOfIndex(columnRange)
      const values = dataColumnIndices.map(
        index => (record as any[])[index] || null,
      )
      let object: Record<string, unknown> = {}
      columnNames.forEach((col, index) => {
        object[col] = values[index]
      })
      data[kind] = object
    }

    return data
  })

  // generate sql statement
  const sqlStatements = mappedData.map((data: any) => {
    const sqlStatement = Object.keys(data).map(kind => {
      const value = data[kind]
      const tableName = getTableName(type, kind)
      const tableColumns = Object.keys(value).join(', ')
      const tableValues = Object.values(value)
        .map(value => `'${value}'`)
        .join(', ')

      return `INSERT INTO ${tableName} (${tableColumns}) VALUES (${tableValues})`
    })

    return sqlStatement
  })

  // write sql statement
  const filePathSQL = path.join(
    __dirname,
    `../../storage/${type}/sql/${fileName}.json`,
  )
  await writeFile(filePathSQL, JSON.stringify(sqlStatements, null, 2))

  // move excel file to archive directory
  try {
    await rename(
      filePath,
      path.join(__dirname, `../../storage/${type}/archive/excel/${fileName}`),
    )
  } catch (err) {
    logger.error(
      `Process with correlation id: ${correlationID}, file: ${filePath}, error: ${err.message}`,
    )
  }

  pubsub.publish('onConvertedToSQL', {
    filePath: filePathSQL,
    type, // pcr or antigen
    correlationID,
  })
})

// execute statement worker
pubsub.subscribe('onConvertedToSQL', async ({ message, _ }: any) => {
  const { filePath, type, correlationID } = message
  const fileName = removeExtension(getFileName(filePath))

  try {
    // TODO: Execute SQL statement

    // move sql statement file to archive directory
    await rename(
      filePath,
      path.join(
        __dirname,
        `../../storage/${type}/archive/sql/${fileName}.json`,
      ),
    )
  } catch (err) {
    logger.error(
      `Process with correlation id: ${correlationID}, file: ${filePath}, error: ${err.message}`,
    )
  }

  logger.info(`correlation ID: ${correlationID} is done`)
})

function getFileName(filePath: string): string {
  const splitFileName = filePath.split('/')
  const fileName = splitFileName[splitFileName.length - 1]

  return fileName
}

function removeExtension(fileName: string): string[] {
  const splitFileName = fileName.split('.')
  const fileNameWithoutExtension = splitFileName.filter(
    (_, index) => index !== splitFileName.length - 1,
  )

  return fileNameWithoutExtension
}

function getTableName(pcrOrAntigen: string, patientOrSpecimen: string): string {
  const isAntigen = pcrOrAntigen === 'antigen'
  const isPCR = pcrOrAntigen === 'pcr'
  const isPatient = patientOrSpecimen === 'patient'
  const isSpecimen = patientOrSpecimen === 'specimen'
  const isAntigenPatient = isAntigen && isPatient
  const isAntigenSpecimen = isAntigen && isSpecimen
  const isPCRPatient = isPCR && isPatient
  const isPCRSpesimen = isPCR && isSpecimen

  if (isPCRPatient) return 'dt_litbang_new'
  if (isPCRSpesimen) return 'dt_litbang_sampel'
  if (isAntigenPatient) return 'dt_antigen_pasien'
  if (isAntigenSpecimen) return 'dt_antigen_sampel'

  return ''
}
