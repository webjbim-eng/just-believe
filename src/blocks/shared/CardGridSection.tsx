import type { ReactNode } from 'react'
import { ScrollReveal } from '../../components/ScrollReveal'

/**
 * Shared layout for the data-driven "Featured X" blocks (FeaturedSermons,
 * FeaturedBooks) — "query a collection, show a card grid, show an honest
 * empty state" with nothing else distinct about their layout, so the
 * grid/empty-state chrome lives here once. FeaturedEvents/Testimonials
 * outgrew this into their own bespoke layouts; MinistriesOverview (the
 * original user of this) was removed 2026-08-11 once MinistryFeatureGrid's
 * `list` layout fully superseded it.
 *
 * The empty state (2026-08-10 directive) is a real design moment — the
 * icon-feature-ring motif already used elsewhere, not just gray text — but
 * still never invents content. `emptyCta` must be a real, working
 * destination (YouTube channel, newsletter anchor, mailto) or omitted.
 */
export function CardGridSection<T>({
  heading,
  emptyMessage,
  emptyIcon,
  emptyCta,
  items,
  renderItem,
}: {
  heading: string
  emptyMessage: string
  emptyIcon?: ReactNode
  emptyCta?: { label: string; href: string }
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
}) {
  return (
    <section className="section">
      <div className="container">
        <ScrollReveal>
          <h2 style={{ textAlign: 'center' }}>{heading}</h2>
          <hr className="heading-underline heading-underline--center" />
          {items.length === 0 ? (
            <div className="icon-feature" style={{ maxWidth: '28rem', margin: '2.5rem auto 0' }}>
              {emptyIcon && <span className="icon-feature-ring">{emptyIcon}</span>}
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>{emptyMessage}</p>
              {emptyCta && (
                <a className="btn-outline" href={emptyCta.href} style={{ marginTop: '0.5rem' }}>
                  {emptyCta.label}
                </a>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {items.map(renderItem)}
            </div>
          )}
        </ScrollReveal>
      </div>
    </section>
  )
}
