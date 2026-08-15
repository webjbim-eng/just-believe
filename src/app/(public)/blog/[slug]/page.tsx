import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { TENANT_HEADER } from '../../../../access/getResolvedTenantId'
import { ScrollReveal } from '../../../../components/ScrollReveal'

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

  const featuredImage = typeof post.featuredImage === 'object' ? post.featuredImage : undefined

  return (
    <main>
      <article className="section">
        <div className="container container--narrow">
          <ScrollReveal>
            <p className="section-eyebrow">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Reflections'}</p>
            <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>{post.title}</h1>
            <hr className="heading-underline" />
            {featuredImage?.url && (
              <div
                aria-hidden={!featuredImage.alt}
                style={{
                  backgroundImage: `url(${featuredImage.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 'var(--radius-card)',
                  aspectRatio: '16 / 9',
                  boxShadow: 'var(--shadow-card-lg)',
                  margin: '0 0 2rem',
                }}
              />
            )}
            {/* Real Lexical → JSX rendering (2026-08-12) — this used to
                flatten every post to plain text via lexicalToPlainText,
                losing headings/lists/bold/links entirely. Matters now that
                real structured content (the paulinemenoru.com import) has
                actual formatting worth keeping. */}
            {post.body && (
              <div className="blog-post-body">
                <RichText data={post.body} />
              </div>
            )}
            <a className="btn-outline" href="/blog" style={{ marginTop: '1.5rem' }}>
              ← Back to Blog
            </a>
          </ScrollReveal>
        </div>
      </article>
    </main>
  )
}
