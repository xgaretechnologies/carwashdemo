const router = require('express').Router()
const { pool } = require('../db')
const { auth, managerOnly } = require('../middleware/auth')

function mapRow(r) {
  return {
    id:     r.id,
    name:   r.name,
    role:   r.role,
    phone:  r.phone,
    email:  r.email,
    shift:  r.shift,
    status: r.status,
    createdAt: r.created_at,
  }
}

// GET /api/employees  — all staff can view
router.get('/', auth, async (req, res) => {
  try {
    const { search, status } = req.query
    const conds = []; const vals = []

    if (status && status !== 'all') {
      vals.push(status); conds.push(`status = $${vals.length}`)
    }
    if (search) {
      vals.push(`%${search}%`)
      conds.push(`(name ILIKE $${vals.length} OR role ILIKE $${vals.length})`)
    }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : ''
    const { rows } = await pool.query(
      `SELECT * FROM employees ${where} ORDER BY name ASC`, vals
    )
    res.json(rows.map(mapRow))
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employees' })
  }
})

// GET /api/employees/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM employees WHERE id=$1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Employee not found' })
    res.json(mapRow(rows[0]))
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employee' })
  }
})

// POST /api/employees  — manager only
router.post('/', auth, managerOnly, async (req, res) => {
  try {
    const { name, role, phone, email, shift, status } = req.body
    if (!name || !role || !phone || !shift) {
      return res.status(400).json({ error: 'name, role, phone and shift are required' })
    }
    const { rows } = await pool.query(
      `INSERT INTO employees (name, role, phone, email, shift, status)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, role, phone, email||'', shift, status||'active']
    )
    res.status(201).json(mapRow(rows[0]))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create employee' })
  }
})

// PUT /api/employees/:id  — manager only
router.put('/:id', auth, managerOnly, async (req, res) => {
  try {
    const { name, role, phone, email, shift, status } = req.body
    if (!name || !role || !phone || !shift) {
      return res.status(400).json({ error: 'name, role, phone and shift are required' })
    }
    const { rows } = await pool.query(
      `UPDATE employees SET name=$1, role=$2, phone=$3, email=$4, shift=$5, status=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [name, role, phone, email||'', shift, status||'active', req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Employee not found' })
    res.json(mapRow(rows[0]))
  } catch (err) {
    res.status(500).json({ error: 'Failed to update employee' })
  }
})

// PATCH /api/employees/:id/status  — manager only
router.patch('/:id/status', auth, managerOnly, async (req, res) => {
  try {
    const { status } = req.body
    if (!['active','inactive'].includes(status)) {
      return res.status(400).json({ error: 'Status must be active or inactive' })
    }
    const { rows } = await pool.query(
      'UPDATE employees SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Employee not found' })
    res.json(mapRow(rows[0]))
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' })
  }
})

// DELETE /api/employees/:id  — manager only
router.delete('/:id', auth, managerOnly, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM employees WHERE id=$1 RETURNING id', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Employee not found' })
    res.json({ message: 'Employee deleted', id: rows[0].id })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete employee' })
  }
})

module.exports = router
