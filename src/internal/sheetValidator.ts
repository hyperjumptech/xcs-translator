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
  const valid = validate(record, constraints)
  console.log(record)
  console.log(valid)
  return !valid
}
