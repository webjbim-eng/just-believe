import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../access/getResolvedTenantId'
import { ScrollReveal } from '../../../components/ScrollReveal'
import { Stagger, StaggerItem } from '../../../components/Stagger'

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
            sort: '-featured',
            limit: 50,
            overrideAccess: true,
          }),
        )
      ).docs
    : []

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
          </ScrollReveal>
        </div>
      </section>

      <section className="section decorative-flourish">
        <div className="container">
          {books.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Books and resources are coming soon.</p>
          ) : (
            <Stagger className="photo-caption-grid-4" role="list">
              {books.map((book) => {
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
    </main>
  )
}
