import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_LABEL = {
  seeker:    'Job Seeker',
  recruiter: 'Recruiter',
  admin:     'Admin',
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()

  const isActive = (path) => location.pathname.startsWith(path)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="app-navbar navbar navbar-expand-lg">
      <div className="container">
        <Link className="navbar-brand" to="/">
          TalentHub
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}
                to="/jobs"
              >
                Browse Jobs
              </Link>
            </li>

            {user?.role === 'recruiter' && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/post-job') ? 'active' : ''}`}
                    to="/post-job"
                  >
                    Post a Job
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/my-jobs') ? 'active' : ''}`}
                    to="/my-jobs"
                  >
                    My Jobs
                  </Link>
                </li>
              </>
            )}

            {user?.role === 'seeker' && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive('/my-applications') ? 'active' : ''}`}
                  to="/my-applications"
                >
                  Applications
                </Link>
              </li>
            )}

            {user?.role === 'admin' && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive('/admin-dashboard') ? 'active' : ''}`}
                  to="/admin-dashboard"
                >
                  Dashboard
                </Link>
              </li>
            )}
          </ul>

          <ul className="navbar-nav ms-auto align-items-center gap-2">
            {user ? (
              <>
                <li className="nav-item">
                  <Link
                    to="/profile"
                    className="nav-link d-flex align-items-center gap-2"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <span
                      className="d-inline-flex align-items-center
                                 justify-content-center rounded-circle
                                 text-white fw-semibold"
                      style={{
                        width: 30, height: 30, fontSize: '0.75rem',
                        background: 'var(--brand-primary)'
                      }}
                    >
                      {user.username?.[0]?.toUpperCase()}
                    </span>
                    <span className="d-none d-md-inline
                                     text-secondary fw-medium">
                      {user.username}
                    </span>
                    <span
                      className="badge rounded-pill"
                      style={{
                        background: 'var(--brand-primary-light)',
                        color: 'var(--brand-primary)',
                        fontSize: '0.65rem',
                        fontWeight: 600
                      }}
                    >
                      {ROLE_LABEL[user.role] || user.role}
                    </span>
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleLogout}
                  >
                    Sign out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login"
                        style={{ fontSize: '0.875rem' }}>
                    Sign in
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary btn-sm" to="/register">
                    Get started
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}