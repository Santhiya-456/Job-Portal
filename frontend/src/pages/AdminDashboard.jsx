import { useState, useEffect } from 'react'
import API from '../api/axios'

const TABS = ['Overview', 'Users', 'Jobs', 'Applications']

const StatusBadge = ({ status }) => {
  const map = {
    pending:     'status-badge-pending',
    shortlisted: 'status-badge-shortlisted',
    rejected:    'status-badge-rejected',
    hired:       'status-badge-hired',
    active:      'status-badge-active',
    inactive:    'status-badge-inactive',
  }
  return (
    <span className={`badge ${map[status] || 'status-badge-pending'}`}>
      {status}
    </span>
  )
}

export default function AdminDashboard() {
  const [tab, setTab]           = useState('Overview')
  const [users, setUsers]       = useState([])
  const [jobs, setJobs]         = useState([])
  const [applications, setApps] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [u, j, a] = await Promise.all([
          API.get('/auth/admin/users/'),
          API.get('/jobs/admin/all/'),
          API.get('/applications/admin/all/'),
        ])
        setUsers(u.data.results || u.data)
        setJobs(j.data.results  || j.data)
        setApps(a.data.results  || a.data)
      } finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const handleToggleJob = async (id) => {
    const res = await API.patch(`/jobs/admin/${id}/toggle/`)
    setJobs(jobs.map(j =>
      j.id === id ? { ...j, is_active: res.data.is_active } : j
    ))
  }

  const stats = [
    { label: 'Total users',    value: users.length,
      sub: `${users.filter(u=>u.role==='seeker').length} seekers` },
    { label: 'Active jobs',    value: jobs.filter(j=>j.is_active).length,
      sub: `${jobs.length} total posted` },
    { label: 'Applications',   value: applications.length,
      sub: `${applications.filter(a=>a.status==='hired').length} hired` },
    { label: 'Recruiters',     value: users.filter(u=>u.role==='recruiter').length,
      sub: `${jobs.filter(j=>!j.is_active).length} inactive jobs` },
  ]

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border"
           style={{ color: 'var(--brand-primary)' }} />
    </div>
  )

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Admin Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)',
                                          marginTop: '0.25rem' }}>
            Platform overview and management
          </p>
        </div>
      </div>

      <div className="container page-wrapper" style={{ paddingTop: 0 }}>

        {/* ── Tabs ──────────────────────────────────────── */}
        <div style={{ borderBottom: '1px solid var(--surface-border)',
                      marginBottom: '1.5rem' }}>
          <nav className="d-flex gap-1">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  border:      'none',
                  background:  'none',
                  padding:     '0.75rem 1rem',
                  fontSize:    '0.875rem',
                  fontWeight:  tab === t ? 600 : 400,
                  color:       tab === t
                    ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  borderBottom: tab === t
                    ? '2px solid var(--brand-primary)' : '2px solid transparent',
                  cursor:  'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Overview ──────────────────────────────────── */}
        {tab === 'Overview' && (
          <>
            <div className="row g-3 mb-4">
              {stats.map((s, i) => (
                <div className="col-6 col-lg-3" key={i}>
                  <div className="stat-card">
                    <p className="stat-label">{s.label}</p>
                    <p className="stat-value">{s.value}</p>
                    <p className="text-xs mt-1"
                       style={{ color: 'var(--text-muted)' }}>
                      {s.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="row g-3">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">
                      Recent applications
                    </h6>
                    {applications.slice(0, 5).map(a => (
                      <div key={a.id}
                           className="d-flex justify-content-between
                                      align-items-center py-2"
                           style={{ borderBottom: '1px solid var(--surface-border)' }}>
                        <div>
                          <p className="text-sm fw-medium mb-0">
                            {a.full_name || a.applicant?.username}
                          </p>
                          <p className="text-xs mb-0"
                             style={{ color: 'var(--text-muted)' }}>
                            {a.job?.title}
                          </p>
                        </div>
                        <StatusBadge status={a.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Recent jobs</h6>
                    {jobs.slice(0, 5).map(j => (
                      <div key={j.id}
                           className="d-flex justify-content-between
                                      align-items-center py-2"
                           style={{ borderBottom: '1px solid var(--surface-border)' }}>
                        <div>
                          <p className="text-sm fw-medium mb-0">
                            {j.title}
                          </p>
                          <p className="text-xs mb-0"
                             style={{ color: 'var(--text-muted)' }}>
                            {j.company_name}
                          </p>
                        </div>
                        <StatusBadge
                          status={j.is_active ? 'active' : 'inactive'} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Users ─────────────────────────────────────── */}
        {tab === 'Users' && (
          <div className="card">
            <div className="d-flex justify-content-between
                            align-items-center p-3"
                 style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <h6 className="fw-semibold mb-0">
                All users
                <span className="badge ms-2"
                      style={{ background: 'var(--surface-gray)',
                               color: 'var(--text-muted)',
                               fontWeight: 500 }}>
                  {users.length}
                </span>
              </h6>
            </div>
            <div className="table-responsive">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="d-inline-flex align-items-center
                                       justify-content-center rounded-circle
                                       text-white fw-semibold flex-shrink-0"
                            style={{
                              width: 28, height: 28,
                              fontSize: '0.6875rem',
                              background: 'var(--brand-primary)',
                            }}
                          >
                            {u.username?.[0]?.toUpperCase()}
                          </span>
                          <span className="text-sm fw-medium">
                            {u.username}
                          </span>
                        </div>
                      </td>
                      <td className="text-sm"
                          style={{ color: 'var(--text-muted)' }}>
                        {u.email}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: u.role === 'admin'
                              ? '#fee2e2' : u.role === 'recruiter'
                              ? '#fef3c7' : 'var(--brand-primary-light)',
                            color: u.role === 'admin'
                              ? '#991b1b' : u.role === 'recruiter'
                              ? '#92400e' : 'var(--brand-primary)',
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="text-sm"
                          style={{ color: 'var(--text-muted)' }}>
                        {new Date(u.date_joined).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Jobs ──────────────────────────────────────── */}
        {tab === 'Jobs' && (
          <div className="card">
            <div className="d-flex justify-content-between
                            align-items-center p-3"
                 style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <h6 className="fw-semibold mb-0">
                All jobs
                <span className="badge ms-2"
                      style={{ background: 'var(--surface-gray)',
                               color: 'var(--text-muted)',
                               fontWeight: 500 }}>
                  {jobs.length}
                </span>
              </h6>
            </div>
            <div className="table-responsive">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Type</th>
                    <th>Recruiter</th>
                    <th>Applicants</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(j => (
                    <tr key={j.id}>
                      <td>
                        <p className="text-sm fw-medium mb-0">{j.title}</p>
                        <p className="text-xs mb-0"
                           style={{ color: 'var(--text-muted)' }}>
                          {j.company_name}
                        </p>
                      </td>
                      <td>
                        <span className="type-badge">
                          {j.job_type.replace('_', '-')}
                        </span>
                      </td>
                      <td className="text-sm"
                          style={{ color: 'var(--text-muted)' }}>
                        {j.posted_by?.username}
                      </td>
                      <td className="text-sm">{j.application_count}</td>
                      <td>
                        <StatusBadge
                          status={j.is_active ? 'active' : 'inactive'} />
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleToggleJob(j.id)}
                        >
                          {j.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Applications ──────────────────────────────── */}
        {tab === 'Applications' && (
          <div className="card">
            <div className="p-3"
                 style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <h6 className="fw-semibold mb-0">
                All applications
                <span className="badge ms-2"
                      style={{ background: 'var(--surface-gray)',
                               color: 'var(--text-muted)',
                               fontWeight: 500 }}>
                  {applications.length}
                </span>
              </h6>
            </div>
            <div className="table-responsive">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Position</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(a => (
                    <tr key={a.id}>
                      <td>
                        <p className="text-sm fw-medium mb-0">
                          {a.full_name || a.applicant?.username}
                        </p>
                        <p className="text-xs mb-0"
                           style={{ color: 'var(--text-muted)' }}>
                          {a.email || a.applicant?.email}
                        </p>
                      </td>
                      <td className="text-sm">{a.job?.title}</td>
                      <td className="text-sm"
                          style={{ color: 'var(--text-muted)' }}>
                        {a.job?.company_name}
                      </td>
                      <td><StatusBadge status={a.status} /></td>
                      <td className="text-sm"
                          style={{ color: 'var(--text-muted)' }}>
                        {new Date(a.applied_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </>
  )
}