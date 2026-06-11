import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, user, loading } = useAuth()
  const navigate                 = useNavigate()
  const location                 = useLocation()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  // If user is already logged in and visits /login,
  // redirect them to their dashboard automatically
  useEffect(() => {
    if (!loading && user) {
      const dest = location.state?.from?.pathname ||
        (user.role === 'admin'     ? '/admin-dashboard' :
         user.role === 'recruiter' ? '/my-jobs'         : '/jobs')
      navigate(dest, { replace: true })
    }
  }, [user, loading])

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const loggedInUser = await login(form.email, form.password)

      // Navigate based on role
      const dest =
        loggedInUser.role === 'admin'     ? '/admin-dashboard' :
        loggedInUser.role === 'recruiter' ? '/my-jobs'         :
                                            '/jobs'

      navigate(dest, { replace: true })

    } catch (err) {
      // Detailed error logging to help debug
      console.error('[Login] error:', err)
      console.error('[Login] response:', err.response?.data)
      console.error('[Login] status:', err.response?.status)

      if (err.response?.status === 401) {
        setError('Invalid email or password.')
      } else if (err.response?.status === 400) {
        const data = err.response.data
        setError(
          data?.detail ||
          Object.values(data).flat().join(' ') ||
          'Login failed. Check your credentials.'
        )
      } else if (!err.response) {
        setError(
          'Cannot connect to server. ' +
          'Make sure Django is running on http://localhost:8000'
        )
      } else {
        setError(err.message || 'Login failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Show loading spinner while checking existing session
  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="spinner-border"
             style={{ color: 'var(--brand-primary)' }} />
      </div>
    )
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/"
                style={{ textDecoration: 'none',
                         fontSize: '1rem', fontWeight: 700,
                         color: 'var(--text-primary)' }}>
            TalentHub
          </Link>
          <h2 style={{ marginTop: '1.5rem' }}>Sign in to your account</h2>
          <p>Enter your credentials to continue</p>
        </div>

        {error && (
          <div
            className="mb-4 p-3"
            style={{
              background:    '#fee2e2',
              border:        '1px solid #fecaca',
              borderRadius:  'var(--radius-sm)',
              color:         '#991b1b',
              fontSize:      '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email" name="email"
              className="form-control"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              required autoFocus
              disabled={submitting}
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPw ? 'text' : 'password'}
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                disabled={submitting}
              />
              <button
                type="button"
                className="btn btn-ghost"
                style={{ borderLeft: 'none',
                         borderColor: 'var(--surface-border)' }}
                onClick={() => setShowPw(p => !p)}
                tabIndex={-1}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={submitting}
          >
            {submitting
              ? <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Signing in...
                </>
              : 'Sign in'
            }
          </button>
        </form>

        <p className="text-center mt-4 mb-0"
           style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register"
                style={{ color: 'var(--brand-primary)',
                         fontWeight: 500, textDecoration: 'none' }}>
            Create one
          </Link>
        </p>

        {/* Debug helper — REMOVE before production */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ marginTop: '1.5rem',
                        padding: '0.75rem',
                        background: '#f8fafc',
                        border: '1px solid var(--surface-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)' }}>
            <strong>Debug:</strong> API →{' '}
            {import.meta.env.VITE_API_BASE_URL || 'NOT SET'}
          </div>
        )}
      </div>
    </div>
  )
}