export type WelcomeMessageConfig = {
  heading: string
  body: string
}

export function WelcomeMessage({ config }: { config: WelcomeMessageConfig }) {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center' }}>
        <h2>{config.heading}</h2>
        <p style={{ fontSize: 'var(--text-subheading)' }}>{config.body}</p>
      </div>
    </section>
  )
}
