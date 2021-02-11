import path from 'path'
import { Router } from 'express'
import multer from 'multer'
import crypto from 'crypto'
import { object, string } from 'joi'
import { v4 as uuidv4 } from 'uuid'
import validate from '../../internal/middleware/validator'
import { upload } from './handler'
import fs from 'fs'

const router = Router()
const validator = object({
  type: string().required().valid('antigen', 'pcr').label('Tipe Spesimen'),
})
const storage = multer.diskStorage({
  destination: (_, __, cb) =>
    cb(null, path.join(__dirname, '../../storage/excel')),
  filename: (req, file, cb) => {
    const sha1 = crypto
      .createHash('sha1')
      .update(String(file.buffer))
      .digest('hex')
    const valid = validateHash(sha1)

    if (!valid) {
      cb(new Error('Found duplicate file!'), file.originalname)
      return
    }

    const getTimestamp = () => {
      const date = new Date()
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      const second = String(date.getSeconds()).padStart(2, '0')
      const timestamp = `${year}-${month}-${day}T${hour}:${minute}:${second}`

      return timestamp
    }
    const getFileExtension = (fileName: string) => {
      const splitFileName = fileName.split('.')
      const extension = splitFileName[splitFileName.length - 1]

      return extension
    }
    const correlationID = uuidv4()
    const timestamp = getTimestamp()
    const extension = getFileExtension(file.originalname)

    const fileName = `${correlationID};${sha1};${timestamp}.${extension}`
    // add header to track process from file name
    req.headers['x-correlation-id'] = correlationID

    cb(null, fileName)
  },
})

function validateHash(sha1: string): Boolean {
  let result = true
  const archiveFolder = path.join(__dirname, '../../storage/archive/excel/')
  const filenames = fs.readdirSync(archiveFolder, { withFileTypes: true })

  for (let file of filenames) {
    if (file.name.match(/\.(xlsx)$/)) {
      const nameArr = file.name.split(';')
      if (nameArr[1] === sha1) {
        result = false
        break
      }
    }
  }

  return result
}

function fileFilter(
  _: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (!file.originalname.match(/\.(xlsx)$/)) {
    cb(new Error('Only .xlsx files are allowed!'))
    return
  }
  cb(null, true)
}

router.post(
  '/api/v1/uploads',
  multer({ storage, fileFilter }).single('file'),
  validate(validator),
  upload,
)

export default router
