import { renderHeadingWithAccent } from '../lib/renderHeadingWithAccent'
import { Accordion, type AccordionItemData } from '../components/Accordion'
import { ScrollReveal } from '../components/ScrollReveal'

export type MinistryPathwaysConfig = {
  eyebrow?: string
  heading: string
  accentWord?: string
  body?: string
  image: string
  imageCaptionEyebrow?: string
  imageCaptionTitle?: string
  listItems: AccordionItemData[]
  ctaLabel?: string
  ctaHref?: string
  iconFeatures: string[]
}

/**
 * Structural match for the reference's "Diverse Paths of Worship" section:
 * photo with a caption-badge overlay + expandable list + CTA, then a
 * separate row of 4 icon-feature items below the split. Copy is JBIM's own
 * (evangelism/discipleship/prayer voice), not the reference's liturgical
 * wording — iconFeatures pulls from real ministry names, not invented
 * labels.
 */
export function MinistryPathways({ config }: { config: MinistryPathwaysConfig }) {
  return (
    <section className="section decorative-flourish">
      <div className="container">
        <ScrollReveal>
          <div className="split-layout" style={{ marginBottom: config.iconFeatures.length > 0 ? '4rem' : 0 }}>
            <div
              className="split-layout-media"
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-card)',
                overflow: 'hidden',
                aspectRatio: '4 / 5',
                boxShadow: 'var(--shadow-card-lg)',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${config.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              {(config.imageCaptionEyebrow || config.imageCaptionTitle) && (
                <>
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(11,17,33,0) 45%, rgba(11,17,33,0.82) 100%)',
                    }}
                  />
                  <div style={{ position: 'absolute', left: '1.5rem', right: '1.5rem', bottom: '1.5rem', color: '#fff' }}>
                    {config.imageCaptionEyebrow && <p className="card-eyebrow">{config.imageCaptionEyebrow}</p>}
                    {config.imageCaptionTitle && (
                      <p style={{ margin: 0, fontFamily: 'var(--font-heading), Georgia, serif', fontSize: 'var(--text-heading-sm)' }}>
                        {config.imageCaptionTitle}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            <div>
              {config.eyebrow && <p className="section-eyebrow">{config.eyebrow}</p>}
              <h2>{renderHeadingWithAccent(config.heading, config.accentWord)}</h2>
              {config.body && <p style={{ fontSize: 'var(--text-body)', marginBottom: '1.75rem' }}>{config.body}</p>}
              <div style={{ marginBottom: '1.75rem' }}>
                <Accordion items={config.listItems} />
              </div>
              {config.ctaLabel && config.ctaHref && (
                <a className="btn-accent" href={config.ctaHref}>
                  {config.ctaLabel}
                </a>
              )}
            </div>
          </div>
        </ScrollReveal>

        {config.iconFeatures.length > 0 && (
          <ScrollReveal delay={120}>
            <div className="icon-feature-row">
              {config.iconFeatures.map((label) => (
                <div key={label} className="icon-feature">
                  <span className="icon-feature-ring" aria-hidden="true" style={{ fontFamily: 'var(--font-heading), Georgia, serif', fontWeight: 700 }}>
                    {label.charAt(0).toUpperCase()}
                  </span>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)', fontSize: 'var(--text-body-sm)' }}>{label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  )
}
