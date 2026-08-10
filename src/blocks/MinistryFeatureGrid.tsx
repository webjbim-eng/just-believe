import { ScrollReveal } from '../components/ScrollReveal'

export type MinistryFeatureGridItem = {
  image: string
  title: string
  subtitle?: string
}

export type MinistryFeatureGridConfig = {
  eyebrow?: string
  heading: string
  ctaLabel?: string
  ctaHref?: string
  items: MinistryFeatureGridItem[]
}

/**
 * Reference's "Divine Communion" 4-card grid — white cards (not the dark
 * overlay treatment PhotoCaptionGrid uses), photo on top, title + short
 * subtitle below, centered. Items are real ministry names/photography, not
 * the reference's liturgical card titles.
 */
export function MinistryFeatureGrid({ config }: { config: MinistryFeatureGridConfig }) {
  return (
    <section className="section">
      <div className="container">
        <ScrollReveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div>
              {config.eyebrow && <p className="section-eyebrow">{config.eyebrow}</p>}
              <h2 style={{ margin: 0 }}>{config.heading}</h2>
            </div>
            {config.ctaLabel && config.ctaHref && (
              <a className="btn-primary-pill" href={config.ctaHref}>
                {config.ctaLabel}
              </a>
            )}
          </div>
        </ScrollReveal>

        <div className="photo-caption-grid-4">
          {config.items.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 80}>
              <div className="card" style={{ padding: 0, overflow: 'hidden', textAlign: 'center' }}>
                <div className="hover-zoom" style={{ aspectRatio: '4 / 3', overflow: 'hidden' }}>
                  <div
                    aria-hidden="true"
                    className="hover-zoom-bg"
                    style={{ width: '100%', height: '100%', backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  />
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <p className="card-title" style={{ fontSize: 'var(--text-heading-sm)', marginBottom: item.subtitle ? '0.25rem' : 0 }}>
                    {item.title}
                  </p>
                  {item.subtitle && <p style={{ margin: 0, fontSize: 'var(--text-body-sm)' }}>{item.subtitle}</p>}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
