import { useState, useEffect } from 'react'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [message, setMessage]   = useState({ type: '', text: '' })
  const [resumeFile, setResumeFile] = useState(null)

  const endpoint = user?.role === 'seeker'
    ? '/auth/profile/seeker/'
    : '/auth/profile/recruiter/'

  useEffect(() => {
    API.get(endpoint)
      .then(res => setProfile(res.data))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = e =>
    setProfile({ ...profile, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const formData = new FormData()

      if (user.role === 'seeker') {
        formData.append('skills', profile.skills || '')
        formData.append('bio', profile.bio || '')
        formData.append('phone', profile.phone || '')
        if (resumeFile) formData.append('resume', resumeFile)
      } else {
        formData.append('company_name', profile.company_name || '')
        formData.append('company_website', profile.company_website || '')
        formData.append('phone', profile.phone || '')
      }

      const res = await API.patch(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProfile(res.data)
      setMessage({ type: 'success', text: '✅ Profile updated successfully!' })
    } catch {
      setMessage({ type: 'danger', text: 'Failed to update profile.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary" />
    </div>
  )

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4">

            {/* Header */}
            <div className="text-center mb-4">
              <div
                className="rounded-circle bg-primary text-white d-inline-flex
                            align-items-center justify-content-center mb-3"
                style={{ width: 72, height: 72, fontSize: '2rem' }}
              >
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <h4 className="fw-bold mb-0">{user?.username}</h4>
              <p className="text-muted">{user?.email}</p>
              <span className={`badge ${
                user?.role === 'admin' ? 'bg-danger' :
                user?.role === 'recruiter' ? 'bg-warning text-dark' : 'bg-success'
              } px-3 py-2`}>
                {user?.role}
              </span>
            </div>

            <hr />

            {message.text && (
              <div className={`alert alert-${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {user?.role === 'seeker' ? (
                <>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Phone</label>
                    <input
                      name="phone" className="form-control"
                      placeholder="+1 234 567 8900"
                      value={profile?.phone || ''} onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Skills</label>
                    <input
                      name="skills" className="form-control"
                      placeholder="e.g. React, Python, Django, SQL"
                      value={profile?.skills || ''} onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Bio</label>
                    <textarea
                      name="bio" className="form-control" rows={4}
                      placeholder="Tell recruiters about yourself..."
                      value={profile?.bio || ''} onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Resume (PDF/DOC)</label>
                    {profile?.resume && (
                      <div className="mb-2">
                        <a
                          href={`http://localhost:8000${profile.resume}`}
                          target="_blank" rel="noreferrer"
                          className="btn btn-outline-success btn-sm"
                        >
                          📄 View Current Resume
                        </a>
                      </div>
                    )}
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.doc,.docx"
                      onChange={e => setResumeFile(e.target.files[0])}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Company Name</label>
                    <input
                      name="company_name" className="form-control"
                      placeholder="Acme Corp"
                      value={profile?.company_name || ''} onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Company Website</label>
                    <input
                      name="company_website" className="form-control"
                      placeholder="https://acme.com"
                      value={profile?.company_website || ''} onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Phone</label>
                    <input
                      name="phone" className="form-control"
                      placeholder="+1 234 567 8900"
                      value={profile?.phone || ''} onChange={handleChange}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100 mt-2"
                disabled={saving}
              >
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-2"/>Saving...</>
                  : ' Save Profile'
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}