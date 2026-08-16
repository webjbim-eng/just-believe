'use client'

import { useEffect, useRef, useState } from 'react'

type NavChild = { label: string; link: string }

/**
 * Desktop-only dropdown for a nav item with children (Navigation.items[].
 * children — the schema already supported one level of nesting,
 * SiteNavigation just never rendered it). Click-to-toggle rather than
 * hover-only, so it's keyboard/touch operable, not just mouse-hover.
 */
export function NavDropdown({ label, children }: { label: string; children: NavChild[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          color: 'var(--color-text-muted)',
          fontWeight: 500,
          fontSize: 'var(--text-body-sm)',
          letterSpacing: '0.01em',
          fontFamily: 'var(--font-body), system-ui, sans-serif',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s ease' }}>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.875rem)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-card-lg)',
            minWidth: '13rem',
            padding: '0.5rem',
            zIndex: 30,
          }}
        >
          {children.map((child) => (
            <a
              key={child.link}
              href={child.link}
              role="menuitem"
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-button)',
                textDecoration: 'none',
                color: 'var(--color-text)',
                fontSize: 'var(--text-body-sm)',
                whiteSpace: 'nowrap',
              }}
            >
              {child.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
