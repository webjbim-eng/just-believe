'use client'

import Script from 'next/script'
import { useState, type CSSProperties, type FormEvent } from 'react'

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string
        email: string
        amount: number
        currency: 'NGN' | 'USD'
        plan?: string
        metadata?: Record<string, unknown>
        ref?: string
        callback: (response: { reference: string }) => void
        onClose: () => void
      }) => { openIframe: () => void }
    }
  }
}

const FUNDS: { value: string; label: string }[] = [
  { value: 'tithe', label: 'Tithe' },
  { value: 'mission-projects', label: 'Mission Projects' },
  { value: 'child-sponsorship', label: 'Child Sponsorship' },
  { value: 'offering', label: 'Offering' },
]

const PRESET_AMOUNTS: Record<'NGN' | 'USD', number[]> = {
  NGN: [5000, 15000, 50000],
  USD: [25, 50, 100],
}

/**
 * Two independent checkout paths, donor's choice (2026-08-11 — Paystack
 * was the only option until Jimmy asked to add Stripe alongside it):
 *
 * - Paystack: Inline JS (loaded via next/script, no npm dependency) opens a
 *   popup using the tenant's public key. Recurring needs a Plan created
 *   server-side first (donor amounts aren't fixed tiers), so that path
 *   makes an extra round trip to api/donations/prepare before opening the
 *   popup. On popup success, api/donations/verify independently re-checks
 *   the transaction against Paystack before any Donation record exists —
 *   this component can't create one on its own either way.
 * - Stripe: api/donations/stripe/checkout creates a Checkout Session
 *   server-side and returns a hosted URL; this component just redirects
 *   the whole page there (no Stripe.js needed). Verification happens after
 *   Stripe redirects the donor back to /give/success.
 *
 * If a tenant has only configured one processor, that one is used silently
 * — the method toggle only appears when there's a real choice to make.
 */
