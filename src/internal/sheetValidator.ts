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

import validate from 'validate.js'
import { WorkSheet } from 'xlsx/types'

export const validateColumns = (
  columns: { col: string; title: string }[],
  headerRow = 1,
  worksheet: WorkSheet,
): boolean => {
  for (let { col, title } of columns) {
    if (worksheet[`${col}${headerRow}`]?.v !== title) {
      return false
    }
  }
  return true
}

export const validateValues = (records: any[], constraints: any): boolean => {
  for (let record of records) {
    const valid = validateValue(record, constraints)
    if (!valid) return false
  }
  return true
}

const validateValue = (record: any, constraints: any): boolean => {
  return !validate(record, constraints)
}
