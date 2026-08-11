'use client'

import { useState, type CSSProperties, type FormEvent } from 'react'

/**
 * Posts to Payload's auto-generated REST endpoint for the Messages
 * collection — same same-origin fetch()/no-tenant-id-needed pattern as
 * NewsletterMiniForm.tsx (setTenantFromRequest derives the tenant
 * server-side from the resolved request header, not a client-supplied
 * value). Feeds the Ministry Dashboard's "New Messages" stat and the
 * Messages admin module — a module with no working intake form is hollow.
 */
export function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      setStatus(res.ok ? 'success' : 'error')
      if (res.ok) setValues({ name: '', email: '', subject: '', message: '' })
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
        <p style={{ fontSize: 'var(--text-subheading)', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Message sent.</p>
        <p style={{ margin: 0 }}>Thank you for reaching out — we&rsquo;ll be in touch soon.</p>
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
          type="email"
          required
          placeholder="Your Email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          style={inputStyle}
        />
      </div>
      <input
        type="text"
        required
        placeholder="Subject"
        value={values.subject}
        onChange={(e) => setValues((v) => ({ ...v, subject: e.target.value }))}
        style={inputStyle}
      />
      <textarea
        required
        rows={5}
        placeholder="Your Message"
        value={values.message}
        onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
        style={{ ...inputStyle, resize: 'vertical' }}
      />
      <button className="btn-accent" type="submit" disabled={status === 'submitting'} style={{ justifySelf: 'start' }}>
        {status === 'submitting' ? 'Sending…' : 'Send Message'}
      </button>
      {status === 'error' && <p style={{ color: 'crimson', margin: 0, fontSize: '0.875rem' }}>Something went wrong — please try again, or email us directly.</p>}
    </form>
  )
}
