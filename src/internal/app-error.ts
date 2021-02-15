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
