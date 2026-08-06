export type PartnershipInvitationConfig = {
  heading: string
  body?: string
  ctaLabel: string
  ctaHref: string
}

/**
 * Same shape as CTA but on a filled Royal Blue background with white text
 * — a deliberate dark panel for visual rhythm against the surrounding
 * white/surface sections, matching the "dark trust panel" pattern in the
 * GoFundMe homepage reference researched for this build.
 */
export function PartnershipInvitation({ config }: { config: PartnershipInvitationConfig }) {
  return (
    <section className="section" style={{ background: 'var(--color-primary)' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#fff' }}>{config.heading}</h2>
        {config.body && (
          <p style={{ maxWidth: '36rem', margin: '0 auto 1.5rem', color: 'rgba(255,255,255,0.85)' }}>{config.body}</p>
        )}
        <a className="btn-accent" href={config.ctaHref}>
          {config.ctaLabel}
        </a>
      </div>
    </section>
  )
}
