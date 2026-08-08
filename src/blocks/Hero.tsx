export type HeroConfig = {
  eyebrow?: string
  heading: string
  subheading?: string
  ctaLabel?: string
  ctaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
}

/**
 * Centered, text-led hero (Airbnb.org/Medium reference styles: oversized
 * tight-set headline carries the section, generous negative space, single
 * high-contrast CTA) with a soft radial glow behind the headline — a
 * restrained nod to the logo's fire identity as atmosphere/texture, not
 * as a palette change (the confirmed brand colors stay Royal Blue/Deep
 * Purple/Gold, see project_jbim_design_system.md).
 */
export function Hero({ config }: { config: HeroConfig }) {
  return (
    <section className="section block-hero" style={{ position: 'relative', overflow: 'hidden', paddingTop: '7rem' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60rem',
          height: '40rem',
          background: 'radial-gradient(closest-side, var(--color-accent) 0%, transparent 70%)',
          opacity: 0.14,
          pointerEvents: 'none',
        }}
      />
      <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
        {config.eyebrow && <p className="section-eyebrow">{config.eyebrow}</p>}
        <h1 style={{ fontSize: 'var(--text-display)', maxWidth: '56rem', margin: '0 auto 1.5rem' }}>{config.heading}</h1>
        {config.subheading && (
          <p style={{ fontSize: 'var(--text-subheading)', maxWidth: '42rem', margin: '0 auto 2.5rem' }}>{config.subheading}</p>
        )}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {config.ctaLabel && config.ctaHref && (
            <a className="btn-accent" href={config.ctaHref}>
              {config.ctaLabel}
            </a>
          )}
          {config.secondaryCtaLabel && config.secondaryCtaHref && (
            <a className="btn-outline" href={config.secondaryCtaHref}>
              {config.secondaryCtaLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
