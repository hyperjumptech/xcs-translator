/**********************************************************************************
 *                                                                                *
 *    Copyright (C) 2021  XCS TRANSLATOR Contributors                             *
 *                                                                                *
 *   This program is free software: you can redistribute it and/or modify         *
 *   it under the terms of the GNU Affero General Public License as published     *
 *   by the Free Software Foundation, either version 3 of the License, or         *
 *   (at your option) any later version.                                          *
 *                                                                                *
 *   This program is distributed in the hope that it will be useful,              *
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of               *
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                *
 *   GNU Affero General Public License for more details.                          *
 *                                                                                *
 *   You should have received a copy of the GNU Affero General Public License     *
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.       *
 *                                                                                *
 **********************************************************************************/

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
import { sheetsConfig, Table } from '../../config'
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
  logger.info(
    `Starting onFileUploaded with Correlation ID: ${message.correlationID}`,
  )
  const { filePath, type, correlationID } = message
  const fileName = path.basename(filePath)
  const buffer = await fsReadFile(filePath)
  const sha1 = crypto.createHash('sha1').update(buffer).digest('hex')
  const valid = validateHash(sha1, type)
  // add hash to filename
  const splitFileName = fileName.split(';')
  const fileNameWithHash = [splitFileName[0], sha1, splitFileName[1]].join(';')

  try {
    if (!valid) {
      throw new Error('Same file is already uploaded')
    }
    await rename(filePath, path.join(path.dirname(filePath), fileNameWithHash))

    pubsub.publish('onFileHashed', {
      ...message,
      filePath: `${path.dirname(filePath)}/${fileNameWithHash}`,
    })
  } catch (err) {
    pipelineError(correlationID, 'onFileUploaded', err.message)
    moveExcelToFailedDir(filePath, type).catch(err =>
      pipelineError(correlationID, 'onFileUploaded', err.message),
    )
  }
})

