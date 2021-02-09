import { Request, Response, RequestHandler, NextFunction } from 'express'
import { Schema } from 'joi'
import { AppError, commonHTTPErrors } from '../app-error'

export default function validate(schema: Schema): RequestHandler {
  return async (req: Request, _: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body)
    } catch (err) {
      const error = new AppError(
        commonHTTPErrors.badRequest,
        err.details[0].message,
        true,
      )
      next(error)
      return
    }

    next()
  }
}