export function GiveForm({ paystackPublicKey, stripeEnabled }: { paystackPublicKey: string | null; stripeEnabled: boolean }) {
  const paystackEnabled = Boolean(paystackPublicKey)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN')
  const [fund, setFund] = useState(FUNDS[0].value)
  const [recurring, setRecurring] = useState(false)
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [method, setMethod] = useState<'paystack' | 'stripe'>(paystackEnabled ? 'paystack' : 'stripe')
  const [status, setStatus] = useState<'idle' | 'preparing' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: 'var(--radius-card)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-body), system-ui, sans-serif',
    fontSize: 'var(--text-body-sm)',
  }

  function toggleButtonStyle(active: boolean): CSSProperties {
    return {
      padding: '0.625rem 1.25rem',
      borderRadius: 'var(--radius-button)',
      border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
      background: active ? 'var(--color-accent)' : 'var(--color-surface)',
      color: active ? 'var(--color-primary)' : 'var(--color-text)',
      fontWeight: active ? 700 : 500,
      fontSize: 'var(--text-body-sm)',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    }
  }

  if (!paystackEnabled && !stripeEnabled) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)' }}>
        <p style={{ fontSize: 'var(--text-subheading)', marginBottom: '0.5rem' }}>Online giving is coming soon.</p>
        <p style={{ margin: 0 }}>
          We&rsquo;re finishing setup on secure online giving. In the meantime, reach out via the{' '}
          <a href="/contact">Contact page</a> for bank transfer details.
        </p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: 'var(--text-subheading)', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Thank you for your gift.</p>
        <p style={{ margin: 0 }}>Your donation was received — a confirmation has been sent to {donorEmail || 'your email'}.</p>
      </div>
    )
  }

  async function handleStripeSubmit(numericAmount: number) {
    setStatus('submitting')
    try {
      const res = await fetch('/api/donations/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numericAmount, currency, recurring, fund, donorName, donorEmail, anonymous }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setStatus('error')
        setErrorMessage(data.error || 'Could not start checkout — please try again.')
        return
      }
      // Full-page navigation to Stripe's hosted Checkout — this component
      // (and its "submitting" state) is left behind entirely; the donor
      // lands back on /give/success afterward, which does the verify step.
      window.location.href = data.url
    } catch {
      setStatus('error')
      setErrorMessage('Could not start checkout — please try again.')
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErrorMessage('')

    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Enter an amount greater than zero.')
      return
    }
    if (!donorEmail) {
      setErrorMessage('An email address is required to process your gift.')
      return
    }

    if (method === 'stripe') {
      await handleStripeSubmit(numericAmount)
      return
    }

    // Unreachable in practice — method only becomes 'paystack' when
    // paystackEnabled is true — but narrows the type for
    // window.PaystackPop.setup below.
    if (!paystackPublicKey) return

    if (!window.PaystackPop) {
      setErrorMessage('Payment could not load — please refresh and try again.')
      return
    }

    let planCode: string | undefined

    if (recurring) {
      setStatus('preparing')
      try {
        const res = await fetch('/api/donations/prepare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: numericAmount, currency, recurring: true }),
        })
        const data = await res.json()
        if (!res.ok || !data.planCode) {
          setStatus('error')
          setErrorMessage(data.error || 'Could not set up the recurring gift — please try again.')
          return
        }
        planCode = data.planCode
      } catch {
        setStatus('error')
        setErrorMessage('Could not set up the recurring gift — please try again.')
        return
      }
    }

    setStatus('submitting')

    const popup = window.PaystackPop.setup({
      key: paystackPublicKey,
      email: donorEmail,
      amount: Math.round(numericAmount * 100),
      currency,
      plan: planCode,
      metadata: { fund, donorName: anonymous ? undefined : donorName, anonymous },
      callback: (response) => {
        fetch('/api/donations/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: response.reference }),
        })
          .then(() => setStatus('success'))
          .catch(() => {
            // Paystack already confirmed success client-side; the webhook
            // is the backstop if this confirmation call itself failed to
            // reach our server — still tell the donor it worked.
            setStatus('success')
          })
      },
      onClose: () => {
        setStatus((current) => (current === 'submitting' ? 'idle' : current))
      },
    })
    popup.openIframe()
  }

  return (
    <>
      {paystackEnabled && <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
        {paystackEnabled && stripeEnabled && (
          <div>
            <p className="card-eyebrow" style={{ marginBottom: '0.5rem' }}>Payment Method</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" style={toggleButtonStyle(method === 'paystack')} onClick={() => setMethod('paystack')}>Paystack</button>
              <button type="button" style={toggleButtonStyle(method === 'stripe')} onClick={() => setMethod('stripe')}>Stripe</button>
            </div>
          </div>
        )}

        <div>
          <p className="card-eyebrow" style={{ marginBottom: '0.5rem' }}>Currency</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['NGN', 'USD'] as const).map((c) => (
              <button key={c} type="button" style={toggleButtonStyle(currency === c)} onClick={() => setCurrency(c)}>
                {c === 'NGN' ? '₦ Naira' : '$ Dollar'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="card-eyebrow" style={{ marginBottom: '0.5rem' }}>Amount</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {PRESET_AMOUNTS[currency].map((preset) => (
              <button key={preset} type="button" style={toggleButtonStyle(amount === String(preset))} onClick={() => setAmount(String(preset))}>
                {currency === 'NGN' ? '₦' : '$'}
                {preset.toLocaleString()}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            step="0.01"
            required
            placeholder={`Other amount (${currency})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <p className="card-eyebrow" style={{ marginBottom: '0.5rem' }}>Frequency</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" style={toggleButtonStyle(!recurring)} onClick={() => setRecurring(false)}>Give Once</button>
            <button type="button" style={toggleButtonStyle(recurring)} onClick={() => setRecurring(true)}>Give Monthly</button>
          </div>
        </div>

        <div>
          <p className="card-eyebrow" style={{ marginBottom: '0.5rem' }}>Fund</p>
          <select value={fund} onChange={(e) => setFund(e.target.value)} style={inputStyle}>
            {FUNDS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div className="contact-form-row">
          <input
            type="text"
            placeholder="Your Name"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            disabled={anonymous}
            style={{ ...inputStyle, opacity: anonymous ? 0.5 : 1 }}
          />
          <input
            type="email"
            required
            placeholder="Your Email"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-body-sm)', cursor: 'pointer' }}>
          <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
          Give anonymously
        </label>

        <button
          className="btn-accent"
          type="submit"
          disabled={status === 'preparing' || status === 'submitting'}
          style={{ justifySelf: 'start' }}
        >
          {status === 'preparing' ? 'Preparing…' : status === 'submitting' ? 'Processing…' : `Give ${recurring ? 'Monthly' : 'Now'}`}
        </button>

        {errorMessage && <p style={{ color: 'crimson', margin: 0, fontSize: '0.875rem' }}>{errorMessage}</p>}
      </form>
    </>
  )
}
