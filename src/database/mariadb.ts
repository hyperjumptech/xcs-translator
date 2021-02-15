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

import mariadb from 'mariadb'
import { cfg } from '../config'

const { db } = cfg
const pools = db.map(database => {
  const pool = mariadb.createPool({
    host: database.host,
    port: database.port,
    database: database.database,
    user: database.user,
    password: database.password,
    connectionLimit: database.connectionLimit,
  })

  return { databaseID: database.id, pool }
})

// Connection pools reuse connections between invocations,
// and handle dropped or expired connections automatically.
export async function getConnection(type: string) {
  return await pools
    .find(pool => pool.databaseID === type)
    ?.pool.getConnection()
}

export async function endPool() {
  await Promise.all(pools.map(pool => pool.pool.end()))
}
