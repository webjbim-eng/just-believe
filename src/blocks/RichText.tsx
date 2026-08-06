export type RichTextConfig = {
  heading?: string
  body: string
}

// Plain-paragraph rendering (split on blank lines), not a Lexical
// renderer — no block currently stores real Lexical JSON in config (it's
// a generic JSON blob, see HomepageLayout.ts), and rendering trusted-only
// plain text avoids dangerouslySetInnerHTML entirely.
export function RichText({ config }: { config: RichTextConfig }) {
  const paragraphs = config.body.split(/\n{2,}/)

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: '48rem', margin: '0 auto' }}>
        {config.heading && <h2>{config.heading}</h2>}
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </section>
  )
}
