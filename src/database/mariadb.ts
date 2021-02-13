import mariadb from 'mariadb'
import { cfg } from '../config'

const { db } = cfg
let pool: mariadb.Pool[]

// Connection pools reuse connections between invocations,
// and handle dropped or expired connections automatically.
export async function getConnection(type: string) {
  let conn: mariadb.PoolConnection | null = null
  for (let con of db) {
    if (type === con.id) {
      const pl = mariadb.createPool({
        host: con.host,
        port: con.port,
        database: con.database,
        user: con.user,
        password: con.password,
        connectionLimit: con.connectionLimit,
      })

      pool.push(pl)

      conn = await pl.getConnection()
      break
    }
  }

  return conn
}

export async function endPool() {
  for (let pol of pool) {
    await pol.end()
  }
}
