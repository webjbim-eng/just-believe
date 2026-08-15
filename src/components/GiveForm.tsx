'use client'

import Script from 'next/script'
import { useState, useEffect, type CSSProperties, type FormEvent } from 'react'
import { buildPayPalDonateUrl } from '../lib/paypal'

export type Currency = 'NGN' | 'USD' | 'CAD' | 'EUR' | 'GBP'

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string
        email: string
        amount: number
        // Paystack's own real currency support, not the wider Currency type
        // used elsewhere in this file — see CURRENCIES_BY_METHOD.
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

export type PaymentMethod = 'paystack' | 'stripe' | 'paypal'

/**
 * 2026-08-12: Paystack genuinely only settles NGN and USD (confirmed when
 * the Paystack integration was first built) — it isn't a UI restriction,
 * charging CAD/EUR/GBP through Paystack would just fail. Stripe has real
 * multi-currency support, so the fuller set is Stripe-only. PayPal here
 * (a plain hosted-button redirect, no API credentials — see
 * src/lib/paypal.ts) is conservatively scoped to USD only, since nothing
 * confirms what currencies this specific PayPal business account can
 * actually receive — a wrong guess would mean a donor's payment gets
 * rejected by PayPal partway through, worse than just offering fewer
 * options. The currency toggle below reads from this map keyed on the
 * selected `method`, and switching method resets currency if the current
 * selection isn't valid for the newly-selected processor.
 *
 * Order is deliberate (2026-08-12, Jimmy's request): USD first/default,
 * then CAD, EUR, GBP, NGN last — both the toggle's left-to-right order
 * and which currency a method resets to when switching (index 0).
 */
const CURRENCIES_BY_METHOD: Record<PaymentMethod, Currency[]> = {
  paystack: ['USD', 'NGN'],
  stripe: ['USD', 'CAD', 'EUR', 'GBP', 'NGN'],
  paypal: ['USD'],
}

const CURRENCY_LABELS: Record<Currency, string> = {
  NGN: '₦ Naira',
  USD: '$ Dollar',
  CAD: 'CA$ Canadian',
  EUR: '€ Euro',
  GBP: '£ Pound',
}

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  NGN: '₦',
  USD: '$',
  CAD: 'CA$',
  EUR: '€',
  GBP: '£',
}

const PRESET_AMOUNTS: Record<Currency, number[]> = {
  NGN: [5000, 15000, 50000],
  USD: [25, 50, 100],
  CAD: [35, 65, 130],
  EUR: [25, 50, 100],
  GBP: [20, 40, 85],
}

/**
 * Three independent checkout paths, donor's choice (2026-08-11 Stripe,
 * 2026-08-12 PayPal — Paystack was the only option originally):
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
 * - PayPal: a plain hosted-button redirect (src/lib/paypal.ts) built
 *   entirely client-side — no API credentials exist for it, only a
 *   business email, so there's no server call and no way to verify the
 *   payment or write a Donations row. One-time gifts only (no recurring;
 *   PayPal's classic donate button doesn't support it without the real
 *   Subscriptions API, which needs credentials this doesn't have).
 *
 * If a tenant has only configured one processor, that one is used silently
 * — the method toggle only appears when there's a real choice to make.
 */
