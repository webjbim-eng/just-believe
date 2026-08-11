import { getPayload } from 'payload'
import config from '@payload-config'
import { ScrollReveal } from '../components/ScrollReveal'
import { Stagger, StaggerItem } from '../components/Stagger'

export type FeaturedBooksConfig = {
  eyebrow?: string
  heading?: string
  limit?: number
}

/**
 * 2026-08-11: rebuilt — the previous version rendered title-only boxes
 * (no cover, no link, no _status filter so drafts could leak onto the
 * homepage). Now shows real cover photography and links to the real
 * /books/[slug] detail page, matching the visual bar set on Ministries.
 */
export async function FeaturedBooks({ config: blockConfig, tenantId }: { config: FeaturedBooksConfig; tenantId: string }) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'books',
    where: { and: [{ tenant: { equals: tenantId } }, { _status: { equals: 'published' } }] },
    sort: '-featured',
    limit: blockConfig.limit ?? 4,
    overrideAccess: true,
  })

  return (
    <section className="section decorative-flourish">
      <div className="container">
        <ScrollReveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div>
              {blockConfig.eyebrow && <p className="section-eyebrow">{blockConfig.eyebrow}</p>}
              <h2 style={{ margin: 0 }}>{blockConfig.heading || 'Books'}</h2>
            </div>
            {docs.length > 0 && (
              <a className="btn-primary-pill" href="/books">
                View All
              </a>
            )}
          </div>
        </ScrollReveal>

        {docs.length === 0 ? (
          <div className="icon-feature" style={{ alignItems: 'flex-start', textAlign: 'left', maxWidth: '32rem' }}>
            <span className="icon-feature-ring" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 4.5h6a2 2 0 0 1 2 2v13a1.5 1.5 0 0 0-1.5-1.5H5V4.5zM19 4.5h-6a2 2 0 0 0-2 2v13a1.5 1.5 0 0 1 1.5-1.5H19V4.5z" strokeLinejoin="round" />
              </svg>
            </span>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Books and resources are coming soon.</p>
          </div>
        ) : (
          <Stagger className="photo-caption-grid-4" role="list">
            {docs.map((book) => {
              const cover = typeof book.coverImage === 'object' ? book.coverImage?.url : undefined
              const author = typeof book.author === 'object' ? book.author?.name : undefined
              return (
                <StaggerItem key={book.id} role="listitem">
                  <a href={`/books/${book.slug}`} className="card hover-zoom" style={{ display: 'block', padding: 0, overflow: 'hidden', textAlign: 'center' }}>
                    <div style={{ aspectRatio: '3 / 4', overflow: 'hidden', background: 'var(--color-base)' }}>
                      {cover && (
                        <div
                          aria-hidden="true"
                          className="hover-zoom-bg"
                          style={{ width: '100%', height: '100%', backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                      )}
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      <p className="card-title" style={{ fontSize: 'var(--text-heading-sm)', marginBottom: author ? '0.25rem' : 0 }}>
                        {book.title}
                      </p>
                      {author && <p style={{ margin: 0, fontSize: 'var(--text-body-sm)' }}>{author}</p>}
                    </div>
                  </a>
                </StaggerItem>
              )
            })}
          </Stagger>
        )}
      </div>
    </section>
  )
}
