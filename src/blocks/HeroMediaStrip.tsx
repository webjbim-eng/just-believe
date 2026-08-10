import { ScrollReveal } from '../components/ScrollReveal'

export type HeroMediaStripConfig = {
  badgeImage?: string
  badgeHeading: string
  badgeSubheading?: string
  /** Real destination — a YouTube channel/video, since there's no inline video player. Never a fake play button with nowhere to go. */
  videoImage: string
  videoHref: string
  stripImages: string[]
}

/**
 * The reference's strip beneath its hero: a circular-badge quote panel,
 * a large "video" tile, and a 4-photo texture strip. There's no real video
 * player built (no video-hosting infrastructure exists), so the play
 * button is a real link out to JBIM's YouTube channel rather than a
 * fabricated inline player — same honesty rule as every other CTA on this
 * site.
 */
export function HeroMediaStrip({ config }: { config: HeroMediaStripConfig }) {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <ScrollReveal>
          <div className="split-layout media-badge-split" style={{ alignItems: 'stretch', marginBottom: '1.75rem' }}>
            <div
              style={{
                background: 'var(--color-primary)',
                borderRadius: 'var(--radius-card)',
                padding: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
              }}
            >
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
            </div>

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

        {config.stripImages.length > 0 && (
          <ScrollReveal delay={120}>
            <div className="media-strip-grid" style={{ display: 'grid', gap: '1rem' }}>
              {config.stripImages.map((src, index) => (
                <div
                  key={index}
                  aria-hidden="true"
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: 'var(--radius-card)',
                    backgroundImage: `url(${src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              ))}
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  )
}
