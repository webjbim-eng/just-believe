/**
 * One-time import of the founder's real books from their Amazon listings
 * (Jimmy's request, 2026-08-16) — see src/lib/amazonImport.ts for the
 * extraction logic (shared with the "Import from Amazon" admin button).
 * Idempotent by externalLink: skips a URL already present on some book.
 * Paced with a delay between requests — repeated fast requests to the
 * same a.co redirector triggered an anti-automation interstitial during
 * testing; one book every few seconds avoided it in practice.
 *
 * Per the request: never invents a title/description/author that
 * couldn't be reliably retrieved. Where extraction genuinely fails, the
 * record is still created (Books.title is required) with an unmistakable
 * placeholder title naming the ASIN, so it's easy to find in /admin and
 * complete manually — never presented as if it were real data.
 *
 * Run with `npm run import:books`.
 */
import { getPayload } from 'payload'
import config from '../payload.config'
import { fetchAmazonBookMetadata } from '../lib/amazonImport'

const AMAZON_URLS = [
  'https://a.co/d/07CzPCL8',
  'https://a.co/d/0aSmpNne',
  'https://a.co/d/0eQQf5tx',
  'https://a.co/d/06lo6ibY',
  'https://a.co/d/03qFavia',
  'https://a.co/d/04lkBJ0V',
  'https://a.co/d/0aHhhS2q',
]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

async function run() {
  const payload = await getPayload({ config })

  const tenantSlug = process.env.SEED_TENANT_SLUG
  if (!tenantSlug) throw new Error('SEED_TENANT_SLUG is required to run the book import.')
  const tenant = (
    await payload.find({ collection: 'tenants', where: { slug: { equals: tenantSlug } }, limit: 1, overrideAccess: true })
  ).docs[0]
  if (!tenant) throw new Error(`No tenant found for slug "${tenantSlug}" — run npm run seed first.`)

  const existing = await payload.find({
    collection: 'books',
    where: { tenant: { equals: tenant.id } },
    limit: 100,
    overrideAccess: true,
  })
  const existingLinks = new Set(existing.docs.map((b) => b.externalLink).filter(Boolean))
  const existingSlugs = new Set(existing.docs.map((b) => b.slug))

  let created = 0
  let skipped = 0
  let incomplete = 0

  for (const [index, amazonUrl] of AMAZON_URLS.entries()) {
    if (existingLinks.has(amazonUrl)) {
      payload.logger.info(`Skipping ${amazonUrl} — already imported.`)
      skipped++
      continue
    }

    try {
      const metadata = await fetchAmazonBookMetadata(amazonUrl, payload, tenant.id)
      const asin = amazonUrl.split('/').pop() || `book-${index + 1}`
      const title = metadata.title || `Untitled Book (needs details — ${asin})`
      if (!metadata.title) incomplete++

      let slug = slugify(title) || `book-${asin.toLowerCase()}`
      let suffix = 2
      while (existingSlugs.has(slug)) {
        slug = `${slugify(title)}-${suffix}`
        suffix++
      }
      existingSlugs.add(slug)

      await payload.create({
        collection: 'books',
        data: {
          tenant: tenant.id,
          title,
          slug,
          externalLink: amazonUrl,
          shortDescription: metadata.shortDescription || undefined,
          description: metadata.description || undefined,
          format: (metadata.format as 'paperback' | 'hardcover' | 'kindle' | 'ebook' | 'audiobook' | undefined) || undefined,
          coverImage: metadata.coverImageId || undefined,
          _status: 'published',
        },
        overrideAccess: true,
      })
      payload.logger.info(`Imported "${title}"${metadata.warning ? ` — ${metadata.warning}` : ''}`)
      created++
    } catch (err) {
      payload.logger.error(`Failed to import ${amazonUrl}: ${(err as Error).message}`)
    }

    if (index < AMAZON_URLS.length - 1) await sleep(4000)
  }

  payload.logger.info(`Book import complete: ${created} created (${incomplete} need manual title), ${skipped} skipped.`)
  process.exit(0)
}

run().catch((err) => {
  console.error('Book import failed:', err)
  process.exit(1)
})
