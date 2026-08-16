'use client'

import { useState, type CSSProperties, type FormEvent } from 'react'

const TYPES: { value: string; label: string }[] = [
  { value: 'biblical', label: 'Biblical Counseling' },
  { value: 'family', label: 'Family' },
  { value: 'marriage', label: 'Marriage' },
  { value: 'individual', label: 'Individual' },
]

/** Same pattern as ContactForm.tsx — posts straight to Payload's REST endpoint for counseling-requests. */
export function CounselingRequestForm() {
  const [values, setValues] = useState({ name: '', contact: '', type: TYPES[0].value, requestText: '' })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/counseling-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      setStatus(res.ok ? 'success' : 'error')
      if (res.ok) setValues({ name: '', contact: '', type: TYPES[0].value, requestText: '' })
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
        <p style={{ fontSize: 'var(--text-subheading)', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Request received.</p>
        <p style={{ margin: 0 }}>
          Your request has been received in confidence — someone from our counseling team will reach out to schedule a time.
        </p>
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
      <select value={values.type} onChange={(e) => setValues((v) => ({ ...v, type: e.target.value }))} style={inputStyle}>
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <textarea
        required
        rows={5}
        placeholder="Share what's on your heart — this is received in confidence"
        value={values.requestText}
        onChange={(e) => setValues((v) => ({ ...v, requestText: e.target.value }))}
        style={{ ...inputStyle, resize: 'vertical' }}
      />
      <button className="btn-accent" type="submit" disabled={status === 'submitting'} style={{ justifySelf: 'start' }}>
        {status === 'submitting' ? 'Sending…' : 'Request Counseling'}
      </button>
      {status === 'error' && <p style={{ color: 'crimson', margin: 0, fontSize: '0.875rem' }}>Something went wrong — please try again, or email us directly.</p>}
    </form>
  )
}
