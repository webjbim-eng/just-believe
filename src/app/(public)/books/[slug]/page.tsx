import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../../access/getResolvedTenantId'
import { ScrollReveal } from '../../../../components/ScrollReveal'
import { shortTitle } from '../../../../lib/shortTitle'

const FORMAT_LABELS: Record<string, string> = {
  paperback: 'Paperback',
  hardcover: 'Hardcover',
  kindle: 'Kindle Edition',
  ebook: 'eBook',
  audiobook: 'Audiobook',
}

async function getBook(slug: string, preview: boolean) {
  const tenantId = (await headers()).get(TENANT_HEADER)
  if (!tenantId) return null

  const { docs } = await getPayload({ config }).then((payload) =>
    payload.find({
      collection: 'books',
      where: {
        and: [{ tenant: { equals: tenantId } }, { slug: { equals: slug } }, ...(preview ? [] : [{ _status: { equals: 'published' as const } }])],
      },
      draft: preview,
      limit: 1,
      overrideAccess: true,
    }),
  )
  return docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const book = await getBook(slug, false)
  return { title: book ? `${book.title} — Just Believe International Missions` : 'Books — Just Believe International Missions' }
}

export default async function BookDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> }) {
  const { slug } = await params
  const preview = (await searchParams).preview === '1'
  const book = await getBook(slug, preview)
  if (!book) notFound()

  const cover = typeof book.coverImage === 'object' ? book.coverImage?.url : undefined
  const author = typeof book.author === 'object' ? book.author : null
  const tenantId = (await headers()).get(TENANT_HEADER)

  const related = tenantId
    ? (
        await getPayload({ config }).then((payload) =>
          payload.find({
            collection: 'books',
            where: {
              and: [{ tenant: { equals: tenantId } }, { _status: { equals: 'published' } }, { id: { not_equals: book.id } }],
            },
            sort: ['-featured', 'displayOrder'],
            limit: 3,
            overrideAccess: true,
          }),
        )
      ).docs
    : []

  return (
    <main>
      {preview && (
        <div style={{ background: 'var(--color-accent)', color: 'var(--color-on-accent)', textAlign: 'center', padding: '0.625rem', fontSize: '0.875rem', fontWeight: 600 }}>
          Preview mode — showing the current draft, not yet published
        </div>
      )}
      <section className="section">
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
                    backgroundImage: cover ? `url(${cover})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    background: cover ? undefined : 'var(--color-base)',
                  }}
                />
              </div>
              <div>
                <p className="section-eyebrow">Book</p>
                <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>{book.title}</h1>
                {author && 'name' in author && (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-subheading)', marginBottom: '0.5rem' }}>By {author.name}</p>
                )}
                {(book.format || book.publicationDate) && (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-body-sm)', marginBottom: '1.5rem' }}>
                    {book.format && FORMAT_LABELS[book.format]}
                    {book.format && book.publicationDate && ' · '}
                    {book.publicationDate && new Date(book.publicationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                  </p>
                )}
                <hr className="heading-underline" />
                {book.description && <p style={{ fontSize: 'var(--text-body)', marginBottom: '2rem', whiteSpace: 'pre-line' }}>{book.description}</p>}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {book.externalLink && (
                    <a className="btn-accent" href={book.externalLink} target="_blank" rel="noopener noreferrer">
                      Get This Book
                    </a>
                  )}
                  <a className="btn-outline" href="/books">
                    ← All Books
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--surface decorative-flourish">
          <div className="container">
            <ScrollReveal>
              <h2 style={{ textAlign: 'center' }}>More Books</h2>
              <hr className="heading-underline heading-underline--center" />
            </ScrollReveal>
            <div className="photo-caption-grid-4">
              {related.map((other) => {
                const otherCover = typeof other.coverImage === 'object' ? other.coverImage?.url : undefined
                return (
                  <a key={other.id} href={`/books/${other.slug}`} className="card hover-zoom" style={{ display: 'block', padding: 0, overflow: 'hidden', textAlign: 'center', textDecoration: 'none' }}>
                    <div style={{ aspectRatio: '3 / 4', overflow: 'hidden', background: 'var(--color-base)' }}>
                      {otherCover && (
                        <div
                          aria-hidden="true"
                          className="hover-zoom-bg"
                          style={{ width: '100%', height: '100%', backgroundImage: `url(${otherCover})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                      )}
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      <p
                        className="card-title"
                        title={other.title}
                        style={{
                          fontSize: '1rem',
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {shortTitle(other.title)}
                      </p>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