export function GiveForm({
  paystackPublicKey,
  stripeEnabled,
  paypalBusinessEmail,
}: {
  paystackPublicKey: string | null
  stripeEnabled: boolean
  paypalBusinessEmail: string | null
}) {
  const paystackEnabled = Boolean(paystackPublicKey)
  const paypalEnabled = Boolean(paypalBusinessEmail)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<Currency>('USD')
  const [fund, setFund] = useState(FUNDS[0].value)
  const [recurring, setRecurring] = useState(false)
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [paypalReturned, setPaypalReturned] = useState(false)
  const [method, setMethod] = useState<PaymentMethod>(paystackEnabled ? 'paystack' : stripeEnabled ? 'stripe' : 'paypal')
  const [status, setStatus] = useState<'idle' | 'preparing' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // PayPal's hosted button has no server callback we can trust — this is
  // just "did the browser land back on /give with ?paypal=success", which
  // only tells us the donor completed PayPal's flow and clicked back, not
  // a verified payment. Good enough for a thank-you message, not for a
  // Donations record (see src/lib/paypal.ts).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('paypal') === 'success') {
      setPaypalReturned(true)
    }
  }, [])

  const availableCurrencies = CURRENCIES_BY_METHOD[method]

  function handleMethodChange(nextMethod: PaymentMethod) {
    setMethod(nextMethod)
    if (!CURRENCIES_BY_METHOD[nextMethod].includes(currency)) {
      setCurrency(CURRENCIES_BY_METHOD[nextMethod][0])
    }
    if (nextMethod === 'paypal') {
      setRecurring(false)
    }
  }

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

  const enabledMethodCount = [paystackEnabled, stripeEnabled, paypalEnabled].filter(Boolean).length

  if (enabledMethodCount === 0) {
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

  if (paypalReturned) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: 'var(--text-subheading)', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Thank you for your gift.</p>
        <p style={{ margin: 0 }}>PayPal will email you a receipt directly.</p>
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

  function handlePaypalSubmit(numericAmount: number) {
    if (!paypalBusinessEmail) return
    const origin = window.location.origin
    const url = buildPayPalDonateUrl({
      businessEmail: paypalBusinessEmail,
      amount: numericAmount,
      currency: 'USD',
      itemName: `${fund} — Just Believe International Missions`,
      returnUrl: `${origin}/give?paypal=success`,
      cancelUrl: `${origin}/give`,
    })
    // Same full-page-redirect pattern as Stripe — leaves this component
    // behind. Unlike Stripe, PayPal's own return has nothing our server
    // verifies; ?paypal=success just means the donor clicked back.
    window.location.href = url
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

    if (method === 'paypal') {
      handlePaypalSubmit(numericAmount)
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
      // Safe: availableCurrencies already restricts selection to NGN/USD
      // whenever method === 'paystack' (see CURRENCIES_BY_METHOD), this
      // branch only runs for that method.
      currency: currency as 'NGN' | 'USD',
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
        {enabledMethodCount > 1 && (
          <div>
            <p className="card-eyebrow" style={{ marginBottom: '0.5rem' }}>Payment Method</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {paystackEnabled && (
                <button type="button" style={toggleButtonStyle(method === 'paystack')} onClick={() => handleMethodChange('paystack')}>Paystack</button>
              )}
              {stripeEnabled && (
                <button type="button" style={toggleButtonStyle(method === 'stripe')} onClick={() => handleMethodChange('stripe')}>Stripe</button>
              )}
              {paypalEnabled && (
                <button type="button" style={toggleButtonStyle(method === 'paypal')} onClick={() => handleMethodChange('paypal')}>PayPal</button>
              )}
            </div>
          </div>
        )}

        <div>
          <p className="card-eyebrow" style={{ marginBottom: '0.5rem' }}>Currency</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {availableCurrencies.map((c) => (
              <button key={c} type="button" style={toggleButtonStyle(currency === c)} onClick={() => setCurrency(c)}>
                {CURRENCY_LABELS[c]}
              </button>
            ))}
          </div>
          {method === 'paystack' && stripeEnabled && (
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Need CAD, EUR, or GBP? Switch to Stripe above — Paystack settles in Naira and Dollars only.
            </p>
          )}
        </div>

        <div>
          <p className="card-eyebrow" style={{ marginBottom: '0.5rem' }}>Amount</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            {PRESET_AMOUNTS[currency].map((preset) => (
              <button key={preset} type="button" style={toggleButtonStyle(amount === String(preset))} onClick={() => setAmount(String(preset))}>
                {CURRENCY_SYMBOLS[currency]}
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

        {method !== 'paypal' && (
          <div>
            <p className="card-eyebrow" style={{ marginBottom: '0.5rem' }}>Frequency</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" style={toggleButtonStyle(!recurring)} onClick={() => setRecurring(false)}>Give Once</button>
              <button type="button" style={toggleButtonStyle(recurring)} onClick={() => setRecurring(true)}>Give Monthly</button>
            </div>
          </div>
        )}

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
