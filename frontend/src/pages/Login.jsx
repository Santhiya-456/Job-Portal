import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role === 'admin')          navigate('/admin-dashboard')
      else if (user.role === 'recruiter') navigate('/my-jobs')
      else                                navigate('/jobs')
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Invalid email or password. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/"
                style={{ textDecoration: 'none',
                         fontSize: '1rem',
                         fontWeight: 700,
                         color: 'var(--text-primary)' }}>
            TalentHub
          </Link>
          <h2 style={{ marginTop: '1.5rem' }}>Sign in to your account</h2>
          <p>Enter your credentials to continue</p>
        </div>

        {error && (
          <div
            className="alert mb-4 py-2"
            style={{ background: '#fee2e2',
                     border: '1px solid #fecaca',
                     borderRadius: 'var(--radius-sm)',
                     color: '#991b1b',
                     fontSize: '0.875rem' }}
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
            disabled={loading}
          >
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2"/>
                  Signing in...</>
              : 'Sign in'
            }
          </button>
        </form>

        <p className="text-center mt-4 mb-0 text-sm"
           style={{ color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register"
                style={{ color: 'var(--brand-primary)',
                         fontWeight: 500,
                         textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}