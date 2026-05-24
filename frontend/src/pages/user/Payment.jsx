import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import api from '../../api/axios'

export default function Payment() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [booking, setBooking] = useState(location.state?.booking || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('UPI')

  // We need eventId to call the payment endpoint
  const eventId = booking?.event

  const handlePay = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post(`/payments/${eventId}/payment-request`, {
        ticketCount: booking.ticketCount,
        paymentMethod
      })
      // Redirect to PhonePe payment page
      window.location.href = res.data.paymentUrl
    } catch (err) {
      setError(err.response?.data?.message || 'Payment initiation failed')
      setLoading(false)
    }
  }

  const formatCurrency = (n) => `₹${n.toLocaleString('en-IN')}`

  if (!booking) return (
    <div style={s.page}>
      <div style={s.center}>
        <p style={{ color: '#f87171' }}>No booking data found.</p>
        <button onClick={() => navigate('/events')} style={s.backLink}>Go back to events</button>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <button onClick={() => navigate(-1)} style={s.backBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/>
            </svg>
          </div>
          <span style={s.brandName}>EventFlow</span>
        </div>
      </nav>

      <div style={s.body}>
        <h1 style={s.heading}>Complete your booking</h1>
        <p style={s.sub}>Review your order and choose a payment method</p>

        <div style={s.layout}>
          {/* Left — payment method */}
          <div style={s.left}>
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Payment method</h2>
              <div style={s.methodGrid}>
                {['UPI', 'Card', 'NetBanking'].map(m => (
                  <button key={m} type="button"
                    onClick={() => setPaymentMethod(m)}
                    style={{ ...s.methodBtn, ...(paymentMethod === m ? s.methodBtnActive : {}) }}>
                    <span style={s.methodIcon}>
                      {m === 'UPI' ? '📱' : m === 'Card' ? '💳' : '🏦'}
                    </span>
                    <span style={s.methodLabel}>{m}</span>
                    {paymentMethod === m && (
                      <span style={s.methodCheck}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div style={s.section}>
              <h2 style={s.sectionTitle}>Secure payment</h2>
              <div style={s.secureRow}>
                <div style={s.secureItem}>
                  <span>🔒</span>
                  <span style={s.secureText}>256-bit SSL encryption</span>
                </div>
                <div style={s.secureItem}>
                  <span>✅</span>
                  <span style={s.secureText}>Powered by PhonePe</span>
                </div>
                <div style={s.secureItem}>
                  <span>↩️</span>
                  <span style={s.secureText}>Instant refund on failure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — order summary */}
          <div style={s.right}>
            <div style={s.summaryCard}>
              <h2 style={s.sectionTitle}>Order summary</h2>
              <div style={s.divider} />

              <div style={s.summaryRow}>
                <span style={s.summaryLabel}>Tickets</span>
                <span style={s.summaryValue}>{booking.ticketCount}</span>
              </div>
              <div style={s.summaryRow}>
                <span style={s.summaryLabel}>Price per ticket</span>
                <span style={s.summaryValue}>
                  {formatCurrency(booking.totalAmount / booking.ticketCount)}
                </span>
              </div>
              <div style={s.summaryRow}>
                <span style={s.summaryLabel}>Payment method</span>
                <span style={s.summaryValue}>{paymentMethod}</span>
              </div>

              <div style={s.divider} />

              <div style={s.totalRow}>
                <span style={s.totalLabel}>Total amount</span>
                <span style={s.totalValue}>{formatCurrency(booking.totalAmount)}</span>
              </div>

              {error && <p style={s.error}>{error}</p>}

              <button
                onClick={handlePay}
                disabled={loading}
                style={{ ...s.payBtn, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Redirecting to PhonePe...' : `Pay ${formatCurrency(booking.totalAmount)}`}
              </button>

              <p style={s.note}>
                You'll be redirected to PhonePe to complete the payment securely
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', fontFamily: 'system-ui, sans-serif' },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid #1e1e1e', background: '#0d0d0d' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#888', fontSize: '14px', cursor: 'pointer' },
  brand: { display: 'flex', alignItems: 'center', gap: '8px' },
  brandIcon: { width: '28px', height: '28px', background: '#6d28d9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandName: { color: '#fff', fontSize: '14px', fontWeight: '500' },
  body: { maxWidth: '900px', margin: '0 auto', padding: '40px 24px' },
  heading: { color: '#fff', fontSize: '24px', fontWeight: '500', letterSpacing: '-0.5px', marginBottom: '6px' },
  sub: { color: '#666', fontSize: '14px', marginBottom: '32px' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' },
  left: { display: 'flex', flexDirection: 'column', gap: '20px' },
  section: { background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '20px' },
  sectionTitle: { color: '#fff', fontSize: '14px', fontWeight: '500', marginBottom: '16px' },
  methodGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  methodBtn: { display: 'flex', alignItems: 'center', gap: '12px', background: '#0a0a0a', border: '1px solid #222', borderRadius: '10px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left' },
  methodBtnActive: { background: '#1a0f2e', border: '1px solid #6d28d9' },
  methodIcon: { fontSize: '20px' },
  methodLabel: { color: '#fff', fontSize: '14px', flex: 1 },
  methodCheck: { color: '#9d71f7', fontSize: '16px', fontWeight: '500' },
  secureRow: { display: 'flex', flexDirection: 'column', gap: '10px' },
  secureItem: { display: 'flex', alignItems: 'center', gap: '10px' },
  secureText: { color: '#666', fontSize: '13px' },
  right: { position: 'sticky', top: '80px' },
  summaryCard: { background: '#111', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '20px' },
  divider: { height: '1px', background: '#1e1e1e', margin: '16px 0' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  summaryLabel: { color: '#666', fontSize: '13px' },
  summaryValue: { color: '#ccc', fontSize: '13px' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  totalLabel: { color: '#fff', fontSize: '15px', fontWeight: '500' },
  totalValue: { color: '#9d71f7', fontSize: '22px', fontWeight: '500' },
  error: { color: '#f87171', fontSize: '13px', marginBottom: '12px' },
  payBtn: { width: '100%', background: '#6d28d9', border: 'none', borderRadius: '10px', padding: '14px', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  note: { color: '#444', fontSize: '11px', textAlign: 'center', marginTop: '12px' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' },
  backLink: { background: 'none', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '8px 16px', color: '#888', fontSize: '13px', cursor: 'pointer' },
}