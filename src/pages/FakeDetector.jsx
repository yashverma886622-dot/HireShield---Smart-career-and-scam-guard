import { useState } from 'react'
import { Shield, AlertTriangle, CheckCircle, XCircle, Search, Loader } from 'lucide-react'
import { suspiciousInternships } from '../data/mockData'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function FakeDetector() {
  const { token } = useAuth()
  const [tab, setTab] = useState('check') // 'check' | 'examples'
  const [form, setForm] = useState({ title: '', company: '', description: '', salary: '', contact: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheck = async () => {
    if (!form.title && !form.description) return
    setLoading(true)
    setError('')
    try {
      const data = await api.checkFakeInternship(form, token)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const verdictConfig = {
    'FAKE': { color: '#EF4444', bg: '#EF444415', icon: XCircle, label: '🚨 Likely Fake — Do NOT Apply' },
    'SUSPICIOUS': { color: '#F59E0B', bg: '#F59E0B15', icon: AlertTriangle, label: '⚠️ Suspicious — Verify Before Applying' },
    'REVIEW': { color: '#6366F1', bg: '#6366F115', icon: AlertTriangle, label: '🔍 Review Carefully' },
    'LIKELY SAFE': { color: '#10B981', bg: '#10B98115', icon: CheckCircle, label: '✅ Likely Legitimate' },
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <div style={{ background: '#F59E0B20', padding: 10, borderRadius: 10 }}>
          <Shield size={22} color="var(--yellow)" />
        </div>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Fake Internship Detector</h1>
          <p style={{ color: 'var(--muted2)', fontSize: 14, margin: 0 }}>Paste a listing to instantly check if it's legitimate</p>
        </div>
      </div>
      <div style={{ height: 1, background: 'var(--border)', margin: '20px 0 24px' }} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--card)', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 24, border: '1px solid var(--border)' }}>
        {[['check', '🔍 Check a Listing'], ['examples', '📋 Known Scam Examples']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: tab === key ? 'var(--accent)' : 'transparent',
            color: tab === key ? 'white' : 'var(--muted2)',
            fontFamily: 'Inter', fontWeight: 500, fontSize: 14, transition: 'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'check' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          {/* Form */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>Enter Internship Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label>Job Title *</label>
                <input placeholder="e.g. Work from Home – Earn ₹5000/day" value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label>Company Name</label>
                <input placeholder="Company name" value={form.company}
                  onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
              </div>
              <div>
                <label>Salary / Stipend</label>
                <input placeholder="e.g. ₹50,000/week or commission based" value={form.salary}
                  onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} />
              </div>
              <div>
                <label>Contact Method</label>
                <input placeholder="e.g. WhatsApp only, email, portal" value={form.contact}
                  onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} />
              </div>
              <div>
                <label>Job Description</label>
                <textarea rows={4} placeholder="Paste the job description here..." value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13 }}
                onClick={handleCheck} disabled={loading || (!form.title && !form.description)}>
                {loading ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : <><Shield size={15} /> Check This Listing</>}
              </button>
            </div>
          </div>

          {/* Result */}
          <div>
            {error && (
              <div className="card" style={{ borderColor: '#EF444440', background: '#EF444410', marginBottom: 16 }}>
                <p style={{ color: 'var(--red)', fontSize: 13, margin: 0 }}>{error}</p>
              </div>
            )}
            {!result && !loading ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: 56, marginBottom: 14 }}>🛡️</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Enter listing details to analyze</h3>
                <p style={{ color: 'var(--muted2)', fontSize: 14 }}>We check for 10+ red flag patterns used by fake internship scammers.</p>
              </div>
            ) : loading ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <p style={{ color: 'var(--muted2)', fontSize: 15 }}>Analyzing listing for red flags...</p>
              </div>
            ) : result && (() => {
              const cfg = verdictConfig[result.verdict]
              const VIcon = cfg.icon
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Verdict */}
                  <div className="card" style={{ background: cfg.bg, borderColor: cfg.color + '50', textAlign: 'center' }}>
                    <VIcon size={40} color={cfg.color} style={{ marginBottom: 10 }} />
                    <div style={{ fontSize: 22, fontWeight: 700, color: cfg.color, fontFamily: 'Space Grotesk' }}>{cfg.label}</div>
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 13, color: 'var(--muted2)', marginBottom: 6 }}>Risk Score</div>
                      <div style={{ fontSize: 40, fontWeight: 700, color: cfg.color, fontFamily: 'Space Grotesk' }}>{result.score}/100</div>
                      <div className="progress-bar" style={{ marginTop: 10, height: 8 }}>
                        <div className="progress-fill" style={{ width: `${result.score}%`, background: cfg.color }} />
                      </div>
                    </div>
                  </div>

                  {/* Flags found */}
                  {result.flags.length > 0 ? (
                    <div className="card">
                      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Red Flags Detected ({result.flags.length})</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {result.flags.map((flag, i) => (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 14px', borderRadius: 8,
                            background: flag.severity === 'high' ? '#EF444410' : flag.severity === 'medium' ? '#F59E0B10' : '#6366F110',
                            border: `1px solid ${flag.severity === 'high' ? '#EF444430' : flag.severity === 'medium' ? '#F59E0B30' : '#6366F130'}`,
                          }}>
                            <AlertTriangle size={15} color={flag.severity === 'high' ? 'var(--red)' : flag.severity === 'medium' ? 'var(--yellow)' : 'var(--accent2)'} />
                            <span style={{ fontSize: 13, flex: 1 }}>{flag.label}</span>
                            <span style={{
                              fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 600,
                              background: flag.severity === 'high' ? '#EF444425' : '#F59E0B25',
                              color: flag.severity === 'high' ? 'var(--red)' : 'var(--yellow)',
                              textTransform: 'uppercase',
                            }}>{flag.severity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="card" style={{ borderColor: '#10B98140' }}>
                      <div style={{ display: 'flex', align: 'center', gap: 10 }}>
                        <CheckCircle size={18} color="var(--green)" />
                        <span style={{ color: 'var(--green)', fontWeight: 500 }}>No red flags detected — looks legitimate!</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      ) : (
        /* Known scams */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{ color: 'var(--muted2)', fontSize: 14 }}>These are real patterns from known fraudulent internship listings in India.</p>
          {suspiciousInternships.map(item => (
            <div key={item.id} className="card" style={{ borderColor: item.verdict === 'FAKE' ? '#EF444440' : '#F59E0B40' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{item.title}</h3>
                  <p style={{ color: 'var(--muted2)', fontSize: 13 }}>{item.company}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge badge-${item.verdict === 'FAKE' ? 'red' : 'yellow'}`} style={{ fontSize: 13, fontWeight: 700 }}>
                    {item.verdict}
                  </span>
                  <div style={{ fontSize: 24, fontWeight: 700, color: item.verdict === 'FAKE' ? 'var(--red)' : 'var(--yellow)', fontFamily: 'Space Grotesk', marginTop: 6 }}>{item.riskScore}/100</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {item.flags.map((flag, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--muted2)' }}>
                    <XCircle size={14} color="var(--red)" style={{ flexShrink: 0 }} />
                    {flag}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
