import { ScrollReveal } from '../components/ScrollReveal'

export type PhotoCaptionGridItem = {
  image: string
  eyebrow?: string
  title: string
}

export type PhotoCaptionGridConfig = {
  heading?: string
  columns?: 2 | 4
  items: PhotoCaptionGridItem[]
}

/**
 * Reusable dark-overlay photo grid — reference uses this identical pattern
 * twice (the 2x2 "Sunday Worship" grid and the later 4-photo ministry
 * grid), so it's one block with a `columns` config rather than two
 * near-duplicate components.
 */
export function PhotoCaptionGrid({ config }: { config: PhotoCaptionGridConfig }) {
  const columns = config.columns ?? 4

  return (
    <section className="section">
      <div className="container">
        {config.heading && (
          <ScrollReveal>
            <h2 style={{ textAlign: 'center' }}>{config.heading}</h2>
            <hr className="heading-underline heading-underline--center" />
          </ScrollReveal>
        )}
        <div className={columns === 2 ? 'photo-caption-grid-2' : 'photo-caption-grid-4'}>
          {config.items.map((item, index) => (
            <ScrollReveal key={item.title} delay={index * 80}>
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
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
