export type PartnershipInvitationWay = {
  label: string
  description: string
}

export type PartnershipInvitationConfig = {
  heading: string
  body?: string
  ctaLabel: string
  ctaHref: string
  /** Path under /public. Optional — falls back to a flat Royal Blue panel when unset. */
  backgroundImage?: string
  /**
   * Real fund designations a donor can ask for (mirrors
   * Donations.ts's `fund` options) — descriptive only, not separate
   * buttons, since there is no online checkout yet. All roads still lead
   * to the one real CTA below.
   */
  ways?: PartnershipInvitationWay[]
}

/**
 * Same shape as CTA but on a filled Royal Blue background (or a real
 * photo with a blue-toned scrim, when config.backgroundImage is set) with
 * white text — a deliberate dark panel for visual rhythm against the
 * surrounding white/surface sections, matching the "dark trust panel"
 * pattern in the GoFundMe homepage reference researched for this build.
 *
 * 2026-08-10 directive asked for a "Give Once / Give Monthly / Support a
 * Mission"-style presentation, restrained rather than a hard sell. There is
 * no PayPal checkout built yet (src/collections/Donations.ts is a
 * system-writer record only — see its comment), so `ways` is presented as
 * three quiet, informational fund designations rather than three
 * functional payment buttons — real content (matches Donations.ts's `fund`
 * enum), not a fabricated checkout flow.
 */
export function PartnershipInvitation({ config }: { config: PartnershipInvitationConfig }) {
  const hasImage = Boolean(config.backgroundImage)

  return (
    <section
      className="section"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: hasImage ? undefined : 'var(--color-primary)',
      }}
    >
      {hasImage && (
        <>
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${config.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 0,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(30,58,138,0.88) 0%, rgba(76,29,149,0.9) 100%)',
              zIndex: 1,
            }}
          />
        </>
      )}
      <div className="container container--narrow" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <p className="section-eyebrow">Giving</p>
        <h2 style={{ color: '#fff' }}>{config.heading}</h2>
        {config.body && (
          <p style={{ maxWidth: '36rem', margin: '0 auto 2rem', color: 'rgba(255,255,255,0.85)' }}>{config.body}</p>
        )}

        {config.ways && config.ways.length > 0 && (
          <div className="grid" style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
            {config.ways.map((way) => (
              <div
                key={way.label}
                style={{
                  padding: '1.5rem',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 'var(--radius-card)',
                }}
              >
                <p className="card-eyebrow">{way.label}</p>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: 'var(--text-body-sm)' }}>{way.description}</p>
              </div>
            ))}
          </div>
        )}

        <a className="btn-accent" href={config.ctaHref}>
          {config.ctaLabel}
        </a>
      </div>
    </section>
  )
}
