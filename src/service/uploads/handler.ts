import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { promisify } from 'util'
import { NextFunction, Request, Response } from 'express'
import { readFile, utils } from 'xlsx'
import { PoolConnection } from 'mariadb'
import { AppError, commonHTTPErrors } from '../../internal/app-error'
import PubSub from '../../internal/pubsub'
import { logger } from '../../internal/logger'
import { validateColumns, validateValues } from '../../internal/sheetValidator'
import { sheetConfig, SheetConfig, cfg } from '../../config'
import { getConnection } from '../../database/mariadb'

const pubsub = new PubSub()
const rename = promisify(fs.rename)
const writeFile = promisify(fs.writeFile)
const fsReadFile = promisify(fs.readFile)
const storagePath = '../../../storage'

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

// hash file and check for duplicate
pubsub.subscribe('onFileUploaded', async ({ message, _ }: any) => {
  const { filePath, type, correlationID } = message
  const fileName = path.basename(filePath)

  const buffer = await fsReadFile(filePath)
  const sha1 = crypto.createHash('sha1').update(buffer).digest('hex')
  const valid = validateHash(sha1, type)

  if (!valid) {
    logger.error(
      `correlation ID: ${correlationID}, same file is already uploaded`,
    )
    await rename(
      filePath,
      path.join(
        path.dirname(filePath),
        `${storagePath}/${type}/failed/excel/${fileName}`,
      ),
    )
    return
  }

  // add hash to filename
  const splitFileName = fileName.split(';')
  const fileNameWithHash = [splitFileName[0], sha1, splitFileName[1]].join(';')

  try {
    await rename(filePath, path.join(path.dirname(filePath), fileNameWithHash))

    pubsub.publish('onFileHashed', {
      ...message,
      filePath: `${path.dirname(filePath)}/${fileNameWithHash}`,
    })
  } catch (err) {
    logger.error(
      `Process with correlation id: ${correlationID}, file: ${filePath}, error: ${err.message}`,
    )
  }
})

// excel to json worker
pubsub.subscribe('onFileHashed', async ({ message, _ }: any) => {
  const { filePath, type, correlationID } = message
  const fileName = removeExtension(getFileName(filePath))

  // read excel and convert to json
  const workbook = readFile(filePath)
  const worksheetname = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[worksheetname]

  let sheet = {} as SheetConfig
  const sheetArr = sheetConfig()
  for (const sht of sheetArr) {
    if (sht.type === type) {
      sheet = sht
    }
  }

  // validate columns header
  const isColumnsValid = validateColumns(sheet.source.columns, worksheet)
  if (!isColumnsValid) {
    logger.error(
      `correlation ID: ${correlationID} does not come with valid excel template`,
    )
    await rename(
      filePath,
      path.join(
        path.dirname(filePath),
        `${storagePath}/${type}/failed/excel/${getFileName(filePath)}`,
      ),
    )
    return
  }

  const json: Record<string, unknown>[] = utils.sheet_to_json(worksheet, {
    range: 1,
    header: 'A',
    blankrows: false,
  })

  // validate values
  let valuesConstraints: any = {}
  sheet.source.columns.forEach(column => {
    valuesConstraints[column.col] = column.constraints
  })
  const isValuesValid = validateValues(json, valuesConstraints)
  if (!isValuesValid) {
    logger.error(
      `correlation ID: ${correlationID} contains value that does not match required constraints`,
    )

    await rename(
      filePath,
      path.join(
        path.dirname(filePath),
        `${storagePath}/${type}/failed/excel/${getFileName(filePath)}`,
      ),
    )
    return
  }

  // map json with database column
  const { destinations } = sheet
  const mappedData = json.map(record => {
    const data: any = {}
    for (let { columns, kind } of destinations) {
      let object: Record<string, unknown> = {}

      const isInteger = (column: any) => {
        const columnType = column.type
        return columnType === 'int'
      }

      columns.inSheet.forEach(column => {
        const columnName = column.name
        const value = normalizeDataType(record[column.col], isInteger(column))

        object[columnName] = value
      })

      columns.outSheet.forEach(column => {
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
    `${storagePath}/${type}/json/${fileName}.json`,
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
      path.join(
        __dirname,
        `${storagePath}/${type}/archive/excel/${fileName}.xlsx`,
      ),
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
  let conn: PoolConnection | undefined

  try {
    conn = await getConnection(type)
    if (!conn) {
      throw new Error('Database connection is failed')
    }
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
        const res = await conn?.query(query)
        const id_pasien = res.insertId
        const foreignKeyName = type === 'antigen' ? 'id_pasien' : 'id'
        const secondQuery = `INSERT INTO ${secondTableName} (${foreignKeyName}, ${secondTableColumns}) VALUES (${id_pasien}, ${secondTableValues})`
        await conn?.query(secondQuery)
      } catch (err) {
        logger.error(
          `Process with correlation id: ${correlationID}, error: ${err.message}`,
        )
      }
    })

    // move json statement file to archive directory
    await rename(
      filePath,
      path.join(
        __dirname,
        `${storagePath}/${type}/archive/json/${fileName}.json`,
      ),
    )

    logger.info(`correlation ID: ${correlationID} is done`)
  } catch (err) {
    logger.error(
      `Process with correlation id: ${correlationID}, file: ${filePath}, error: ${err.message}`,
    )
  } finally {
    if (conn) conn.release()
  }
})

function validateHash(sha1: string, type: string): Boolean {
  let result = true
  const archiveFolder = path.join(
    __dirname,
    `${storagePath}/${type}/archive/excel/`,
  )
  const filenames = fs.readdirSync(archiveFolder, { withFileTypes: true })

  for (let file of filenames) {
    if (file.name.match(/\.(xlsx)$/)) {
      const nameArr = file.name.split(';')
      if (nameArr[1] === sha1) {
        result = false
        break
      }
    }
  }

  return result
}

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

function getTableName(
  pcrOrAntigen: string,
  patientOrSpecimen: string,
): string | undefined {
  const isAntigen = pcrOrAntigen === 'antigen'
  const isPCR = pcrOrAntigen === 'pcr'
  const isPatient = patientOrSpecimen === 'patient'
  const isSpecimen = patientOrSpecimen === 'specimen'
  const isAntigenPatient = isAntigen && isPatient
  const isAntigenSpecimen = isAntigen && isSpecimen
  const isPCRPatient = isPCR && isPatient
  const isPCRSpesimen = isPCR && isSpecimen
  const antigenDB = cfg.db.find(database => database.id === 'antigen')
  const PCRDB = cfg.db.find(database => database.id === 'pcr')

  if (isPCRPatient) return PCRDB?.patientTable
  if (isPCRSpesimen) return PCRDB?.specimentTable
  if (isAntigenPatient) return antigenDB?.patientTable
  if (isAntigenSpecimen) return antigenDB?.specimentTable

  return ''
}

function normalizeSQLValue(value: any): any {
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  return `'${value}'`
}
