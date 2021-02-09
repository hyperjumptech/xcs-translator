import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { object, string } from 'joi'
import { v4 as uuidv4 } from 'uuid'
import validate from '../../internal/middleware/validator'
import PubSub from '../../internal/pubsub'
import { AppError, commonHTTPErrors } from '../../internal/app-error'

const router = Router()
const pubsub = new PubSub()
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

    const correlationID = req.headers['x-correlation-id']
    pubsub.publish('fileUploaded', { filePath: req.file.path, correlationID })

    res.status(202).send({ correlationID })
  },
)

pubsub.subscribe('fileUploaded', ({ message, context }: any) => {
  // To do: Convert to csv, delete excel file
  const { correlationID } = message
  pubsub.publish('convertedToCSV', { correlationID })
})

pubsub.subscribe('convertedToCSV', ({ message, context }: any) => {
  // To do: Convert to sql, delete csv file
  const { correlationID } = message
  pubsub.publish('convertedToSQL', { correlationID })
})

pubsub.subscribe('convertedToSQL', ({ message, _ }: any) => {
  const { correlationID } = message
  console.info(`correlation ID: ${correlationID} is done`)
})

export default router
