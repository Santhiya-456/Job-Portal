import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'

const STATUS_OPTIONS = ['pending', 'shortlisted', 'rejected', 'hired']

const STATUS_COLOR = {
  pending:     'warning',
  shortlisted: 'info',
  rejected:    'danger',
  hired:       'success',
}

// ─── Safe helpers ───────────────────────────────────────────
// Prevents crash when field is null/undefined
const safeText  = (val) => val || '—'
const safeSkills = (val) => {
  if (!val || !val.trim()) return []
  return val.split(',').map(s => s.trim()).filter(Boolean)
}

export default function MyJobs() {
  const [jobs, setJobs]               = useState([])
  const [loading, setLoading]         = useState(true)
  const [jobsError, setJobsError]     = useState('')

  const [selectedJob, setSelectedJob] = useState(null)
  const [applicants, setApplicants]   = useState([])
  const [appLoading, setAppLoading]   = useState(false)
  const [appError, setAppError]       = useState('')

  const [selectedApp, setSelectedApp]       = useState(null)
  const [detailLoading, setDetailLoading]   = useState(false)
  const [detailError, setDetailError]       = useState('')

  // ── Load recruiter's jobs ──────────────────────────────────
  useEffect(() => {
    API.get('/jobs/my-jobs/')
      .then(res => setJobs(res.data.results || res.data))
      .catch(() => setJobsError('Failed to load jobs. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  // ── Delete a job ──────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting?')) return
    try {
      await API.delete(`/jobs/${id}/edit/`)
      setJobs(prev => prev.filter(j => j.id !== id))
      if (selectedJob?.id === id) {
        setSelectedJob(null)
        setApplicants([])
        setSelectedApp(null)
      }
    } catch {
      alert('Failed to delete job.')
    }
  }

  // ── Click a job → load its applicants ─────────────────────
  const handleViewApplicants = async (job) => {
    setSelectedJob(job)
    setSelectedApp(null)
    setApplicants([])
    setAppError('')
    setAppLoading(true)
    try {
      const res = await API.get(`/applications/job/${job.id}/`)
      const data = res.data.results || res.data
      setApplicants(Array.isArray(data) ? data : [])
    } catch (err) {
      setAppError(
        err.response?.status === 403
          ? 'You do not have permission to view these applications.'
          : 'Failed to load applicants. Please try again.'
      )
    } finally {
      setAppLoading(false)
    }
  }

  // ── Click an applicant → fetch fresh full detail ──────────
  const handleSelectApplicant = async (app) => {
    // First set from list data so something shows immediately
    setSelectedApp(app)
    setDetailError('')
    setDetailLoading(true)
    try {
      const res = await API.get(`/applications/${app.id}/detail/`)
      setSelectedApp(res.data)
    } catch (err) {
      setDetailError(
        err.response?.status === 404
          ? 'Application not found.'
          : err.response?.status === 403
          ? 'Access denied.'
          : 'Failed to load application details.'
      )
    } finally {
      setDetailLoading(false)
    }
  }

  // ── Update applicant status ───────────────────────────────
  const handleStatusChange = async (appId, newStatus) => {
    try {
      await API.patch(`/applications/${appId}/status/`, {
        status: newStatus
      })
      setApplicants(prev =>
        prev.map(a => a.id === appId ? { ...a, status: newStatus } : a)
      )
      if (selectedApp?.id === appId)
        setSelectedApp(prev => ({ ...prev, status: newStatus }))
    } catch {
      alert('Failed to update status. Please try again.')
    }
  }

  // ── Render ────────────────────────────────────────────────
  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary" />
    </div>
  )

  if (jobsError) return (
    <div className="container mt-4">
      <div className="alert alert-danger">{jobsError}</div>
    </div>
  )

  return (
    <div className="container-fluid px-3 px-md-4">

      {/* ── Header ── */}
      <div className="d-flex justify-content-between
                      align-items-center mb-4">
        <h2 className="fw-bold mb-0">My Posted Jobs</h2>
        <Link to="/post-job" className="btn btn-primary">
          + Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <h5>No jobs posted yet.</h5>
          <Link to="/post-job" className="btn btn-primary mt-3">
            Post Your First Job
          </Link>
        </div>
      ) : (
        <div className="row g-3">

          {/* ════════════════════════════════
               COLUMN 1 — Job List
          ════════════════════════════════ */}
          <div className="col-12 col-lg-3">
            <h6 className="text-muted fw-semibold mb-2
                           text-uppercase small">
              Your Jobs ({jobs.length})
            </h6>

            {jobs.map(job => (
              <div
                key={job.id}
                onClick={() => handleViewApplicants(job)}
                className={`card border-0 shadow-sm rounded-3
                  p-3 mb-2 ${selectedJob?.id === job.id
                    ? 'border border-primary bg-primary bg-opacity-10'
                    : 'bg-white'}`}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex justify-content-between
                                align-items-start">
                  <div className="flex-grow-1 me-2 overflow-hidden">
                    <p className="fw-bold mb-0 small text-truncate">
                      {job.title}
                    </p>
                    <p className="text-muted mb-1"
                       style={{ fontSize: '0.72rem' }}>
                      {job.location} ·{' '}
                      {job.job_type.replace('_', ' ')}
                    </p>
                    <div className="d-flex gap-1 flex-wrap">
                      <span
                        className={`badge bg-${
                          job.is_active ? 'success' : 'secondary'
                        }`}
                        style={{ fontSize: '0.62rem' }}
                      >
                        {job.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span
                        className="badge bg-light text-dark border"
                        style={{ fontSize: '0.62rem' }}
                      >
                        👥 {job.application_count}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline-danger btn-sm
                               py-0 px-1 flex-shrink-0"
                    style={{ fontSize: '0.7rem' }}
                    title="Delete job"
                    onClick={e => {
                      e.stopPropagation()
                      handleDelete(job.id)
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ════════════════════════════════
               COLUMN 2 — Applicant List
          ════════════════════════════════ */}
          <div className="col-12 col-lg-4">
            {!selectedJob ? (
              <div className="card border-0 shadow-sm rounded-3
                              p-4 text-center text-muted h-100
                              d-flex align-items-center
                              justify-content-center">
                <div>
                  <div style={{ fontSize: '2rem' }}>👈</div>
                  <p className="mt-2 mb-0">
                    Click a job to see applicants
                  </p>
                </div>
              </div>
            ) : (
              <>
                <h6 className="text-muted fw-semibold mb-2
                               text-uppercase small">
                  Applicants — {selectedJob.title}
                </h6>

                {/* Loading */}
                {appLoading && (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm
                                    text-primary" />
                    <p className="text-muted small mt-2">
                      Loading applicants...
                    </p>
                  </div>
                )}

                {/* Error */}
                {!appLoading && appError && (
                  <div className="alert alert-danger small">
                    {appError}
                  </div>
                )}

                {/* Empty */}
                {!appLoading && !appError &&
                 applicants.length === 0 && (
                  <div className="card border-0 shadow-sm
                                  rounded-3 p-4 text-center
                                  text-muted">
                    No applications received yet.
                  </div>
                )}

                {/* Applicant cards */}
                {!appLoading && !appError &&
                  applicants.map(app => (
                    <div
                      key={app.id}
                      onClick={() => handleSelectApplicant(app)}
                      className={`card border-0 shadow-sm
                        rounded-3 p-3 mb-2 ${
                        selectedApp?.id === app.id
                          ? 'border border-primary bg-primary bg-opacity-10'
                          : 'bg-white'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between
                                      align-items-start">
                        <div className="overflow-hidden me-2">
                          <p className="fw-bold mb-0 small text-truncate">
                            {safeText(app.full_name)}
                          </p>
                          <p className="text-muted mb-0 text-truncate"
                             style={{ fontSize: '0.72rem' }}>
                            {safeText(app.email)}
                          </p>
                          <p className="text-muted mb-1"
                             style={{ fontSize: '0.72rem' }}>
                            📞 {safeText(app.phone)}
                          </p>
                        </div>
                        <div className="text-end flex-shrink-0">
                          <span
                            className={`badge bg-${
                              STATUS_COLOR[app.status] || 'secondary'
                            }`}
                            style={{ fontSize: '0.62rem' }}
                          >
                            {app.status || 'pending'}
                          </span>
                          <br />
                          <small className="text-muted"
                                 style={{ fontSize: '0.62rem' }}>
                            {app.applied_at
                              ? new Date(app.applied_at)
                                  .toLocaleDateString()
                              : '—'
                            }
                          </small>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </>
            )}
          </div>

          {/* ════════════════════════════════
               COLUMN 3 — Applicant Detail
          ════════════════════════════════ */}
          <div className="col-12 col-lg-5">
            {!selectedApp && !detailLoading ? (
              <div className="card border-0 shadow-sm rounded-3
                              p-4 text-center text-muted h-100
                              d-flex align-items-center
                              justify-content-center">
                <div>
                  <div style={{ fontSize: '2rem' }}>👤</div>
                  <p className="mt-2 mb-0">
                    Click an applicant to see full details
                  </p>
                </div>
              </div>
            ) : detailLoading ? (
              <div className="card border-0 shadow-sm rounded-3 p-4
                              text-center">
                <div className="spinner-border text-primary mb-2" />
                <p className="text-muted small">
                  Loading applicant details...
                </p>
              </div>
            ) : detailError ? (
              <div className="card border-0 shadow-sm rounded-3 p-4">
                <div className="alert alert-danger mb-0">
                  {detailError}
                </div>
              </div>
            ) : selectedApp && (
              <div className="card border-0 shadow-sm rounded-3 p-4">

                {/* ── Header ── */}
                <div className="d-flex justify-content-between
                                align-items-start mb-3">
                  <div>
                    <h5 className="fw-bold mb-0">
                      {safeText(selectedApp.full_name)}
                    </h5>
                    <p className="text-muted small mb-0">
                      {safeText(selectedApp.email)}
                    </p>
                    <p className="text-muted small mb-0">
                      Applied:{' '}
                      {selectedApp.applied_at
                        ? new Date(selectedApp.applied_at)
                            .toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                        : '—'
                      }
                    </p>
                  </div>
                  <span
                    className={`badge bg-${
                      STATUS_COLOR[selectedApp.status] || 'secondary'
                    } fs-6`}
                  >
                    {selectedApp.status || 'pending'}
                  </span>
                </div>

                <hr className="my-2" />

                {/* ── Contact Info ── */}
                <Section title="Contact Information">
                  <InfoRow label="📞 Phone"
                           value={safeText(selectedApp.phone)} />
                  <InfoRow label="✉️ Email"
                           value={safeText(selectedApp.email)} />

                  {selectedApp.linkedin_url && (
                    <InfoRow label="🔗 LinkedIn">
                      <a href={selectedApp.linkedin_url}
                         target="_blank" rel="noreferrer"
                         className="small">
                        View LinkedIn Profile
                      </a>
                    </InfoRow>
                  )}

                  {selectedApp.portfolio_url && (
                    <InfoRow label="🌐 Portfolio">
                      <a href={selectedApp.portfolio_url}
                         target="_blank" rel="noreferrer"
                         className="small">
                        View Portfolio
                      </a>
                    </InfoRow>
                  )}
                </Section>

                <hr className="my-2" />

                {/* ── Skills ── */}
                <Section title="Skills">
                  {safeSkills(selectedApp.skills).length > 0 ? (
                    <div className="d-flex flex-wrap gap-1">
                      {safeSkills(selectedApp.skills).map((s, i) => (
                        <span key={i}
                              className="badge bg-light
                                         text-dark border small">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted small mb-0">
                      No skills listed.
                    </p>
                  )}
                </Section>

                <hr className="my-2" />

                {/* ── Experience ── */}
                <Section title="Experience">
                  <p className="small text-muted mb-0"
                     style={{ whiteSpace: 'pre-line' }}>
                    {safeText(selectedApp.experience)}
                  </p>
                </Section>

                {/* ── Cover Letter ── */}
                {selectedApp.cover_letter && (
                  <>
                    <hr className="my-2" />
                    <Section title="Cover Letter">
                      <div className="bg-light rounded-3 p-3">
                        <p className="small text-muted mb-0"
                           style={{ whiteSpace: 'pre-line' }}>
                          {selectedApp.cover_letter}
                        </p>
                      </div>
                    </Section>
                  </>
                )}

                <hr className="my-2" />

                {/* ── Resume ── */}
                <Section title="Resume">
                  {selectedApp.resume_url ? (
                    <div className="d-flex gap-2 flex-wrap">
                      <a href={selectedApp.resume_url}
                         target="_blank" rel="noreferrer"
                         className="btn btn-outline-primary btn-sm">
                        👁 View Resume
                      </a>
                      <a href={selectedApp.resume_url}
                         download
                         className="btn btn-outline-success btn-sm">
                        ⬇ Download
                      </a>
                    </div>
                  ) : (
                    <p className="text-muted small mb-0">
                      No resume uploaded.
                    </p>
                  )}
                </Section>

                <hr className="my-2" />

                {/* ── Status Update ── */}
                <Section title="Update Status">
                  <div className="d-flex gap-2 flex-wrap">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() =>
                          handleStatusChange(selectedApp.id, s)
                        }
                        className={`btn btn-sm ${
                          selectedApp.status === s
                            ? `btn-${STATUS_COLOR[s]}`
                            : `btn-outline-${STATUS_COLOR[s]}`
                        }`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </Section>

              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

// ─── Reusable layout helpers (defined outside component) ──────
function Section({ title, children }) {
  return (
    <div className="mb-2">
      <p className="fw-semibold mb-2 small text-uppercase
                    text-muted letter-spacing-1">
        {title}
      </p>
      {children}
    </div>
  )
}

function InfoRow({ label, value, children }) {
  return (
    <p className="mb-1 small">
      <span className="text-muted">{label}:</span>{' '}
      {children || <span>{value}</span>}
    </p>
  )
}