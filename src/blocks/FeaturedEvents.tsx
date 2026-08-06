import { getPayload } from 'payload'
import config from '@payload-config'
import { CardGridSection } from './shared/CardGridSection'

export type FeaturedEventsConfig = {
  heading?: string
  limit?: number
}

export async function FeaturedEvents({ config: blockConfig, tenantId }: { config: FeaturedEventsConfig; tenantId: string }) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'events',
    where: { tenant: { equals: tenantId } },
    sort: 'startDate',
    limit: blockConfig.limit ?? 3,
    overrideAccess: true,
  })

  return (
    <CardGridSection
      heading={blockConfig.heading || 'Upcoming Events'}
      emptyMessage="No upcoming events right now — check back soon."
      items={docs}
      renderItem={(event) => (
        <div key={event.id} className="card">
          <p className="card-eyebrow">{event.type}</p>
          <h3 className="card-title">{event.title}</h3>
          <p className="card-meta">
            {[event.startDate ? new Date(event.startDate).toLocaleDateString() : null, event.location].filter(Boolean).join(' · ')}
          </p>
        </div>
      )}
    />
  )
}
