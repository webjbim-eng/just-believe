import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../../access/getResolvedTenantId'
import { lexicalToPlainText } from '../../../../lib/lexicalToPlainText'

async function getPost(slug: string) {
  const tenantId = (await headers()).get(TENANT_HEADER)
  if (!tenantId) return null

  const { docs } = await getPayload({ config }).then((payload) =>
    payload.find({
      collection: 'blog-posts',
      where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: slug } }, { _status: { equals: 'published' } }] },
      limit: 1,
      overrideAccess: true,
    }),
  )
  return docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  return { title: post ? `${post.title} — Just Believe International Missions` : 'Blog — Just Believe International Missions' }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <main>
      <article className="section">
        <div className="container container--narrow">
          <p className="section-eyebrow">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Reflections'}</p>
          <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>{post.title}</h1>
          <hr className="heading-underline" />
          {post.body && <p style={{ fontSize: 'var(--text-body)', whiteSpace: 'pre-line' }}>{lexicalToPlainText(post.body)}</p>}
          <a className="btn-outline" href="/blog" style={{ marginTop: '1.5rem' }}>
            ← Back to Blog
          </a>
        </div>
      </article>
    </main>
  )
}
