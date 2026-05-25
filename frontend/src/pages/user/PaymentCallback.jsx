import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'

export default function PaymentCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  const merchantOrderId = searchParams.get('merchantOrderId')

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get(`/payments/payment/callback?merchantOrderId=${merchantOrderId}`)
        setStatus(res.data.data)
      } catch (err) {
        setStatus({ 'payment-status': 'FAILED' })
      } finally {
        setLoading(false)
      }
    }

    if (merchantOrderId) fetchStatus()
    else setLoading(false)
  }, [merchantOrderId])

  if (loading) return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.icon}>⏳</div>
        <p style={s.title}>Confirming your payment...</p>
        <p style={s.sub}>Please wait, do not close this page</p>
      </div>
    </div>
  )

  const isConfirmed = status?.['booking-status'] === 'Confirmed'
  const isPending = status?.['payment-status'] === 'Pending' || status?.['payment-status'] === 'PENDING'

  return (
    <div style={s.page}>
      <div style={s.card}>
        {isConfirmed ? (
          <>
            <div style={s.icon}>✅</div>
            <p style={s.title}>Payment successful!</p>
            <p style={s.sub}>Your booking is confirmed. Your ticket is ready.</p>
            <button onClick={() => navigate('/my-bookings')} style={s.primaryBtn}>
              View & download ticket
            </button>
          </>
        ) : isPending ? (
          <>
            <div style={s.icon}>⏳</div>
            <p style={s.title}>Payment processing</p>
            <p style={s.sub}>Your payment is being processed. Check your bookings in a few minutes.</p>
            <button onClick={() => navigate('/my-bookings')} style={s.primaryBtn}>
              Go to my bookings
            </button>
          </>
        ) : (
          <>
            <div style={s.icon}>❌</div>
            <p style={s.title}>Payment failed</p>
            <p style={s.sub}>Something went wrong. No amount has been deducted.</p>
            <button onClick={() => navigate('/events')} style={s.primaryBtn}>
              Try again
            </button>
          </>
        )}
        <button onClick={() => navigate('/events')} style={s.secondaryBtn}>
          Back to events
        </button>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' },
  card: { background: '#111', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '48px 40px', maxWidth: '420px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  icon: { fontSize: '48px', marginBottom: '8px' },
  title: { color: '#fff', fontSize: '20px', fontWeight: '500' },
  sub: { color: '#666', fontSize: '14px', lineHeight: '1.5', marginBottom: '8px' },
  primaryBtn: { width: '100%', background: '#6d28d9', border: 'none', borderRadius: '10px', padding: '13px', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginTop: '8px' },
  secondaryBtn: { width: '100%', background: 'none', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '11px', color: '#666', fontSize: '13px', cursor: 'pointer' },
}