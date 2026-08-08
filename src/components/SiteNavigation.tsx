import { getPayload } from 'payload'
import config from '@payload-config'

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
    <header style={{ background: 'var(--color-base)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 10 }}>
      <nav className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', padding: '1.25rem 1.5rem' }}>
        <a
          href="/"
          style={{
            fontFamily: 'var(--font-heading), Georgia, serif',
            fontWeight: 700,
            fontSize: '1.25rem',
            textDecoration: 'none',
            color: 'var(--color-text)',
          }}
        >
          Just Believe International Missions
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {items.length > 0 && (
            <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
              {items.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.link}
                    style={{ textDecoration: 'none', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: 'var(--text-body-sm)' }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <a className="btn-accent" href="/contact" style={{ padding: '0.625rem 1.5rem' }}>
            Partner With Us
          </a>
        </div>
      </nav>
    </header>
  )
}
