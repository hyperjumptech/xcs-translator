import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { object, string } from 'joi'
import { v4 as uuidv4 } from 'uuid'
import validate from '../../internal/middleware/validator'
import { AppError, commonHTTPErrors } from '../../internal/app-error'

const router = Router()
const validator = object({
  type: string().required().valid('antigen', 'pcr').label('Tipe Spesimen'),
})
const storage = multer.diskStorage({
  destination: (_, __, cb) =>
    cb(null, path.join(__dirname, '../../storage/excel')),
  filename: (_, file, cb) => {
    const fileName = `${uuidv4()}-${file.originalname
      .toLowerCase()
      .split(' ')
      .join('-')}`

    cb(null, fileName)
  },
})
function fileFilter(
  _: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  // Accept images only
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
  (req, res, next) => {
    if (!req.file) {
      const err = new AppError(
        commonHTTPErrors.badRequest,
        'File is required',
        true,
      )
      next(err)
      return
    }

    res.sendStatus(202)
  },
)

export default router
