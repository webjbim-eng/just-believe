import { ScrollReveal } from '../components/ScrollReveal'

export type HeroMediaStripQuickLink = {
  image: string
  label: string
  href: string
}

export type HeroMediaStripConfig = {
  badgeImage?: string
  badgeHeading: string
  badgeSubheading?: string
  badgeHref?: string
  /** Real destination — a YouTube channel/video, since there's no inline video player. Never a fake play button with nowhere to go. */
  videoImage: string
  videoHref: string
  /** Each tile must be a real, working destination — this replaced a purely decorative photo strip. */
  quickLinks: HeroMediaStripQuickLink[]
}

/**
 * 2026-08-11: rebuilt after feedback that the strip below the hero was
 * "just images arranged" with no function. Every tile now does something:
 * the badge and video link out, and the reference's 4-photo texture row —
 * pure decoration — became 4 real quick-access links (Ministries, Events,
 * Prayer, Give) with a photo + label, the same "every element earns its
 * place" standard the rest of the site holds to. Also restores real
 * padding-top (was 0, which read as a cramped, un-designed seam against
 * the hero above it).
 */
export function HeroMediaStrip({ config }: { config: HeroMediaStripConfig }) {
  return (
    <section className="section">
      <div className="container">
        <ScrollReveal>
          <div className="split-layout media-badge-split" style={{ alignItems: 'stretch', marginBottom: '1.75rem' }}>
            {(() => {
              const badgeContent = (
                <>
                  {config.badgeImage && (
                    <div
                      aria-hidden="true"
                      style={{
                        width: '4rem',
                        height: '4rem',
                        borderRadius: '50%',
                        flexShrink: 0,
                        backgroundImage: `url(${config.badgeImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '2px solid var(--color-accent)',
                      }}
                    />
                  )}
                  <div>
                    <p style={{ color: '#fff', fontWeight: 600, fontFamily: 'var(--font-heading), Georgia, serif', fontSize: 'var(--text-heading-sm)', margin: 0 }}>
                      {config.badgeHeading}
                    </p>
                    {config.badgeSubheading && (
                      <p style={{ color: 'var(--color-text-muted-on-dark)', margin: '0.375rem 0 0', fontSize: 'var(--text-body-sm)' }}>
                        {config.badgeSubheading}
                      </p>
                    )}
                  </div>
                </>
              )
              const badgeStyle = {
                background: 'var(--color-primary)',
                borderRadius: 'var(--radius-card)',
                padding: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                textDecoration: 'none',
              } as const
              return config.badgeHref ? (
                <a href={config.badgeHref} style={badgeStyle}>
                  {badgeContent}
                </a>
              ) : (
                <div style={badgeStyle}>{badgeContent}</div>
              )
            })()}

            <a
              href={config.videoHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Watch on YouTube"
              className="hover-zoom"
              style={{ position: 'relative', borderRadius: 'var(--radius-card)', overflow: 'hidden', display: 'block', minHeight: '12rem' }}
            >
              <div
                aria-hidden="true"
                className="hover-zoom-bg"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${config.videoImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'rgba(11,17,33,0.25)' }} />
              <span className="play-button" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-primary)">
                  <path d="M8 5.5v13l11-6.5-11-6.5z" />
                </svg>
              </span>
            </a>
          </div>
        </ScrollReveal>

        {config.quickLinks.length > 0 && (
          <ScrollReveal delay={120}>
            <div className="media-strip-grid">
              {config.quickLinks.map((link, index) => (
                <a key={index} href={link.href} className="photo-caption hover-zoom" style={{ aspectRatio: '1 / 1', display: 'block' }}>
                  <div
                    aria-hidden="true"
                    className="hover-zoom-bg"
                    style={{ backgroundImage: `url(${link.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  />
                  <div className="photo-caption-label" style={{ bottom: '0.875rem', left: '0.875rem', right: '0.875rem' }}>
                    <p style={{ fontSize: 'var(--text-body-sm)' }}>{link.label}</p>
                  </div>
                </a>
              ))}
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  )
}
