import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { AppError } from '../app-error'
import { logger } from '../logger'

export default function errorHandler(): ErrorRequestHandler {
  return (err: AppError, _: Request, res: Response, __: NextFunction) => {
    logger.error(err.message)
    crashIfUntrustedErrorOrSendResponse(err, res)
  }
}

async function crashIfUntrustedErrorOrSendResponse(
  err: AppError,
  res: Response,
) {
  if (!err.isOperational) {
    process.exit(1)
  }

  res.status(err.httpErrorCode).send({
    message: err.message,
  })
}
