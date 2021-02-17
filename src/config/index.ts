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

import dotenv from 'dotenv'

dotenv.config()

export interface Table {
  kind: string | undefined
  name: string | undefined
  foreignkey: string | undefined
}

export interface DbConfig {
  id: string | undefined
  host: string | undefined
  port: number
  database: string | undefined
  user: string | undefined
  password: string | undefined
  connectionLimit: number | undefined
  tables: Table[]
}

interface Config {
  env: string
  port: string
  db: DbConfig[]
}

export const cfg: Config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || '8080',
  db: [
    {
      id: process.env.DB_ID,
      host: process.env.DB_HOST,
      port: parseInt(String(process.env.DB_PORT), 10),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionLimit: parseInt(String(process.env.DB_CONNECTION_LIMIT), 10),
      tables: [
        {
          kind: process.env.DB_PATIENT,
          name: process.env.DB_PATIENT_TABLE,
          foreignkey: process.env.DB_PATIENT_FOREIGN_KEY,
        },
        {
          kind: process.env.DB_SPECIMEN,
          name: process.env.DB_SPECIMEN_TABLE,
          foreignkey: process.env.DB_SPECIMEN_FOREIGN_KEY,
        },
      ],
    },
    {
      id: process.env.DB2_ID,
      host: process.env.DB2_HOST,
      port: parseInt(String(process.env.DB2_PORT), 10),
      database: process.env.DB2_NAME,
      user: process.env.DB2_USER,
      password: process.env.DB2_PASSWORD,
      connectionLimit: parseInt(String(process.env.DB2_CONNECTION_LIMIT), 10),
      tables: [
        {
          kind: process.env.DB2_PATIENT,
          name: process.env.DB2_PATIENT_TABLE,
          foreignkey: process.env.DB2_PATIENT_FOREIGN_KEY,
        },
        {
          kind: process.env.DB2_SPECIMEN,
          name: process.env.DB2_SPECIMEN_TABLE,
          foreignkey: process.env.DB2_SPECIMEN_FOREIGN_KEY,
        },
      ],
    },
  ],
}

export { sheetConfig, SheetConfig } from './sheet'
