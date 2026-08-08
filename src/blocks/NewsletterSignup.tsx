'use client'

import { useState, type FormEvent } from 'react'

export type NewsletterSignupConfig = {
  heading?: string
  subheading?: string
}

/**
 * Posts directly to Payload's REST API. Doesn't need to know or send a
 * tenant id — the browser's same-origin request carries the same Host
 * header the page itself resolved through, and
 * src/hooks/setTenantFromRequest.ts forces the correct tenant server-side
 * regardless of what the client sends.
 */
export function NewsletterSignup({ config }: { config: NewsletterSignupConfig }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/newsletter-subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="section section--surface">
      <div className="container" style={{ textAlign: 'center', maxWidth: '32rem', margin: '0 auto' }}>
        <h2>{config.heading || 'Stay Connected'}</h2>
        {config.subheading && <p>{config.subheading}</p>}
        {status === 'success' ? (
          <p>Thanks for subscribing!</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              style={{
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-button)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-base)',
                color: 'var(--color-text)',
                flex: '1 1 16rem',
                fontFamily: 'var(--font-body), system-ui, sans-serif',
                fontSize: 'var(--text-body-sm)',
              }}
            />
            <button className="btn-accent" type="submit" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Submitting…' : 'Subscribe'}
            </button>
          </form>
        )}
        {status === 'error' && <p style={{ color: 'crimson' }}>Something went wrong — please try again.</p>}
      </div>
    </section>
  )
}
