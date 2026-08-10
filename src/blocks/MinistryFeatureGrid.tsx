import { ScrollReveal } from '../components/ScrollReveal'
import { Stagger, StaggerItem } from '../components/Stagger'

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
  /**
   * 'list': compact editorial index — small thumbnail, text-forward,
   * hairline dividers. Use when this section follows other large-photo
   * sections and doesn't need to compete for the same visual weight.
   * 'grid': the original large photo-card treatment, kept for contexts
   * where this section IS the page's primary content (not currently used
   * on the homepage, but available for an admin-configured page).
   */
  layout?: 'grid' | 'list'
  items: MinistryFeatureGridItem[]
}

/**
 * 2026-08-11: added the `list` layout after feedback that the homepage
 * had three consecutive large-photo-card sections back to back (this one
 * included) — a ministries *teaser* on the homepage isn't the primary
 * destination for browsing ministries (/ministries already is, with its
 * own featured+supporting hierarchy), so it doesn't need the same visual
 * weight as a dedicated listing page. Compact rows instead of photo
 * cards.
 */
export function MinistryFeatureGrid({ config }: { config: MinistryFeatureGridConfig }) {
  const layout = config.layout ?? 'list'

  return (
    <section className="section decorative-flourish decorative-flourish--reverse">
      <div className="container container--narrow">
        <ScrollReveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: layout === 'list' ? '1.5rem' : '2.5rem' }}>
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

        {layout === 'list' ? (
          <Stagger>
            {config.items.map((item, index) => (
              <StaggerItem key={item.title}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    padding: '1.25rem 0',
                    borderBottom: index < config.items.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      width: '3.5rem',
                      height: '3.5rem',
                      borderRadius: '50%',
                      flexShrink: 0,
                      backgroundImage: `url(${item.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)', fontFamily: 'var(--font-heading), Georgia, serif', fontSize: 'var(--text-heading-sm)' }}>
                      {item.title}
                    </p>
                    {item.subtitle && <p style={{ margin: 0, fontSize: 'var(--text-body-sm)' }}>{item.subtitle}</p>}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <Stagger className="photo-caption-grid-4">
            {config.items.map((item) => (
              <StaggerItem key={item.title}>
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
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  )
}
