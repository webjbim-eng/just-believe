'use client'

import { useState } from 'react'

type NavItem = { label: string; link: string }

/**
 * Client-side hamburger toggle — receives items as props from the server
 * component (SiteNavigation) that already fetched them, so this stays a
 * thin interaction layer, not a second data fetch. Hidden on desktop via
 * CSS (.mobile-nav-toggle), the desktop <ul> is hidden on mobile the same
 * way — see globals.css.
 */
export function MobileNavToggle({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mobile-nav-toggle">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Toggle navigation menu"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          padding: '0.5rem',
        }}
      >
        <span style={{ width: 24, height: 2, background: 'var(--color-text)', display: 'block' }} />
        <span style={{ width: 24, height: 2, background: 'var(--color-text)', display: 'block' }} />
        <span style={{ width: 24, height: 2, background: 'var(--color-text)', display: 'block' }} />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--color-base)',
            borderBottom: '1px solid var(--color-border)',
            padding: '1rem 1.5rem 1.5rem',
          }}
        >
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item, index) => (
              <li key={index}>
                <a href={item.link} style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: 500 }} onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
