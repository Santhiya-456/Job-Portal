import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'

const TYPE_COLORS = {
  full_time: 'primary', part_time: 'secondary',
  contract: 'warning', internship: 'info', remote: 'success',
}

const INIT_FORM = {
  full_name: '', email: '', phone: '',
  skills: '', experience: '', cover_letter: '',
  linkedin_url: '', portfolio_url: '',
}

export default function JobDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { user }   = useAuth()
  const fileRef    = useRef()

  const [job, setJob]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)

  const [form, setForm]         = useState(INIT_FORM)
  const [resumeFile, setResume] = useState(null)
  const [errors, setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [applied, setApplied]   = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    API.get(`/jobs/${id}/`)
      .then(res => setJob(res.data))
      .catch(() => navigate('/jobs'))
      .finally(() => setLoading(false))
  }, [id])

  // Pre-fill email from logged-in user
  useEffect(() => {
    if (user) setForm(f => ({ ...f, email: user.email }))
  }, [user])

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const e = {}
    if (!form.full_name.trim())   e.full_name   = 'Full name is required'
    if (!form.email.trim())       e.email       = 'Email is required'
    if (!form.phone.trim())       e.phone       = 'Phone is required'
    if (!form.skills.trim())      e.skills      = 'Skills are required'
    if (!form.experience.trim())  e.experience  = 'Experience is required'
    if (!resumeFile)              e.resume      = 'Resume is required'
    else {
      const allowed = ['application/pdf','application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowed.includes(resumeFile.type))
        e.resume = 'Only PDF, DOC, DOCX allowed'
      if (resumeFile.size > 5 * 1024 * 1024)
        e.resume = 'File must be under 5MB'
    }
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    setApiError('')

    const fd = new FormData()
    fd.append('job', job.id)
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    fd.append('resume', resumeFile)

    try {
      await API.post('/applications/apply/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setApplied(true)
      setShowModal(false)
    } catch (err) {
      const data = err.response?.data
      if (data) {
        if (data.non_field_errors)
          setApiError(data.non_field_errors[0])
        else
          setErrors(data)
      } else {
        setApiError('Submission failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setErrors({})
    setApiError('')
  }

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary" />
    </div>
  )
  if (!job) return null

  return (
    <div className="container">
      <div className="row">

        {/* ── Job Detail ── */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h2 className="fw-bold mb-1">{job.title}</h2>
                <p className="text-primary fw-semibold fs-5 mb-1">
                  🏢 {job.company_name}
                </p>
                <p className="text-muted mb-0">
                  📍 {job.location}
                  {job.salary &&
                    <span className="ms-3">💰 {job.salary}</span>}
                </p>
              </div>
              <span className={`badge bg-${TYPE_COLORS[job.job_type]} fs-6`}>
                {job.job_type.replace('_',' ')}
              </span>
            </div>
            <hr />
            <h5 className="fw-bold mb-3">Job Description</h5>
            <div className="text-muted" style={{ whiteSpace:'pre-line' }}>
              {job.description}
            </div>
            <hr />
            <div className="row text-muted small">
              <div className="col-sm-6">
                <strong>Posted by:</strong> {job.posted_by?.username}
              </div>
              <div className="col-sm-6">
                <strong>Date:</strong>{' '}
                {new Date(job.created_at).toLocaleDateString('en-US',{
                  year:'numeric',month:'long',day:'numeric'
                })}
              </div>
              <div className="col-sm-6 mt-1">
                <strong>Applicants:</strong> {job.application_count}
              </div>
            </div>
          </div>
        </div>

        {/* ── Apply Sidebar ── */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top"
               style={{ top:'80px' }}>
            <h5 className="fw-bold mb-3">Apply for this Role</h5>

            {applied ? (
              <div className="text-center text-success fw-semibold">
                ✅ Application submitted!
              </div>
            ) : user?.role === 'seeker' ? (
              <button
                className="btn btn-primary w-100 fw-semibold"
                onClick={() => setShowModal(true)}
              >
                🚀 Apply Now
              </button>
            ) : !user ? (
              <>
                <p className="text-muted small">
                  Login as a Job Seeker to apply.
                </p>
                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate('/login')}
                >
                  Login to Apply
                </button>
              </>
            ) : (
              <p className="text-muted small text-center">
                Only job seekers can apply.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
           APPLICATION MODAL
      ══════════════════════════════════ */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor:'rgba(0,0,0,0.5)' }}
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0">

              {/* Header */}
              <div className="modal-header bg-primary text-white rounded-top-4">
                <h5 className="modal-title fw-bold">
                  Apply — {job.title}
                </h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                />
              </div>

              {/* Body */}
              <div className="modal-body p-4">
                {apiError && (
                  <div className="alert alert-danger">{apiError}</div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <p className="text-muted small mb-3">
                    Fields marked <span className="text-danger">*</span> are required.
                  </p>

                  {/* Row 1 */}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        name="full_name"
                        className={`form-control ${errors.full_name ? 'is-invalid':''}`}
                        placeholder="John Doe"
                        value={form.full_name}
                        onChange={handleChange}
                      />
                      {errors.full_name &&
                        <div className="invalid-feedback">{errors.full_name}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        name="email" type="email"
                        className={`form-control ${errors.email ? 'is-invalid':''}`}
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                      />
                      {errors.email &&
                        <div className="invalid-feedback">{errors.email}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Phone <span className="text-danger">*</span>
                      </label>
                      <input
                        name="phone"
                        className={`form-control ${errors.phone ? 'is-invalid':''}`}
                        placeholder="+1 234 567 8900"
                        value={form.phone}
                        onChange={handleChange}
                      />
                      {errors.phone &&
                        <div className="invalid-feedback">{errors.phone}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Resume <span className="text-danger">*</span>
                        <span className="text-muted fw-normal ms-1">
                          (PDF/DOC/DOCX, max 5MB)
                        </span>
                      </label>
                      <input
                        type="file"
                        ref={fileRef}
                        className={`form-control ${errors.resume ? 'is-invalid':''}`}
                        accept=".pdf,.doc,.docx"
                        onChange={e => setResume(e.target.files[0])}
                      />
                      {errors.resume &&
                        <div className="invalid-feedback">{errors.resume}</div>}
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Skills <span className="text-danger">*</span>
                      </label>
                      <input
                        name="skills"
                        className={`form-control ${errors.skills ? 'is-invalid':''}`}
                        placeholder="React, Python, Django, SQL..."
                        value={form.skills}
                        onChange={handleChange}
                      />
                      {errors.skills &&
                        <div className="invalid-feedback">{errors.skills}</div>}
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Experience <span className="text-danger">*</span>
                      </label>
                      <textarea
                        name="experience" rows={3}
                        className={`form-control ${errors.experience ? 'is-invalid':''}`}
                        placeholder="Describe your work experience..."
                        value={form.experience}
                        onChange={handleChange}
                      />
                      {errors.experience &&
                        <div className="invalid-feedback">{errors.experience}</div>}
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Cover Letter
                        <span className="text-muted fw-normal ms-1">(optional)</span>
                      </label>
                      <textarea
                        name="cover_letter" rows={3}
                        className="form-control"
                        placeholder="Why are you the right fit?"
                        value={form.cover_letter}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Optional links */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        LinkedIn URL
                        <span className="text-muted fw-normal ms-1">(optional)</span>
                      </label>
                      <input
                        name="linkedin_url" type="url"
                        className="form-control"
                        placeholder="https://linkedin.com/in/you"
                        value={form.linkedin_url}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Portfolio URL
                        <span className="text-muted fw-normal ms-1">(optional)</span>
                      </label>
                      <input
                        name="portfolio_url" type="url"
                        className="form-control"
                        placeholder="https://yourportfolio.com"
                        value={form.portfolio_url}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Footer buttons inside form */}
                  <div className="d-flex gap-3 mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary px-5 fw-semibold"
                      disabled={submitting}
                    >
                      {submitting
                        ? <><span className="spinner-border spinner-border-sm me-2"/>
                            Submitting...</>
                        : ' Submit Application'
                      }
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}