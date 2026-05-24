import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function PendingEvents() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [approving, setApproving] = useState({})
  const [approved, setApproved] = useState({})

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/events/${user._id}/get-pending-events`)
        setEvents(res.data.body)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load pending events')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const handleApprove = async (eventId) => {
    setApproving(prev => ({ ...prev, [eventId]: true }))
    try {
      await api.post(`/events/${eventId}/approve-event`)
      setApproved(prev => ({ ...prev, [eventId]: true }))
      setEvents(prev => prev.filter(e => e._id !== eventId))
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed')
    } finally {
      setApproving(prev => ({ ...prev, [eventId]: false }))
    }
  }

  const handleLogout = async () => {
    try { await api.post('/users/log-out') } catch {}
    logout()
    navigate('/login')
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  })

  const modeColor = {
    Online:   { bg: '#0f2e1a', text: '#4ade80' },
    Campus:   { bg: '#0f1a2e', text: '#60a5fa' },
    External: { bg: '#2e0f1a', text: '#f472b6' },
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <div style={s.brand}>
            <div style={s.brandIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/>
              </svg>
            </div>
            <span style={s.brandName}>EventFlow</span>
          </div>
          <span style={s.adminBadge}>Admin panel</span>
        </div>
        <div style={s.navRight}>
          <span style={s.navUser}>🛡 {user?.username || user?.email}</span>
          <button onClick={handleLogout} style={s.logoutBtn}>Sign out</button>
        </div>
      </nav>

      <div style={s.body}>
        <div style={s.header}>
          <div>
            <h1 style={s.heading}>Pending approvals</h1>
            <p style={s.sub}>Review and approve events submitted by organizers</p>
          </div>
          {!loading && (
            <div style={s.countBadge}>
              {events.length} pending
            </div>
          )}
        </div>

        {loading && (
          <div style={s.center}>
            <p style={{ color: '#666' }}>Loading pending events...</p>
          </div>
        )}

        {error && <p style={s.error}>{error}</p>}

        {!loading && events.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>✅</div>
            <p style={s.emptyTitle}>All caught up</p>
            <p style={s.emptySub}>No events pending approval right now</p>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div style={s.list}>
            {events.map(event => {
              const mc = modeColor[event.mode] || { bg: '#1a1a1a', text: '#aaa' }
              return (
                <div key={event._id} style={s.card}>
                  <div style={s.cardBody}>
                    <div style={s.cardTop}>
                      <span style={{ ...s.badge, background: mc.bg, color: mc.text }}>
                        {event.mode}
                      </span>
                      <span style={s.eventId}>#{event._id.slice(-8).toUpperCase()}</span>
                    </div>

                    <h3 style={s.cardTitle}>{event.title}</h3>
                    <p style={s.cardCategory}>{event.category}</p>

                    <div style={s.detailGrid}>
                      <div style={s.detailItem}>
                        <span style={s.detailLabel}>Venue</span>
                        <span style={s.detailValue}>📍 {event.venue}</span>
                      </div>
                      <div style={s.detailItem}>
                        <span style={s.detailLabel}>Date</span>
                        <span style={s.detailValue}>📅 {formatDate(event.startTime)}</span>
                      </div>
                      <div style={s.detailItem}>
                        <span style={s.detailLabel}>Time</span>
                        <span style={s.detailValue}>🕐 {formatTime(event.startTime)} — {formatTime(event.endTime)}</span>
                      </div>
                      <div style={s.detailItem}>
                        <span style={s.detailLabel}>Seats</span>
                        <span style={s.detailValue}>🎟 {event.seatLimit}</span>
                      </div>
                      <div style={s.detailItem}>
                        <span style={s.detailLabel}>Price</span>
                        <span style={s.detailValue}>
                          {event.price === 0 ? '🆓 Free' : `💰 ₹${event.price}`}
                        </span>
                      </div>
                      <div style={s.detailItem}>
                        <span style={s.detailLabel}>Submitted</span>
                        <span style={s.detailValue}>🗓 {formatDate(event.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div style={s.cardActions}>
                    <button
                      onClick={() => handleApprove(event._id)}
                      disabled={approving[event._id]}
                      style={{ ...s.approveBtn, opacity: approving[event._id] ? 0.7 : 1 }}>
                      {approving[event._id] ? 'Approving...' : '✓ Approve'}
                    </button>
                    <button style={s.rejectBtn}>
                      ✕ Reject
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: 'system-ui, sans-serif' },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid #1e1e1e', background: '#0d0d0d', position: 'sticky', top: 0, zIndex: 10 },
  navLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  brand: { display: 'flex', alignItems: 'center', gap: '8px' },
  brandIcon: { width: '28px', height: '28px', background: '#6d28d9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandName: { color: '#fff', fontSize: '14px', fontWeight: '500' },
  adminBadge: { background: '#1a0f2e', color: '#9d71f7', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', border: '1px solid #4c1d95' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  navUser: { color: '#666', fontSize: '13px' },
  logoutBtn: { background: 'none', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '6px 14px', color: '#888', fontSize: '13px', cursor: 'pointer' },
  body: { maxWidth: '900px', margin: '0 auto', padding: '40px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
  heading: { color: '#fff', fontSize: '24px', fontWeight: '500', letterSpacing: '-0.5px', marginBottom: '6px' },
  sub: { color: '#666', fontSize: '14px' },
  countBadge: { background: '#2e2a0f', color: '#facc15', fontSize: '12px', padding: '6px 14px', borderRadius: '20px', fontWeight: '500' },
  center: { textAlign: 'center', padding: '80px 0' },
  error: { color: '#f87171', fontSize: '13px' },
  empty: { textAlign: 'center', padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  emptyIcon: { fontSize: '48px', marginBottom: '8px' },
  emptyTitle: { color: '#fff', fontSize: '18px', fontWeight: '500' },
  emptySub: { color: '#666', fontSize: '14px' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' },
  cardBody: { flex: 1 },
  cardTop: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  badge: { fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' },
  eventId: { color: '#444', fontSize: '11px', fontFamily: 'monospace' },
  cardTitle: { color: '#fff', fontSize: '16px', fontWeight: '500', marginBottom: '4px' },
  cardCategory: { color: '#555', fontSize: '13px', marginBottom: '16px' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
  detailItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  detailLabel: { color: '#444', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' },
  detailValue: { color: '#aaa', fontSize: '13px' },
  cardActions: { display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 },
  approveBtn: { background: '#0f2e1a', border: '1px solid #166534', borderRadius: '8px', padding: '10px 20px', color: '#4ade80', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' },
  rejectBtn: { background: '#2e0f0f', border: '1px solid #4a1a1a', borderRadius: '8px', padding: '10px 20px', color: '#f87171', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' },
}