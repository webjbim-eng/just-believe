import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../../access/getResolvedTenantId'
import { ScrollReveal } from '../../../../components/ScrollReveal'

async function getBook(slug: string) {
  const tenantId = (await headers()).get(TENANT_HEADER)
  if (!tenantId) return null

  const { docs } = await getPayload({ config }).then((payload) =>
    payload.find({
      collection: 'books',
      where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: slug } }, { _status: { equals: 'published' } }] },
      limit: 1,
      overrideAccess: true,
    }),
  )
  return docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const book = await getBook(slug)
  return { title: book ? `${book.title} — Just Believe International Missions` : 'Books — Just Believe International Missions' }
}

export default async function BookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const book = await getBook(slug)
  if (!book) notFound()

  const cover = typeof book.coverImage === 'object' ? book.coverImage?.url : undefined
  const author = typeof book.author === 'object' ? book.author : null

  return (
    <main>
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
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-subheading)', marginBottom: '1.5rem' }}>By {author.name}</p>
                )}
                <hr className="heading-underline" />
                {book.description && <p style={{ fontSize: 'var(--text-body)', marginBottom: '2rem' }}>{book.description}</p>}
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
    </main>
  )
}
