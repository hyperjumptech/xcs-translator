import fs from 'fs'

export interface SheetConfig {
  type: string
  source: {
    columns: { col: string; title: string }[]
  }
  destinations: {
    kind: string
    columns: {
      inSheet: { col: string; name: string; type?: string }[]
      outSheet: { name: string; type?: string }[]
    }
  }[]
}

export const sheetConfig = (): SheetConfig[] => {
  const raw = fs.readFileSync('../../sheetconfig.json')
  const conf: SheetConfig[] = JSON.parse(String(raw))
  return conf
}
