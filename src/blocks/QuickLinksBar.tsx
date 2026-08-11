import { Stagger, StaggerItem } from '../components/Stagger'

export type QuickLink = {
  icon: 'book' | 'calendar' | 'message' | 'heart'
  label: string
  href: string
}

export type QuickLinksBarConfig = {
  links: QuickLink[]
}

const ICONS: Record<QuickLink['icon'], React.ReactNode> = {
  book: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 4.5h6a2 2 0 0 1 2 2v13a1.5 1.5 0 0 0-1.5-1.5H5V4.5zM19 4.5h-6a2 2 0 0 0-2 2v13a1.5 1.5 0 0 1 1.5-1.5H19V4.5z" strokeLinejoin="round" />
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" strokeLinecap="round" />
    </svg>
  ),
  message: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 5.5h16v11H8l-4 4v-4H4v-11z" strokeLinejoin="round" />
    </svg>
  ),
  heart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 20s-7.5-4.6-9.5-9.3C1.2 7.4 3 4.5 6.2 4.5c2 0 3.4 1.1 4.1 2.3.4.6 1 .6 1.4 0 .7-1.2 2.1-2.3 4.1-2.3 3.2 0 5 2.9 3.7 6.2C19.5 15.4 12 20 12 20z" strokeLinejoin="round" />
    </svg>
  ),
}

/**
 * Replaces HeroMediaStrip on the homepage (2026-08-11 redesign) — the
 * badge+YouTube-preview row it also rendered isn't in the reference mockup,
 * and Jimmy confirmed dropping it entirely rather than keeping it alongside
 * this bar. A plain white strip directly under the hero, matching the
 * mockup precisely: icon + label, four real destinations.
 */
export function QuickLinksBar({ config }: { config: QuickLinksBarConfig }) {
  if (config.links.length === 0) return null

  return (
    <section style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <Stagger className="container quick-links-bar" staggerDelay={0.05}>
        {config.links.map((link, index) => (
          <StaggerItem key={link.label} className="quick-links-bar-item">
            <a
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.625rem',
                width: '100%',
                padding: '1.25rem 1rem',
                textDecoration: 'none',
                color: 'var(--color-text)',
                fontWeight: 500,
                fontSize: 'var(--text-body-sm)',
                borderRight: index < config.links.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <span aria-hidden="true" style={{ color: 'var(--color-accent)', display: 'flex' }}>
                {ICONS[link.icon]}
              </span>
              {link.label}
            </a>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
