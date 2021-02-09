import path from 'path'
import { Router } from 'express'
import multer from 'multer'
import { object, string } from 'joi'
import { v4 as uuidv4 } from 'uuid'
import validate from '../../internal/middleware/validator'
import { upload } from './handler'

const router = Router()
const validator = object({
  type: string().required().valid('antigen', 'pcr').label('Tipe Spesimen'),
})
const storage = multer.diskStorage({
  destination: (_, __, cb) =>
    cb(null, path.join(__dirname, '../../storage/excel')),
  filename: (req, file, cb) => {
    const correlationID = uuidv4()
    const fileName = `${correlationID}-${file.originalname
      .toLowerCase()
      .split(' ')
      .join('-')}`

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
