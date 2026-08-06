export type CTAConfig = {
  heading: string
  body?: string
  ctaLabel: string
  ctaHref: string
}

export function CTA({ config }: { config: CTAConfig }) {
  return (
    <section className="section section--surface">
      <div className="container" style={{ textAlign: 'center' }}>
        <h2>{config.heading}</h2>
        {config.body && <p style={{ maxWidth: '36rem', margin: '0 auto 1.5rem' }}>{config.body}</p>}
        <a className="btn-accent" href={config.ctaHref}>
          {config.ctaLabel}
        </a>
      </div>
    </section>
  )
}
