'use client'

import { useState, type CSSProperties, type FormEvent } from 'react'

export type EventRegistrationField = {
  label: string
  fieldType: 'text' | 'textarea' | 'select' | 'checkbox'
  options?: string | null
  required?: boolean | null
}

type ResponseValue = string | boolean

/**
 * Same submission pattern as ContactForm.tsx, plus dynamically rendered
 * inputs for whatever custom questions the admin defined on this specific
 * event (Events.registrationFields) — answers are collected into one
 * `responses` object keyed by each field's label and stored as-is on
 * EventRegistrations.responses (a json field, since the question set
 * varies per event). Waitlist status comes back from the server
 * (EventRegistrations.ts's beforeChange hook sets it based on capacity),
 * not computed here.
 */
export function EventRegistrationForm({ eventId, fields }: { eventId: number; fields: EventRegistrationField[] }) {
  const [values, setValues] = useState({ name: '', email: '', phone: '' })
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'waitlisted' | 'error'>('idle')

  function setResponse(label: string, value: ResponseValue) {
    setResponses((r) => ({ ...r, [label]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/event-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventId, ...values, responses }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setStatus('error')
        return
      }
      setStatus(data?.doc?.waitlisted ? 'waitlisted' : 'success')
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

  if (status === 'success' || status === 'waitlisted') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: 'var(--text-subheading)', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
          {status === 'waitlisted' ? "You're on the waitlist." : "You're registered."}
        </p>
        <p style={{ margin: 0 }}>
          {status === 'waitlisted'
            ? "This event is at capacity — we'll reach out if a spot opens up."
            : 'A confirmation has been sent to your email.'}
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
          type="email"
          required
          placeholder="Your Email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          style={inputStyle}
        />
      </div>
      <input
        type="tel"
        placeholder="Phone (optional)"
        value={values.phone}
        onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
        style={inputStyle}
      />

      {fields.map((field) => {
        if (field.fieldType === 'checkbox') {
          return (
            <label key={field.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-body-sm)', cursor: 'pointer' }}>
              <input type="checkbox" required={field.required ?? false} checked={Boolean(responses[field.label])} onChange={(e) => setResponse(field.label, e.target.checked)} />
              {field.label}
            </label>
          )
        }
        if (field.fieldType === 'select') {
          const options = (field.options || '').split(',').map((o) => o.trim()).filter(Boolean)
          return (
            <select
              key={field.label}
              required={field.required ?? false}
              value={(responses[field.label] as string) || ''}
              onChange={(e) => setResponse(field.label, e.target.value)}
              style={inputStyle}
            >
              <option value="" disabled>
                {field.label}
              </option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )
        }
        if (field.fieldType === 'textarea') {
          return (
            <textarea
              key={field.label}
              required={field.required ?? false}
              rows={4}
              placeholder={field.label}
              value={(responses[field.label] as string) || ''}
              onChange={(e) => setResponse(field.label, e.target.value)}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          )
        }
        return (
          <input
            key={field.label}
            type="text"
            required={field.required ?? false}
            placeholder={field.label}
            value={(responses[field.label] as string) || ''}
            onChange={(e) => setResponse(field.label, e.target.value)}
            style={inputStyle}
          />
        )
      })}

      <button className="btn-accent" type="submit" disabled={status === 'submitting'} style={{ justifySelf: 'start' }}>
        {status === 'submitting' ? 'Registering…' : 'Register'}
      </button>
      {status === 'error' && <p style={{ color: 'crimson', margin: 0, fontSize: '0.875rem' }}>Something went wrong — please try again, or email us directly.</p>}
    </form>
  )
}
