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
    <footer style={{ borderTop: '1px solid var(--color-border)', marginTop: '2rem' }}>
      <div className="container" style={{ padding: '3rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between' }}>
        {footer?.columns?.map((column, index) => (
          <div key={index}>
            <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{column.title}</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {column.links?.map((link, linkIndex) => (
                <li key={linkIndex} style={{ marginBottom: '0.5rem' }}>
                  <a href={link.url} style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {footer?.socialLinks && footer.socialLinks.length > 0 && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            {footer.socialLinks.map((social, index) => (
              <a key={index} href={social.url} style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                {social.platform}
              </a>
            ))}
          </div>
        )}
      </div>
      {footer?.copyrightText && (
        <div className="container" style={{ padding: '0 1.5rem 1.5rem', color: 'var(--color-text-muted)', fontSize: 'var(--text-body-sm)' }}>
          {footer.copyrightText}
        </div>
      )}
    </footer>
  )
}
