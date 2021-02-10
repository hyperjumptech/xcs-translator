import fs from 'fs'
import { readFile, utils } from 'xlsx'

export function convertFromFilePath(
  filepath: string,
  options: {
    columns: string[]
    destinations: { columns: string[]; filepath: string }[]
  },
) {
  const workbook = readFile(filepath)
  const worksheetname = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[worksheetname]

  const json = utils.sheet_to_json(worksheet, {
    range: 1,
    header: options.columns,
  })

  for (let { columns, filepath } of options.destinations) {
    const data = json.map((record: any) => {
      let filtered: Record<string, unknown> = {}
      for (let col of columns) {
        filtered[col] = record[col]
      }
      return filtered
    })

    const writeStream = fs.createWriteStream(filepath)

    data.forEach(record => {
      const row = Object.values(record).join(',') + '\n'
      writeStream.write(row)
    })

    writeStream.end()
  }
}
