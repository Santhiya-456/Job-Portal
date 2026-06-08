import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

const JOB_TYPES = [
  { value: 'full_time',  label: 'Full Time' },
  { value: 'part_time',  label: 'Part Time' },
  { value: 'contract',   label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote',     label: 'Remote' },
]

export default function PostJob() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', location: '',
    salary: '', job_type: 'full_time', company_name: '',
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await API.post('/jobs/create/', form)
      navigate('/my-jobs')
    } catch (err) {
      const data = err.response?.data
      const msg = data
        ? Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(' | ')
        : 'Failed to post job.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h3 className="fw-bold mb-4">📝 Post a New Job</h3>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Job Title *</label>
                  <input
                    name="title" className="form-control"
                    placeholder="e.g. Senior React Developer"
                    value={form.title} onChange={handleChange} required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Company Name *</label>
                  <input
                    name="company_name" className="form-control"
                    placeholder="e.g. Acme Corp"
                    value={form.company_name} onChange={handleChange} required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Location *</label>
                  <input
                    name="location" className="form-control"
                    placeholder="e.g. Coimbatore, Tamil Nadu"
                    value={form.location} onChange={handleChange} required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Salary</label>
                  <input
                    name="salary" className="form-control"
                    placeholder="e.g. 80k - 100k"
                    value={form.salary} onChange={handleChange}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Job Type *</label>
                  <select
                    name="job_type" className="form-select"
                    value={form.job_type} onChange={handleChange}
                  >
                    {JOB_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Job Description *</label>
                  <textarea
                    name="description" className="form-control" rows={7}
                    placeholder="Describe responsibilities, requirements, and benefits..."
                    value={form.description} onChange={handleChange} required
                  />
                </div>
              </div>

              <div className="d-flex gap-3 mt-4">
                <button
                  type="submit" className="btn btn-primary px-5"
                  disabled={loading}
                >
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-2"/>Posting...</>
                    : ' Post Job'
                  }
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/my-jobs')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}