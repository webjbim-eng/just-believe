import { ScrollReveal } from '../components/ScrollReveal'

export type FoundationStatementConfig = {
  eyebrow?: string
  heading: string
  body?: string
  image: string
  imageTag?: string
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
            <div>
              {config.eyebrow && <p className="section-eyebrow">{config.eyebrow}</p>}
              <h2 style={{ fontSize: 'var(--text-heading)' }}>{config.heading}</h2>
              {config.body && <p style={{ fontSize: 'var(--text-body)' }}>{config.body}</p>}
            </div>
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
                <span
                  className="btn-pill-light"
                  style={{
                    position: 'absolute',
                    bottom: '1.25rem',
                    left: '1.25rem',
                    padding: '0.625rem 1.25rem',
                    fontSize: '0.875rem',
                    pointerEvents: 'none',
                  }}
                >
                  {config.imageTag}
                </span>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
