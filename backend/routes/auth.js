const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../db')
const { auth } = require('../middleware/auth')

const JWT_SECRET = process.env.JWT_SECRET || 'VernonAutoDetailing_secret'
const JWT_EXPIRES = '12h'

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' })
    }

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username.trim().toLowerCase()]
    )

    const user = rows[0]
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    if (password !== user.password) return res.status(401).json({ error: 'Incorrect password' })
    // const match = await bcrypt.compare(password, user.password)
    // if (!match) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    )

    res.json({
      token,
      user: { id: user.id, username: user.username, name: user.name, role: user.role }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/auth/me  — verify token & return user
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user })
})

module.exports = router
