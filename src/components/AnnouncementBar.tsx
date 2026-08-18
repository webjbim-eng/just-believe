'use client'

import { useState } from 'react'

/**
 * In-memory dismiss only, no persistence — matches the public/brand/*.html
 * mockups' plain behavior (their vanilla-JS dismiss doesn't persist across
 * reloads either). A localStorage-backed "don't show again" would be a
 * reasonable follow-up but wasn't part of what was asked or referenced.
 */
export function AnnouncementBar({ children }: { children: React.ReactNode }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div
      style={{
        background: 'var(--navy-950)',
        padding: '0.55rem 2.5rem',
        textAlign: 'center',
        fontSize: '0.78rem',
        letterSpacing: '0.02em',
        color: 'var(--gold-light)',
        position: 'relative',
      }}
    >
      {children}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        style={{
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: 'var(--gold-light)',
          cursor: 'pointer',
          fontSize: '1rem',
          lineHeight: 1,
          padding: '0.25rem',
        }}
      >
        ✕
      </button>
    </div>
  )
}
