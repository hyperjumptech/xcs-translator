import mariadb from 'mariadb'
import { cfg } from '../config'

// TODO: Remove hardcode
const { antigenDatabase, PCRDatabase } = cfg
const {
  host,
  port,
  database,
  user,
  password,
  connectionLimit,
} = antigenDatabase

// Connection pools reuse connections between invocations,
// and handle dropped or expired connections automatically.
const antigenPool = mariadb.createPool({
  host,
  port,
  database,
  user,
  password,
  connectionLimit,
})
const PCRPool = mariadb.createPool({
  host: PCRDatabase.host,
  port: PCRDatabase.port,
  database: PCRDatabase.database,
  user: PCRDatabase.user,
  password: PCRDatabase.password,
  connectionLimit: PCRDatabase.connectionLimit,
})

export async function getConnection(type: string) {
  if (type === 'antigen') {
    return await antigenPool.getConnection()
  }
  return await PCRPool.getConnection()
}

export async function endPool() {
  await antigenPool.end()
  await PCRPool.end()
}
