import type { ReactNode } from 'react'

/**
 * Shared layout for the data-driven "Featured X" / overview blocks
 * (MinistriesOverview, FeaturedSermons, FeaturedEvents, FeaturedBooks,
 * Testimonials) — all five are "query a collection, show a card grid,
 * show an honest empty state" with nothing else distinct about their
 * layout, so the grid/empty-state chrome lives here once.
 */
export function CardGridSection<T>({
  heading,
  emptyMessage,
  items,
  renderItem,
}: {
  heading: string
  emptyMessage: string
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
}) {
  return (
    <section className="section">
      <div className="container">
        <h2 style={{ textAlign: 'center' }}>{heading}</h2>
        <hr className="heading-underline heading-underline--center" />
        {items.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>{emptyMessage}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {items.map(renderItem)}
          </div>
        )}
      </div>
    </section>
  )
}
