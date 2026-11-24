import express from 'express'
import { pool } from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

const LOGO_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1']

function guessCategory(text) {
  const t = text.toLowerCase()
  if (t.includes('machine learning') || t.includes(' ml ') || t.includes(' ai ')) return 'AI/ML'
  if (t.includes('data scien') || t.includes('data analy')) return 'Data Science'
  if (t.includes('full stack') || t.includes('fullstack')) return 'Full Stack'
  if (t.includes('backend') || t.includes('back-end')) return 'Backend'
  if (t.includes('android') || t.includes('ios') || t.includes('mobile') || t.includes('flutter')) return 'Mobile'
  return 'Frontend'
}

// OPTIONAL: if Adzuna keys are set in .env, fetch live jobs and save them into the jobs table.
// After that, ranking is done by SQL, exactly the same as for the sample jobs.
let lastImport = 0
async function importAdzunaJobs(targetRole) {
  const { ADZUNA_APP_ID, ADZUNA_APP_KEY } = process.env
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) return
  if (Date.now() - lastImport < 60 * 60 * 1000) return // at most once an hour (free plan limit)
  lastImport = Date.now()

  try {
    const query = encodeURIComponent(targetRole || 'developer intern')
    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=15&what=${query}&content-type=application/json`
    const data = await (await fetch(url)).json()

    const [skillRows] = await pool.query('SELECT skill_id, skill_name FROM skills')

    for (const job of data.results || []) {
      const title = job.title || 'Untitled role'
      const description = (job.description || '').slice(0, 500)
      const text = `${title} ${description}`.toLowerCase()

      const [ins] = await pool.query(
        `INSERT IGNORE INTO jobs (external_id, title, company, location, job_type, salary, description, category, posted, apply_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          String(job.id), title, job.company?.display_name || 'Unknown', job.location?.display_name || '',
          /intern/i.test(title) ? 'Internship' : 'Full-time',
          job.salary_min ? `₹${Math.round(job.salary_min)} - ₹${Math.round(job.salary_max || job.salary_min)}` : 'Not specified',
          description, guessCategory(` ${text} `),
          job.created ? job.created.slice(0, 10) : 'Recently', job.redirect_url || '',
        ]
      )
      if (ins.affectedRows === 0) continue // already imported earlier

      // Link the job to every known skill that appears in its text
      for (const s of skillRows) {
        const escaped = s.skill_name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const found = new RegExp(`(^|[^a-z0-9+#.])${escaped}($|[^a-z0-9+#.])`).test(text)
        if (found && s.skill_name.length > 1) {
          await pool.query('INSERT IGNORE INTO job_skills (job_id, skill_id) VALUES (?, ?)', [ins.insertId, s.skill_id])
        }
      }
    }
  } catch (err) {
    console.error('Adzuna import failed, using jobs already in the database:', err.message)
  }
}

// GET /api/jobs
// The ranking is pure SQL: for every job, count how many of its skills the user also has.
router.get('/', requireAuth, async (req, res) => {
  const [[user]] = await pool.query(
    `SELECT r.role_name FROM users u LEFT JOIN roles r ON r.role_id = u.target_role_id WHERE u.user_id = ?`,
    [req.userId]
  )
  await importAdzunaJobs(user?.role_name)

  const [jobs] = await pool.query(
    `SELECT j.job_id AS id, j.title, j.company, j.location, j.job_type AS type, j.salary,
            j.description, j.category, j.posted, j.apply_url AS url,
            COALESCE(ROUND(100 * COUNT(us.skill_id) / NULLIF(COUNT(js.skill_id), 0)), 40) AS \`match\`
       FROM jobs j
       LEFT JOIN job_skills js  ON js.job_id = j.job_id
       LEFT JOIN user_skills us ON us.skill_id = js.skill_id AND us.user_id = ?
      GROUP BY j.job_id
      ORDER BY \`match\` DESC, j.job_id DESC
      LIMIT 30`,
    [req.userId]
  )

  // Fetch the skill names for those jobs (one extra query for all of them)
  let skillsByJob = {}
  if (jobs.length > 0) {
    const [skillRows] = await pool.query(
      `SELECT js.job_id, s.skill_name
         FROM job_skills js JOIN skills s ON s.skill_id = js.skill_id
        WHERE js.job_id IN (?)`,
      [jobs.map((j) => j.id)]
    )
    for (const row of skillRows) {
      ;(skillsByJob[row.job_id] ||= []).push(row.skill_name)
    }
  }

  res.json(
    jobs.map((job, i) => ({
      ...job,
      match: Number(job.match),
      skills: skillsByJob[job.id] || [],
      logo: job.company?.[0]?.toUpperCase() || '?',
      logoColor: LOGO_COLORS[i % LOGO_COLORS.length],
      verified: true,
    }))
  )
})

export default router
