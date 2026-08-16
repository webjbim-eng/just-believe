import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@payload-config'
import { AnnouncementBar } from './AnnouncementBar'
import { MobileNavToggle } from './MobileNavToggle'

/**
 * 2026-08-11 redesign (public/brand/*.html mockups): the main bar flips
 * from a dark navy fill to a light, translucent "dawn" fill with blur —
 * so the logo switches to the black/dark lockup (jbim-logo-black.png,
 * previously only used in the footer/admin contexts) and nav text switches
 * from the `-on-dark` token set to the normal light-background one. The
 * announcement strip above it stays dark (var(--color-primary)) with a
 * bold gold lead-in, now dismissible via AnnouncementBar. Real logo/
 * favicon are unchanged — only the mockups' circular compass mark was
 * skipped, per Jimmy's explicit instruction to keep the current brand mark.
 */
export async function SiteNavigation({ tenantId }: { tenantId: string }) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'navigation',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    overrideAccess: true,
  })
  const items = docs[0]?.items ?? []

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 20 }}>
      <AnnouncementBar>
        <strong style={{ color: 'var(--color-accent-hover)', fontWeight: 600 }}>Hub of Transformation</strong> — proclaiming the
        Gospel, equipping believers, serving communities worldwide
      </AnnouncementBar>
      <div
        style={{
          background: 'var(--color-header-bg)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--color-border)',
          position: 'relative',
        }}
      >
        <nav
          className="container"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', padding: '0.875rem 1.5rem' }}
        >
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            {/* Header background is theme-aware (--color-header-bg: light dawn
                in light mode, dark navy in dark mode) — the dark logo mark
                would vanish against a dark header, so both marks render and
                CSS (.logo-mark-light/.logo-mark-dark in globals.css) shows
                only the one that reads correctly for the active theme. */}
            <Image
              src="/brand/jbim-logo-black.png"
              alt="Just Believe International Missions"
              width={44}
              height={44}
              className="logo-mark-light"
              style={{ objectFit: 'contain', height: 44, width: 'auto' }}
              priority
            />
            <Image
              src="/brand/jbim-logo-white.png"
              alt="Just Believe International Missions"
              width={44}
              height={44}
              className="logo-mark-dark"
              style={{ objectFit: 'contain', height: 44, width: 'auto' }}
              priority
            />
            <span className="nav-wordmark" style={{ lineHeight: 1.15 }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-heading), Georgia, serif',
                  fontWeight: 600,
                  fontSize: '1.02rem',
                  color: 'var(--color-text)',
                }}
              >
                Just Believe
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body), system-ui, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.62rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-accent)',
                }}
              >
                International Missions
              </span>
            </span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            {items.length > 0 && (
              <ul className="desktop-nav-links" style={{ display: 'flex', gap: '1.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
                {items.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.link}
                      style={{
                        textDecoration: 'none',
                        color: 'var(--color-text-muted)',
                        fontWeight: 500,
                        fontSize: 'var(--text-body-sm)',
                        letterSpacing: '0.01em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <a className="btn-accent nav-cta" href="/give" style={{ padding: '0.625rem 1.5rem' }}>
              Partner With Us
            </a>
            <MobileNavToggle items={items.map((item) => ({ label: item.label, link: item.link }))} />
          </div>
        </nav>
      </div>
    </header>
  )
}
