import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('careerlens_token') || null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load, if we have a saved token, fetch the user's profile to restore the session.
  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const profile = await api.getProfile(token)
        setUser(profile)
      } catch (err) {
        // Token expired or invalid — clear it
        localStorage.removeItem('careerlens_token')
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleAuthSuccess({ token: newToken, user: newUser }) {
    localStorage.setItem('careerlens_token', newToken)
    setToken(newToken)
    setUser(newUser)
  }

  async function login(email, password) {
    const data = await api.login({ email, password })
    handleAuthSuccess(data)
  }

  async function signup(payload) {
    const data = await api.signup(payload)
    handleAuthSuccess(data)
  }

  function logout() {
    localStorage.removeItem('careerlens_token')
    setToken(null)
    setUser(null)
  }

  function updateUser(updatedUser) {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider')
  return ctx
}
