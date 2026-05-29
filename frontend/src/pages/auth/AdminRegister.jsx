import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'

export default function AdminRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '', email: '', password: '', phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/users/register-admin', form)
      setSuccess(res.data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/>
            </svg>
          </div>
          <span style={s.brandName}>EventFlow</span>
        </div>

        {!success ? (
          <>
            <div style={s.adminBadge}>🛡 Admin Access Request</div>
            <h1 style={s.heading}>Request admin access</h1>
            <p style={s.sub}>
              Fill in your details — the principal admin will review
              your request and notify you via email
            </p>

            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.row}>
                <div style={s.field}>
                  <label style={s.label}>Username</label>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="yourname"
                    style={s.input}
                    required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    style={s.input}
                    required />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Email address</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  style={s.input}
                  required />
              </div>

              <div style={s.field}>
                <label style={s.label}>Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  style={s.input}
                  required />
              </div>

              {error && <p style={s.error}>{error}</p>}

              <button
                type="submit"
                style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
                disabled={loading}>
                {loading ? 'Submitting request...' : 'Submit request'}
              </button>
            </form>
          </>
        ) : (
          // Success state
          <div style={s.successWrap}>
            <div style={s.successIcon}>📬</div>
            <h2 style={s.successTitle}>Request submitted!</h2>
            <p style={s.successMsg}>{success}</p>
            <p style={s.successNote}>
              Keep an eye on your inbox. The principal admin will
              review your request and send you a confirmation email.
            </p>
            <button onClick={() => navigate('/login')} style={s.backBtn}>
              Back to login
            </button>
          </div>
        )}

        {!success && (
          <p style={s.footer}>
            Not an admin?{' '}
            <Link to="/register" style={s.link}>Register as User or Organizer</Link>
          </p>
        )}
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '2rem', fontFamily: 'system-ui, sans-serif' },
  card: { width: '100%', maxWidth: '480px', background: '#111', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '40px' },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' },
  brandIcon: { width: '32px', height: '32px', background: '#6d28d9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandName: { color: '#fff', fontSize: '15px', fontWeight: '500' },
  adminBadge: { display: 'inline-block', background: '#1a0f2e', color: '#9d71f7', fontSize: '11px', padding: '4px 12px', borderRadius: '20px', border: '1px solid #4c1d95', marginBottom: '16px' },
  heading: { color: '#fff', fontSize: '22px', fontWeight: '500', letterSpacing: '-0.5px', marginBottom: '8px' },
  sub: { color: '#666', fontSize: '13px', lineHeight: '1.6', marginBottom: '28px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  label: { color: '#888', fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase' },
  input: { background: '#0a0a0a', border: '1px solid #222', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none' },
  error: { color: '#f87171', fontSize: '13px' },
  btn: { background: '#6d28d9', border: 'none', borderRadius: '10px', padding: '13px', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginTop: '4px' },
  footer: { color: '#555', fontSize: '13px', textAlign: 'center', marginTop: '1.5rem' },
  link: { color: '#7c3aed', textDecoration: 'none' },
  successWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px', padding: '16px 0' },
  successIcon: { fontSize: '52px', marginBottom: '8px' },
  successTitle: { color: '#fff', fontSize: '20px', fontWeight: '500' },
  successMsg: { color: '#4ade80', fontSize: '14px', fontWeight: '500' },
  successNote: { color: '#666', fontSize: '13px', lineHeight: '1.6', maxWidth: '320px' },
  backBtn: { background: '#6d28d9', border: 'none', borderRadius: '10px', padding: '12px 32px', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginTop: '8px' },
}