'use client'

import { useState, type CSSProperties, type FormEvent } from 'react'

/** Same pattern as ContactForm.tsx — posts straight to Payload's REST endpoint for prayer-requests. */
export function PrayerRequestForm() {
  const [values, setValues] = useState({ name: '', contact: '', requestText: '', isPrivate: true })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/prayer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      setStatus(res.ok ? 'success' : 'error')
      if (res.ok) setValues({ name: '', contact: '', requestText: '', isPrivate: true })
    } catch {
      setStatus('error')
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

  if (status === 'success') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: 'var(--text-subheading)', color: 'var(--color-text)', marginBottom: '0.5rem' }}>We&rsquo;re praying with you.</p>
        <p style={{ margin: 0 }}>Your request has been received by our prayer team.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
      <div className="contact-form-row">
        <input
          type="text"
          required
          placeholder="Your Name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          style={inputStyle}
        />
        <input
          type="text"
          required
          placeholder="Email or Phone"
          value={values.contact}
          onChange={(e) => setValues((v) => ({ ...v, contact: e.target.value }))}
          style={inputStyle}
        />
      </div>
      <textarea
        required
        rows={5}
        placeholder="Share your prayer request"
        value={values.requestText}
        onChange={(e) => setValues((v) => ({ ...v, requestText: e.target.value }))}
        style={{ ...inputStyle, resize: 'vertical' }}
      />
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-body-sm)', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={values.isPrivate}
          onChange={(e) => setValues((v) => ({ ...v, isPrivate: e.target.checked }))}
        />
        Keep this request private (visible to our prayer team only)
      </label>
      <button className="btn-accent" type="submit" disabled={status === 'submitting'} style={{ justifySelf: 'start' }}>
        {status === 'submitting' ? 'Sending…' : 'Send Prayer Request'}
      </button>
      {status === 'error' && <p style={{ color: 'crimson', margin: 0, fontSize: '0.875rem' }}>Something went wrong — please try again, or email us directly.</p>}
    </form>
  )
}
