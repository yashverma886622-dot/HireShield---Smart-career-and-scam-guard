import { useState } from 'react'
import { Briefcase, Plus, Trash2, Edit2, X, Check, ChevronDown, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'

const STATUSES = ['Applied', 'Interview', 'Offered', 'Rejected']

const statusStyle = {
  Applied: { badge: 'badge-blue', dot: '#3B82F6' },
  Interview: { badge: 'badge-yellow', dot: '#F59E0B' },
  Offered: { badge: 'badge-green', dot: '#10B981' },
  Rejected: { badge: 'badge-red', dot: '#EF4444' },
}

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk', color }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--muted2)' }}>{label}</div>
      </div>
    </div>
  )
}

const emptyForm = { company: '', role: '', status: 'Applied', appliedDate: '', deadline: '', location: '', salary: '', notes: '', nextStep: '', logo: '', logoColor: '#3B82F6' }

export default function AppTracker({ applications, addApplication, updateApplication, deleteApplication }) {
  const [filter, setFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const filtered = filter === 'All' ? applications : applications.filter(a => a.status === filter)

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true) }
  const openEdit = (app) => { setForm({ ...app }); setEditId(app.id); setShowModal(true) }

  const handleSave = () => {
    if (!form.company || !form.role) return
    const logo = form.logo || form.company[0].toUpperCase()
    if (editId) {
      updateApplication(editId, { ...form, logo })
    } else {
      addApplication({ ...form, logo })
    }
    setShowModal(false)
  }

  const stats = {
    total: applications.length,
    interview: applications.filter(a => a.status === 'Interview').length,
    offered: applications.filter(a => a.status === 'Offered').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <div style={{ background: '#8B5CF620', padding: 10, borderRadius: 10 }}>
          <Briefcase size={22} color="var(--accent2)" />
        </div>
        <div style={{ flex: 1 }}>
          <h1 className="page-title" style={{ margin: 0 }}>Application Tracker</h1>
          <p style={{ color: 'var(--muted2)', fontSize: 14, margin: 0 }}>All your job applications in one place</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={15} /> Add Application
        </button>
      </div>
      <div style={{ height: 1, background: 'var(--border)', margin: '20px 0 24px' }} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Applied" value={stats.total} color="#3B82F6" icon={Briefcase} />
        <StatCard label="In Interview" value={stats.interview} color="#F59E0B" icon={TrendingUp} />
        <StatCard label="Offers" value={stats.offered} color="#10B981" icon={CheckCircle} />
        <StatCard label="Rejected" value={stats.rejected} color="#EF4444" icon={XCircle} />
      </div>

      {/* Pipeline view */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {STATUSES.map(s => {
          const count = applications.filter(a => a.status === s).length
          const pct = applications.length ? Math.round((count / applications.length) * 100) : 0
          const cfg = statusStyle[s]
          return (
            <div key={s} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: 6 }}>{s}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%`, background: cfg.dot }} />
              </div>
              <div style={{ fontSize: 13, color: cfg.dot, fontWeight: 600, marginTop: 4 }}>{count} ({pct}%)</div>
            </div>
          )
        })}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['All', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '7px 16px', borderRadius: 20, border: '1px solid',
            borderColor: filter === s ? 'var(--accent)' : 'var(--border)',
            background: filter === s ? '#3B82F620' : 'transparent',
            color: filter === s ? 'var(--accent)' : 'var(--muted2)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter',
          }}>{s} {s !== 'All' && `(${applications.filter(a => a.status === s).length})`}</button>
        ))}
      </div>

      {/* Application list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <h3 style={{ marginBottom: 8 }}>No applications yet</h3>
            <p style={{ color: 'var(--muted2)', fontSize: 14, marginBottom: 16 }}>Start tracking your job applications</p>
            <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Your First Application</button>
          </div>
        ) : filtered.map(app => {
          const cfg = statusStyle[app.status] || {}
          const isExpanded = expandedId === app.id
          return (
            <div key={app.id} className="card" style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }} onClick={() => setExpandedId(isExpanded ? null : app.id)}>
                {/* Logo */}
                <div style={{
                  width: 42, height: 42, borderRadius: 9, flexShrink: 0,
                  background: (app.logoColor || '#3B82F6') + '25',
                  color: app.logoColor || '#3B82F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 17,
                }}>{app.logo || app.company?.[0]}</div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{app.role}</div>
                  <div style={{ color: 'var(--muted2)', fontSize: 13 }}>{app.company} {app.location && `· ${app.location}`}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {app.salary && <span style={{ fontSize: 13, color: 'var(--green)' }}>{app.salary}</span>}
                  <span className={`badge ${cfg.badge}`}>{app.status}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{app.appliedDate}</span>
                  <ChevronDown size={15} color="var(--muted)" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                    {app.deadline && <div><span style={{ fontSize: 12, color: 'var(--muted)' }}>Deadline</span><div style={{ fontSize: 14, marginTop: 2 }}>{app.deadline}</div></div>}
                    {app.nextStep && <div><span style={{ fontSize: 12, color: 'var(--muted)' }}>Next Step</span><div style={{ fontSize: 14, marginTop: 2, color: 'var(--accent)' }}>{app.nextStep}</div></div>}
                  </div>
                  {app.notes && (
                    <div style={{ background: 'var(--card2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--muted2)', marginBottom: 14 }}>
                      📝 {app.notes}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    {STATUSES.filter(s => s !== app.status).slice(0, 2).map(s => (
                      <button key={s} className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}
                        onClick={(e) => { e.stopPropagation(); updateApplication(app.id, { status: s }) }}>
                        Move to {s}
                      </button>
                    ))}
                    <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}
                      onClick={(e) => { e.stopPropagation(); openEdit(app) }}>
                      <Edit2 size={13} /> Edit
                    </button>
                    <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px', color: 'var(--red)', borderColor: '#EF444440' }}
                      onClick={(e) => { e.stopPropagation(); deleteApplication(app.id) }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: '#00000080',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999, padding: 20,
        }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{editId ? 'Edit Application' : 'Add Application'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-2">
                <div><label>Company *</label><input placeholder="e.g. Google" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} /></div>
                <div><label>Role *</label><input placeholder="e.g. SDE Intern" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} /></div>
              </div>
              <div className="grid-2">
                <div>
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div><label>Location</label><input placeholder="City / Remote" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
              </div>
              <div className="grid-2">
                <div><label>Applied Date</label><input type="date" value={form.appliedDate} onChange={e => setForm(p => ({ ...p, appliedDate: e.target.value }))} /></div>
                <div><label>Deadline</label><input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} /></div>
              </div>
              <div className="grid-2">
                <div><label>Salary / Stipend</label><input placeholder="₹25,000/month" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} /></div>
                <div><label>Next Step</label><input placeholder="e.g. Technical Interview" value={form.nextStep} onChange={e => setForm(p => ({ ...p, nextStep: e.target.value }))} /></div>
              </div>
              <div><label>Notes</label><textarea rows={3} placeholder="Any notes about this application..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
              <div className="grid-2">
                <div><label>Logo Letter</label><input maxLength={1} placeholder="R" value={form.logo} onChange={e => setForm(p => ({ ...p, logo: e.target.value.toUpperCase() }))} /></div>
                <div><label>Logo Color</label><input type="color" value={form.logoColor} onChange={e => setForm(p => ({ ...p, logoColor: e.target.value }))} style={{ height: 42, padding: 4 }} /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={!form.company || !form.role}>
                  <Check size={15} /> {editId ? 'Save Changes' : 'Add Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
