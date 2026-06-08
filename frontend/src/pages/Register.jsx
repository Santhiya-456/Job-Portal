import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '', email: '', password: '', role: 'seeker'
  })
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
      await API.post('/auth/register/', form)
      navigate('/login')
    } catch (err) {
      const data = err.response?.data
      setError(data
        ? Object.values(data).flat().join(' ')
        : 'Registration failed. Please try again.')
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
          <h2 style={{ marginTop: '1.5rem' }}>Create your account</h2>
          <p>Join thousands of professionals on TalentHub</p>
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
            <label className="form-label">Full name</label>
            <input
              name="username" className="form-control"
              placeholder="John Doe"
              value={form.username}
              onChange={handleChange}
              required autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email" name="email"
              className="form-control"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPw ? 'text' : 'password'}
                name="password" className="form-control"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                required minLength={6}
              />
              <button
                type="button" className="btn btn-ghost"
                style={{ borderLeft: 'none',
                         borderColor: 'var(--surface-border)' }}
                onClick={() => setShowPw(p => !p)}
                tabIndex={-1}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label">I am a</label>
            <div className="d-flex gap-3">
              {[
                { value: 'seeker',    label: 'Job Seeker' },
                { value: 'recruiter', label: 'Recruiter'  },
              ].map(opt => (
                <label
                  key={opt.value}
                  className="d-flex align-items-center gap-2 flex-grow-1
                             p-3 rounded cursor-pointer"
                  style={{
                    border: `1px solid ${
                      form.role === opt.value
                        ? 'var(--brand-primary)'
                        : 'var(--surface-border)'
                    }`,
                    background: form.role === opt.value
                      ? 'var(--brand-primary-light)' : 'white',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: form.role === opt.value ? 600 : 400,
                    color: form.role === opt.value
                      ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio" name="role" value={opt.value}
                    checked={form.role === opt.value}
                    onChange={handleChange}
                    className="d-none"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit" className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2"/>
                  Creating account...</>
              : 'Create account'
            }
          </button>
        </form>

        <p className="text-center mt-4 mb-0 text-sm"
           style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login"
                style={{ color: 'var(--brand-primary)',
                         fontWeight: 500,
                         textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}