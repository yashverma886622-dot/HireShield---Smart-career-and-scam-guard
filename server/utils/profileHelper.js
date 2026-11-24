import { pool } from '../config/db.js'

// Returns the user's profile in the shape the React app expects.
// Uses a LEFT JOIN (user may have no target role) and a second JOIN query for skills.
export async function getProfile(userId) {
  const [rows] = await pool.query(
    `SELECT u.user_id AS id, u.name, u.email, u.college, u.branch,
            u.year_of_study AS year, u.resume_link AS resumeLink,
            r.role_name AS targetRole
       FROM users u
       LEFT JOIN roles r ON u.target_role_id = r.role_id
      WHERE u.user_id = ?`,
    [userId]
  )
  if (rows.length === 0) return null

  const [skillRows] = await pool.query(
    `SELECT s.skill_name
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.skill_id
      WHERE us.user_id = ?
      ORDER BY s.skill_name`,
    [userId]
  )

  return {
    ...rows[0],
    targetRole: rows[0].targetRole || '',
    skills: skillRows.map((r) => r.skill_name),
  }
}

// Replaces a user's skills with the given list.
// New skill names are added to the skills table first (INSERT IGNORE skips duplicates).
export async function saveSkills(conn, userId, skills) {
  await conn.query('DELETE FROM user_skills WHERE user_id = ?', [userId])

  for (const raw of skills) {
    const name = String(raw).trim()
    if (!name) continue
    await conn.query('INSERT IGNORE INTO skills (skill_name) VALUES (?)', [name])
    await conn.query(
      'INSERT IGNORE INTO user_skills (user_id, skill_id) SELECT ?, skill_id FROM skills WHERE skill_name = ?',
      [userId, name]
    )
  }
}

// Finds a role_id from a role name (returns null if the name is empty/unknown).
export async function roleIdByName(conn, roleName) {
  if (!roleName) return null
  const [rows] = await conn.query('SELECT role_id FROM roles WHERE role_name = ?', [roleName])
  return rows.length ? rows[0].role_id : null
}