// excel to json worker
pubsub.subscribe('onFileHashed', async ({ message, _ }: any) => {
  logger.info(
    `Starting onFileHashed with Correlation ID: ${message.correlationID}`,
  )
  const { filePath, type, correlationID } = message
  const fileName = removeExtension(getFileName(filePath))

  // read excel and convert to json
  const workbook = readFile(filePath)
  const worksheetname = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[worksheetname]

  let sheet = sheetsConfig.find(cfg => cfg.type === type)

  if (!sheet) {
    throw new Error(`Sheet type '${type}' does not exist in sheetconfig.json`)
  }

  // validate columns header
  const isColumnsValid = validateColumns(
    sheet.source.columns,
    sheet.source.headerRow,
    worksheet,
  )

  try {
    if (!isColumnsValid) {
      throw new Error('Does not come with valid excel template')
    }

    const json: Record<string, unknown>[] = utils.sheet_to_json(worksheet, {
      range: sheet.source.startingDataRow - 1,
      header: 'A',
      blankrows: false,
    })

    // validate values
    let valuesConstraints: any = {}
    sheet.source.columns.forEach(column => {
      valuesConstraints[column.col] = column.constraints
    })
    const { error, isValid } = validateValues(json, valuesConstraints)
    if (!isValid) {
      throw new Error(
        `Contains value that does not match required constraints: ${JSON.stringify(
          error,
        )}`,
      )
    }

    // map json with database column
    const { destinations } = sheet
    const mappedData = json.map(record => {
      const data: any = {}
      for (let { columns, kind } of destinations) {
        let object: Record<string, unknown> = {}

        columns.forEach(column => {
          const columnName = column.name
          const value = record[column.col]

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
          if (typeof value === 'undefined') {
            // TODO: Remove hardcode
            if (key === 'modified_date') {
              return new Date().toISOString().slice(0, 19).replace('T', ' ')
            }

            return null
          }

          return value
        },
        2,
      ),
    )

    pubsub.publish('onConvertedToJSON', {
      filePath: filePathJSON,
      type,
      correlationID,
    })
  } catch (err) {
    pipelineError(correlationID, 'onFileHashed', err.message)
    // move excel to failed
    moveExcelToFailedDir(filePath, type).catch(err =>
      pipelineError(correlationID, 'onFileHashed', err.message),
    )
  }
})

// execute sql statement worker
pubsub.subscribe('onConvertedToJSON', async ({ message, _ }: any) => {
  logger.info(
    `Starting onConvertedToJSON with Correlation ID: ${message.correlationID}`,
  )
  const { filePath, type, correlationID } = message
  const fileName = removeExtension(getFileName(filePath))
  let conn: PoolConnection | undefined

  try {
    conn = await getConnection(type)
    if (!conn) {
      throw new Error('Database connection is failed')
    }
    const jsonFile = await fsReadFile(filePath, 'utf-8')
    const mappedData = JSON.parse(jsonFile)

    // generate sql statement
    conn?.beginTransaction()
    await Promise.all(
      mappedData.map(async (data: any) => {
        const kinds = Object.keys(data)

        let insertIds: unknown[] = []

        for (const kind of kinds) {
          const value = data[kind]
          const table = getTable(type, kind)
          const tableName = table?.name || ''
          const getColumnInformationQuery = (tableName: string): string =>
            `SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}' AND EXTRA != 'auto_increment'`
          const tableInfo = await conn?.query(
            getColumnInformationQuery(tableName || ''),
          )
          const sqlData = fillUnmappedColumnToJSON(tableInfo, value)
          let foreignKeyName: string | undefined
          let foreignKeyValue: any
          if (table?.foreignKey) {
            foreignKeyName = table.foreignKey.field
            foreignKeyValue = insertIds[table.foreignKey.sourceIndex]
            delete sqlData[foreignKeyName]
          }
          const tableColumns = Object.keys(sqlData).join(', ')
          const tableValues = Object.values(sqlData)
            .map(normalizeSQLValue)
            .join(', ')

          const query = generateInsertQuery({
            tableName,
            tableColumns,
            tableValues,
            foreignKeyName,
            foreignKeyValue,
          })

          const res = await conn?.query(query)
          insertIds.push(res.insertId) // save current table insert id so it can be used by later tables
        }
      }),
    )
    conn?.commit()

    // move excel file to archive directory
    await rename(
      path.join(__dirname, `${storagePath}/${type}/excel/${fileName}.xlsx`),
      path.join(
        __dirname,
        `${storagePath}/${type}/archive/excel/${fileName}.xlsx`,
      ),
    )

    // move json statement file to archive directory
    await rename(
      filePath,
      path.join(
        __dirname,
        `${storagePath}/${type}/archive/json/${fileName}.json`,
      ),
    )

    logger.info(`Correlation ID: ${correlationID} is done`)
  } catch (err) {
    conn?.rollback()

    pipelineError(correlationID, 'onConvertedToJSON', err.message)
    // move excel to failed
    await moveExcelToFailedDir(
      path.join(__dirname, `${storagePath}/${type}/excel/${fileName}.xlsx`),
      type,
    ).catch(err =>
      pipelineError(correlationID, 'onConvertedToJSON', err.message),
    )
  } finally {
    if (conn) conn.release()
  }
})

interface insertQueryParams {
  tableName: string
  tableColumns: string
  tableValues: string
  foreignKeyName: string | undefined
  foreignKeyValue: string | undefined
}

function generateInsertQuery(params: insertQueryParams) {
  if (params.foreignKeyName && params.foreignKeyValue) {
    return `INSERT INTO ${params.tableName} (${params.foreignKeyName}, ${params.tableColumns}) VALUES (${params.foreignKeyValue}, ${params.tableValues})`
  }

  return `INSERT INTO ${params.tableName} (${params.tableColumns}) VALUES (${params.tableValues})`
}

function pipelineError(
  correlationID: string,
  pipeline: string,
  errorMessage: string,
) {
  logger.error(
    `Correlation ID: ${correlationID}. Pipeline: ${pipeline}. Error: ${errorMessage}`,
  )
}

async function moveExcelToFailedDir(filePath: string, type: string) {
  const fileName = removeExtension(getFileName(filePath))
  await rename(
    filePath,
    path.join(
      path.dirname(filePath),
      `${storagePath}/${type}/failed/excel/${fileName}.xlsx`,
    ),
  )
}

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

function getTable(type: string, kind: string): Table | undefined {
  const table = sheetsConfig
    .find(cfg => cfg.type === type)
    ?.destinations.find(dest => dest.kind === kind)?.table

  return table
}

function normalizeSQLValue(value: any): any {
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  if (value === null) {
    return 'NULL'
  }

  return `'${value}'`
}

function generateDefaultValue(dataType: string, columnType: string) {
  const stringDataTypes = [
    'char',
    'varchar',
    'tinytext',
    'text',
    'mediumtext',
    'longtext',
    'binary',
    'varbinary',
  ]
  const numericDataTypes = [
    'bit',
    'tinyint',
    'smallint',
    'mediumint',
    'int',
    'integer',
    'bigint',
    'decimal',
    'dec',
    'numeric',
    'fixed',
    'float',
    'double',
    'doubleprecision',
    'real',
    'float',
    'bool',
    'boolean',
  ]
  const isEnum = dataType == 'enum'
  const isDate = dataType == 'date'
  const isDateTime = dataType == 'datetime'

  if (isEnum) {
    return 1
  }
  if (isDate) {
    return '0000-00-00'
  }
  if (isDateTime) {
    return '0000-00-00 00:00:00'
  }
  const isStringDataTypes = stringDataTypes.find(dt => dt === dataType)
  if (isStringDataTypes) {
    return ' '
  }
  const isNumericDataTypes = numericDataTypes.find(dt => dt === dataType)
  if (isNumericDataTypes) {
    return 0
  }

  return null
}

function fillUnmappedColumnToJSON(columnInfo: any, jsonData: any): any {
  const filledData: any = {}

  columnInfo.forEach((column: any) => {
    const { COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE } = column
    const isColumnExist = Object.keys(jsonData).find(key => key === COLUMN_NAME)
    if (
      isColumnExist &&
      jsonData[COLUMN_NAME] !== undefined &&
      jsonData[COLUMN_NAME] !== null
    ) {
      let value = jsonData[COLUMN_NAME]
      if (
        (DATA_TYPE == 'date' || DATA_TYPE == 'datetime') &&
        typeof value === 'number'
      ) {
        value = parseNumericDate(value)
      }
      filledData[COLUMN_NAME] = value
      return
    }

    if (IS_NULLABLE === 'NO') {
      const defaultValue = generateDefaultValue(DATA_TYPE, COLUMN_TYPE)
      filledData[COLUMN_NAME] = defaultValue
    } else {
      filledData[COLUMN_NAME] = null
    }
  })

  return filledData
}

function parseNumericDate(numericExcelDate: number) {
  // excel numeric date is number of days since 1900-01-01
  let date = new Date('1900-01-01')
  date.setDate(numericExcelDate)

  return date.toISOString().slice(0, 10)
}
