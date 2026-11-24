import express from 'express'
import { pool } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'
import { getProfile, saveSkills, roleIdByName } from '../utils/profileHelper.js'

const router = express.Router()
router.use(requireAuth)

// GET /api/profile
router.get('/', async (req, res) => {
  const user = await getProfile(req.userId)
  if (!user) return res.status(404).json({ message: 'User not found.' })
  res.json(user)
})

// PUT /api/profile  — update any of: name, college, branch, year, resumeLink, targetRole, skills
router.put('/', async (req, res) => {
  const { name, college, branch, year, resumeLink, targetRole, skills } = req.body

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const sets = []
    const values = []
    if (name !== undefined)       { sets.push('name = ?');          values.push(name) }
    if (college !== undefined)    { sets.push('college = ?');       values.push(college) }
    if (branch !== undefined)     { sets.push('branch = ?');        values.push(branch) }
    if (year !== undefined)       { sets.push('year_of_study = ?'); values.push(year) }
    if (resumeLink !== undefined) { sets.push('resume_link = ?');   values.push(resumeLink) }
    if (targetRole !== undefined) {
      sets.push('target_role_id = ?')
      values.push(await roleIdByName(conn, targetRole))
    }

    if (sets.length > 0) {
      await conn.query(`UPDATE users SET ${sets.join(', ')} WHERE user_id = ?`, [...values, req.userId])
    }
    if (Array.isArray(skills)) {
      await saveSkills(conn, req.userId, skills)
    }

    await conn.commit()
    res.json(await getProfile(req.userId))
  } catch (err) {
    await conn.rollback()
    console.error(err)
    res.status(500).json({ message: 'Could not update profile.' })
  } finally {
    conn.release()
  }
})

export default router
