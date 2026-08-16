'use client'

import { useState, type CSSProperties, type FormEvent } from 'react'

const ENGAGEMENT_TYPES: { value: string; label: string }[] = [
  { value: 'prayer', label: 'Prayer Partnership' },
  { value: 'financial', label: 'Financial Partnership' },
  { value: 'volunteer', label: 'Volunteer Partnership' },
  { value: 'project-sponsor', label: 'Project Sponsorship' },
  { value: 'mission-trip', label: 'Mission Trip' },
]

/**
 * Same pattern as ContactForm.tsx — posts straight to Payload's REST
 * endpoint for partners. `orgName` is optional (Partners.ts: leave empty
 * for an individual partner, use individualName instead) — this form
 * asks for whichever applies via one combined field and sends it as
 * orgName, since most applicants won't distinguish the two themselves;
 * staff can move it to individualName on review if needed.
 */
export function PartnerForm() {
  const [values, setValues] = useState({ orgName: '', contact: '', engagementType: ENGAGEMENT_TYPES[0].value })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      setStatus(res.ok ? 'success' : 'error')
      if (res.ok) setValues({ orgName: '', contact: '', engagementType: ENGAGEMENT_TYPES[0].value })
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
        <p style={{ fontSize: 'var(--text-subheading)', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Thank you.</p>
        <p style={{ margin: 0 }}>Your partnership interest has been received — our team will follow up soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
      <div className="contact-form-row">
        <input
          type="text"
          required
          placeholder="Your Name or Organization"
          value={values.orgName}
          onChange={(e) => setValues((v) => ({ ...v, orgName: e.target.value }))}
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
      <select value={values.engagementType} onChange={(e) => setValues((v) => ({ ...v, engagementType: e.target.value }))} style={inputStyle}>
        {ENGAGEMENT_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <button className="btn-accent" type="submit" disabled={status === 'submitting'} style={{ justifySelf: 'start' }}>
        {status === 'submitting' ? 'Submitting…' : 'Become a Partner'}
      </button>
      {status === 'error' && <p style={{ color: 'crimson', margin: 0, fontSize: '0.875rem' }}>Something went wrong — please try again, or email us directly.</p>}
    </form>
  )
}
