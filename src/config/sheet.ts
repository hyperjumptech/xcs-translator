import rawConfig from '../../sheetconfig.json'

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
  destinations: {
    kind: string
    columns: {
      inSheet: { col: string; name: string; type?: string }[]
      outSheet: { name: string; type?: string }[]
    }
  }[]
}

export const sheetConfig = (): SheetConfig[] => {
  return rawConfig
}
