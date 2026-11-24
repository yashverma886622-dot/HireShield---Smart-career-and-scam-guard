import { useState } from 'react'
import { Eye, CheckCircle, XCircle, AlertCircle, Plus, X, ChevronDown } from 'lucide-react'
import { jobRoleRequirements } from '../data/mockData'

export default function BlindSpot({ userProfile, setUserProfile }) {
  const [selectedRole, setSelectedRole] = useState(
    Object.keys(jobRoleRequirements).includes(userProfile.targetRole) ? userProfile.targetRole : 'Frontend Developer'
  )
  const [mySkills, setMySkills] = useState(userProfile.skills)
  const [newSkill, setNewSkill] = useState('')
  const [analyzed, setAnalyzed] = useState(false)

  const roles = Object.keys(jobRoleRequirements)
  const req = jobRoleRequirements[selectedRole]

  const missingRequired = req.required.filter(s => !mySkills.map(x => x.toLowerCase()).includes(s.toLowerCase()))
  const missingPreferred = req.preferred.filter(s => !mySkills.map(x => x.toLowerCase()).includes(s.toLowerCase()))
  const matchedRequired = req.required.filter(s => mySkills.map(x => x.toLowerCase()).includes(s.toLowerCase()))
  const matchedPreferred = req.preferred.filter(s => mySkills.map(x => x.toLowerCase()).includes(s.toLowerCase()))

  const score = Math.round(
    ((matchedRequired.length / req.required.length) * 70) +
    ((matchedPreferred.length / req.preferred.length) * 30)
  )

  const addSkill = () => {
    if (newSkill.trim() && !mySkills.includes(newSkill.trim())) {
      const updated = [...mySkills, newSkill.trim()]
      setMySkills(updated)
      setUserProfile(p => ({ ...p, skills: updated }))
      setNewSkill('')
    }
  }

  const removeSkill = (skill) => {
    const updated = mySkills.filter(s => s !== skill)
    setMySkills(updated)
    setUserProfile(p => ({ ...p, skills: updated }))
  }

  const scoreColor = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'
  const scoreLabel = score >= 80 ? 'Strong Match' : score >= 50 ? 'Needs Work' : 'Major Gaps'

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <div style={{ background: '#3B82F620', padding: 10, borderRadius: 10 }}>
          <Eye size={22} color="var(--accent)" />
        </div>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Blind Spot Detector</h1>
          <p style={{ color: 'var(--muted2)', fontSize: 14, margin: 0 }}>Discover skill gaps between your profile and your target role</p>
        </div>
      </div>
      <div style={{ height: 1, background: 'var(--border)', margin: '20px 0 28px' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24 }}>

        {/* LEFT: Input panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Role selector */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>🎯 Target Role</h3>
            <div style={{ position: 'relative' }}>
              <select value={selectedRole} onChange={e => { setSelectedRole(e.target.value); setAnalyzed(false) }}
                style={{ appearance: 'none', paddingRight: 36 }}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* My skills */}
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>🧠 My Skills</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input
                placeholder="Add a skill..."
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill()}
              />
              <button className="btn btn-primary" style={{ whiteSpace: 'nowrap', padding: '10px 14px' }} onClick={addSkill}>
                <Plus size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {mySkills.map(skill => (
                <span key={skill} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', background: '#3B82F615',
                  border: '1px solid #3B82F640', borderRadius: 20,
                  fontSize: 13, color: 'var(--accent)',
                }}>
                  {skill}
                  <X size={12} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => removeSkill(skill)} />
                </span>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }}
            onClick={() => setAnalyzed(true)}>
            <Eye size={16} /> Analyze My Gaps
          </button>
        </div>

        {/* RIGHT: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {analyzed ? (
            <>
              {/* Score card */}
              <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #131C35, #1A2540)' }}>
                <div style={{ fontSize: 13, color: 'var(--muted2)', marginBottom: 8 }}>Readiness Score for {selectedRole}</div>
                <div style={{ fontSize: 64, fontWeight: 700, color: scoreColor, fontFamily: 'Space Grotesk', lineHeight: 1 }}>
                  {score}%
                </div>
                <span className={`badge badge-${score >= 80 ? 'green' : score >= 50 ? 'yellow' : 'red'}`} style={{ marginTop: 12, fontSize: 13 }}>
                  {scoreLabel}
                </span>
                <div style={{ marginTop: 16 }}>
                  <div className="progress-bar" style={{ height: 10, borderRadius: 5 }}>
                    <div className="progress-fill" style={{ width: `${score}%`, background: scoreColor, borderRadius: 5 }} />
                  </div>
                </div>
              </div>

              {/* Missing Required */}
              {missingRequired.length > 0 && (
                <div className="card" style={{ borderColor: '#EF444440' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <XCircle size={18} color="var(--red)" />
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--red)', margin: 0 }}>Critical Gaps ({missingRequired.length})</h3>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted2)', marginBottom: 12 }}>These skills are required. Missing them will likely disqualify you.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {missingRequired.map(s => (
                      <span key={s} style={{
                        padding: '5px 12px', background: '#EF444415',
                        border: '1px solid #EF444440', borderRadius: 20,
                        fontSize: 13, color: 'var(--red)',
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Preferred */}
              {missingPreferred.length > 0 && (
                <div className="card" style={{ borderColor: '#F59E0B40' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <AlertCircle size={18} color="var(--yellow)" />
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--yellow)', margin: 0 }}>Nice-to-have Gaps ({missingPreferred.length})</h3>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted2)', marginBottom: 12 }}>These would make you a stronger candidate but aren't deal-breakers.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {missingPreferred.map(s => (
                      <span key={s} style={{
                        padding: '5px 12px', background: '#F59E0B15',
                        border: '1px solid #F59E0B40', borderRadius: 20,
                        fontSize: 13, color: 'var(--yellow)',
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched skills */}
              <div className="card" style={{ borderColor: '#10B98140' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <CheckCircle size={18} color="var(--green)" />
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--green)', margin: 0 }}>Skills You Already Have ✓</h3>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[...matchedRequired, ...matchedPreferred].map(s => (
                    <span key={s} style={{
                      padding: '5px 12px', background: '#10B98115',
                      border: '1px solid #10B98140', borderRadius: 20,
                      fontSize: 13, color: 'var(--green)',
                    }}>{s}</span>
                  ))}
                  {matchedRequired.length === 0 && matchedPreferred.length === 0 && (
                    <p style={{ color: 'var(--muted)', fontSize: 13 }}>No matching skills yet. Start adding skills above!</p>
                  )}
                </div>
              </div>

              {/* Soft skills */}
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>💡 Soft Skills to Develop</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {req.soft.map(s => (
                    <span key={s} className="badge badge-purple">{s}</span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '60px 32px' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Ready to find your blind spots?</h3>
              <p style={{ color: 'var(--muted2)', fontSize: 14 }}>Select a target role, add your current skills, and click Analyze to see exactly what you're missing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
