import express from 'express'
import { pool } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'
import { scoreInternship } from '../utils/fakeCheckRules.js'

const router = express.Router()

// POST /api/fakecheck
// Scores the listing with the rules in fakeCheckRules.js, then SAVES the result:
// one row in fake_checks + one row per red flag in fake_check_flags (one-to-many).
router.post('/', requireAuth, async (req, res) => {
  const { title = '', company = '', salary = '', contact = '', description = '' } = req.body || {}
  const result = scoreInternship({ title, company, salary, contact, description })

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [check] = await conn.query(
      `INSERT INTO fake_checks (user_id, title, company, salary, contact, description, risk_score, verdict)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, title, company, salary, contact, description, result.score, result.verdict]
    )

    for (const flag of result.flags) {
      await conn.query(
        'INSERT INTO fake_check_flags (check_id, label, severity) VALUES (?, ?, ?)',
        [check.insertId, flag.label, flag.severity]
      )
    }

    await conn.commit()
  } catch (err) {
    await conn.rollback()
    console.error('Could not save fake-check history:', err.message)
    // The user still gets their result even if saving history failed.
  } finally {
    conn.release()
  }

  res.json(result)
})

export default router
