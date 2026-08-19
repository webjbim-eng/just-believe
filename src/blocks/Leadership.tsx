import { getPayload } from 'payload'
import config from '@payload-config'
import { ScrollReveal } from '../components/ScrollReveal'
import { lexicalToPlainText } from '../lib/lexicalToPlainText'

export type LeadershipConfig = {
  eyebrow?: string
  heading?: string
}

/**
 * New (2026-08-16, Jimmy's request) — Leadership had zero public
 * presence despite being real, admin-managed content: creating a record
 * in /admin never showed up anywhere on the site.
 *
 * 2026-08-17: was a photo-caption-grid-4 card grid (with exactly 1 real
 * leader today, that read as one small orphaned card in an otherwise-
 * empty row — the same "orphaned card" problem fixed elsewhere this
 * session). docs/index.html's homepage spotlights the founder in a full
 * split-media section instead (same visual pattern as FoundationStatement)
 * — featuring the top-sorted leader (`-isFounder, order`), which is the
 * real content shape today (one founder), not a hypothetical multi-
 * leader grid.
 */
export async function Leadership({ config: blockConfig, tenantId }: { config: LeadershipConfig; tenantId: string }) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'leadership',
    where: { tenant: { equals: tenantId } },
    sort: ['-isFounder', 'order'],
    limit: 1,
    overrideAccess: true,
  })
  const leader = docs[0]
  if (!leader) return null

  const photo = typeof leader.photo === 'object' ? leader.photo : undefined
  const bioExcerpt = leader.bio ? lexicalToPlainText(leader.bio).slice(0, 320) : undefined

  return (
    <section className="section decorative-flourish">
      <div className="container">
        <ScrollReveal>
          <div className="split-layout split-layout--reverse">
            <div className="split-layout-media" style={{ position: 'relative' }}>
              <div
                style={{
                  backgroundImage: photo?.url ? `url(${photo.url})` : undefined,
                  backgroundSize: 'cover',
                  // 'top', not 'center' — real leader photos are tall
                  // portraits with headroom above the subject; centering
                  // crops evenly off both edges and clips the top of the
                  // head, since the container's aspect ratio is wider than
                  // the source image's.
                  backgroundPosition: 'center top',
                  background: photo?.url ? undefined : 'var(--color-base)',
                  borderRadius: 'var(--radius-card)',
                  aspectRatio: '4 / 5',
                  boxShadow: 'var(--shadow-card-lg)',
                }}
              />
              <span className="media-caption">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.4" />
                  <path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" />
                </svg>
                {leader.name}
              </span>
            </div>
            <div>
              {blockConfig.eyebrow && <p className="section-eyebrow">{blockConfig.eyebrow}</p>}
              <h2 style={{ margin: 0 }}>{blockConfig.heading || 'Our Leadership'}</h2>
              <h3 style={{ fontSize: 'var(--text-subheading)', color: 'var(--color-accent)', margin: '1.1rem 0 0.125rem' }}>{leader.name}</h3>
              {leader.title && <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>{leader.title}</p>}
              {bioExcerpt && <p style={{ marginTop: '1rem' }}>{bioExcerpt}…</p>}
              <a className="link-arrow" href="/about#leadership" style={{ marginTop: '1.25rem', display: 'inline-flex' }}>
                Meet the Team <span className="link-arrow-glyph">→</span>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
