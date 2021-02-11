/* Clear storage archive directory without removing .gitignore file */

const fs = require('fs')
const path = require('path')

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

function isGitIgnore(filePath) {
  return filePath.endsWith('.gitignore')
}

const archiveDir = path.join(__dirname, '../src/storage/archive')

getAllFiles(archiveDir)
  .filter(filePath => !isGitIgnore(filePath))
  .forEach(fs.unlinkSync)

console.log('Archive is clear')
