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
import { promisify } from 'util'
import { NextFunction, Request, Response } from 'express'
import { sheetsConfig } from '../../config'
import { AppError, commonHTTPErrors } from '../../internal/app-error'

const readDir = promisify(fs.readdir)

interface pipeline {
  type: string
  excelInProgress: string[]
  jsonInProgress: string[]
  excelArchived: string[]
  jsonArchived: string[]
  excelFailed: string[]
  jsonFailed: string[]
}

export async function index(req: Request, res: Response, next: NextFunction) {
  const storageDir = path.join(__dirname, '../../../storage')
  const pipelines: pipeline[] = []
  for (let sheet of sheetsConfig) {
    const { type } = sheet
    try {
      const excelInProgress = await readDir(`${storageDir}/${type}/excel/`)
      const jsonInProgress = await readDir(`${storageDir}/${type}/json/`)
      const excelArchived = await readDir(
        `${storageDir}/${type}/archive/excel/`,
      )
      const jsonArchived = await readDir(`${storageDir}/${type}/archive/json`)
      const excelFailed = await readDir(`${storageDir}/${type}/failed/excel/`)
      const jsonFailed = await readDir(`${storageDir}/${type}/failed/json/`)
      const pipeline = {
        type,
        excelInProgress,
        jsonInProgress,
        excelArchived,
        jsonArchived,
        excelFailed,
        jsonFailed,
      }

      pipelines.push(pipeline)
    } catch (error) {
      const err = new AppError(
        commonHTTPErrors.unprocessableEntity,
        error.message,
        true,
      )
      next(err)
    }
  }

  res.status(200).send(pipelines)
}
