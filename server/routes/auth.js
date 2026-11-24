import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db.js'
import { getProfile, saveSkills, roleIdByName } from '../utils/profileHelper.js'

const router = express.Router()

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// POST /api/auth/signup
// Inserts the user, then their skills, inside ONE transaction:
// either everything is saved, or nothing is (ROLLBACK on error).
router.post('/signup', async (req, res) => {
  const { name, email, password, college, branch, year, targetRole, skills, resumeLink } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' })
  }

  const conn = await pool.getConnection()
  try {
    const [existing] = await conn.query('SELECT user_id FROM users WHERE email = ?', [email.toLowerCase()])
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await conn.beginTransaction()

    const roleId = await roleIdByName(conn, targetRole)
    const [result] = await conn.query(
      `INSERT INTO users (name, email, password_hash, college, branch, year_of_study, resume_link, target_role_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email.toLowerCase(), passwordHash, college || '', branch || '', year || '', resumeLink || '', roleId]
    )
    const userId = result.insertId

    await saveSkills(conn, userId, Array.isArray(skills) ? skills : [])

    await conn.commit()

    const user = await getProfile(userId)
    res.status(201).json({ token: signToken(userId), user })
  } catch (err) {
    await conn.rollback()
    console.error(err)
    res.status(500).json({ message: 'Something went wrong while creating your account.' })
  } finally {
    conn.release()
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const [rows] = await pool.query(
      'SELECT user_id, password_hash FROM users WHERE email = ?',
      [email.toLowerCase()]
    )
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const match = await bcrypt.compare(password, rows[0].password_hash)
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const user = await getProfile(rows[0].user_id)
    res.json({ token: signToken(rows[0].user_id), user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong while logging in.' })
  }
})

export default router
