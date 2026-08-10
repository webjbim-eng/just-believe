import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../access/getResolvedTenantId'
import { lexicalToPlainText } from '../../../lib/lexicalToPlainText'

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
          <p className="section-eyebrow">Reflections</p>
          <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>
            From the <span className="text-accent">Blog</span>
          </h1>
          <hr className="heading-underline heading-underline--center" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          {posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Reflections and updates from JBIM are coming soon.</p>
          ) : (
            <div className="grid">
              {posts.map((post) => (
                <a key={post.id} href={`/blog/${post.slug}`} className="card" style={{ textDecoration: 'none' }}>
                  <p className="card-eyebrow">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recent'}</p>
                  <h3 className="card-title">{post.title}</h3>
                  {post.body && <p>{lexicalToPlainText(post.body).slice(0, 140)}</p>}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
