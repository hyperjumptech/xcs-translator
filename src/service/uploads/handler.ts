import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { NextFunction, Request, Response } from 'express'
import { readFile, utils, WorkSheet } from 'xlsx'
import { AppError, commonHTTPErrors } from '../../internal/app-error'
import PubSub from '../../internal/pubsub'
import { logger } from '../../internal/logger'
import { sheetConfig } from '../../config'
import { getConnection } from '../../database/mariadb'

const pubsub = new PubSub()
const rename = promisify(fs.rename)
const writeFile = promisify(fs.writeFile)
const fsReadFile = promisify(fs.readFile)

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

// excel to json worker
pubsub.subscribe('onFileUploaded', async ({ message, _ }: any) => {
  const { filePath, type, correlationID } = message
  const fileName = removeExtension(getFileName(filePath))

  // read excel and convert to json
  const workbook = readFile(filePath)
  const worksheetname = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[worksheetname]

  const isInputValid = validateExcelColumnInput(
    sheetConfig[type].source.columns,
    worksheet,
  )

  if (!isInputValid) {
    logger.info(
      `correlation ID: ${correlationID} does not provide a valid excel file`,
    )
    return
  }

  const json: Record<string, unknown>[] = utils.sheet_to_json(worksheet, {
    range: 1,
    header: 'A',
    blankrows: false,
  })

  // map json with database column
  const { destinations } = sheetConfig[type as string]
  const mappedData = json.map(record => {
    const data: any = {}
    for (let { columns, kind } of destinations) {
      let object: Record<string, unknown> = {}

      const isInteger = (column: any) => {
        const columnType = column.type
        return columnType === 'int'
      }

      columns.inSheet.forEach((column, index) => {
        const columnName = column.name
        const value = normalizeDataType(record[column.col], isInteger(column))

        object[columnName] = value
      })

      columns.outSheet.forEach((column, index) => {
        const columnName = column.name
        const value = normalizeDataType(null, isInteger(column))

        object[columnName] = value
      })

      data[kind] = object
    }

    return data
  })

  // write json file
  const filePathJSON = path.join(
    __dirname,
    `../../storage/${type}/json/${fileName}.json`,
  )
  await writeFile(
    filePathJSON,
    JSON.stringify(
      mappedData,
      (key, value) => {
        if (value === null || typeof value === 'undefined') {
          // TODO: Remove hardcode
          if (key === 'modified_date') {
            return new Date().toISOString().slice(0, 19).replace('T', ' ')
          }

          return ' '
        }

        return value
      },
      2,
    ),
  )

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

  pubsub.publish('onConvertedToJSON', {
    filePath: filePathJSON,
    type, // pcr or antigen
    correlationID,
  })
})

// execute sql statement worker
pubsub.subscribe('onConvertedToJSON', async ({ message, _ }: any) => {
  const { filePath, type, correlationID } = message
  const fileName = removeExtension(getFileName(filePath))
  let conn: any

  try {
    conn = await getConnection(type)
    const sqlStatementsFile = await fsReadFile(filePath)
    const mappedData = JSON.parse(String(sqlStatementsFile))

    // generate sql statement
    mappedData.forEach(async (data: any) => {
      const kinds = Object.keys(data)
      const firstKind = kinds[0]
      const value = data[firstKind]
      const tableName = getTableName(type, firstKind)
      const tableColumns = Object.keys(value).join(', ')
      const tableValues = Object.values(value).map(normalizeSQLValue).join(', ')
      const query = `INSERT INTO ${tableName} (${tableColumns}) VALUES (${tableValues})`
      const secondKind = kinds[1]
      const secondValue = data[secondKind]
      const secondTableName = getTableName(type, secondKind)
      const secondTableColumns = Object.keys(secondValue).join(', ')
      const secondTableValues = Object.values(secondValue)
        .map(normalizeSQLValue)
        .join(', ')

      try {
        // TODO: Remove hardcode
        const res = await conn.query(query)
        const id_pasien = res.insertId
        const foreignKeyName =
          type === 'antigen' ? 'id_pasien' : 'id_pemeriksaan'
        const secondQuery = `INSERT INTO ${secondTableName} (${foreignKeyName}, ${secondTableColumns}) VALUES (${id_pasien}, ${secondTableValues})`
        await conn.query(secondQuery)
      } catch (err) {
        logger.error(err.message)
      }
    })

    // move json statement file to archive directory
    await rename(
      filePath,
      path.join(
        __dirname,
        `../../storage/${type}/archive/json/${fileName}.json`,
      ),
    )
  } catch (err) {
    logger.error(
      `Process with correlation id: ${correlationID}, file: ${filePath}, error: ${err.message}`,
    )
  } finally {
    if (conn) conn.release()
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

function normalizeDataType(value: any, isInteger: boolean): any {
  if (isInteger) {
    if (!value) {
      return 0
    }

    return parseInt(value, 10)
  }

  return value
}

function getTableName(pcrOrAntigen: string, patientOrSpecimen: string): string {
  // TODO: Remove hardcode
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

function normalizeSQLValue(value: any): any {
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  return `'${value}'`
}

function validateExcelColumnInput(
  columns: { col: string; title: string }[],
  worksheet: WorkSheet,
): boolean {
  for (let { col, title } of columns) {
    if (worksheet[`${col}1`].v !== title) {
      return false
    }
  }
  return true
}
