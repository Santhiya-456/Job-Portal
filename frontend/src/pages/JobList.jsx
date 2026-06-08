import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'

const JOB_TYPES = [
  { value: '',           label: 'All types'   },
  { value: 'full_time',  label: 'Full-time'   },
  { value: 'part_time',  label: 'Part-time'   },
  { value: 'contract',   label: 'Contract'    },
  { value: 'internship', label: 'Internship'  },
  { value: 'remote',     label: 'Remote'      },
]

export default function JobList() {
  const [jobs, setJobs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [jobType, setJobType]     = useState('')
  const [location, setLocation]   = useState('')
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchJobs = async (p = page) => {
    setLoading(true)
    try {
      const params = { page: p }
      if (search)   params.search   = search
      if (jobType)  params.job_type = jobType
      if (location) params.location = location
      const res = await API.get('/jobs/', { params })
      setJobs(res.data.results || res.data)
      if (res.data.count !== undefined) {
        setTotalCount(res.data.count)
        setTotalPages(Math.ceil(res.data.count / 10))
      }
    } catch { setJobs([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchJobs() }, [page])

  const handleSearch = e => {
    e.preventDefault()
    setPage(1)
    fetchJobs(1)
  }

  const handleReset = () => {
    setSearch(''); setJobType(''); setLocation('')
    setPage(1)
    setTimeout(() => fetchJobs(1), 0)
  }

  return (
    <>
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="page-header">
        <div className="container">
          <h1>Open positions</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)',
                                          marginTop: '0.25rem' }}>
            Browse roles from verified companies
          </p>
        </div>
      </div>

      <div className="container page-wrapper" style={{ paddingTop: 0 }}>

        {/* ── Search Bar ──────────────────────────────────── */}
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <div className="row g-2 align-items-end">
              <div className="col-12 col-md-4">
                <label className="form-label">Keywords</label>
                <input
                  className="form-control"
                  placeholder="Job title, company, or skill"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label">Location</label>
                <input
                  className="form-control"
                  placeholder="City or remote"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-2">
                <label className="form-label">Job type</label>
                <select
                  className="form-select"
                  value={jobType}
                  onChange={e => setJobType(e.target.value)}
                >
                  {JOB_TYPES.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-3">
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary flex-grow-1">
                    Search
                  </button>
                  {(search || jobType || location) && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={handleReset}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* ── Results ─────────────────────────────────────── */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border"
                 style={{ color: 'var(--brand-primary)' }} />
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="24" height="24" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor"
                   style={{ color: 'var(--text-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <h6>No positions found</h6>
            <p>Try adjusting your search criteria or clearing filters.</p>
            <button className="btn btn-outline-primary btn-sm mt-2"
                    onClick={handleReset}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm mb-3"
               style={{ color: 'var(--text-muted)' }}>
              Showing {jobs.length}{totalCount > 10
                ? ` of ${totalCount}` : ''} positions
            </p>

            <div className="row g-3">
              {jobs.map(job => (
                <div className="col-12 col-md-6 col-xl-4" key={job.id}>
                  <div className="job-card">
                    <div className="d-flex justify-content-between
                                    align-items-start mb-2">
                      <span className="type-badge">
                        {job.job_type.replace('_', '-')}
                      </span>
                      <span style={{ fontSize: '0.75rem',
                                     color: 'var(--text-muted)' }}>
                        {new Date(job.created_at)
                          .toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric'
                          })}
                      </span>
                    </div>

                    <p className="job-title">{job.title}</p>
                    <p className="company-name">{job.company_name}</p>
                    <p className="job-meta mt-1">
                      {job.location}
                      {job.salary &&
                        <> &middot; {job.salary}</>}
                    </p>

                    <p className="text-sm mt-2 mb-3"
                       style={{
                         color: 'var(--text-muted)',
                         display: '-webkit-box',
                         WebkitLineClamp: 2,
                         WebkitBoxOrient: 'vertical',
                         overflow: 'hidden',
                       }}>
                      {job.description}
                    </p>

                    <div className="d-flex justify-content-between
                                    align-items-center mt-auto"
                         style={{ borderTop: '1px solid var(--surface-border)',
                                  paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem',
                                     color: 'var(--text-muted)' }}>
                        {job.application_count} applicant
                        {job.application_count !== 1 ? 's' : ''}
                      </span>
                      <Link
                        to={`/jobs/${job.id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        View role
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center
                              align-items-center gap-2 mt-4">
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </button>
                <span style={{ fontSize: '0.875rem',
                               color: 'var(--text-muted)' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}