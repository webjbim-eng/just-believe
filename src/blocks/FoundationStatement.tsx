import { ScrollReveal } from '../components/ScrollReveal'

export type FoundationStatementConfig = {
  eyebrow?: string
  heading: string
  body?: string
  image: string
  imageTag?: string
  linkLabel?: string
  linkHref?: string
}

/**
 * New block (2026-08-11 homepage redesign) — the mockup's "Our Foundation"
 * section, photo + short statement right after the hero. The mockup shows
 * a dot-progress indicator here, implying a multi-item carousel, but only
 * one real statement exists — a non-functional carousel UI for content
 * that doesn't rotate would be decoration pretending to be a feature, so
 * this renders as a plain static section instead.
 */
export function FoundationStatement({ config }: { config: FoundationStatementConfig }) {
  return (
    <section className="section">
      <div className="container">
        <ScrollReveal>
          <div className="split-layout" style={{ alignItems: 'center' }}>
            <div className="split-layout-media" style={{ position: 'relative' }}>
              <div
                style={{
                  backgroundImage: `url(${config.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 'var(--radius-card)',
                  aspectRatio: '1 / 1',
                  boxShadow: 'var(--shadow-card-lg)',
                }}
              />
              {config.imageTag && (
                <span className="media-caption">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 21s-7-4.6-9.5-9.2C.8 8.4 2.4 5 6 5c2 0 3.3 1 4 2 .7-1 2-2 4-2 3.6 0 5.2 3.4 3.5 6.8C19 16.4 12 21 12 21Z" />
                  </svg>
                  {config.imageTag}
                </span>
              )}
            </div>
            <div>
              {config.eyebrow && <p className="section-eyebrow">{config.eyebrow}</p>}
              <h2 style={{ fontSize: 'var(--text-heading)' }}>{config.heading}</h2>
              {config.body && <p style={{ fontSize: 'var(--text-body)' }}>{config.body}</p>}
              {config.linkLabel && config.linkHref && (
                <a className="link-arrow" href={config.linkHref} style={{ marginTop: '0.5rem', display: 'inline-flex' }}>
                  {config.linkLabel} <span className="link-arrow-glyph">→</span>
                </a>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
