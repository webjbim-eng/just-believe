'use client'

import { useState, type CSSProperties, type FormEvent } from 'react'
import { plainTextToLexical } from '../lib/plainTextToLexical'

/**
 * Same pattern as ContactForm.tsx, posting to Payload's REST endpoint
 * for testimonials — `content` is a required richText field, so the
 * plain textarea is converted to minimal Lexical JSON before sending
 * (see src/lib/plainTextToLexical.ts). New submissions default to
 * status: 'submitted' (Testimonials.ts's defaultValue) — they only
 * become publicly visible once staff moves them to 'published' via
 * /admin, per Testimonials.ts's moderation access control.
 */
export function TestimonialForm() {
  const [values, setValues] = useState({ submitterName: '', content: '' })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submitterName: values.submitterName, content: plainTextToLexical(values.content) }),
      })
      setStatus(res.ok ? 'success' : 'error')
      if (res.ok) setValues({ submitterName: '', content: '' })
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
        <p style={{ fontSize: 'var(--text-subheading)', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Thank you for sharing.</p>
        <p style={{ margin: 0 }}>Your story has been received and will appear here once our team reviews it.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
      <input
        type="text"
        required
        placeholder="Your Name"
        value={values.submitterName}
        onChange={(e) => setValues((v) => ({ ...v, submitterName: e.target.value }))}
        style={inputStyle}
      />
      <textarea
        required
        rows={6}
        placeholder="Share how God has worked in your life through this ministry"
        value={values.content}
        onChange={(e) => setValues((v) => ({ ...v, content: e.target.value }))}
        style={{ ...inputStyle, resize: 'vertical' }}
      />
      <button className="btn-accent" type="submit" disabled={status === 'submitting'} style={{ justifySelf: 'start' }}>
        {status === 'submitting' ? 'Sending…' : 'Share Your Story'}
      </button>
      {status === 'error' && <p style={{ color: 'crimson', margin: 0, fontSize: '0.875rem' }}>Something went wrong — please try again, or email us directly.</p>}
    </form>
  )
}
