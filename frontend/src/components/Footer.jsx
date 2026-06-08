import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <p className="footer-brand">TalentHub</p>
            <p className="footer-desc">
              A professional recruitment platform connecting
              qualified candidates with leading employers.
            </p>
          </div>
          <div className="col-6 col-md-2">
            <p className="footer-heading">Platform</p>
            <Link className="footer-link" to="/jobs">Browse jobs</Link>
            <Link className="footer-link" to="/register">Post a job</Link>
            <Link className="footer-link" to="/register">Sign up</Link>
          </div>
          <div className="col-6 col-md-2">
            <p className="footer-heading">Company</p>
            <a className="footer-link" href="#">About us</a>
            <a className="footer-link" href="#">Careers</a>
            <a className="footer-link" href="#">Contact</a>
          </div>
          <div className="col-6 col-md-2">
            <p className="footer-heading">Legal</p>
            <a className="footer-link" href="#">Privacy Policy</a>
            <a className="footer-link" href="#">Terms of Service</a>
            <a className="footer-link" href="#">Cookie Policy</a>
          </div>
          <div className="col-6 col-md-2">
            <p className="footer-heading">Support</p>
            <a className="footer-link" href="#">Help Center</a>
            <a className="footer-link" href="#">Security</a>
            <a className="footer-link" href="#">Status</a>
          </div>
        </div>
        <div className="footer-bottom d-flex justify-content-between
                        align-items-center flex-wrap gap-2">
          <span>© {year} TalentHub, Inc. All rights reserved.</span>
          <span>Built with Django + React</span>
        </div>
      </div>
    </footer>
  )
}