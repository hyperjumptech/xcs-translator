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

/* Clear storage archive directory without removing .gitignore file */

const fs = require('fs')
const path = require('path')
const sheetConfig = require('../sheetconfig.json')

const archiveDirectories = sheetConfig.map(
  sheet => `../storage/${sheet.type}/archive`,
)

removeFilesInDirectories(archiveDirectories, '.gitignore')

console.info('Archive is clear')

function removeFilesInDirectories(directories, excludeExt) {
  directories.forEach(dir => {
    const normalizeDir = path.join(__dirname, dir)

    getAllFiles(normalizeDir)
      .filter(filePath => !filePath.endsWith(excludeExt))
      .forEach(fs.unlinkSync)
  })
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath)

  files.forEach(file => {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, '/', file))
    }
  })

  return arrayOfFiles
}
