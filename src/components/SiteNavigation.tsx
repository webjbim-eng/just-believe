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
    <header style={{ borderBottom: '1px solid var(--color-border)' }}>
      <nav className="container" style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.25rem 1.5rem' }}>
        <a href="/" style={{ fontFamily: 'var(--font-heading), Georgia, serif', fontWeight: 700, textDecoration: 'none', color: 'var(--color-text)' }}>
          Just Believe International Missions
        </a>
        {items.length > 0 && (
          <ul style={{ display: 'flex', gap: '1.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
            {items.map((item, index) => (
              <li key={index}>
                <a href={item.link} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  )
}
