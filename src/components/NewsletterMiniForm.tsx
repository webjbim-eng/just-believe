'use client'

import { useState, type FormEvent } from 'react'

/**
 * Compact footer variant of src/blocks/NewsletterSignup.tsx — same real
 * endpoint, stacked layout instead of a centered inline row so it fits a
 * footer column.
 */
export function NewsletterMiniForm() {
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

  if (status === 'success') {
    return <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'var(--text-body-sm)', margin: 0 }}>Thanks for subscribing!</p>
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-button)',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'transparent',
          color: '#fff',
          fontFamily: 'var(--font-body), system-ui, sans-serif',
          fontSize: 'var(--text-body-sm)',
        }}
      />
      <button className="btn-accent" type="submit" disabled={status === 'submitting'} style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}>
        {status === 'submitting' ? 'Submitting…' : 'Subscribe'}
      </button>
      {status === 'error' && <p style={{ color: '#f3a6a6', fontSize: '0.8rem', margin: 0 }}>Something went wrong — please try again.</p>}
    </form>
  )
}
