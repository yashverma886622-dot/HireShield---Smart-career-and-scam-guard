import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, CheckCircle2, Calendar, Sparkles, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function ShieldLogo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect width="36" height="36" rx="10" fill="#0D9488" />
      <path
        d="M18 7.5 9.5 10.8v6.2c0 5.2 3.5 9.2 8.5 10.7 5-1.5 8.5-5.5 8.5-10.7v-6.2L18 7.5Z"
        fill="#fff" fillOpacity="0.18" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"
      />
      <path d="m14.2 18.2 2.9 2.9 5.2-5.7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const weekDays = [
  { day: 'Mon', num: '23', active: false },
  { day: 'Tue', num: '24', active: true },
  { day: 'Wed', num: '25', active: false },
  { day: 'Thu', num: '26', active: false },
  { day: 'Fri', num: '27', active: false },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card-shell animate-in">
        {/* Left: Clean Form Panel */}
        <div className="auth-form-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldLogo />
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>HireShield</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Smart Career &amp; Scam Guard</div>
            </div>
          </div>

          <div style={{ maxWidth: 380, width: '100%', margin: '24px auto' }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Welcome back</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>
              Log in to track applications and verify internship listings.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  className="auth-pill-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="field" style={{ marginBottom: 22 }}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="auth-pill-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="alert alert-danger" role="alert" style={{ marginBottom: 16, fontSize: 13 }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg btn-block btn-pill" disabled={loading}>
                {loading ? 'Logging in...' : <>Log in <ArrowRight size={16} /></>}
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
            <span>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 700 }}>Sign up</Link>
            </span>
            <span>© HireShield</span>
          </div>
        </div>

        {/* Right: Rich Visual Showcase Panel */}
        <div className="auth-visual-panel">
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="hero-pill">
              <Sparkles size={13} /> Career Protection Active
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: 10 }}>
              Apply with confidence, not guesswork.
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', maxWidth: 340 }}>
              Detect scam internships, spot missing skills, and manage your entire interview pipeline in one place.
            </p>
          </div>

          {/* Floating Glass Preview Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 2, margin: '20px 0' }}>
            {/* Card 1: Scam Shield */}
            <div className="auth-glass-card float-card" style={{ alignSelf: 'flex-start', width: '88%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#99F6E4' }}>
                  <ShieldCheck size={15} /> Scam Guard Verified
                </span>
                <span style={{ fontSize: 11, background: '#10B981', color: '#fff', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                  98% Safe
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Frontend Developer Intern</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.72)' }}>0 red flags · Verified company domain</div>
            </div>

            {/* Card 2: Weekly Schedule Strip */}
            <div className="auth-glass-card float-card-alt" style={{ alignSelf: 'flex-end', width: '90%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#FDE68A' }}>
                  <Calendar size={14} /> Interview Pipeline
                </span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>This week</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, textAlign: 'center' }}>
                {weekDays.map((d) => (
                  <div key={d.day} style={{
                    padding: '6px 4px',
                    borderRadius: 10,
                    background: d.active ? '#fff' : 'rgba(255,255,255,0.08)',
                    color: d.active ? '#0F172A' : '#fff',
                  }}>
                    <div style={{ fontSize: 10, opacity: d.active ? 0.7 : 0.75 }}>{d.day}</div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{d.num}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.78)', position: 'relative', zIndex: 2 }}>
            <CheckCircle2 size={15} color="#5EEAD4" />
            <span>Built for students &amp; early-career engineers</span>
          </div>
        </div>
      </div>
    </div>
  )
}