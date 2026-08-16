'use client'

import { useState } from 'react'

type NavChild = { label: string; link: string }
type NavItem = { label: string; link: string; children?: NavChild[] }

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
            background: 'var(--color-primary)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid var(--color-border-on-dark)',
            padding: '1rem 1.5rem 1.5rem',
          }}
        >
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item, index) => (
              <li key={index}>
                {item.children && item.children.length > 0 ? (
                  <>
                    <span style={{ display: 'block', color: 'var(--color-text-muted-on-dark)', fontWeight: 700, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.625rem' }}>
                      {item.label}
                    </span>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.875rem', paddingLeft: '1rem' }}>
                      {item.children.map((child) => (
                        <li key={child.link}>
                          <a href={child.link} style={{ textDecoration: 'none', color: 'var(--color-text-on-dark)', fontWeight: 500 }} onClick={() => setOpen(false)}>
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <a href={item.link} style={{ textDecoration: 'none', color: 'var(--color-text-on-dark)', fontWeight: 500 }} onClick={() => setOpen(false)}>
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
