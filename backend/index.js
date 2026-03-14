require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const { initDB } = require('./db')

const app = express()
const PORT = process.env.PORT || 5003

// ── Middleware ────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString().slice(11, 19)} ${req.method} ${req.path}`)
    next()
  })
}

// ── API Routes ────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'))
app.use('/api/bookings', require('./routes/bookings'))
app.use('/api/employees', require('./routes/employees'))

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }))

// ── Serve React build in production ──────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')))
}

// ── Global error handler ──────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ── Start ─────────────────────────────────────────────────────────
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚿 VernonAutoDetailing API running on http://localhost:${PORT}`)
      console.log(`   Health: http://localhost:${PORT}/api/health\n`)
    })
  })
  .catch(err => {
    console.error('Failed to initialise database:', err.message)
    process.exit(1)
  })
