import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STATS = [
  { value: '10,000+', label: 'Active job listings' },
  { value: '3,500+',  label: 'Companies hiring'   },
  { value: '50,000+', label: 'Professionals hired' },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        style={{
          background:   'var(--surface-white)',
          borderBottom: '1px solid var(--surface-border)',
          padding:      '4rem 0',
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <p className="text-label mb-2"
                 style={{ color: 'var(--brand-primary)' }}>
                Professional Recruitment Platform
              </p>
              <h1
                style={{
                  fontSize:      'clamp(1.75rem, 4vw, 2.5rem)',
                  fontWeight:    700,
                  lineHeight:    1.2,
                  letterSpacing: '-0.02em',
                  color:         'var(--text-primary)',
                  marginBottom:  '1rem',
                }}
              >
                Connect talent with
                <br />opportunity at scale.
              </h1>
              <p
                style={{
                  fontSize:     '1rem',
                  color:        'var(--text-secondary)',
                  maxWidth:     '420px',
                  marginBottom: '2rem',
                  lineHeight:   1.7,
                }}
              >
                A modern hiring platform built for recruiters who
                move fast and candidates who mean business.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/jobs" className="btn btn-primary">
                  Browse open roles
                </Link>
                {!user && (
                  <Link to="/register" className="btn btn-ghost">
                    Create an account
                  </Link>
                )}
              </div>
            </div>

            <div className="col-lg-5 offset-lg-1 d-none d-lg-block">
              <div
                style={{
                  background:    'var(--surface-gray)',
                  border:        '1px solid var(--surface-border)',
                  borderRadius:  'var(--radius-lg)',
                  padding:       '1.5rem',
                }}
              >
                {/* Minimal job preview card — no images, no emoji */}
                {[
                  { title: 'Senior Product Designer',
                    company: 'Acme Corp',
                    location: 'Remote',
                    type: 'Full-time' },
                  { title: 'Backend Engineer',
                    company: 'Buildco',
                    location: 'New York, NY',
                    type: 'Contract' },
                  { title: 'Data Analyst',
                    company: 'Insightful',
                    location: 'San Francisco, CA',
                    type: 'Full-time' },
                ].map((j, i) => (
                  <div
                    key={i}
                    style={{
                      background:   'var(--surface-white)',
                      border:       '1px solid var(--surface-border)',
                      borderRadius: 'var(--radius-md)',
                      padding:      '0.875rem 1rem',
                      marginBottom: i < 2 ? '0.75rem' : 0,
                    }}
                  >
                    <div className="d-flex justify-content-between
                                    align-items-start">
                      <div>
                        <p style={{ fontWeight: 600,
                                    fontSize: '0.875rem',
                                    color: 'var(--text-primary)',
                                    marginBottom: '0.125rem' }}>
                          {j.title}
                        </p>
                        <p style={{ fontSize: '0.8125rem',
                                    color: 'var(--text-muted)',
                                    marginBottom: 0 }}>
                          {j.company} · {j.location}
                        </p>
                      </div>
                      <span className="type-badge">{j.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────── */}
      <section
        style={{
          background:   'var(--surface-white)',
          borderBottom: '1px solid var(--surface-border)',
          padding:      '1.5rem 0',
        }}
      >
        <div className="container">
          <div className="row g-0 text-center">
            {STATS.map((s, i) => (
              <div
                key={i}
                className="col-4"
                style={{
                  borderRight: i < 2
                    ? '1px solid var(--surface-border)' : 'none'
                }}
              >
                <p style={{ fontSize: '1.375rem', fontWeight: 700,
                             color: 'var(--text-primary)',
                             marginBottom: '0.125rem' }}>
                  {s.value}
                </p>
                <p style={{ fontSize: '0.8125rem',
                             color: 'var(--text-muted)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature columns ───────────────────────────────── */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="row g-4">
            {[
              {
                title: 'For Job Seekers',
                desc:  'Search thousands of verified roles, apply in minutes, and track every application in one place.',
                cta:   'Browse jobs',
                to:    '/jobs',
              },
              {
                title: 'For Recruiters',
                desc:  'Post roles, screen applicants, manage the full hiring pipeline, and make faster decisions.',
                cta:   'Start hiring',
                to:    '/register',
              },
              {
                title: 'For Administrators',
                desc:  'Full visibility across all users, jobs, and applications with platform-level controls.',
                cta:   'Learn more',
                to:    '/register',
              },
            ].map((f, i) => (
              <div className="col-md-4" key={i}>
                <div
                  style={{
                    background:    'var(--surface-white)',
                    border:        '1px solid var(--surface-border)',
                    borderRadius:  'var(--radius-md)',
                    padding:       '1.75rem',
                    height:        '100%',
                    boxShadow:     'var(--shadow-sm)',
                  }}
                >
                  <h5 style={{ fontWeight: 700, marginBottom: '0.625rem' }}>
                    {f.title}
                  </h5>
                  <p style={{ fontSize: '0.875rem',
                               color: 'var(--text-secondary)',
                               marginBottom: '1.25rem',
                               lineHeight: 1.7 }}>
                    {f.desc}
                  </p>
                  <Link to={f.to}
                        className="btn btn-outline-primary btn-sm">
                    {f.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}