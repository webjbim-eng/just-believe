export type PartnershipInvitationConfig = {
  heading: string
  body?: string
  ctaLabel: string
  ctaHref: string
  /** Path under /public. Optional — falls back to a flat Royal Blue panel when unset. */
  backgroundImage?: string
}

/**
 * Same shape as CTA but on a filled Royal Blue background (or a real
 * photo with a blue-toned scrim, when config.backgroundImage is set) with
 * white text — a deliberate dark panel for visual rhythm against the
 * surrounding white/surface sections, matching the "dark trust panel"
 * pattern in the GoFundMe homepage reference researched for this build.
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
      <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
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
