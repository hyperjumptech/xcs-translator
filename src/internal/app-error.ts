export enum commonHTTPErrors {
  badRequest = 400,
  unprocessableEntity = 422,
}

export class AppError extends Error {
  public readonly httpErrorCode: commonHTTPErrors
  public readonly isOperational: boolean

  constructor(
    httpErrorCode: number,
    description: string,
    isOperational: boolean,
  ) {
    super(description)

    // restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype)

    this.httpErrorCode = httpErrorCode
    this.isOperational = isOperational

    Error.captureStackTrace(this)
  }
}
