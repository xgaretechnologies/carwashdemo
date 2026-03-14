require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const { initDB } = require('./db')

const app = express()
const PORT = process.env.PORT

const allowedOrigins = [
  'http://localhost:5173',
  'https://vernonautodetailing.xgaretechnologies.com'
]

// ── Middleware ────────────────────────────────────────────────────
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use((req, _res, next) => {
  console.log(`${new Date().toISOString().slice(11, 19)} ${req.method} ${req.path}`)
  next()
})

// ── API Routes ────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'))
app.use('/api/bookings', require('./routes/bookings'))
app.use('/api/employees', require('./routes/employees'))

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }))

// ── Global error handler ──────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ── Start ─────────────────────────────────────────────────────────
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`VernonAutoDetailing API running on ${PORT}`)
    })
  })
  .catch(err => {
    console.error('Failed to initialise database:', err.message)
    process.exit(1)
  })
