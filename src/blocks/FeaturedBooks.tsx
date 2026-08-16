import { getPayload } from 'payload'
import config from '@payload-config'
import { ScrollReveal } from '../components/ScrollReveal'
import { Stagger, StaggerItem } from '../components/Stagger'

export type FeaturedBooksConfig = {
  eyebrow?: string
  heading?: string
  body?: string
  limit?: number
}

/**
 * 2026-08-11: rebuilt — the previous version rendered title-only boxes
 * (no cover, no link, no _status filter so drafts could leak onto the
 * homepage). Now shows real cover photography and links to the real
 * /books/[slug] detail page, matching the visual bar set on Ministries.
 *
 * 2026-08-16: sort now includes displayOrder (admin-controlled tiebreak
 * within featured/non-featured groups, not just "whichever was marked
 * featured") — this section is one query against the same Books
 * collection /books itself reads, no separate homepage-only content.
 * Cards are compact (cover + title + button, no excerpt) per
 * public/home-books-preview.html — the full description lives on
 * /books and the book's own page, not repeated here.
 */
export async function FeaturedBooks({ config: blockConfig, tenantId }: { config: FeaturedBooksConfig; tenantId: string }) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'books',
    where: { and: [{ tenant: { equals: tenantId } }, { _status: { equals: 'published' } }] },
    sort: ['-featured', 'displayOrder'],
    limit: blockConfig.limit ?? 5,
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
              {blockConfig.body && <p style={{ margin: '0.75rem 0 0', maxWidth: '34rem' }}>{blockConfig.body}</p>}
            </div>
            {docs.length > 0 && (
              <a className="btn-primary-pill" href="/books">
                View All Books
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
              return (
                <StaggerItem key={book.id} role="listitem">
                  <div className="card hover-zoom" style={{ padding: 0, overflow: 'hidden', textAlign: 'center' }}>
                    <a href={`/books/${book.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                      <div style={{ aspectRatio: '3 / 4', overflow: 'hidden', background: 'var(--color-base)' }}>
                        {cover && (
                          <div
                            aria-hidden="true"
                            className="hover-zoom-bg"
                            style={{ width: '100%', height: '100%', backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                          />
                        )}
                      </div>
                      <div style={{ padding: '1.25rem', paddingBottom: book.externalLink ? '0.75rem' : '1.25rem' }}>
                        <p
                          className="card-title"
                          style={{
                            fontSize: '1.0625rem',
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {book.title}
                        </p>
                      </div>
                    </a>
                    {book.externalLink && (
                      <div style={{ padding: '0 1.25rem 1.25rem' }}>
                        <a
                          className="btn-outline"
                          href={book.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ width: '100%', fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                        >
                          Get This Book
                        </a>
                      </div>
                    )}
                  </div>
                </StaggerItem>
              )
            })}
          </Stagger>
        )}
      </div>
    </section>
  )
}
