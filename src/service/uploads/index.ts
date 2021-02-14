import path from 'path'
import { Router } from 'express'
import multer from 'multer'
import { object, string } from 'joi'
import { v4 as uuidv4 } from 'uuid'
import validate from '../../internal/middleware/validator'
import { upload } from './handler'
import { AppError, commonHTTPErrors } from '../../internal/app-error'

const router = Router()
const validator = object({
  type: string().required().valid('antigen', 'pcr').label('Tipe Spesimen'),
})
const storage = multer.diskStorage({
  destination: (req, __, cb) => {
    cb(null, path.join(__dirname, `../../../storage/${req?.body?.type}/excel`))
  },
  filename: (req, file, cb) => {
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

    const fileName = `${correlationID};${timestamp}.${extension}`
    // add header to track process from file name
    req.headers['x-correlation-id'] = correlationID

    cb(null, fileName)
  },
})

function fileFilter(
  _: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (!file.originalname.match(/\.(xlsx)$/)) {
    const err = new AppError(
      commonHTTPErrors.badRequest,
      'Only .xlsx files are allowed!',
      true,
    )
    cb(err)
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
