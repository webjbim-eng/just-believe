import { getPayload } from 'payload'
import config from '@payload-config'
import { lexicalToPlainText } from '../lib/lexicalToPlainText'
import { ScrollReveal } from '../components/ScrollReveal'

export type MinistriesOverviewConfig = {
  heading?: string
  limit?: number
}

/**
 * Visual hierarchy, not eight identical cards (2026-08-08 creative
 * directive: "some ministries deserve more visual weight than others").
 * The first result (by `order`) becomes a large featured entry with its
 * full description; the rest are smaller supporting entries.
 */
export async function MinistriesOverview({ config: blockConfig, tenantId }: { config: MinistriesOverviewConfig; tenantId: string }) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'ministries',
    where: { tenant: { equals: tenantId } },
    sort: 'order',
    limit: blockConfig.limit ?? 8,
    overrideAccess: true,
  })

  const [featured, ...supporting] = docs

  return (
    <section className="section">
      <div className="container">
        <ScrollReveal>
          <h2 style={{ textAlign: 'center' }}>{blockConfig.heading || 'Our Ministries'}</h2>
          <hr className="heading-underline heading-underline--center" />
          {!featured ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Ministry pages are coming soon.</p>
          ) : (
            <>
              <div className="card" style={{ marginBottom: supporting.length > 0 ? '1.75rem' : 0, padding: '3rem' }}>
                <p className="card-eyebrow">Featured Ministry</p>
                <h3 style={{ fontSize: 'var(--text-heading)', marginBottom: '1rem' }}>{featured.name}</h3>
                {featured.description && <p style={{ fontSize: 'var(--text-body)', maxWidth: '48rem' }}>{lexicalToPlainText(featured.description)}</p>}
              </div>
              {supporting.length > 0 && (
                <div className="grid">
                  {supporting.map((ministry, index) => (
                    <ScrollReveal key={ministry.id} delay={index * 60}>
                      <div className="card">
                        <p className="card-eyebrow">Ministry</p>
                        <h3 className="card-title">{ministry.name}</h3>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </>
          )}
        </ScrollReveal>
      </div>
    </section>
  )
}
