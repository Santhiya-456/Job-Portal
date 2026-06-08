import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import NavbarComponent from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Home            from './pages/Home'
import Login           from './pages/Login'
import Register        from './pages/Register'
import JobList         from './pages/JobList'
import JobDetail       from './pages/JobDetail'
import PostJob         from './pages/PostJob'
import MyJobs          from './pages/MyJobs'
import MyApplications  from './pages/MyApplications'
import AdminDashboard  from './pages/AdminDashboard'
import Profile         from './pages/Profile'
import Footer          from './components/Footer'

// Placeholder for pages built in next phase
const Placeholder = ({ name }) => (
  <div className="container mt-5 text-center">
    <h3 className="text-muted">⏳ {name} — coming in next phase</h3>
  </div>
)

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column',
                      minHeight: '100vh' }}>
          <NavbarComponent />
          <main style={{ flex: 1 }}>
          <Routes>
            {/* Public */}
            <Route path="/"        element={<Home />} />
            <Route path="/login"   element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs"    element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetail />} />

            {/* Seeker */}
            <Route path="/my-applications" element={
              <ProtectedRoute roles={['seeker']}>
                <MyApplications />
              </ProtectedRoute>
            } />

            {/* Recruiter */}
            <Route path="/post-job" element={
              <ProtectedRoute roles={['recruiter']}>
                <PostJob />
              </ProtectedRoute>
            } />
            <Route path="/my-jobs" element={
              <ProtectedRoute roles={['recruiter']}>
                <MyJobs />
              </ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin-dashboard" element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Shared */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}