import { getPayload } from 'payload'
import config from '@payload-config'
import { ScrollReveal } from '../components/ScrollReveal'
import { Stagger, StaggerItem } from '../components/Stagger'
import { lexicalToPlainText } from '../lib/lexicalToPlainText'

export type LeadershipConfig = {
  eyebrow?: string
  heading?: string
  limit?: number
}

/**
 * New (2026-08-16, Jimmy's request) — Leadership had zero public
 * presence despite being real, admin-managed content: creating a record
 * in /admin never showed up anywhere on the site. This is the homepage
 * teaser (founder/leaders first, via `order`/`isFounder`), linking to
 * the full-bio /about#leadership section — same "collection -> homepage
 * block -> full page" shape as BlogSpotlight/FeaturedBooks.
 */
export async function Leadership({ config: blockConfig, tenantId }: { config: LeadershipConfig; tenantId: string }) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'leadership',
    where: { tenant: { equals: tenantId } },
    sort: ['-isFounder', 'order'],
    limit: blockConfig.limit ?? 4,
    overrideAccess: true,
  })

  if (docs.length === 0) return null

  return (
    <section className="section decorative-flourish">
      <div className="container">
        <ScrollReveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div>
              {blockConfig.eyebrow && <p className="section-eyebrow">{blockConfig.eyebrow}</p>}
              <h2 style={{ margin: 0 }}>{blockConfig.heading || 'Our Leadership'}</h2>
            </div>
            <a className="btn-primary-pill" href="/about#leadership">
              Meet the Team
            </a>
          </div>
        </ScrollReveal>

        <Stagger className="photo-caption-grid-4" role="list">
          {docs.map((leader) => {
            const photo = typeof leader.photo === 'object' ? leader.photo : undefined
            const bioExcerpt = leader.bio ? lexicalToPlainText(leader.bio).slice(0, 90) : undefined
            return (
              <StaggerItem key={leader.id} role="listitem">
                <a href="/about#leadership" className="card hover-zoom" style={{ display: 'block', padding: 0, overflow: 'hidden', textAlign: 'center', textDecoration: 'none' }}>
                  <div style={{ aspectRatio: '1 / 1', overflow: 'hidden', background: 'var(--color-base)' }}>
                    {photo?.url && (
                      <div
                        aria-hidden="true"
                        className="hover-zoom-bg"
                        style={{ width: '100%', height: '100%', backgroundImage: `url(${photo.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      />
                    )}
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <p className="card-title" style={{ fontSize: 'var(--text-heading-sm)', marginBottom: leader.title ? '0.25rem' : 0 }}>
                      {leader.name}
                    </p>
                    {leader.title && <p style={{ margin: 0, color: 'var(--color-accent)', fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>{leader.title}</p>}
                    {bioExcerpt && <p style={{ margin: '0.5rem 0 0', fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>{bioExcerpt}…</p>}
                  </div>
                </a>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
