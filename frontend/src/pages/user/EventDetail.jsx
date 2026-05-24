import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [ticketCount, setTicketCount] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/events/${id}/get-event-data`)
        setEvent(res.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load event')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleBook = async () => {
    setBooking(true)
    setError('')
    try {
      const res = await api.post('/bookings/create-booking', {
        eventId: id,
        ticketCount
      })
      setSuccess('Booking created! Proceeding to payment...')
      // Navigate to payment page with bookingId
      setTimeout(() => navigate(`/payment/${res.data.data._id}`), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  })

  const modeColor = { Online: '#0f2e1a', Campus: '#0f1a2e', External: '#2e0f1a' }
  const modeText = { Online: '#4ade80', Campus: '#60a5fa', External: '#f472b6' }

  if (loading) return (
    <div style={s.page}>
      <div style={s.center}><p style={{ color: '#666' }}>Loading event...</p></div>
    </div>
  )

  if (!event) return (
    <div style={s.page}>
      <div style={s.center}><p style={{ color: '#f87171' }}>{error || 'Event not found'}</p></div>
    </div>
  )

  const totalPrice = event.price * ticketCount

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.nav}>
        <button onClick={() => navigate('/events')} style={s.backBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to events
        </button>
      </nav>

      <div style={s.body}>
        <div style={s.layout}>
          {/* Left — event details */}
          <div style={s.left}>
            <div style={s.topRow}>
              <span style={{
                ...s.modeBadge,
                background: modeColor[event.mode] || '#1a1a1a',
                color: modeText[event.mode] || '#aaa'
              }}>
                {event.mode}
              </span>
              <span style={{
                ...s.statusBadge,
                background: event.status === 'Active' ? '#0f2e1a' : '#2e1a0f',
                color: event.status === 'Active' ? '#4ade80' : '#fb923c'
              }}>
                {event.status}
              </span>
            </div>

            <h1 style={s.title}>{event.title}</h1>
            <p style={s.category}>{event.category}</p>

            <div style={s.detailGrid}>
              <div style={s.detailCard}>
                <p style={s.detailLabel}>Date</p>
                <p style={s.detailValue}>{formatDate(event.startTime)}</p>
              </div>
              <div style={s.detailCard}>
                <p style={s.detailLabel}>Time</p>
                <p style={s.detailValue}>{formatTime(event.startTime)} — {formatTime(event.endTime)}</p>
              </div>
              <div style={s.detailCard}>
                <p style={s.detailLabel}>Venue</p>
                <p style={s.detailValue}>{event.venue}</p>
              </div>
              <div style={s.detailCard}>
                <p style={s.detailLabel}>Seats available</p>
                <p style={s.detailValue}>{event.seatLimit}</p>
              </div>
            </div>
          </div>

          {/* Right — booking panel */}
          <div style={s.right}>
            <div style={s.bookingCard}>
              <p style={s.priceLabel}>Price per ticket</p>
              <p style={s.priceValue}>
                {event.price === 0 ? 'Free' : `₹${event.price}`}
              </p>

              <div style={s.divider} />

              <label style={s.ticketLabel}>Number of tickets</label>
              <div style={s.ticketRow}>
                <button style={s.ticketBtn}
                  onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}>−</button>
                <span style={s.ticketCount}>{ticketCount}</span>
                <button style={s.ticketBtn}
                  onClick={() => setTicketCount(Math.min(event.seatLimit, ticketCount + 1))}>+</button>
              </div>

              <div style={s.divider} />

              <div style={s.totalRow}>
                <span style={s.totalLabel}>Total</span>
                <span style={s.totalValue}>
                  {event.price === 0 ? 'Free' : `₹${totalPrice}`}
                </span>
              </div>

              {error && <p style={s.error}>{error}</p>}
              {success && <p style={s.successMsg}>{success}</p>}

              <button
                style={{
                  ...s.bookBtn,
                  opacity: booking || event.status !== 'Active' || event.seatLimit === 0 ? 0.6 : 1,
                  cursor: booking || event.status !== 'Active' ? 'not-allowed' : 'pointer'
                }}
                onClick={handleBook}
                disabled={booking || event.status !== 'Active' || event.seatLimit === 0}
              >
                {event.seatLimit === 0 ? 'Sold out' :
                  booking ? 'Processing...' : 'Book now'}
              </button>

              <p style={s.note}>You won't be charged until payment is confirmed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: 'system-ui, sans-serif' },
  nav: { padding: '16px 32px', borderBottom: '1px solid #1e1e1e', background: '#0d0d0d' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#888', fontSize: '14px', cursor: 'pointer' },
  body: { maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' },
  left: { display: 'flex', flexDirection: 'column', gap: '20px' },
  topRow: { display: 'flex', gap: '10px' },
  modeBadge: { fontSize: '11px', padding: '4px 12px', borderRadius: '20px', fontWeight: '500' },
  statusBadge: { fontSize: '11px', padding: '4px 12px', borderRadius: '20px', fontWeight: '500' },
  title: { color: '#fff', fontSize: '28px', fontWeight: '500', letterSpacing: '-0.5px', lineHeight: '1.3' },
  category: { color: '#666', fontSize: '14px' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  detailCard: { background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '16px' },
  detailLabel: { color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' },
  detailValue: { color: '#fff', fontSize: '14px', fontWeight: '500' },
  right: { position: 'sticky', top: '80px' },
  bookingCard: { background: '#111', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '24px' },
  priceLabel: { color: '#666', fontSize: '12px', marginBottom: '4px' },
  priceValue: { color: '#fff', fontSize: '28px', fontWeight: '500', marginBottom: '20px' },
  divider: { height: '1px', background: '#1e1e1e', margin: '16px 0' },
  ticketLabel: { display: 'block', color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' },
  ticketRow: { display: 'flex', alignItems: 'center', gap: '16px' },
  ticketBtn: { width: '36px', height: '36px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', fontSize: '18px', cursor: 'pointer' },
  ticketCount: { color: '#fff', fontSize: '18px', fontWeight: '500', minWidth: '24px', textAlign: 'center' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#888', fontSize: '14px' },
  totalValue: { color: '#fff', fontSize: '20px', fontWeight: '500' },
  error: { color: '#f87171', fontSize: '13px', margin: '12px 0 0' },
  successMsg: { color: '#4ade80', fontSize: '13px', margin: '12px 0 0' },
  bookBtn: { width: '100%', background: '#6d28d9', border: 'none', borderRadius: '10px', padding: '14px', color: '#fff', fontSize: '14px', fontWeight: '500', marginTop: '16px' },
  note: { color: '#444', fontSize: '11px', textAlign: 'center', marginTop: '10px' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' },
}