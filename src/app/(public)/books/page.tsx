import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../access/getResolvedTenantId'
import { ScrollReveal } from '../../../components/ScrollReveal'
import { Stagger, StaggerItem } from '../../../components/Stagger'
import type { Book } from '../../../payload-types'

export const metadata: Metadata = {
  title: 'Books — Just Believe International Missions',
  description: 'Books and resources from Just Believe International Missions.',
}

export default async function BooksPage() {
  const tenantId = (await headers()).get(TENANT_HEADER)

  const books = tenantId
    ? (
        await getPayload({ config }).then((payload) =>
          payload.find({
            collection: 'books',
            where: { and: [{ tenant: { equals: tenantId } }, { _status: { equals: 'published' } }] },
            sort: ['-featured', 'displayOrder'],
            limit: 50,
            overrideAccess: true,
          }),
        )
      ).docs
    : []

  const featured = books.find((b) => b.featured) || books[0]
  const rest = books.filter((b) => b.id !== featured?.id)

  return (
    <main>
      <section className="section" style={{ paddingBottom: 0, textAlign: 'center' }}>
        <div className="container container--narrow">
          <ScrollReveal>
            <p className="section-eyebrow">Resources</p>
            <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>
              Our <span className="text-accent">Books</span>
            </h1>
            <hr className="heading-underline heading-underline--center" />
            <p style={{ fontSize: 'var(--text-subheading)' }}>
              Writings from our founder — for anyone seeking to grow deeper in faith and calling.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {books.length === 0 ? (
        <section className="section decorative-flourish">
          <div className="container">
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Books and resources are coming soon.</p>
          </div>
        </section>
      ) : (
        <>
          {featured && (
            <section className="section decorative-flourish">
              <div className="container">
                <ScrollReveal>
                  <div className="split-layout">
                    <BookCoverMedia book={featured} />
                    <div>
                      <p className="section-eyebrow">Featured Book</p>
                      <h2 style={{ fontSize: 'var(--text-heading)' }}>{featured.title}</h2>
                      {(featured.shortDescription || featured.description) && (
                        <p style={{ fontSize: 'var(--text-body)', marginBottom: '2rem' }}>{featured.shortDescription || featured.description}</p>
                      )}
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {featured.externalLink && (
                          <a className="btn-accent" href={featured.externalLink} target="_blank" rel="noopener noreferrer">
                            Get This Book
                          </a>
                        )}
                        <a className="btn-outline" href={`/books/${featured.slug}`}>
                          Read More
                        </a>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section className="section section--surface decorative-flourish decorative-flourish--reverse">
              <div className="container">
                <ScrollReveal>
                  <h2 style={{ textAlign: 'center' }}>All Books</h2>
                  <hr className="heading-underline heading-underline--center" />
                </ScrollReveal>
                <Stagger className="photo-caption-grid-4" role="list">
                  {rest.map((book) => (
                    <StaggerItem key={book.id} role="listitem">
                      <BookCard book={book} />
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  )
}

function BookCoverMedia({ book }: { book: Book }) {
  const cover = typeof book.coverImage === 'object' ? book.coverImage?.url : undefined
  return (
    <div className="split-layout-media" style={{ display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          maxWidth: '22rem',
          aspectRatio: '3 / 4',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card-lg)',
          backgroundImage: cover ? `url(${cover})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          background: cover ? undefined : 'var(--color-base)',
        }}
      />
    </div>
  )
}

function BookCard({ book }: { book: Book }) {
  const cover = typeof book.coverImage === 'object' ? book.coverImage?.url : undefined
  return (
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
          <p className="card-title" style={{ fontSize: 'var(--text-heading-sm)', marginBottom: book.shortDescription ? '0.375rem' : 0 }}>
            {book.title}
          </p>
          {book.shortDescription && <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>{book.shortDescription}</p>}
        </div>
      </a>
      {book.externalLink && (
        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          <a className="btn-outline" href={book.externalLink} target="_blank" rel="noopener noreferrer" style={{ width: '100%', fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>
            Get This Book
          </a>
        </div>
      )}
    </div>
  )
}
