import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Search, Shield, Briefcase, Eye, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/blind-spot', icon: Eye, label: 'Blind Spot Detector' },
  { to: '/jobs', icon: Search, label: 'Job Recommendations' },
  { to: '/fake-detector', icon: Shield, label: 'Fake Internship Check' },
  { to: '/tracker', icon: Briefcase, label: 'Application Tracker' },
]

function ShieldLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect width="36" height="36" rx="10" fill="#0D9488" />
      <path
        d="M18 7.5 9.5 10.8v6.2c0 5.2 3.5 9.2 8.5 10.7 5-1.5 8.5-5.5 8.5-10.7v-6.2L18 7.5Z"
        fill="#fff"
        fillOpacity="0.18"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m14.2 18.2 2.9 2.9 5.2-5.7"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initial = user?.name?.[0]?.toUpperCase() || '?'

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <ShieldLogo />
        <div>
          <div className="sidebar-brand-name">HireShield</div>
          <div className="sidebar-brand-tag">Smart Career &amp; Scam Guard</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav" aria-label="Main">
        <div className="sidebar-section">Features</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom profile */}
      <div className="sidebar-profile">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div className="sidebar-avatar">{initial}</div>
          <div style={{ overflow: 'hidden', minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name || 'Loading...'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{user?.targetRole || 'Student'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm btn-block"
          style={{ fontSize: 13 }}
        >
          <LogOut size={14} /> Log out
        </button>
      </div>
    </aside>
  )
}