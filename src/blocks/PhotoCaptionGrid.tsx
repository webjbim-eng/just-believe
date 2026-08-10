import { ScrollReveal } from '../components/ScrollReveal'
import { Stagger, StaggerItem } from '../components/Stagger'

export type PhotoCaptionGridItem = {
  image: string
  eyebrow?: string
  title: string
}

export type PhotoCaptionGridConfig = {
  heading?: string
  columns?: 2 | 4
  /**
   * 'featured' gives item[0] real visual weight (large tile + smaller
   * supporting list) instead of a uniform grid — reuses the same
   * featured/supporting pattern MinistriesOverview already established,
   * rather than every photo section on the page looking identical.
   */
  variant?: 'grid' | 'featured'
  items: PhotoCaptionGridItem[]
}

function Tile({ item }: { item: PhotoCaptionGridItem }) {
  return (
    <div className="photo-caption hover-zoom">
      <div
        aria-hidden="true"
        className="hover-zoom-bg"
        style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div className="photo-caption-label">
        {item.eyebrow && <p className="card-eyebrow">{item.eyebrow}</p>}
        <p>{item.title}</p>
      </div>
    </div>
  )
}

/**
 * Reusable dark-overlay photo grid — reference uses this identical pattern
 * twice (the 2x2 "Sunday Worship" grid and the later 4-photo ministry
 * grid). 2026-08-11: added a `featured` variant so the two homepage
 * instances don't read as the same section repeated — per design
 * feedback that repetitive uniform grids read as "images just arranged,"
 * not designed with hierarchy.
 */
export function PhotoCaptionGrid({ config }: { config: PhotoCaptionGridConfig }) {
  const columns = config.columns ?? 4
  const variant = config.variant ?? 'grid'
  const [featured, ...rest] = config.items

  return (
    <section className="section decorative-flourish">
      <div className="container">
        {config.heading && (
          <ScrollReveal>
            <h2 style={{ textAlign: 'center' }}>{config.heading}</h2>
            <hr className="heading-underline heading-underline--center" />
          </ScrollReveal>
        )}

        {variant === 'featured' && featured ? (
          <div className="split-layout">
            <ScrollReveal className="split-layout-media">
              <div style={{ aspectRatio: '4 / 5' }}>
                <Tile item={featured} />
              </div>
            </ScrollReveal>
            <Stagger className="photo-caption-grid-2" staggerDelay={0.1}>
              {rest.map((item) => (
                <StaggerItem key={item.title}>
                  <Tile item={item} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        ) : (
          <Stagger className={columns === 2 ? 'photo-caption-grid-2' : 'photo-caption-grid-4'}>
            {config.items.map((item) => (
              <StaggerItem key={item.title}>
                <Tile item={item} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  )
}
