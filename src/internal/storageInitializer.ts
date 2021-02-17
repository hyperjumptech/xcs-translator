import fs from 'fs'
import path from 'path'
import { sheetConfig } from '../config'

export function initStorage(): void {
  for (let sheet of sheetConfig()) {
    createStorageForType(sheet.type)
  }
}

function createStorageForType(type: string): void {
  const storageDir = path.join(__dirname, '../../storage')
  mkdirp(storageDir)
  mkdirp(`${storageDir}/${type}`)
  mkdirp(`${storageDir}/${type}/excel`)
  mkdirp(`${storageDir}/${type}/json`)
  mkdirp(`${storageDir}/${type}/archive`)
  mkdirp(`${storageDir}/${type}/archive/excel`)
  mkdirp(`${storageDir}/${type}/archive/json`)
  mkdirp(`${storageDir}/${type}/failed`)
  mkdirp(`${storageDir}/${type}/failed/excel`)
  mkdirp(`${storageDir}/${type}/failed/json`)
}

function mkdirp(path: string): void {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
}
