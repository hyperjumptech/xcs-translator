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
