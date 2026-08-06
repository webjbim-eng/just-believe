export type HeroConfig = {
  eyebrow?: string
  heading: string
  subheading?: string
  ctaLabel?: string
  ctaHref?: string
}

/**
 * Centered, text-led hero — no image by default (matches the Airbnb.org/
 * Raise reference styles: typography carries the section, not photography
 * no tenant has uploaded yet). config.ctaLabel/ctaHref are both required
 * together for the button to render; either can be omitted for a hero
 * with no call to action.
 */
export function Hero({ config }: { config: HeroConfig }) {
  return (
    <section className="section block-hero">
      <div className="container" style={{ textAlign: 'center' }}>
        {config.eyebrow && (
          <p style={{ color: 'var(--color-accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {config.eyebrow}
          </p>
        )}
        <h1 style={{ fontSize: 'var(--text-display)' }}>{config.heading}</h1>
        {config.subheading && (
          <p style={{ fontSize: 'var(--text-subheading)', maxWidth: '40rem', margin: '0 auto 2rem' }}>{config.subheading}</p>
        )}
        {config.ctaLabel && config.ctaHref && (
          <a className="btn-accent" href={config.ctaHref}>
            {config.ctaLabel}
          </a>
        )}
      </div>
    </section>
  )
}
