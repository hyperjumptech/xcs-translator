/**********************************************************************************
 *                                                                                *
 *    Copyright (C) 2021  XCS TRANSLATOR Contributors                             *
 *                                                                                *
 *   This program is free software: you can redistribute it and/or modify         *
 *   it under the terms of the GNU Affero General Public License as published     *
 *   by the Free Software Foundation, either version 3 of the License, or         *
 *   (at your option) any later version.                                          *
 *                                                                                *
 *   This program is distributed in the hope that it will be useful,              *
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of               *
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                *
 *   GNU Affero General Public License for more details.                          *
 *                                                                                *
 *   You should have received a copy of the GNU Affero General Public License     *
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.       *
 *                                                                                *
 **********************************************************************************/

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
    res.status(500).send({
      message: err.message,
    })
    process.exit(1)
  }

  res.status(err.httpErrorCode).send({
    message: err.message,
  })
}
