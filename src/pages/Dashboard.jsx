import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye, Search, Shield, Briefcase, ArrowRight,
  FileText, TrendingUp, CheckCircle, XCircle, Sparkles,
} from 'lucide-react'

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  const fromRef = useRef(0)

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion || target === fromRef.current) {
      fromRef.current = target
      setValue(target)
      return
    }

    const from = fromRef.current
    let raf
    let start

    const tick = (now) => {
      if (start === undefined) start = now
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = Math.round(from + (target - from) * eased)
      fromRef.current = next
      setValue(next)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}

function StatValue({ value }) {
  const n = useCountUp(value)
  return (
    <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
      {n}
    </div>
  )
}

/* Pure SVG Semi-Circle Gauge (inspired by modern analytics UI) */
function ReadinessGauge({ score }) {
  const radius = 70
  const circumference = Math.PI * radius
  const clamped = Math.max(0, Math.min(100, score))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div style={{ position: 'relative', width: 180, height: 105, margin: '0 auto' }}>
      <svg width="180" height="105" viewBox="0 0 180 105">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
        <path
          d="M 20 90 A 70 70 0 0 1 160 90"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M 20 90 A 70 70 0 0 1 160 90"
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center',
      }}>
        <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: 'var(--text)' }}>{clamped}%</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginTop: 3 }}>Pipeline Health</div>
      </div>
    </div>
  )
}

/* Pure SVG Donut Chart for Application Breakdown */
function PipelineDonut({ total, segments }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  let cumulative = 0

  return (
    <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="16" />
        {total > 0 && segments.map((seg) => {
          if (seg.value === 0) return null
          const dash = (seg.value / total) * circumference
          const gap = circumference - dash
          const offset = -cumulative
          cumulative += dash
          return (
            <circle
              key={seg.label}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="16"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              style={{ transition: 'all 0.8s ease' }}
            />
          )
        })}
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Total</div>
      </div>
    </div>
  )
}

