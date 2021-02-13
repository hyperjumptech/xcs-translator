import mariadb from 'mariadb'
import { cfg } from '../config'

const { db1, db2 } = cfg
const { host, port, database, user, password, connectionLimit } = db1

// Connection pools reuse connections between invocations,
// and handle dropped or expired connections automatically.
const db1Pool = mariadb.createPool({
  host,
  port,
  database,
  user,
  password,
  connectionLimit,
})
const db2Pool = mariadb.createPool({
  host: db2.host,
  port: db2.port,
  database: db2.database,
  user: db2.user,
  password: db2.password,
  connectionLimit: db2.connectionLimit,
})

export async function getConnection(type: string) {
  if (type === 'db1') {
    return await db1Pool.getConnection()
  }
  return await db2Pool.getConnection()
}

export async function endPool() {
  await db1Pool.end()
  await db2Pool.end()
}
