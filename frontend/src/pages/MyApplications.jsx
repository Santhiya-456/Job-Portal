import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'

const STATUS_LABELS = {
  pending:     { label: 'Pending',     cls: 'status-pending'  },
  shortlisted: { label: 'Shortlisted', cls: 'status-reviewed' },
  rejected:    { label: 'Rejected',    cls: 'status-rejected' },
  hired:       { label: 'Hired ✅',    cls: 'status-accepted' },
}

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    API.get('/applications/my/')
      .then(res => setApplications(res.data.results || res.data))
      .finally(() => setLoading(false))
  }, [])

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return
    await API.delete(`/applications/${id}/withdraw/`)
    setApplications(applications.filter(a => a.id !== id))
  }

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary" />
    </div>
  )

  return (
    <div className="container">
      <h2 className="fw-bold mb-4">My Applications</h2>

      {applications.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <h5>You haven't applied to any jobs yet.</h5>
          <Link to="/jobs" className="btn btn-primary mt-3">Browse Jobs</Link>
        </div>
      ) : (
        <div className="row g-3">
          {applications.map(app => {
            const s = STATUS_LABELS[app.status] || STATUS_LABELS.pending
            return (
              <div className="col-md-6" key={app.id}>
                <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold mb-0">{app.job.title}</h5>
                    <span className={`badge ${s.cls}`}>{s.label}</span>
                  </div>

                  <p className="text-primary fw-semibold mb-1">
                    🏢 {app.job.company_name}
                  </p>
                  <p className="text-muted small mb-2">
                    📍 {app.job.location}
                  </p>

                  {app.cover_letter && (
                    <div className="bg-light rounded-3 p-2 mb-2">
                      <small className="text-muted">
                        <strong>Your cover letter:</strong><br />
                        <span style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {app.cover_letter}
                        </span>
                      </small>
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
                    <small className="text-muted">
                      Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </small>
                    <div className="d-flex gap-2">
                      <Link
                        to={`/jobs/${app.job.id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        View Job
                      </Link>
                      {app.status === 'pending' && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleWithdraw(app.id)}
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}