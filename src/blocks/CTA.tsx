import { ScrollReveal } from '../components/ScrollReveal'

export type CTAConfig = {
  heading: string
  body?: string
  ctaLabel: string
  ctaHref: string
  /** Path under /public. Optional — falls back to the plain surface panel when unset. */
  backgroundImage?: string
}

/**
 * 2026-08-10: extended to optionally carry a full-bleed photo — the
 * reference's closing "Discover the Power of Faith & Spiritual Growth"
 * moment, the last section before the footer. Kept as the same generic CTA
 * block (not a new one-off component) since PartnershipInvitation already
 * owns the mid-page "Giving" dark panel with fund tiles — this is the
 * simpler, text+single-button closing beat.
 */
export function CTA({ config }: { config: CTAConfig }) {
  const hasImage = Boolean(config.backgroundImage)

  return (
    <section className={hasImage ? 'section' : 'section section--surface'} style={hasImage ? { position: 'relative', overflow: 'hidden' } : undefined}>
      {hasImage && (
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
            style={{ position: 'absolute', inset: 0, background: 'rgba(11,17,33,0.6)', zIndex: 1 }}
          />
        </>
      )}
      <ScrollReveal>
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <h2 style={hasImage ? { color: '#fff' } : undefined}>{config.heading}</h2>
          {config.body && (
            <p style={{ maxWidth: '36rem', margin: '0 auto 1.5rem', color: hasImage ? 'rgba(255,255,255,0.85)' : undefined }}>
              {config.body}
            </p>
          )}
          <a className={hasImage ? 'btn-pill-light' : 'btn-accent'} href={config.ctaHref}>
            {config.ctaLabel}
          </a>
        </div>
      </ScrollReveal>
    </section>
  )
}
