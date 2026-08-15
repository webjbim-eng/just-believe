/**
 * One-time import of Pastor Pauline's real blog from paulinemenoru.com
 * (WordPress.com) into the Blog collection, requested 2026-08-15.
 * WordPress.com's public REST API needs no auth for a public blog and
 * returns full HTML content, excerpt, featured image, and categories as
 * clean JSON — no scraping needed.
 *
 * Idempotent: matched by slug (WordPress's own, stable) per tenant —
 * already-imported posts are skipped on rerun, never re-created or
 * overwritten (so a real admin edit made after import survives a rerun).
 * `author` is deliberately left blank — Leadership has no real records to
 * attribute posts to, and inventing one isn't this script's call to make.
 *
 * Run with `npm run import:blog` (full 55-post batch) or
 * `npm run import:blog -- --sample=2` to verify a couple of posts first.
 */
import { getPayload, type Payload } from 'payload'
import config from '../payload.config'
import { JSDOM } from 'jsdom'
import { wpHtmlToLexical } from './wpHtmlToLexical'
import type { BlogPost } from '../payload-types'

const SOURCE_SITE = 'paulinemenoru.com'

type WPPost = {
  ID: number
  date: string
  title: string
  content: string
  excerpt: string
  slug: string
  featured_image?: string
  categories?: Record<string, { name: string }>
}

type WPPostsResponse = { found: number; posts: WPPost[] }

const textDecoderDoc = new JSDOM('').window.document

function htmlToPlainText(html: string): string {
  const div = textDecoderDoc.createElement('div')
  div.innerHTML = html
  return (div.textContent || '').replace(/\s+/g, ' ').trim()
}

async function uploadImageFromUrl(
  payload: Payload,
  url: string,
  alt: string,
  tenantId: number,
  cache: Map<string, number | null>,
): Promise<number | null> {
  if (cache.has(url)) return cache.get(url) as number | null
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    const filename = url.split('/').pop()?.split('?')[0] || `image-${Date.now()}.jpg`
    const created = await payload.create({
      collection: 'media',
      data: { tenant: tenantId, alt: alt || 'Blog post image' },
      file: { data: buffer, mimetype: res.headers.get('content-type') || 'image/jpeg', name: filename, size: buffer.length },
      overrideAccess: true,
    })
    cache.set(url, created.id)
    return created.id
  } catch (err) {
    payload.logger.warn(`Failed to import image ${url}: ${(err as Error).message}`)
    cache.set(url, null)
    return null
  }
}

async function getOrCreateCategoryId(
  payload: Payload,
  tenantId: number,
  name: string,
  cache: Map<string, number>,
): Promise<number> {
  if (cache.has(name)) return cache.get(name) as number
  const existing = await payload.find({
    collection: 'categories',
    where: { and: [{ tenant: { equals: tenantId } }, { name: { equals: name } }] },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) {
    cache.set(name, existing.docs[0].id)
    return existing.docs[0].id
  }
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  const created = await payload.create({
    collection: 'categories',
    data: { tenant: tenantId, name, slug },
    overrideAccess: true,
  })
  cache.set(name, created.id)
  return created.id
}

async function run() {
  const sampleArg = process.argv.find((a) => a.startsWith('--sample'))
  const sampleLimit = sampleArg ? parseInt(sampleArg.split('=')[1] || '2', 10) : undefined

  const payload = await getPayload({ config })

  const tenantSlug = process.env.SEED_TENANT_SLUG
  if (!tenantSlug) throw new Error('SEED_TENANT_SLUG is required to run the blog import.')
  const tenant = (
    await payload.find({ collection: 'tenants', where: { slug: { equals: tenantSlug } }, limit: 1, overrideAccess: true })
  ).docs[0]
  if (!tenant) throw new Error(`No tenant found for slug "${tenantSlug}" — run npm run seed first.`)

  payload.logger.info(`Fetching posts from ${SOURCE_SITE}...`)
  const res = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${SOURCE_SITE}/posts/?number=100`)
  if (!res.ok) throw new Error(`WordPress API request failed: HTTP ${res.status}`)
  const data = (await res.json()) as WPPostsResponse
  payload.logger.info(`Found ${data.found} posts, fetched ${data.posts.length}.`)
  if (data.posts.length < data.found) {
    payload.logger.warn(`Only fetched ${data.posts.length}/${data.found} posts — pagination not implemented, some posts will be missed.`)
  }

  const posts = sampleLimit ? data.posts.slice(0, sampleLimit) : data.posts
  payload.logger.info(`Importing ${posts.length} post(s)${sampleLimit ? ' (sample run)' : ''}...`)

  const imageCache = new Map<string, number | null>()
  const categoryCache = new Map<string, number>()
  let created = 0
  let skipped = 0
  let failed = 0

  for (const post of posts) {
    try {
      const existing = await payload.find({
        collection: 'blog-posts',
        where: { and: [{ tenant: { equals: tenant.id } }, { slug: { equals: post.slug } }] },
        limit: 1,
        overrideAccess: true,
      })
      if (existing.docs[0]) {
        payload.logger.info(`Skipping "${post.title}" — already imported (slug "${post.slug}").`)
        skipped++
        continue
      }

      const title = htmlToPlainText(post.title)

      const featuredImageId = post.featured_image
        ? await uploadImageFromUrl(payload, post.featured_image, title, tenant.id, imageCache)
        : null

      const body = await wpHtmlToLexical(post.content, (src, alt) =>
        uploadImageFromUrl(payload, src, alt || title, tenant.id, imageCache),
      )

      const excerptPlain = htmlToPlainText(post.excerpt)
      const excerpt = excerptPlain.length > 200 ? `${excerptPlain.slice(0, 197)}...` : excerptPlain

      const categoryNames = Object.values(post.categories || {}).map((c) => htmlToPlainText(c.name))
      const categoryIds: number[] = []
      for (const name of categoryNames) {
        categoryIds.push(await getOrCreateCategoryId(payload, tenant.id, name, categoryCache))
      }

      await payload.create({
        collection: 'blog-posts',
        data: {
          tenant: tenant.id,
          title,
          slug: post.slug,
          excerpt: excerpt || undefined,
          body: body as BlogPost['body'],
          featuredImage: featuredImageId ?? undefined,
          categories: categoryIds.length ? categoryIds : undefined,
          publishedAt: new Date(post.date).toISOString(),
          _status: 'published',
        },
        overrideAccess: true,
      })
      payload.logger.info(`Imported "${title}".`)
      created++
    } catch (err) {
      payload.logger.error(`Failed to import "${post.title}": ${(err as Error).message}`)
      failed++
    }
  }

  payload.logger.info(`Blog import complete: ${created} created, ${skipped} skipped, ${failed} failed.`)
  process.exit(0)
}

run().catch((err) => {
  console.error('Blog import failed:', err)
  process.exit(1)
})
