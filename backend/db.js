const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
})

// ── Init DB ───────────────────────────────────────────────────────
async function initDB() {
  const client = await pool.connect()
  try {
    // Simply test the connection
    await client.query('SELECT 1')
    console.log('✅ Database connected successfully')
  } catch (err) {
    console.error('❌ DB connection error:', err.message)
    throw err
  } finally {
    client.release()
  }
}

module.exports = { pool, initDB }
