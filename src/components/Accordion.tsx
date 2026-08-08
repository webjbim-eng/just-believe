'use client'

import { useState } from 'react'

export type AccordionItemData = {
  title: string
  body: string
}

/**
 * Collapsible list — the reachingthenationsministries.com reference's
 * "About RTNM" pattern (Our Overseers / Our Ministerial Groups / Our
 * Foundation, one open at a time with a chevron). Used on /about for the
 * "What We Do" ministry list instead of a static grid.
 */
export function Accordion({ items }: { items: AccordionItemData[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div key={item.title} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '1.25rem 1.5rem',
                background: 'var(--color-surface)',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                font: 'inherit',
              }}
            >
              <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{item.title}</span>
              <span
                aria-hidden="true"
                style={{
                  color: 'var(--color-accent)',
                  transform: isOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              >
                ▾
              </span>
            </button>
            {isOpen && (
              <div style={{ padding: '0 1.5rem 1.5rem' }}>
                <p style={{ margin: 0 }}>{item.body}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
