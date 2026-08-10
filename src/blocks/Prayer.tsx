import { ScrollReveal } from '../components/ScrollReveal'

export type PrayerConfig = {
  eyebrow?: string
  heading: string
  body?: string
  ctaLabel?: string
  ctaHref?: string
  backgroundImage?: string
}

/**
 * Prayer's own atmospheric moment, distinct from every other dark panel on
 * the site (2026-08-10 UI/UX directive: "should feel spiritually meaningful
 * without becoming visually cheesy"). Deliberately quieter than
 * PartnershipInvitation — a near-black scrim (not a Blue/Purple gradient)
 * so the photo reads as candlelit/silhouette rather than "branded panel,"
 * a single centered line of display type, and one restrained CTA rather
 * than a hard sell.
 */
export function Prayer({ config }: { config: PrayerConfig }) {
  return (
    <section className="section" style={{ position: 'relative', overflow: 'hidden', minHeight: '32rem', display: 'flex', alignItems: 'center' }}>
      {config.backgroundImage && (
        <>
          <div
            aria-hidden="true"
            className="ken-burns"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${config.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 0,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(11,23,48,0.75) 0%, rgba(11,23,48,0.94) 100%)',
              zIndex: 1,
            }}
          />
        </>
      )}
      <ScrollReveal>
        <div className="container container--narrow" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {config.eyebrow && <p className="section-eyebrow">{config.eyebrow}</p>}
          <h2 style={{ fontSize: 'var(--text-heading-lg)', color: '#fff' }}>{config.heading}</h2>
          <hr className="heading-underline heading-underline--center" />
          {config.body && (
            <p style={{ fontSize: 'var(--text-subheading)', color: 'rgba(255,255,255,0.82)', maxWidth: '38rem', margin: '0 auto 2rem' }}>
              {config.body}
            </p>
          )}
          {config.ctaLabel && config.ctaHref && (
            <a className="btn-outline" href={config.ctaHref}>
              {config.ctaLabel}
            </a>
          )}
        </div>
      </ScrollReveal>
    </section>
  )
}
