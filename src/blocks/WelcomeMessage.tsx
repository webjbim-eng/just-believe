export type WelcomeMessageAction = {
  heading: string
  body: string
  ctaLabel: string
  ctaHref: string
}

export type WelcomeMessageConfig = {
  heading: string
  body: string
  /** Optional 3-card action row beneath the message — RTNM's "New Here? / K.H.O.F. / Ask a Question" pattern. */
  actions?: WelcomeMessageAction[]
}

export function WelcomeMessage({ config }: { config: WelcomeMessageConfig }) {
  return (
    <section className="section">
      <div className="container">
        <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
          <h2>{config.heading}</h2>
          <hr className="heading-underline heading-underline--center" />
          <p style={{ fontSize: 'var(--text-subheading)' }}>{config.body}</p>
        </div>
        {config.actions && config.actions.length > 0 && (
          <div className="grid" style={{ marginTop: '3rem' }}>
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
