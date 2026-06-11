import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  // CRITICAL: must start as TRUE
  // ProtectedRoute will redirect if this is false + user is null
  const [loading, setLoading] = useState(true)

  // ── Restore session on every page load / refresh ──────────
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('access_token')

      // No token at all → not logged in, stop loading
      if (!token) {
        setLoading(false)
        return
      }

      // Token exists → verify it with /me/
      try {
        const res = await API.get('/auth/me/')
        setUser(res.data)
      } catch (err) {
        // Token invalid or expired
        // Try refresh before giving up
        const refresh = localStorage.getItem('refresh_token')
        if (refresh) {
          try {
            const refreshRes = await API.post('/auth/token/refresh/', {
              refresh
            })
            localStorage.setItem('access_token', refreshRes.data.access)
            // Retry /me/ with new token
            const retryMe = await API.get('/auth/me/')
            setUser(retryMe.data)
          } catch {
            // Refresh also failed → clear everything
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            setUser(null)
          }
        } else {
          localStorage.removeItem('access_token')
          setUser(null)
        }
      } finally {
        // CRITICAL: always stop loading, even if error
        setLoading(false)
      }
    }

    restore()
  }, [])

  // ── Login ─────────────────────────────────────────────────
  const login = async (email, password) => {
    // Step 1: Get tokens
    const tokenRes = await API.post('/auth/login/', { email, password })

    // Step 2: Validate response shape before storing
    const { access, refresh } = tokenRes.data

    if (!access || !refresh) {
      throw new Error(
        'Server returned invalid token response. ' +
        'Expected { access, refresh }. ' +
        `Got: ${JSON.stringify(tokenRes.data)}`
      )
    }

    // Step 3: Store tokens
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)

    // Step 4: Get user profile
    // The axios interceptor will now pick up the stored token
    const meRes = await API.get('/auth/me/')

    if (!meRes.data || !meRes.data.role) {
      throw new Error(
        'Server returned invalid user profile. ' +
        `Got: ${JSON.stringify(meRes.data)}`
      )
    }

    // Step 5: Set global user state
    setUser(meRes.data)

    // Step 6: Return user so Login.jsx can redirect by role
    return meRes.data
  }

  // ── Logout ────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}