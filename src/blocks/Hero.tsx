import { renderHeadingWithAccent } from '../lib/renderHeadingWithAccent'
import { Stagger, StaggerItem } from '../components/Stagger'

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
 * 2026-08-10: rebuilt to match the "Chapel" reference's hero exactly —
 * sparse (no eyebrow rule flanks), a large italic serif display line, a
 * short subheading, one light pill CTA (not gold — the reference reserves
 * gold for one deliberate moment later on the page, not the hero; see
 * FeaturedEvents' "Find Out More" panel). Slow Ken Burns drift on the
 * background photo, guarded by prefers-reduced-motion in globals.css.
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
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100svh',
        paddingTop: '6rem',
        paddingBottom: '6rem',
        color: textColor,
      }}
    >
      {hasImage ? (
        <>
          <div
            aria-hidden="true"
            className="ken-burns"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${config.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 20%',
              zIndex: 0,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(11,17,33,0.5) 0%, rgba(11,17,33,0.68) 55%, rgba(11,17,33,0.88) 100%)',
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
        <Stagger staggerDelay={0.12}>
          {config.eyebrow && (
            <StaggerItem>
              <p className="section-eyebrow" style={hasImage ? { color: 'var(--color-accent)' } : undefined}>
                {config.eyebrow}
              </p>
            </StaggerItem>
          )}
          <StaggerItem>
            <h1 className="text-display-italic" style={{ maxWidth: '48rem', margin: '0 auto 1.25rem', color: textColor }}>
              {renderHeadingWithAccent(config.heading, config.accentWord)}
            </h1>
          </StaggerItem>
          {config.subheading && (
            <StaggerItem>
              <p
                style={{
                  fontSize: 'var(--text-subheading)',
                  maxWidth: '34rem',
                  margin: '0 auto 2.5rem',
                  color: hasImage ? 'rgba(255,255,255,0.85)' : undefined,
                }}
              >
                {config.subheading}
              </p>
            </StaggerItem>
          )}
          <StaggerItem>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {config.ctaLabel && config.ctaHref && (
                <a className={hasImage ? 'btn-pill-light' : 'btn-accent'} href={config.ctaHref}>
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
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  )
}
