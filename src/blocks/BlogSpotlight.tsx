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
 * posts have no image field (Blog.ts), so cards are text-first rather than
 * inventing per-post photography. Unlike Leadership (deferred entirely —
 * no real bio content exists and never will without the client providing
 * it), Blog is fully self-serve: an admin can write a real post right now,
 * so this ships with real /blog + /blog/[slug] pages rather than staying
 * homepage-only.
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
              <a href={`/blog/${featured.slug}`} className="card" style={{ display: 'block', textDecoration: 'none', padding: '2.5rem', minHeight: '18rem' }}>
                <p className="card-eyebrow">{featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString() : 'Recent'}</p>
                <h3 style={{ fontSize: 'var(--text-heading)', marginBottom: '1rem' }}>{featured.title}</h3>
                {(featured.excerpt || featured.body) && (
                  <p style={{ fontSize: 'var(--text-body)' }}>{featured.excerpt || lexicalToPlainText(featured.body).slice(0, 180)}</p>
                )}
                <span className="link-arrow">
                  Read More <span className="link-arrow-glyph">→</span>
                </span>
              </a>
            </ScrollReveal>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {rest.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>More reflections are on the way.</p>
              ) : (
                rest.map((post, index) => (
                  <ScrollReveal key={post.id} delay={index * 80}>
                    <a href={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none', paddingBottom: '1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                      <p className="card-eyebrow">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recent'}</p>
                      <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-heading), Georgia, serif', fontSize: 'var(--text-heading-sm)' }}>
                        {post.title}
                      </p>
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
