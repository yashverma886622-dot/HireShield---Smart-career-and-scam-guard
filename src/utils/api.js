const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.')
  }

  return data
}

export const api = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),

  getProfile: (token) => request('/profile', { token }),
  updateProfile: (payload, token) => request('/profile', { method: 'PUT', body: payload, token }),

  getApplications: (token) => request('/applications', { token }),
  createApplication: (payload, token) => request('/applications', { method: 'POST', body: payload, token }),
  updateApplication: (id, payload, token) => request(`/applications/${id}`, { method: 'PUT', body: payload, token }),
  deleteApplication: (id, token) => request(`/applications/${id}`, { method: 'DELETE', token }),

  getBlindSpot: (token) => request('/blindspot', { token }),
  checkFakeInternship: (payload, token) => request('/fakecheck', { method: 'POST', body: payload, token }),
  getJobs: (token) => request('/jobs', { token }),
}
