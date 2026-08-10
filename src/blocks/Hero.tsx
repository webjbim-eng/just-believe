import { renderHeadingWithAccent } from '../lib/renderHeadingWithAccent'

export type HeroConfig = {
  eyebrow?: string
  heading: string
  /** Substring within `heading` to render in gold — e.g. "International Missions". */
  accentWord?: string
  subheading?: string
  ctaLabel?: string
  ctaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  /** Path under /public, e.g. "/images/hero-worship-sunset.jpg". Optional — falls back to the plain glow treatment when unset. */
  backgroundImage?: string
}

/**
 * Full-bleed photo hero when config.backgroundImage is set (Elementor/
 * Airbnb.org reference: moody full-bleed photograph, tightly-set white
 * headline layered on top via a dark gradient scrim for legibility) —
 * otherwise falls back to the plain centered treatment with a soft accent
 * glow. Photography is real, properly licensed (Unsplash License, free
 * for commercial use), sourced per-tenant via block config — never
 * hardcoded here, since this component is shared across every tenant.
 */
export function Hero({ config }: { config: HeroConfig }) {
  const hasImage = Boolean(config.backgroundImage)
  const textColor = hasImage ? '#fff' : 'var(--color-text)'

  return (
    <section
      className="section block-hero"
      style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: hasImage ? '9rem' : '7rem',
        paddingBottom: hasImage ? '9rem' : undefined,
        color: textColor,
      }}
    >
      {hasImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- server-rendered CSS background is fine for a full-bleed hero photo; no responsive srcset needed */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${config.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 30%',
              zIndex: 0,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(15,15,20,0.55) 0%, rgba(15,15,20,0.75) 60%, rgba(15,15,20,0.9) 100%)',
              zIndex: 1,
            }}
          />
        </>
      ) : (
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
      )}
      <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        {config.eyebrow && (
          <p
            className="section-eyebrow"
            style={{
              ...(hasImage ? { color: 'var(--color-accent)' } : {}),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
            }}
          >
            <span aria-hidden="true" style={{ width: '1.5rem', height: '1px', background: 'currentColor', opacity: 0.6 }} />
            {config.eyebrow}
            <span aria-hidden="true" style={{ width: '1.5rem', height: '1px', background: 'currentColor', opacity: 0.6 }} />
          </p>
        )}
        <h1 style={{ fontSize: 'var(--text-display)', maxWidth: '56rem', margin: '0 auto 1.5rem', color: textColor, letterSpacing: '-0.03em' }}>
          {renderHeadingWithAccent(config.heading, config.accentWord)}
        </h1>
        {config.subheading && (
          <p
            style={{
              fontSize: 'var(--text-subheading)',
              maxWidth: '42rem',
              margin: '0 auto 2.5rem',
              color: hasImage ? 'rgba(255,255,255,0.85)' : undefined,
            }}
          >
            {config.subheading}
          </p>
        )}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {config.ctaLabel && config.ctaHref && (
            <a className="btn-accent" href={config.ctaHref}>
              {config.ctaLabel}
            </a>
          )}
          {config.secondaryCtaLabel && config.secondaryCtaHref && (
            <a
              className="btn-outline"
              href={config.secondaryCtaHref}
              style={hasImage ? { color: '#fff', borderColor: 'rgba(255,255,255,0.6)' } : undefined}
            >
              {config.secondaryCtaLabel}
            </a>
          )}
        </div>
      </div>
      {hasImage && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '1px',
            height: '2.5rem',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.7), transparent)',
            zIndex: 2,
          }}
        />
      )}
    </section>
  )
}
