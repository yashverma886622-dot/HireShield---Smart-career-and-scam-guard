import { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

// The SQL backend already returns "id" (application_id AS id), which is what the pages use.
function normalize(doc) {
  return { ...doc, id: doc.id }
}

export function useAppState() {
  const { token, user, updateUser } = useAuth()
  const [applications, setApplications] = useState([])

  // Load the logged-in user's applications from the backend once we have a token.
  useEffect(() => {
    if (!token) return
    api.getApplications(token)
      .then((list) => setApplications(list.map(normalize)))
      .catch((err) => console.error('Failed to load applications:', err.message))
  }, [token])

  const addApplication = useCallback(async (app) => {
    const created = await api.createApplication(app, token)
    setApplications((prev) => [normalize(created), ...prev])
  }, [token])

  const updateApplication = useCallback(async (id, updates) => {
    const updated = await api.updateApplication(id, updates, token)
    setApplications((prev) => prev.map((a) => (a.id === id ? normalize(updated) : a)))
  }, [token])

  const deleteApplication = useCallback(async (id) => {
    await api.deleteApplication(id, token)
    setApplications((prev) => prev.filter((a) => a.id !== id))
  }, [token])

  // userProfile mirrors the shape the existing pages expect, backed by the real logged-in user.
  const userProfile = {
    name: user?.name || '',
    role: [user?.branch, user?.year].filter(Boolean).join(' • ') || 'Student',
    skills: user?.skills || [],
    targetRole: user?.targetRole || '',
  }

  // BlindSpot calls setUserProfile(p => ({ ...p, skills })), so accept a function or an object.
  // Only skills and targetRole are saved to the database (users + user_skills tables).
  async function setUserProfile(updater) {
    const next = typeof updater === 'function' ? updater(userProfile) : updater
    const saved = await api.updateProfile({ skills: next.skills, targetRole: next.targetRole }, token)
    updateUser(saved)
  }

  return { applications, addApplication, updateApplication, deleteApplication, userProfile, setUserProfile }
}
