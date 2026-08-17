import type { ReactNode } from 'react'
import { Stagger, StaggerItem } from './Stagger'

export type IconKey = 'evangelism' | 'prayer' | 'leadership' | 'family' | 'children' | 'youth' | 'women' | 'compassion'

export type IconCardItem = {
  icon: IconKey
  title: string
  subtitle?: string
}

/**
 * One real icon per real ministry (src/seed/ministries.ts) — thin-stroke
 * line icons matching the visual language already established in
 * QuickLinksBar.tsx, not the mockups' own icon set copied verbatim (those
 * came with no CSS/JS, so nothing about their exact styling is knowable —
 * only their layout/hierarchy is being reused, same rule as every other
 * mockup this session).
 */
const ICONS: Record<IconKey, ReactNode> = {
  evangelism: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 4.5h6a2.5 2.5 0 0 1 2.5 2.5v13a2 2 0 0 0-2-2H3v-13.5zM21 4.5h-6a2.5 2.5 0 0 0-2.5 2.5v13a2 2 0 0 1 2-2h6v-13.5z" strokeLinejoin="round" />
    </svg>
  ),
  prayer: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 21s-7.5-4.6-9.5-9.3C1.2 7.4 3 4.5 6.2 4.5c2 0 3.4 1.1 4.1 2.3.4.6 1 .6 1.4 0 .7-1.2 2.1-2.3 4.1-2.3 3.2 0 5 2.9 3.7 6.2C19.5 16.4 12 21 12 21Z" strokeLinejoin="round" />
    </svg>
  ),
  leadership: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="8" r="3" />
      <path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5" strokeLinecap="round" />
      <circle cx="17.5" cy="9" r="2.3" />
      <path d="M16 20c.5-2.5 2-4 4-4.3" strokeLinecap="round" />
    </svg>
  ),
  family: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 21s-4-3-4-7V6l4-2 4 2v8c0 4-4 7-4 7Z" strokeLinejoin="round" />
    </svg>
  ),
  children: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5V6a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2Z" strokeLinejoin="round" />
      <path d="M4 19.5A2 2 0 0 1 6 17.5h13" />
    </svg>
  ),
  youth: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3v4M5 8l2.5 2.5M19 8l-2.5 2.5M4 16h16M6 20h12" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  ),
  women: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" strokeLinecap="round" />
    </svg>
  ),
  compassion: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 20.3l8.8-8.6a5 5 0 0 0 0-7.1Z" strokeLinejoin="round" />
    </svg>
  ),
}

/**
 * Both real usages of this grid (homepage "Our Ministries", About "What
 * We Do") sit on a dark panel per docs/index.html + docs/about.html — no
 * light variant exists yet, so this styles for dark directly (white
 * title, muted-on-dark body) rather than adding an unused toggle.
 */
export function IconCardGrid({ items }: { items: IconCardItem[] }) {
  return (
    <Stagger className="icon-card-grid" role="list">
      {items.map((item) => (
        <StaggerItem key={item.title} role="listitem">
          <div className="icon-card">
            <span className="icon-feature-ring" aria-hidden="true">
              {ICONS[item.icon]}
            </span>
            <p style={{ margin: '1rem 0 0.375rem', fontWeight: 600, color: '#fff', fontFamily: 'var(--font-heading), Georgia, serif', fontSize: 'var(--text-heading-sm)' }}>
              {item.title}
            </p>
            {item.subtitle && <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted-on-dark)' }}>{item.subtitle}</p>}
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  )
}
