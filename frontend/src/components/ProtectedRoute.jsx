import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // CRITICAL: while AuthContext is restoring session from localStorage
  // we must show a spinner and NOT redirect
  // If we skip this check, user=null causes immediate redirect
  // before the async /me/ call completes
  if (loading) {
    return (
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          minHeight:      '60vh',
          flexDirection:  'column',
          gap:            '1rem',
        }}
      >
        <div
          className="spinner-border"
          style={{ color: 'var(--brand-primary)' }}
          role="status"
        />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Verifying session...
        </p>
      </div>
    )
  }

  // Not logged in → send to login
  // Save the attempted URL so we can redirect back after login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in but wrong role → send to home
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  // All checks passed → render the protected page
  return children
}