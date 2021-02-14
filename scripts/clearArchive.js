/* Clear storage archive directory without removing .gitignore file */

const fs = require('fs')
const path = require('path')

const archiveDirectories = [
  '../storage/antigen/archive',
  '../storage/pcr/archive',
]

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
