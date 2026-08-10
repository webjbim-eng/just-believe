export type WelcomeMessageAction = {
  heading: string
  body: string
  ctaLabel: string
  ctaHref: string
}

export type WelcomeMessageConfig = {
  eyebrow?: string
  heading: string
  body: string
  /** Path under /public — the editorial split-image treatment. Optional; falls back to a centered text-only layout when unset. */
  image?: string
  /** Optional 3-card action row beneath the message — RTNM's "New Here? / K.H.O.F. / Ask a Question" pattern. */
  actions?: WelcomeMessageAction[]
}

/**
 * "Ministry Introduction" (2026-08-08 creative directive): editorial
 * split — large image, large typography, one short statement — not a
 * generic "Welcome to our church" panel.
 */
export function WelcomeMessage({ config }: { config: WelcomeMessageConfig }) {
  return (
    <section className="section">
      <div className="container">
        {config.image ? (
          <div className="split-layout">
            <div
              className="split-layout-media"
              style={{
                backgroundImage: `url(${config.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 'var(--radius-card)',
                aspectRatio: '4 / 5',
                boxShadow: 'var(--shadow-card-lg)',
              }}
            />
            <div>
              {config.eyebrow && <p className="section-eyebrow">{config.eyebrow}</p>}
              <h2 style={{ fontSize: 'var(--text-heading-lg)' }}>{config.heading}</h2>
              <hr className="heading-underline" />
              <p style={{ fontSize: 'var(--text-subheading)' }}>{config.body}</p>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
            {config.eyebrow && <p className="section-eyebrow">{config.eyebrow}</p>}
            <h2>{config.heading}</h2>
            <hr className="heading-underline heading-underline--center" />
            <p style={{ fontSize: 'var(--text-subheading)' }}>{config.body}</p>
          </div>
        )}
        {config.actions && config.actions.length > 0 && (
          <div className="grid" style={{ marginTop: '4rem' }}>
            {config.actions.map((action, index) => (
              <div key={index} className="card" style={{ textAlign: 'center' }}>
                <h3 className="card-title" style={{ fontSize: 'var(--text-heading-sm)' }}>
                  {action.heading}
                </h3>
                <p>{action.body}</p>
                <a className="btn-outline" href={action.ctaHref} style={{ padding: '0.625rem 1.5rem' }}>
                  {action.ctaLabel}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
