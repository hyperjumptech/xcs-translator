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

export interface Table {
  name: string
  foreignKey?: {
    field: string
    sourceIndex: number // index of table in the destinations array which will be the source of value
  }
}

export interface SheetConfig {
  type: string
  source: {
    headerRow: number
    startingDataRow: number
    columns: {
      col: string
      title: string
      constraints?: any
    }[]
  }
  database: {
    host: string
    port: number
    user: string
    password: string
    dbName: string
    connectionLimit: number
  }
  destinations: {
    kind: string
    table: Table
    columns: { col: string; name: string }[]
  }[]
}

export const sheetsConfig: SheetConfig[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../sheetconfig.json'), 'utf-8'),
)
