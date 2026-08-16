import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../access/getResolvedTenantId'
import { lexicalToPlainText } from '../../../lib/lexicalToPlainText'
import { ScrollReveal } from '../../../components/ScrollReveal'
import { Stagger, StaggerItem } from '../../../components/Stagger'
import { Pagination } from '../../../components/Pagination'

export const metadata: Metadata = {
  title: 'Blog — Just Believe International Missions',
  description: 'Reflections, updates, and stories from Just Believe International Missions.',
}

const POSTS_PER_PAGE = 12

export default async function BlogListPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const tenantId = (await headers()).get(TENANT_HEADER)
  const requestedPage = Number((await searchParams).page)
  const page = Number.isFinite(requestedPage) && requestedPage >= 1 ? Math.floor(requestedPage) : 1

  const result = tenantId
    ? await getPayload({ config }).then((payload) =>
        payload.find({
          collection: 'blog-posts',
          where: { and: [{ tenant: { equals: tenantId } }, { _status: { equals: 'published' } }] },
          sort: '-publishedAt',
          limit: POSTS_PER_PAGE,
          page,
          overrideAccess: true,
        }),
      )
    : null

  const posts = result?.docs ?? []

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
            <>
              <Stagger className="blog-grid" role="list">
                {posts.map((post) => {
                  const image = typeof post.featuredImage === 'object' ? post.featuredImage : undefined
                  // 'card' is the ~800px WebP derivative (Media.ts) — a
                  // listing page with many posts shouldn't ship every
                  // full-resolution original just to render a thumbnail.
                  const imageUrl = image?.sizes?.card?.url || image?.url
                  const category = post.categories?.find((c) => typeof c === 'object') as { name: string } | undefined
                  return (
                    <StaggerItem key={post.id} role="listitem">
                      <a href={`/blog/${post.slug}`} className="blog-card hover-zoom">
                        {imageUrl && (
                          <div className="blog-card-image-wrap">
                            {category && <span className="blog-card-category">{category.name}</span>}
                            <div
                              aria-hidden="true"
                              className="hover-zoom-bg"
                              style={{ width: '100%', height: '100%', backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                            />
                          </div>
                        )}
                        <p className="blog-card-meta">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recent'}</p>
                        <h3 className="blog-card-title">{post.title}</h3>
                        {(post.excerpt || post.body) && (
                          <p className="blog-card-excerpt line-clamp-2">{post.excerpt || lexicalToPlainText(post.body).slice(0, 140)}</p>
                        )}
                      </a>
                    </StaggerItem>
                  )
                })}
              </Stagger>
              {result && <Pagination currentPage={result.page ?? 1} totalPages={result.totalPages} basePath="/blog" />}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
