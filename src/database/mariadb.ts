import mariadb from 'mariadb'
import { cfg } from '../config'

const { db } = cfg
let pool: Map<String, mariadb.Pool> = new Map()

// Connection pools reuse connections between invocations,
// and handle dropped or expired connections automatically.
export async function getConnection(type: string) {
  let pol = pool.get(type)
  if (pol) {
    return await pol.getConnection()
  }

  for (let con of db) {
    if (type === con.id) {
      pol = mariadb.createPool({
        host: con.host,
        port: con.port,
        database: con.database,
        user: con.user,
        password: con.password,
        connectionLimit: con.connectionLimit,
      })

      pool.set(type, pol)
      break
    }
  }

  return await pol?.getConnection()
}

export async function endPool() {
  pool.forEach(pol => {
    pol.end()
  })
}
