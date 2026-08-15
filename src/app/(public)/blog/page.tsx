import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../access/getResolvedTenantId'
import { lexicalToPlainText } from '../../../lib/lexicalToPlainText'
import { ScrollReveal } from '../../../components/ScrollReveal'
import { Stagger, StaggerItem } from '../../../components/Stagger'

export const metadata: Metadata = {
  title: 'Blog — Just Believe International Missions',
  description: 'Reflections, updates, and stories from Just Believe International Missions.',
}

export default async function BlogListPage() {
  const tenantId = (await headers()).get(TENANT_HEADER)

  const posts = tenantId
    ? (
        await getPayload({ config }).then((payload) =>
          payload.find({
            collection: 'blog-posts',
            where: { and: [{ tenant: { equals: tenantId } }, { _status: { equals: 'published' } }] },
            sort: '-publishedAt',
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
            <p className="section-eyebrow">Reflections</p>
            <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>
              From the <span className="text-accent">Blog</span>
            </h1>
            <hr className="heading-underline heading-underline--center" />
          </ScrollReveal>
        </div>
      </section>

      <section className="section decorative-flourish">
        <div className="container">
          {posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Reflections and updates from JBIM are coming soon.</p>
          ) : (
            <Stagger className="photo-caption-grid-2" role="list">
              {posts.map((post) => {
                const image = typeof post.featuredImage === 'object' ? post.featuredImage : undefined
                // 'card' is the ~800px WebP derivative (Media.ts) — a
                // listing page with many posts shouldn't ship every
                // full-resolution original just to render a thumbnail.
                const imageUrl = image?.sizes?.card?.url || image?.url
                return (
                  <StaggerItem key={post.id} role="listitem">
                    <a href={`/blog/${post.slug}`} className="card hover-zoom" style={{ display: 'block', padding: 0, overflow: 'hidden', textDecoration: 'none' }}>
                      {imageUrl && (
                        <div style={{ aspectRatio: '16 / 9', overflow: 'hidden' }}>
                          <div
                            aria-hidden="true"
                            className="hover-zoom-bg"
                            style={{ width: '100%', height: '100%', backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                          />
                        </div>
                      )}
                      <div style={{ padding: '1.5rem' }}>
                        <p className="card-eyebrow">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recent'}</p>
                        <h3 className="card-title">{post.title}</h3>
                        {(post.excerpt || post.body) && <p>{post.excerpt || lexicalToPlainText(post.body).slice(0, 140)}</p>}
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
