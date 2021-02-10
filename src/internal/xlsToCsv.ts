import fs from 'fs'
import { readFile, stream } from 'xlsx'

export function convertFromFilePath(filepath: string, destination: string) {
  const workbook = readFile(filepath)
  const worksheetname = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[worksheetname]
  const buffer = stream.to_csv(worksheet, {
    blankrows: false,
    skipHidden: true,
  })

  buffer.pipe(fs.createWriteStream(destination))
}
