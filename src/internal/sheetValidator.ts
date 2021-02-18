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

validate.validators.date = function (value: string | number, options: any) {
  if (
    !validate.isDefined(value) ||
    validate.isEmpty(value) ||
    validate.isNumber(value) // excel auto format date to number as number of days from 1900-01-01
  ) {
    return
  }

  if (typeof value === 'string') {
    const isValid = /^([12]\d{3})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(
      value,
    )
    if (!isValid) {
      return 'is not a valid date'
    }
  }
}

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

export const validateValues = (
  records: any[],
  constraints: any,
): { error: any; isValid: boolean } => {
  for (let record of records) {
    const err = validate(record, constraints)
    if (err) {
      return {
        error: { firstColumn: Object.values(record)[0], message: err },
        isValid: false,
      }
    }
  }
  return { error: null, isValid: true }
}
