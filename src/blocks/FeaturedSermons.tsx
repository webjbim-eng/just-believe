import { getPayload } from 'payload'
import config from '@payload-config'
import { CardGridSection } from './shared/CardGridSection'

export type FeaturedSermonsConfig = {
  heading?: string
  limit?: number
}

export async function FeaturedSermons({ config: blockConfig, tenantId }: { config: FeaturedSermonsConfig; tenantId: string }) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'sermons',
    where: { tenant: { equals: tenantId } },
    sort: '-date',
    limit: blockConfig.limit ?? 3,
    overrideAccess: true,
  })

  return (
    <CardGridSection
      heading={blockConfig.heading || 'Recent Sermons'}
      emptyMessage="Sermons are coming soon."
      items={docs}
      renderItem={(sermon) => (
        <div key={sermon.id} className="card">
          <p className="card-eyebrow">{sermon.type}</p>
          <h3 className="card-title">{sermon.title}</h3>
          <p className="card-meta">
            {[sermon.speaker, sermon.date ? new Date(sermon.date).toLocaleDateString() : null].filter(Boolean).join(' · ')}
          </p>
        </div>
      )}
    />
  )
}
