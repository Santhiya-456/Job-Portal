import axios from 'axios'

// Verify this value is set in frontend/.env:
// VITE_API_BASE_URL=http://localhost:8000/api
const BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!BASE_URL) {
  console.error(
    '[axios.js] VITE_API_BASE_URL is not defined.\n' +
    'Create frontend/.env with:\n' +
    'VITE_API_BASE_URL=http://localhost:8000/api\n' +
    'Then restart the dev server.'
  )
}

const API = axios.create({
  baseURL: BASE_URL,
})

// ── Request interceptor ──────────────────────────────────────
// Attaches JWT token to every outgoing request automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ─────────────────────────────────────
// On 401: try to refresh the access token once, then retry
let isRefreshing  = false
let failedQueue   = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else       prom.resolve(token)
  })
  failedQueue = []
}

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only handle 401 errors, only retry once
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return API(originalRequest)
        }).catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refresh = localStorage.getItem('refresh_token')

      if (!refresh) {
        // No refresh token → force logout
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Use plain axios (not API instance) to avoid interceptor loop
        const res = await axios.post(
          `${BASE_URL}/auth/token/refresh/`,
          { refresh }
        )
        const newToken = res.data.access
        localStorage.setItem('access_token', newToken)
        API.defaults.headers.common.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return API(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default API