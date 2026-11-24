import express from 'express'
import { pool } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()
router.use(requireAuth)

const STATUSES = ['Applied', 'Interview', 'Offered', 'Rejected']

// Column aliases turn SQL names (role_title) into the names the React app uses (role).
const SELECT_COLUMNS = `
  application_id AS id, company, role_title AS role, status,
  applied_date AS appliedDate, deadline, location, salary, notes,
  next_step AS nextStep, logo, logo_color AS logoColor`

// SQL gives NULL for empty values; the React forms expect ''.
function clean(row) {
  const out = {}
  for (const key of Object.keys(row)) out[key] = row[key] === null ? '' : row[key]
  return out
}

const dateOrNull = (v) => (v ? v : null)

// GET /api/applications — only this user's rows (WHERE user_id = ?)
router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM applications WHERE user_id = ? ORDER BY created_at DESC, application_id DESC`,
    [req.userId]
  )
  res.json(rows.map(clean))
})

// POST /api/applications
router.post('/', async (req, res) => {
  const { company, role, status, appliedDate, deadline, location, salary, notes, nextStep, logo, logoColor } = req.body

  if (!company || !role) {
    return res.status(400).json({ message: 'Company and role are required.' })
  }
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' })
  }

  const [result] = await pool.query(
    `INSERT INTO applications
       (user_id, company, role_title, status, applied_date, deadline, location, salary, notes, next_step, logo, logo_color)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.userId, company, role, status || 'Applied',
      dateOrNull(appliedDate), dateOrNull(deadline),
      location || '', salary || '', notes || '', nextStep || '',
      logo || '', logoColor || '#3B82F6',
    ]
  )

  const [rows] = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM applications WHERE application_id = ?`,
    [result.insertId]
  )
  res.status(201).json(clean(rows[0]))
})

// PUT /api/applications/:id
router.put('/:id', async (req, res) => {
  const fieldMap = {
    company: 'company', role: 'role_title', status: 'status',
    appliedDate: 'applied_date', deadline: 'deadline', location: 'location',
    salary: 'salary', notes: 'notes', nextStep: 'next_step',
    logo: 'logo', logoColor: 'logo_color',
  }

  if (req.body.status && !STATUSES.includes(req.body.status)) {
    return res.status(400).json({ message: 'Invalid status.' })
  }

  const [existing] = await pool.query(
    'SELECT application_id FROM applications WHERE application_id = ? AND user_id = ?',
    [req.params.id, req.userId]
  )
  if (existing.length === 0) return res.status(404).json({ message: 'Application not found.' })

  const sets = []
  const values = []
  for (const [key, column] of Object.entries(fieldMap)) {
    if (req.body[key] !== undefined) {
      const isDate = column === 'applied_date' || column === 'deadline'
      sets.push(`${column} = ?`)
      values.push(isDate ? dateOrNull(req.body[key]) : req.body[key])
    }
  }

  if (sets.length > 0) {
    await pool.query(
      `UPDATE applications SET ${sets.join(', ')} WHERE application_id = ? AND user_id = ?`,
      [...values, req.params.id, req.userId]
    )
  }

  const [rows] = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM applications WHERE application_id = ?`,
    [req.params.id]
  )
  res.json(clean(rows[0]))
})

// DELETE /api/applications/:id
router.delete('/:id', async (req, res) => {
  const [result] = await pool.query(
    'DELETE FROM applications WHERE application_id = ? AND user_id = ?',
    [req.params.id, req.userId]
  )
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Application not found.' })
  res.json({ message: 'Deleted.' })
})

export default router
