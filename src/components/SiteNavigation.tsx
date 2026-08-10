import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@payload-config'
import { MobileNavToggle } from './MobileNavToggle'

/**
 * Premium, calm header (2026-08-08 creative directive): a thin
 * announcement strip above the main bar, the real logo mark (not just a
 * text wordmark), a single unmissable "Partner With Us" CTA, and a real
 * mobile nav (hamburger + dropdown, not an overflowing link row) — see
 * globals.css's .desktop-nav-links/.mobile-nav-toggle breakpoint rules.
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
      <div
        style={{
          background: 'var(--color-secondary)',
          padding: '0.5rem 1.5rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          letterSpacing: '0.03em',
          color: 'rgba(255,255,255,0.85)',
        }}
      >
        Hub of Transformation — proclaiming the Gospel, equipping believers, serving communities worldwide
      </div>
      <div
        style={{
          background: 'rgba(11,23,48,0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--color-border-on-dark)',
          position: 'relative',
        }}
      >
        <nav
          className="container"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', padding: '0.875rem 1.5rem' }}
        >
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <Image
              src="/brand/jbim-logo-white.png"
              alt="Just Believe International Missions"
              width={44}
              height={44}
              style={{ objectFit: 'contain', height: 44, width: 'auto' }}
              priority
            />
            <span
              className="nav-wordmark"
              style={{
                fontFamily: 'var(--font-heading), Georgia, serif',
                fontWeight: 700,
                fontSize: '1.125rem',
                color: 'var(--color-text-on-dark)',
                lineHeight: 1.15,
              }}
            >
              Just Believe
              <br />
              International Missions
            </span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.25rem' }}>
            {items.length > 0 && (
              <ul className="desktop-nav-links" style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
                {items.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.link}
                      style={{
                        textDecoration: 'none',
                        color: 'var(--color-text-muted-on-dark)',
                        fontWeight: 500,
                        fontSize: 'var(--text-body-sm)',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <a className="btn-accent nav-cta" href="/contact" style={{ padding: '0.625rem 1.5rem' }}>
              Partner With Us
            </a>
            <MobileNavToggle items={items.map((item) => ({ label: item.label, link: item.link }))} />
          </div>
        </nav>
      </div>
    </header>
  )
}