export default function Dashboard({ applications = [], loading = false }) {
  const navigate = useNavigate()

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'Applied').length,
    interview: applications.filter(a => a.status === 'Interview').length,
    offered: applications.filter(a => a.status === 'Offered').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  }

  const activeCount = stats.applied + stats.interview + stats.offered
  const healthScore = stats.total === 0 ? 75 : Math.round(((activeCount + stats.interview * 1.5 + stats.offered * 2) / (stats.total * 2)) * 100)

  const kpis = [
    { label: 'Total Applied', value: stats.total, icon: FileText, color: '#0D9488', bg: '#CCFBF1', pct: 100 },
    { label: 'In Interview', value: stats.interview, icon: TrendingUp, color: '#D97706', bg: '#FEF3C7', pct: stats.total ? Math.round((stats.interview / stats.total) * 100) : 0 },
    { label: 'Offers Received', value: stats.offered, icon: CheckCircle, color: '#059669', bg: '#D1FAE5', pct: stats.total ? Math.round((stats.offered / stats.total) * 100) : 0 },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: '#DC2626', bg: '#FEE2E2', pct: stats.total ? Math.round((stats.rejected / stats.total) * 100) : 0 },
  ]

  const segments = [
    { label: 'Applied', value: stats.applied, color: '#0EA5E9' },
    { label: 'Interview', value: stats.interview, color: '#F59E0B' },
    { label: 'Offered', value: stats.offered, color: '#10B981' },
    { label: 'Rejected', value: stats.rejected, color: '#EF4444' },
  ]

  const features = [
    {
      icon: Eye,
      title: 'Blind Spot Detector',
      desc: 'Find missing skills for your target role',
      path: '/blind-spot',
      color: '#0D9488',
      bg: '#CCFBF1',
      action: 'Analyze skills',
    },
    {
      icon: Search,
      title: 'Job Recommendations',
      desc: 'Curated jobs matched to your profile',
      path: '/jobs',
      color: '#0284C7',
      bg: '#E0F2FE',
      action: 'Browse jobs',
    },
    {
      icon: Shield,
      title: 'Fake Internship Check',
      desc: 'Verify listings before you apply',
      path: '/fake-detector',
      color: '#D97706',
      bg: '#FEF3C7',
      action: 'Check a listing',
    },
    {
      icon: Briefcase,
      title: 'Application Tracker',
      desc: 'Track all your applications in one place',
      path: '/tracker',
      color: '#4F46E5',
      bg: '#E0E7FF',
      action: 'View tracker',
    },
  ]

  const recent = applications.slice(0, 4)

  return (
    <div className="page">
      {/* Rich Gradient Hero Banner */}
      <div className="hero-banner animate-in">
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 20, flexWrap: 'wrap',
        }}>
          <div>
            <div className="hero-pill">
              <Sparkles size={13} /> HireShield Career Command Center
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
              Welcome back 👋
            </h1>
            {loading ? (
              <div className="skeleton skeleton-text" style={{ width: 320, background: 'rgba(255,255,255,0.2)' }} />
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, maxWidth: 520 }}>
                You have <strong style={{ color: '#FDE68A' }}>{stats.interview} interview{stats.interview !== 1 ? 's' : ''}</strong> scheduled
                and <strong style={{ color: '#6EE7B7' }}>{stats.offered} offer{stats.offered !== 1 ? 's' : ''}</strong> waiting. Keep up the momentum!
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn hero-btn-glass btn-pill" onClick={() => navigate('/blind-spot')}>
              <Eye size={15} /> Check blind spots
            </button>
            <button className="btn hero-btn-white btn-pill" onClick={() => navigate('/jobs')}>
              <Search size={15} /> Find jobs
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid with Colored Top Accent Bars */}
      <div className="kpi-grid">
        {kpis.map(({ label, value, icon: Icon, color, bg, pct }, i) => (
          <div key={label} className={`card kpi-card card-lift animate-in stagger-${i + 1}`}>
            <div className="kpi-accent-bar" style={{ background: color }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{label}</span>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: bg, color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} />
              </div>
            </div>
            {loading ? (
              <div className="skeleton skeleton-title" style={{ width: 56, height: 32 }} />
            ) : (
              <>
                <StatValue value={value} />
                <div style={{ marginTop: 12 }}>
                  <div className="progress-bar" style={{ height: 5 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Visual Analytics Row: Gauge + Donut Pipeline */}
      <div className="grid-2 animate-in stagger-4" style={{ marginBottom: 28 }}>
        {/* Left: Semi-Circle Pipeline Health Gauge */}
        <div className="card card-lift" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="card-header" style={{ marginBottom: 8 }}>
            <div>
              <div className="card-title">Career Momentum</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Based on active applications &amp; interviews</div>
            </div>
            <span className="badge badge-teal">Active</span>
          </div>

          <div style={{ padding: '10px 0' }}>
            <ReadinessGauge score={healthScore} />
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
            paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 13,
          }}>
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: 10 }}>
              <div style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600 }}>Active Pipeline</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#0D9488' }}>{activeCount} roles</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: 10 }}>
              <div style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600 }}>Response Rate</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
                {stats.total ? Math.round(((stats.interview + stats.offered) / stats.total) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Right: Donut Chart + Breakdown Bars */}
        <div className="card card-lift">
          <div className="card-header" style={{ marginBottom: 14 }}>
            <div>
              <div className="card-title">Application Breakdown</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Status distribution across all tracked roles</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tracker')}>
              Tracker <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <PipelineDonut total={stats.total} segments={segments} />
            <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {segments.map((seg) => {
                const pct = stats.total ? Math.round((seg.value / stats.total) * 100) : 0
                return (
                  <div key={seg.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--muted2)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color }} />
                        {seg.label}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{seg.value} <span style={{ color: 'var(--muted)', fontWeight: 500 }}>({pct}%)</span></span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: seg.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="animate-in stagger-5" style={{ fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Quick actions</h2>
      <div className="grid-2" style={{ marginBottom: 28 }}>
        {features.map(({ icon: Icon, title, desc, path, color, bg, action }, i) => (
          <div
            key={path}
            className={`card card-interactive animate-in stagger-${i + 5}`}
            onClick={() => navigate(path)}
            style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{
                width: 46, height: 46, borderRadius: 12, background: bg, color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={21} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{title}</div>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>{desc}</div>
              </div>
            </div>
            <span style={{
              width: 34, height: 34, borderRadius: '50%', background: '#F8FAFC',
              border: '1px solid var(--border)', color: 'var(--muted2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }} title={action}>
              <ArrowRight size={15} />
            </span>
          </div>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="card-header animate-in stagger-7" style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700 }}>Recent applications</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tracker')}>
          View all <ArrowRight size={14} />
        </button>
      </div>
      <div className="card card-lift animate-in stagger-8" style={{ padding: 0, overflow: 'hidden' }}>
        {loading && [0, 1, 2].map((n) => (
          <div key={n} style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
            borderBottom: n < 2 ? '1px solid var(--border)' : 'none',
          }}>
            <div className="skeleton skeleton-circle" style={{ width: 38, height: 38, borderRadius: 10 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: 8 }} />
              <div className="skeleton skeleton-text" style={{ width: '25%', height: 10 }} />
            </div>
            <div className="skeleton" style={{ width: 64, height: 22, borderRadius: 999 }} />
          </div>
        ))}
        {!loading && recent.length === 0 && (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
            No applications yet. Add your first one in the tracker.
          </div>
        )}
        {!loading && recent.map((app, i) => (
          <div key={app.id} className="row-hover" style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '14px 20px',
            borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: app.logoColor + '20',
              color: app.logoColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 15, flexShrink: 0,
            }}>{app.logo}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{app.role}</div>
              <div style={{ color: 'var(--muted)', fontSize: 12 }}>{app.company} · {app.location}</div>
            </div>
            <span className={`badge badge-${app.status === 'Offered' ? 'green' : app.status === 'Interview' ? 'yellow' : app.status === 'Rejected' ? 'red' : 'blue'}`}>
              {app.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}