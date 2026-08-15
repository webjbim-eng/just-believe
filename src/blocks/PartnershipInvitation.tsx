import { ScrollReveal } from '../components/ScrollReveal'

export type PartnershipInvitationWay = {
  label: string
  description: string
}

export type PartnershipInvitationConfig = {
  heading: string
  body?: string
  ctaLabel: string
  ctaHref: string
  /** Path under /public. Optional — falls back to a flat Indigo panel when unset. */
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
 * Same shape as CTA but on a filled Indigo background (or a real photo with
 * an ink-to-indigo scrim, when config.backgroundImage is set) with white
 * text — a deliberate dark panel for visual rhythm against the surrounding
 * white/surface sections. Indigo (--color-secondary) rather than Ink
 * (--color-primary) specifically so this panel reads as visually distinct
 * from MinistryFeatureGrid's dark-numbered "Our Ministries" panel directly
 * above it on the homepage (2026-08-11) — two consecutive identical-black
 * panels would blur together.
 *
 * `ways` renders as a 2x2 grid with icon circles (2026-08-11 redesign,
 * matching the homepage mockup) — stays informational (four real fund
 * designations, matching Donations.ts's `fund` enum) rather than four
 * separate payment buttons; the single real CTA below routes to /give
 * (docs/02-architecture.md §6), where the donor actually picks the fund.
 */
const WAY_ICONS = [
  // Tithe (was General Fund — 2026-08-12 rename, see Donations.ts)
  <svg key="tithe" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3v18M6 7.5c0-1.5 1.5-2.5 3-2.5h6c1.5 0 3 1 3 2.5S16.5 10 15 10H9c-1.5 0-3 1-3 2.5S7.5 15 9 15h6c1.5 0 3 1 3 2.5S16.5 20 15 20H6" strokeLinecap="round" />
  </svg>,
  // Mission Projects
  <svg key="mission" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 3.5v17M3.5 12h17" />
  </svg>,
  // Child Sponsorship
  <svg key="child" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" strokeLinecap="round" />
  </svg>,
  // Offering (was Special Campaign)
  <svg key="offering" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 4.5l2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7L12 4.5z" strokeLinejoin="round" />
  </svg>,
]

export function PartnershipInvitation({ config }: { config: PartnershipInvitationConfig }) {
  const hasImage = Boolean(config.backgroundImage)

  return (
    <section
      className="section"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: hasImage ? undefined : 'var(--color-secondary)',
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
              background: 'linear-gradient(180deg, rgba(16,24,46,0.88) 0%, rgba(35,44,85,0.9) 100%)',
              zIndex: 1,
            }}
          />
        </>
      )}
      <ScrollReveal>
        <div className="container container--narrow" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <p className="section-eyebrow">Giving</p>
          <h2 style={{ color: '#fff' }}>{config.heading}</h2>
          {config.body && (
            <p style={{ maxWidth: '36rem', margin: '0 auto 2rem', color: 'rgba(255,255,255,0.85)' }}>{config.body}</p>
          )}

          {config.ways && config.ways.length > 0 && (
            <div
              className="photo-caption-grid-2"
              style={{
                textAlign: 'left',
                marginBottom: '2.5rem',
                gap: 0,
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 'var(--radius-card)',
                overflow: 'hidden',
              }}
            >
              {config.ways.map((way, index) => (
                <div
                  key={way.label}
                  style={{
                    padding: '1.75rem',
                    borderRight: index % 2 === 0 ? '1px solid rgba(255,255,255,0.18)' : 'none',
                    borderBottom: index < config.ways!.length - 2 ? '1px solid rgba(255,255,255,0.18)' : 'none',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '2.75rem',
                      height: '2.75rem',
                      borderRadius: '50%',
                      border: '1px solid var(--color-accent)',
                      color: 'var(--color-accent)',
                      marginBottom: '0.875rem',
                    }}
                  >
                    {WAY_ICONS[index % WAY_ICONS.length]}
                  </span>
                  <p style={{ color: '#fff', fontWeight: 600, fontFamily: 'var(--font-heading), Georgia, serif', margin: '0 0 0.375rem' }}>{way.label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: 'var(--text-body-sm)' }}>{way.description}</p>
                </div>
              ))}
            </div>
          )}

          <a className="btn-accent" href={config.ctaHref}>
            {config.ctaLabel}
          </a>
        </div>
      </ScrollReveal>
    </section>
  )
}
