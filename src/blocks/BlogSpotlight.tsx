import { getPayload } from 'payload'
import config from '@payload-config'
import { ScrollReveal } from '../components/ScrollReveal'
import { lexicalToPlainText } from '../lib/lexicalToPlainText'

export type BlogSpotlightConfig = {
  eyebrow?: string
  heading?: string
  limit?: number
}

/**
 * Reference's "Soulful Reflections" section: one large featured post +
 * several smaller ones, "View All" linking to a real listing page. Blog
 * posts got a featuredImage field (Blog.ts, 2026-08-15, for the
 * paulinemenoru.com import) — the featured slot uses it when present,
 * falling back to the original text-only card for older posts without
 * one. Unlike Leadership (deferred entirely — no real bio content exists
 * and never will without the client providing it), Blog is fully
 * self-serve: an admin can write a real post right now, so this ships
 * with real /blog + /blog/[slug] pages rather than staying homepage-only.
 */
export async function BlogSpotlight({ config: blockConfig, tenantId }: { config: BlogSpotlightConfig; tenantId: string }) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'blog-posts',
    where: { and: [{ tenant: { equals: tenantId } }, { _status: { equals: 'published' } }] },
    sort: '-publishedAt',
    limit: blockConfig.limit ?? 4,
    overrideAccess: true,
  })
  const [featured, ...rest] = docs
  const featuredImageDoc = featured && typeof featured.featuredImage === 'object' ? featured.featuredImage : undefined
  // 'card' is the ~800px WebP derivative (Media.ts) — plenty for this
  // 4/5-ratio panel, versus shipping the full-resolution original.
  const featuredImageUrl = featuredImageDoc?.sizes?.card?.url || featuredImageDoc?.url

  return (
    <section className="section decorative-flourish decorative-flourish--reverse">
      <div className="container">
        <ScrollReveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div>
              {blockConfig.eyebrow && <p className="section-eyebrow">{blockConfig.eyebrow}</p>}
              <h2 style={{ margin: 0 }}>{blockConfig.heading || 'From the Blog'}</h2>
            </div>
            {docs.length > 0 && (
              <a className="btn-primary-pill" href="/blog">
                View All
              </a>
            )}
          </div>
        </ScrollReveal>

        {!featured ? (
          <div className="icon-feature" style={{ alignItems: 'flex-start', textAlign: 'left', maxWidth: '32rem' }}>
            <span className="icon-feature-ring" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 4.5h14v15H5z" strokeLinejoin="round" />
                <path d="M8 9h8M8 12.5h8M8 16h5" strokeLinecap="round" />
              </svg>
            </span>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Reflections and updates from JBIM are coming soon.</p>
          </div>
        ) : (
          <div className="split-layout">
            <ScrollReveal className="split-layout-media">
              {featuredImageUrl ? (
                <a
                  href={`/blog/${featured.slug}`}
                  aria-label={featured.title}
                  style={{
                    display: 'block',
                    backgroundImage: `url(${featuredImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 'var(--radius-card)',
                    aspectRatio: '1 / 1',
                    boxShadow: 'var(--shadow-card-lg)',
                  }}
                />
              ) : (
                <a href={`/blog/${featured.slug}`} className="card" style={{ display: 'block', textDecoration: 'none', padding: '2.5rem', minHeight: '18rem' }}>
                  <p className="card-eyebrow">{featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString() : 'Recent'}</p>
                  <h3 style={{ fontSize: 'var(--text-heading)', marginBottom: '1rem' }}>{featured.title}</h3>
                  {(featured.excerpt || featured.body) && (
                    <p style={{ fontSize: 'var(--text-body)' }}>{featured.excerpt || lexicalToPlainText(featured.body).slice(0, 180)}</p>
                  )}
                  <span className="link-arrow">
                    Read the Reflection <span className="link-arrow-glyph">→</span>
                  </span>
                </a>
              )}
            </ScrollReveal>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {featuredImageUrl && (
                <a href={`/blog/${featured.slug}`} style={{ display: 'block', textDecoration: 'none', paddingBottom: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                  <p className="card-eyebrow">Latest · {featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString() : 'Recent'}</p>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      fontFamily: 'var(--font-heading), Georgia, serif',
                      fontSize: 'var(--text-heading-sm)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {featured.title}
                  </p>
                  {(featured.excerpt || featured.body) && (
                    <p style={{ marginTop: '0.5rem' }}>{featured.excerpt || lexicalToPlainText(featured.body).slice(0, 140)}</p>
                  )}
                  <span className="link-arrow" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                    Read the Reflection <span className="link-arrow-glyph">→</span>
                  </span>
                </a>
              )}
              {rest.length === 0 && !featuredImageUrl ? (
                <p style={{ color: 'var(--color-text-muted)' }}>More reflections are on the way.</p>
              ) : (
                rest.map((post, index) => (
                  <ScrollReveal key={post.id} delay={index * 80}>
                    <a href={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none', paddingBottom: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                      <p className="card-eyebrow">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recent'}</p>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          color: 'var(--color-text)',
                          fontFamily: 'var(--font-heading), Georgia, serif',
                          fontSize: 'var(--text-heading-sm)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {post.title}
                      </p>
                      <span className="link-arrow" style={{ marginTop: '0.25rem', fontSize: 'var(--text-body-sm)' }}>
                        Read more <span className="link-arrow-glyph">→</span>
                      </span>
                    </a>
                  </ScrollReveal>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
