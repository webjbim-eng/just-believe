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
      emptyMessage="No upcoming events right now — subscribe and we'll let you know as soon as one is scheduled."
      emptyIcon={
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="5.5" width="16" height="14" rx="1.5" />
          <path d="M4 9.5h16M8 3.5v3M16 3.5v3" strokeLinecap="round" />
        </svg>
      }
      emptyCta={{ label: 'Get Notified', href: '#newsletter' }}
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
