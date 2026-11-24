import mysql from 'mysql2/promise'

// A "pool" keeps a few database connections open and reuses them for every query.
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'careerlens_db',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true, // return DATE columns as 'YYYY-MM-DD' text instead of JS Date objects
})

export async function testConnection() {
  try {
    const conn = await pool.getConnection()
    conn.release()
    console.log('MySQL connected')
  } catch (err) {
    console.error('MySQL connection failed:', err.message)
    console.error('Check DB_USER / DB_PASSWORD in server/.env and that schema.sql has been run.')
    process.exit(1)
  }
}
