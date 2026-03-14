const router = require('express').Router()
const { pool } = require('../db')
const { auth } = require('../middleware/auth')

// helper to map DB row → frontend shape
function mapRow(r) {
  return {
    id: r.id,
    customer: r.customer,
    phone: r.phone,
    email: r.email,
    make: r.make,
    model: r.model,
    year: r.year,
    plate: r.plate,
    size: r.size,
    cond: r.cond,
    service: r.service,
    type: r.type,
    slot: r.slot,
    notes: r.notes,
    date: r.date instanceof Date
      ? `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, '0')}-${String(r.date.getDate()).padStart(2, '0')}`
      : String(r.date).slice(0, 10),
    status: r.status,
    createdAt: r.created_at,
  }
}

// GET /api/bookings?date=YYYY-MM-DD&status=pending
router.get('/', auth, async (req, res) => {
  try {
    const { date, status } = req.query
    const conds = []
    const vals = []

    if (date) {
      vals.push(date)
      conds.push(`date = $${vals.length}`)
    }
    if (status && status !== 'all') {
      vals.push(status)
      conds.push(`status = $${vals.length}`)
    }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : ''
    const { rows } = await pool.query(
      `SELECT * FROM bookings ${where} ORDER BY date ASC, slot ASC`,
      vals
    )
    res.json(rows.map(mapRow))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

// GET /api/bookings/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Booking not found' })
    res.json(mapRow(rows[0]))
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch booking' })
  }
})

// POST /api/bookings
router.post('/', auth, async (req, res) => {
  try {
    let { customer, phone, email, make, model, year, plate, size, cond, service, type, slot, notes, date, status } = req.body

    // Validate required
    if (!customer || !phone || !make || !model || !year || !size || !cond || !service || !slot || !date) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Normalize type
    const normType = (type || 'walkin').toLowerCase().trim().replace('-', '')

    // Check slot not already taken on that date for that type
    const conflict = await pool.query(
      `SELECT id FROM bookings 
       WHERE date = $1 AND slot = $2 
       AND LOWER(TRIM(REPLACE(type, '-', ''))) = $3 
       AND status != $4`,
      [date, slot, normType, 'cancelled']
    )
    if (conflict.rows.length) {
      return res.status(409).json({ error: `Slot ${slot} is already booked for ${date}` })
    }

    const { rows } = await pool.query(
      `INSERT INTO bookings (customer, phone, email, make, model, year, plate, size, cond, service, type, slot, notes, date, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [customer, phone, email || '', make, model, String(year), plate || '', size, cond, service, normType, slot, notes || '', date, status || 'pending', req.user.id]
    )
    res.status(201).json(mapRow(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create booking' })
  }
})

// PUT /api/bookings/:id  — full update
router.put('/:id', auth, async (req, res) => {
  try {
    let { customer, phone, email, make, model, year, plate, size, cond, service, type, slot, notes, date, status } = req.body
    const { id } = req.params

    // Check booking exists
    const exist = await pool.query('SELECT id, date, slot, type FROM bookings WHERE id = $1', [id])
    if (!exist.rows[0]) return res.status(404).json({ error: 'Booking not found' })

    // Normalize type
    const normType = (type || 'walkin').toLowerCase().trim().replace('-', '')

    // If slot/date/type changed, check conflict
    const old = exist.rows[0]
    const dateStr = String(old.date).slice(0, 10)
    const oldNormType = (old.type || 'walkin').toLowerCase().trim().replace('-', '')

    if (slot !== old.slot || date !== dateStr || normType !== oldNormType) {
      const conflict = await pool.query(
        `SELECT id FROM bookings 
         WHERE date = $1 AND slot = $2 
         AND LOWER(TRIM(REPLACE(type, '-', ''))) = $3 
         AND status != $4 AND id != $5`,
        [date, slot, normType, 'cancelled', id]
      )
      if (conflict.rows.length) {
        return res.status(409).json({ error: `Slot ${slot} is already booked for ${date}` })
      }
    }

    const { rows } = await pool.query(
      `UPDATE bookings SET
        customer=$1, phone=$2, email=$3, make=$4, model=$5, year=$6,
        plate=$7, size=$8, cond=$9, service=$10, type=$11, slot=$12,
        notes=$13, date=$14, status=$15, updated_at=NOW()
       WHERE id=$16 RETURNING *`,
      [customer, phone, email || '', make, model, String(year), plate || '', size, cond, service, normType, slot, notes || '', date, status, id]
    )
    res.json(mapRow(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update booking' })
  }
})

// PATCH /api/bookings/:id/status  — quick status change
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body
    const allowed = ['pending', 'inprogress', 'done', 'cancelled']
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    const { rows } = await pool.query(
      'UPDATE bookings SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Booking not found' })
    res.json(mapRow(rows[0]))
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' })
  }
})

// DELETE /api/bookings/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM bookings WHERE id=$1 RETURNING id', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Booking not found' })
    res.json({ message: 'Booking deleted', id: rows[0].id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete booking' })
  }
})

module.exports = router
