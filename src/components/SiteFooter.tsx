import { getPayload } from 'payload'
import config from '@payload-config'

export async function SiteFooter({ tenantId }: { tenantId: string }) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'footer',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    overrideAccess: true,
  })
  const footer = docs[0]

  return (
    <footer style={{ background: 'var(--color-primary)', color: 'rgba(255,255,255,0.85)', marginTop: '2rem' }}>
      <div className="container" style={{ padding: '4rem 1.5rem 2rem', display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'space-between' }}>
        <div style={{ maxWidth: '20rem' }}>
          <p style={{ fontFamily: 'var(--font-heading), Georgia, serif', fontWeight: 700, fontSize: '1.25rem', color: '#fff', margin: '0 0 0.75rem' }}>
            Just Believe International Missions
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-body-sm)' }}>
            Proclaiming the Gospel, equipping believers, and serving communities around the world.
          </p>
        </div>
        {footer?.columns?.map((column, index) => (
          <div key={index}>
            <p style={{ fontWeight: 600, color: '#fff', margin: '0 0 0.75rem' }}>{column.title}</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {column.links?.map((link, linkIndex) => (
                <li key={linkIndex} style={{ marginBottom: '0.5rem' }}>
                  <a href={link.url} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {footer?.socialLinks && footer.socialLinks.length > 0 && (
          <div>
            <p style={{ fontWeight: 600, color: '#fff', margin: '0 0 0.75rem' }}>Connect</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {footer.socialLinks.map((social, index) => (
                <a key={index} href={social.url} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', textTransform: 'capitalize' }}>
                  {social.platform}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      {footer?.copyrightText && (
        <div
          className="container"
          style={{
            padding: '1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.875rem',
            marginTop: '1rem',
          }}
        >
          {footer.copyrightText}
        </div>
      )}
    </footer>
  )
}
