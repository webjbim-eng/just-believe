import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../access/getResolvedTenantId'
import { ScrollReveal } from '../../../components/ScrollReveal'
import { BookFilterGrid } from '../../../components/BookFilterGrid'

export const metadata: Metadata = {
  title: 'Books — Just Believe International Missions',
  description: 'Writings from our founder — for anyone seeking to grow deeper in faith and calling.',
}

const FORMAT_LABELS: Record<string, string> = {
  paperback: 'Paperback',
  hardcover: 'Hardcover',
  kindle: 'Kindle Edition',
  ebook: 'eBook',
  audiobook: 'Audiobook',
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
  const featuredCover = featured && typeof featured.coverImage === 'object' ? featured.coverImage?.url : undefined

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
                    <div className="split-layout-media" style={{ display: 'flex', justifyContent: 'center' }}>
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '22rem',
                          aspectRatio: '3 / 4',
                          borderRadius: 'var(--radius-card)',
                          overflow: 'hidden',
                          boxShadow: 'var(--shadow-card-lg)',
                          backgroundImage: featuredCover ? `url(${featuredCover})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          background: featuredCover ? undefined : 'var(--color-base)',
                        }}
                      />
                    </div>
                    <div>
                      <p className="section-eyebrow">Featured Book</p>
                      <h2 style={{ fontSize: 'var(--text-heading)' }}>{featured.title}</h2>
                      {(featured.shortDescription || featured.description) && (
                        <p style={{ fontSize: 'var(--text-body)', marginBottom: '1.5rem' }}>{featured.shortDescription || featured.description}</p>
                      )}
                      {(featured.format || featured.language === 'fr') && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                          {featured.format && (
                            <span className="tag" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                              {FORMAT_LABELS[featured.format]}
                            </span>
                          )}
                          {featured.language === 'fr' && (
                            <span className="tag" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                              Français
                            </span>
                          )}
                        </div>
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
            <section className="section decorative-flourish decorative-flourish--reverse" style={{ background: 'var(--color-primary)' }}>
              <div className="container">
                <ScrollReveal>
                  <div style={{ marginBottom: '1rem' }}>
                    <p className="section-eyebrow" style={{ color: 'var(--color-accent)' }}>
                      Full Catalog
                    </p>
                    <h2 style={{ color: '#fff' }}>All Books</h2>
                    <p style={{ color: 'var(--color-text-muted-on-dark)', maxWidth: '38rem' }}>
                      Every title from our founder, in English and French — for personal study, small groups, or gifting.
                    </p>
                  </div>
                </ScrollReveal>
                <BookFilterGrid books={rest} />
              </div>
            </section>
          )}
        </>
      )}

      <section className="section section--surface">
        <div className="container container--narrow" style={{ textAlign: 'center' }}>
          <ScrollReveal>
            <p className="section-eyebrow">Go Deeper</p>
            <h2>Reflections that meet you where you are.</h2>
            <p style={{ fontSize: 'var(--text-subheading)', marginBottom: '2rem' }}>
              Shorter, scripture-rooted pieces from our founder — read a few minutes at a time.
            </p>
            <a className="btn-accent" href="/blog">
              Read Soulful Reflections
            </a>
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
