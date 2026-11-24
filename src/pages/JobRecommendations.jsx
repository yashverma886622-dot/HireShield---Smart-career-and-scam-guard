import { useState, useEffect } from 'react'
import { Search, MapPin, Briefcase, DollarSign, Star, Filter, CheckCircle, ExternalLink } from 'lucide-react'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const categories = ['All', 'Frontend', 'Backend', 'AI/ML', 'Data Science', 'Full Stack', 'Mobile']
const types = ['All', 'Internship', 'Full-time']

export default function JobRecommendations({ userProfile, addApplication, applications }) {
  const { token } = useAuth()
  const [jobListings, setJobListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [type, setType] = useState('All')
  const [sortBy, setSortBy] = useState('match')
  const [savedJobs, setSavedJobs] = useState([])
  const [appliedNow, setAppliedNow] = useState([])

  useEffect(() => {
    if (!token) return
    setLoading(true)
    api.getJobs(token)
      .then(setJobListings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  const appliedIds = applications.map(a => a.company + a.role)

  const filtered = jobListings
    .filter(j => {
      const q = search.toLowerCase()
      const matchSearch = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.skills.some(s => s.toLowerCase().includes(q))
      const matchCat = category === 'All' || j.category === category
      const matchType = type === 'All' || j.type === type
      return matchSearch && matchCat && matchType
    })
    .sort((a, b) => sortBy === 'match' ? b.match - a.match : a.title.localeCompare(b.title))

  const handleApply = (job) => {
    const key = job.company + job.title
    if (appliedNow.includes(key)) return
    setAppliedNow(prev => [...prev, key])
    addApplication({
      company: job.company,
      role: job.title,
      status: 'Applied',
      appliedDate: new Date().toISOString().split('T')[0],
      deadline: '',
      location: job.location,
      salary: job.salary,
      logo: job.logo,
      logoColor: job.logoColor,
      notes: '',
      nextStep: 'Wait for response',
    })
  }

  const toggleSave = (id) => {
    setSavedJobs(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const matchColor = (m) => m >= 85 ? '#10B981' : m >= 70 ? '#F59E0B' : '#64748B'

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <div style={{ background: '#10B98120', padding: 10, borderRadius: 10 }}>
          <Search size={22} color="var(--green)" />
        </div>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Job Recommendations</h1>
          <p style={{ color: 'var(--muted2)', fontSize: 14, margin: 0 }}>Verified openings matched to your skills and goals</p>
        </div>
      </div>
      <div style={{ height: 1, background: 'var(--border)', margin: '20px 0 24px' }} />

      {/* Filters */}
      <div className="card" style={{ marginBottom: 24, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input placeholder="Search jobs, companies, skills..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }} />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={type} onChange={e => setType(e.target.value)} style={{ width: 'auto', minWidth: 120 }}>
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 'auto', minWidth: 130 }}>
            <option value="match">Sort: Best Match</option>
            <option value="title">Sort: A–Z</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div style={{ color: 'var(--muted2)', fontSize: 13, marginBottom: 16 }}>
        {loading ? 'Loading jobs...' : `${filtered.length} job${filtered.length !== 1 ? 's' : ''} found${category !== 'All' ? ` in ${category}` : ''}`}
      </div>

      {error && (
        <div className="card" style={{ borderColor: '#EF444440', background: '#EF444410', marginBottom: 16 }}>
          <p style={{ color: 'var(--red)', fontSize: 13, margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Job cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <p style={{ color: 'var(--muted2)', fontSize: 14 }}>Fetching the latest listings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔎</div>
            <h3 style={{ marginBottom: 8 }}>No jobs found</h3>
            <p style={{ color: 'var(--muted2)', fontSize: 14 }}>Try adjusting your search or filters</p>
          </div>
        ) : filtered.map(job => {
          const key = job.company + job.title
          const isApplied = appliedIds.includes(key) || appliedNow.includes(key)
          const isSaved = savedJobs.includes(job.id)

          return (
            <div key={job.id} className="card" style={{ transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = job.logoColor + '60'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

                {/* Logo */}
                <div style={{
                  width: 48, height: 48, borderRadius: 10,
                  background: job.logoColor + '25', color: job.logoColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 20, flexShrink: 0,
                }}>{job.logo}</div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{job.title}</h3>
                    {job.verified && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--green)' }}>
                        <CheckCircle size={12} /> Verified
                      </span>
                    )}
                  </div>
                  <div style={{ color: 'var(--muted2)', fontSize: 13, marginTop: 4 }}>{job.company}</div>

                  <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--muted2)' }}>
                      <MapPin size={13} /> {job.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--muted2)' }}>
                      <Briefcase size={13} /> {job.type}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--green)' }}>
                      <DollarSign size={13} /> {job.salary}
                    </span>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 10, lineHeight: 1.6 }}>{job.description}</p>

                  <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                    {job.skills.map(s => (
                      <span key={s} style={{
                        padding: '3px 10px',
                        background: userProfile.skills.map(x => x.toLowerCase()).includes(s.toLowerCase()) ? '#10B98115' : 'var(--card2)',
                        border: `1px solid ${userProfile.skills.map(x => x.toLowerCase()).includes(s.toLowerCase()) ? '#10B98140' : 'var(--border)'}`,
                        borderRadius: 20, fontSize: 12,
                        color: userProfile.skills.map(x => x.toLowerCase()).includes(s.toLowerCase()) ? 'var(--green)' : 'var(--muted2)',
                      }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Right side */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                  {/* Match score */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: matchColor(job.match), fontFamily: 'Space Grotesk' }}>{job.match}%</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>match</div>
                  </div>
                  <span className="badge badge-blue" style={{ fontSize: 11 }}>{job.posted}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                {job.url && (
                  <a href={job.url} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ fontSize: 13, padding: '8px 14px', textDecoration: 'none' }}>
                    <ExternalLink size={14} /> View listing
                  </a>
                )}
                <button className="btn btn-ghost" style={{ fontSize: 13, padding: '8px 14px' }} onClick={() => toggleSave(job.id)}>
                  <Star size={14} fill={isSaved ? 'var(--yellow)' : 'none'} color={isSaved ? 'var(--yellow)' : 'var(--muted2)'} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button
                  className={`btn ${isApplied ? 'btn-ghost' : 'btn-primary'}`}
                  style={{ fontSize: 13, padding: '8px 16px' }}
                  onClick={() => handleApply(job)}
                  disabled={isApplied}
                >
                  {isApplied ? <><CheckCircle size={14} /> Applied</> : 'Apply Now'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
