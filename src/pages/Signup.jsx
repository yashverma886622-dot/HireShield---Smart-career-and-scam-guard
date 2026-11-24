import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, Target, ClipboardList, Sparkles, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const TARGET_ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'ML Engineer', 'Data Scientist']
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year']

const highlights = [
  { icon: ShieldCheck, title: 'Scam Detection', desc: 'Spot fake internship listings before you apply' },
  { icon: Target, title: 'Blind Spot Analysis', desc: 'See which skills your target role expects' },
  { icon: ClipboardList, title: 'Pipeline Tracker', desc: 'Track every application from Applied to Offer' },
]

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

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    college: '', branch: '', year: '',
    targetRole: '', skills: '', resumeLink: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup({
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card-shell animate-in" style={{ maxWidth: 1120 }}>
        {/* Left: Form Panel */}
        <div className="auth-form-panel" style={{ padding: '28px 36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <ShieldLogo />
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>HireShield</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Smart Career &amp; Scam Guard</div>
            </div>
          </div>

          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Create your account</h1>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 18 }}>
              Tell us a bit about yourself to personalize job matches &amp; skill checks.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="grid-2 field" style={{ gap: 12, marginBottom: 12 }}>
                <div>
                  <label htmlFor="name">Full name</label>
                  <input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Yash Verma" required />
                </div>
                <div>
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" required />
                </div>
              </div>

              <div className="field" style={{ marginBottom: 12 }}>
                <label htmlFor="password">Password</label>
                <input id="password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="At least 6 characters" required minLength={6} />
              </div>

              <div className="grid-2 field" style={{ gap: 12, marginBottom: 12 }}>
                <div>
                  <label htmlFor="college">College / university</label>
                  <input id="college" value={form.college} onChange={(e) => update('college', e.target.value)} placeholder="e.g. K.R. Mangalam Univ" />
                </div>
                <div>
                  <label htmlFor="branch">Branch</label>
                  <input id="branch" value={form.branch} onChange={(e) => update('branch', e.target.value)} placeholder="e.g. CSE (AI & ML)" />
                </div>
              </div>

              <div className="grid-2 field" style={{ gap: 12, marginBottom: 12 }}>
                <div>
                  <label htmlFor="year">Year of study</label>
                  <select id="year" value={form.year} onChange={(e) => update('year', e.target.value)}>
                    <option value="">Select year</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="targetRole">Target role</label>
                  <select id="targetRole" value={form.targetRole} onChange={(e) => update('targetRole', e.target.value)}>
                    <option value="">Select a role</option>
                    {TARGET_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="field" style={{ marginBottom: 12 }}>
                <label htmlFor="skills">Skills (comma-separated)</label>
                <input id="skills" value={form.skills} onChange={(e) => update('skills', e.target.value)} placeholder="React, JavaScript, SQL, Python" />
              </div>

              <div className="field" style={{ marginBottom: 16 }}>
                <label htmlFor="resumeLink">Resume link (optional)</label>
                <input id="resumeLink" value={form.resumeLink} onChange={(e) => update('resumeLink', e.target.value)} placeholder="https://drive.google.com/..." />
              </div>

              {error && (
                <div className="alert alert-danger" role="alert" style={{ marginBottom: 14, fontSize: 13 }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg btn-block btn-pill" disabled={loading}>
                {loading ? 'Creating account...' : <>Create account <ArrowRight size={16} /></>}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 16 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>Log in</Link>
          </p>
        </div>

        {/* Right: Visual Panel */}
        <div className="auth-visual-panel">
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="hero-pill">
              <Sparkles size={13} /> Free Student Workspace
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: 10 }}>
              Your job search, protected and organized.
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)' }}>
              Set up your profile once and unlock tailored job recommendations, skill gap detection, and scam alerts.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 2, margin: '20px 0' }}>
            {highlights.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="auth-glass-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'rgba(94, 234, 212, 0.2)', color: '#99F6E4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.76)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', position: 'relative', zIndex: 2 }}>
            © HireShield · Built for smart job seekers
          </div>
        </div>
      </div>
    </div>
  )
}