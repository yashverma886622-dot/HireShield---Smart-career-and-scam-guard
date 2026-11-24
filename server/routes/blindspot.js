import express from 'express'
import { pool } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// GET /api/blindspot
// One SQL query: JOIN the user's target role to the skills that role needs,
// then LEFT JOIN the user's own skills. If the LEFT JOIN finds no match, the user is missing that skill.
router.get('/', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT r.role_name, s.skill_name, rs.importance,
            (us.user_id IS NOT NULL) AS has_skill
       FROM users u
       JOIN roles r        ON r.role_id  = u.target_role_id
       JOIN role_skills rs ON rs.role_id = r.role_id
       JOIN skills s       ON s.skill_id = rs.skill_id
       LEFT JOIN user_skills us ON us.user_id = u.user_id AND us.skill_id = rs.skill_id
      WHERE u.user_id = ?
      ORDER BY s.skill_name`,
    [req.userId]
  )

  if (rows.length === 0) {
    return res.json({
      targetRole: null,
      message: 'Choose a target role on your profile to see your skill gap.',
      matched: [], missingRequired: [], missingPreferred: [], matchPercent: 0,
    })
  }

  const required = rows.filter((r) => r.importance === 'required')
  const preferred = rows.filter((r) => r.importance === 'preferred')
  const matched = required.filter((r) => r.has_skill).map((r) => r.skill_name)

  res.json({
    targetRole: rows[0].role_name,
    matched,
    missingRequired: required.filter((r) => !r.has_skill).map((r) => r.skill_name),
    missingPreferred: preferred.filter((r) => !r.has_skill).map((r) => r.skill_name),
    matchPercent: required.length ? Math.round((matched.length / required.length) * 100) : 0,
  })
})

export default router
