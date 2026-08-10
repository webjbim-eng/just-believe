import { getPayload } from 'payload'
import config from '@payload-config'
import { ScrollReveal } from '../components/ScrollReveal'
import { lexicalToPlainText } from '../lib/lexicalToPlainText'

export type TestimonialsConfig = {
  eyebrow?: string
  heading?: string
  body?: string
  image?: string
  limit?: number
}

/**
 * 2026-08-10: rebuilt as a photo + spotlight-quote layout — the
 * reference's "Standard of Excellence" section. No fabricated carousel:
 * the reference rotates between several testimonials, but with real
 * content this thin (Testimonials.ts has zero seeded records — these are
 * genuinely submitted by visitors), a multi-item carousel with working
 * arrows and nothing behind them to rotate through would be decorative
 * chrome, not a real feature. Spotlights the single most recent real
 * testimonial instead; empty state keeps the same honest CTA as before.
 *
 * Testimonials doesn't use Payload's drafts/versions system — visibility
 * is its own custom status field (submitted/approved/published), and its
 * collection access already restricts anonymous reads to status=published
 * (see Testimonials.ts). This query runs with overrideAccess: true like
 * every other block, so the status filter has to be applied explicitly
 * here to keep that same restriction.
 */
export async function Testimonials({ config: blockConfig, tenantId }: { config: TestimonialsConfig; tenantId: string }) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'testimonials',
    where: { and: [{ tenant: { equals: tenantId } }, { status: { equals: 'published' } }] },
    limit: blockConfig.limit ?? 1,
    overrideAccess: true,
  })
  const spotlight = docs[0]

  return (
    <section className="section decorative-flourish">
      <div className="container">
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            {blockConfig.eyebrow && <p className="section-eyebrow">{blockConfig.eyebrow}</p>}
            <h2>{blockConfig.heading || 'What People Are Saying'}</h2>
            <hr className="heading-underline heading-underline--center" />
            {blockConfig.body && <p style={{ maxWidth: '38rem', margin: '0 auto' }}>{blockConfig.body}</p>}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="split-layout">
            {(() => {
              const photo = spotlight?.photo
              const spotlightImage = photo && typeof photo === 'object' && 'url' in photo ? (photo.url ?? undefined) : undefined
              const mediaImage = spotlightImage || blockConfig.image
              return (
                mediaImage && (
                  <div
                    className="split-layout-media"
                    style={{
                      borderRadius: 'var(--radius-card)',
                      overflow: 'hidden',
                      aspectRatio: '4 / 5',
                      backgroundImage: `url(${mediaImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      boxShadow: 'var(--shadow-card-lg)',
                    }}
                  />
                )
              )
            })()}
            {spotlight ? (
              <div className="card card--tactile" style={{ padding: '2.5rem' }}>
                <span className="quote-mark" aria-hidden="true">
                  &ldquo;
                </span>
                <p style={{ fontSize: 'var(--text-subheading)', color: 'var(--color-text)', marginBottom: '1.5rem' }}>
                  {lexicalToPlainText(spotlight.content)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="avatar-circle" style={{ marginBottom: 0 }}>
                    {spotlight.submitterName.charAt(0).toUpperCase()}
                  </span>
                  <p style={{ fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{spotlight.submitterName}</p>
                </div>
              </div>
            ) : (
              <div className="icon-feature" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
                <span className="icon-feature-ring" aria-hidden="true" style={{ fontFamily: 'var(--font-heading), Georgia, serif', fontSize: '1.5rem' }}>
                  &ldquo;
                </span>
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                  Testimonials are coming soon. Has JBIM impacted your life? We&rsquo;d love to hear your story.
                </p>
                <a className="btn-outline" href="mailto:justbelieveinthot@gmail.com" style={{ marginTop: '0.5rem' }}>
                  Share Your Story
                </a>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
