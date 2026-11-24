import 'dotenv/config'
import express from 'express'
import 'express-async-errors' // lets async route errors reach the error handler below instead of crashing
import cors from 'cors'
import { testConnection } from './config/db.js'

import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import applicationRoutes from './routes/applications.js'
import blindspotRoutes from './routes/blindspot.js'
import fakecheckRoutes from './routes/fakecheck.js'
import jobsRoutes from './routes/jobs.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/blindspot', blindspotRoutes)
app.use('/api/fakecheck', fakecheckRoutes)
app.use('/api/jobs', jobsRoutes)

// Catches any error thrown inside a route (e.g. a failed SQL query)
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Server error. Please try again.' })
})

const PORT = process.env.PORT || 5000

testConnection().then(() => {
  app.listen(PORT, () => console.log(`CareerLens API running on http://localhost:${PORT}`))
})
