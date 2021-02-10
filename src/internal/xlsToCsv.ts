import fs from 'fs'
import { readFile, utils } from 'xlsx'

type SheetFile = {
  filePath: string
  columns: string[]
}

export function convertFromFilePath(
  source: SheetFile,
  destinations: SheetFile[],
) {
  const workbook = readFile(source.filePath)
  const worksheetname = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[worksheetname]

  const json = utils.sheet_to_json(worksheet, {
    range: 1,
    header: source.columns,
  })

  for (let { columns, filePath } of destinations) {
    const data = json.map((record: any) => {
      let filtered: Record<string, unknown> = {}
      for (let col of columns) {
        filtered[col] = record[col]
      }
      return filtered
    })

    const writeStream = fs.createWriteStream(filePath)

    data.forEach(record => {
      const row = Object.values(record).join(',') + '\n'
      writeStream.write(row)
    })

    writeStream.end()
  }
}
