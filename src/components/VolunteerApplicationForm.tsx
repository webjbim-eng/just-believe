'use client'

import { useState, type CSSProperties, type FormEvent } from 'react'

/**
 * Same pattern as ContactForm.tsx — posts straight to Payload's
 * auto-generated REST endpoint for volunteer-applications; tenant is
 * derived server-side via setTenantFromRequest, not sent from the client.
 */
export function VolunteerApplicationForm() {
  const [values, setValues] = useState({ name: '', contact: '', areaOfInterest: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/volunteer-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      setStatus(res.ok ? 'success' : 'error')
      if (res.ok) setValues({ name: '', contact: '', areaOfInterest: '', message: '' })
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
        <p style={{ fontSize: 'var(--text-subheading)', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Application received.</p>
        <p style={{ margin: 0 }}>Thank you for offering your time — our team will reach out about next steps.</p>
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
      <input
        type="text"
        placeholder="Area of Interest (e.g. Youth Ministry, Outreach, Admin)"
        value={values.areaOfInterest}
        onChange={(e) => setValues((v) => ({ ...v, areaOfInterest: e.target.value }))}
        style={inputStyle}
      />
      <textarea
        rows={4}
        placeholder="Tell us a bit about yourself and how you'd like to serve"
        value={values.message}
        onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
        style={{ ...inputStyle, resize: 'vertical' }}
      />
      <button className="btn-accent" type="submit" disabled={status === 'submitting'} style={{ justifySelf: 'start' }}>
        {status === 'submitting' ? 'Submitting…' : 'Submit Application'}
      </button>
      {status === 'error' && <p style={{ color: 'crimson', margin: 0, fontSize: '0.875rem' }}>Something went wrong — please try again, or email us directly.</p>}
    </form>
  )
}
