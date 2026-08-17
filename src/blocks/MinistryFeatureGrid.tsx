import { ScrollReveal } from '../components/ScrollReveal'
import { Stagger, StaggerItem } from '../components/Stagger'
import { IconCardGrid, type IconKey } from '../components/IconCardGrid'

export type MinistryFeatureGridItem = {
  image?: string
  icon?: IconKey
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
   * 'dark-numbered': an earlier homepage treatment — dark ink panel,
   * numbered rows (01, 02, ...), added 2026-08-11, superseded 2026-08-17
   * by 'icon-grid' (below) but kept as a selectable option since existing
   * version-history rows may still reference it.
   * 'icon-grid': docs/index.html's "Our Ministries" section — a real
   * icon badge per ministry (IconCardGrid), light panel. Items need
   * `icon`, not `image`, for this layout.
   */
  layout?: 'grid' | 'list' | 'dark-numbered' | 'icon-grid'
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

  if (layout === 'icon-grid') {
    return (
      <section className="section section--primary decorative-flourish">
        <div className="container">
          <ScrollReveal>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div>
                {config.eyebrow && <p className="section-eyebrow" style={{ color: 'var(--color-accent)' }}>{config.eyebrow}</p>}
                <h2 style={{ margin: 0, color: '#fff' }}>{config.heading}</h2>
              </div>
              {config.ctaLabel && config.ctaHref && (
                <a className="btn-outline" href={config.ctaHref} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }}>
                  {config.ctaLabel}
                </a>
              )}
            </div>
          </ScrollReveal>
          <IconCardGrid items={config.items.map((item) => ({ icon: item.icon ?? 'compassion', title: item.title, subtitle: item.subtitle }))} />
        </div>
      </section>
    )
  }

  if (layout === 'dark-numbered') {
    return (
      <section className="section section--primary">
        <div className="container container--narrow">
          <ScrollReveal>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                {config.eyebrow && <p className="section-eyebrow" style={{ color: 'var(--color-accent)' }}>{config.eyebrow}</p>}
                <h2 style={{ margin: 0, color: '#fff' }}>{config.heading}</h2>
              </div>
              {config.ctaLabel && config.ctaHref && (
                <a className="btn-outline" href={config.ctaHref} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }}>
                  {config.ctaLabel}
                </a>
              )}
            </div>
          </ScrollReveal>
          <Stagger role="list">
            {config.items.map((item, index) => (
              <StaggerItem key={item.title} role="listitem">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    padding: '1.5rem 0',
                    borderBottom: index < config.items.length - 1 ? '1px solid var(--color-border-on-dark)' : 'none',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-heading), Georgia, serif', color: 'var(--color-text-muted-on-dark)', fontSize: '0.875rem', width: '1.75rem', flexShrink: 0 }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div
                    aria-hidden="true"
                    style={{
                      width: '2.75rem',
                      height: '2.75rem',
                      borderRadius: '50%',
                      flexShrink: 0,
                      border: '1px solid rgba(255,255,255,0.2)',
                      backgroundImage: `url(${item.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-heading), Georgia, serif', fontSize: 'var(--text-heading-sm)' }}>
                      {item.title}
                    </p>
                    {item.subtitle && <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted-on-dark)' }}>{item.subtitle}</p>}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    )
  }

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
                  <div style={{ minWidth: 0 }}>
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
