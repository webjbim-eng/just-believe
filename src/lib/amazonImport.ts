import { JSDOM } from 'jsdom'
import type { Payload } from 'payload'

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

const FORMAT_KEYWORDS: { match: RegExp; value: string }[] = [
  { match: /kindle/i, value: 'kindle' },
  { match: /hardcover/i, value: 'hardcover' },
  { match: /paperback/i, value: 'paperback' },
  { match: /audiobook|audible/i, value: 'audiobook' },
  { match: /ebook|e-book/i, value: 'ebook' },
]

function pickLargestImage(dynamicImageJson: string | null): string | null {
  if (!dynamicImageJson) return null
  try {
    const parsed = JSON.parse(dynamicImageJson) as Record<string, [number, number]>
    const entries = Object.entries(parsed)
    if (entries.length === 0) return null
    entries.sort((a, b) => b[1][0] - a[1][0])
    return entries[0][0]
  } catch {
    return null
  }
}

export type AmazonBookMetadata = {
  title: string | null
  description: string | null
  shortDescription: string | null
  format: string | null
  coverImageId: number | null
  warning: string | null
}

/**
 * Best-effort metadata extraction from a real Amazon product page — not a
 * bulk scraper, just a convenience prefill for one admin-initiated import
 * at a time (see Books.ts's comment on the amazonImport ui field, and
 * src/app/api/internal/import-book/route.ts, its only other caller —
 * shared here so the initial-seven-books seed script doesn't need to
 * duplicate it or spin up a full Next.js server to call its own API).
 * Amazon doesn't serve og:* meta tags on these pages (verified against
 * the real product URLs before building this), so this reads the same
 * stable selectors Amazon's own product-page markup has used for years
 * (#productTitle, #bylineInfo, #landingImage). No selector match is
 * treated as a hard failure — every field is optional in the response.
 */
export async function fetchAmazonBookMetadata(amazonUrl: string, payload: Payload, tenantId: number): Promise<AmazonBookMetadata> {
  const res = await fetch(amazonUrl, { headers: { 'User-Agent': BROWSER_UA, 'Accept-Language': 'en-US,en;q=0.9' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()

  const dom = new JSDOM(html)
  const doc = dom.window.document

  const title = doc.querySelector('#productTitle')?.textContent?.trim() || null
  const bylineText = doc.querySelector('#bylineInfo')?.textContent?.replace(/\s+/g, ' ').trim() || ''
  const format = FORMAT_KEYWORDS.find((f) => f.match.test(bylineText))?.value || null

  const descriptionEl =
    doc.querySelector('#bookDescription_feature_div .a-expander-content') ||
    doc.querySelector('#bookDescription_feature_div') ||
    doc.querySelector('#productDescription') ||
    doc.querySelector('#feature-bullets')
  const description = descriptionEl?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 3000) || null
  const shortDescription = description ? description.slice(0, 197) + (description.length > 197 ? '...' : '') : null

  const dynamicImage =
    doc.querySelector('#landingImage')?.getAttribute('data-a-dynamic-image') ||
    doc.querySelector('#imgBlkFront')?.getAttribute('data-a-dynamic-image') ||
    null
  const coverImageUrl = pickLargestImage(dynamicImage) || doc.querySelector('#landingImage')?.getAttribute('src') || null

  let coverImageId: number | null = null
  if (coverImageUrl) {
    try {
      const imgRes = await fetch(coverImageUrl, { headers: { 'User-Agent': BROWSER_UA } })
      if (imgRes.ok) {
        const buffer = Buffer.from(await imgRes.arrayBuffer())
        const filename = coverImageUrl.split('/').pop()?.split('?')[0] || `book-cover-${Date.now()}.jpg`
        const media = await payload.create({
          collection: 'media',
          data: { tenant: tenantId, alt: title ? `${title} — cover` : 'Book cover' },
          file: { data: buffer, mimetype: imgRes.headers.get('content-type') || 'image/jpeg', name: filename, size: buffer.length },
          overrideAccess: true,
        })
        coverImageId = media.id
      }
    } catch {
      // Cover fetch/upload failing shouldn't block the rest of the import —
      // the admin (or seed script) can still add a cover manually.
    }
  }

  const missing = [!title && 'title', !description && 'description', !format && 'format', !coverImageId && 'cover image'].filter(Boolean)

  return {
    title,
    description,
    shortDescription,
    format,
    coverImageId,
    warning: missing.length > 0 ? `Couldn't detect: ${missing.join(', ')} — fill these in manually.` : null,
  }
}
