const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'VernonAutoDetailing',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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
