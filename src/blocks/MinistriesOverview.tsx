import { getPayload } from 'payload'
import config from '@payload-config'
import { CardGridSection } from './shared/CardGridSection'

export type MinistriesOverviewConfig = {
  heading?: string
  limit?: number
}

export async function MinistriesOverview({ config: blockConfig, tenantId }: { config: MinistriesOverviewConfig; tenantId: string }) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'ministries',
    where: { tenant: { equals: tenantId } },
    sort: 'order',
    limit: blockConfig.limit ?? 6,
    overrideAccess: true,
  })

  return (
    <CardGridSection
      heading={blockConfig.heading || 'Our Ministries'}
      emptyMessage="Ministry pages are coming soon."
      items={docs}
      renderItem={(ministry) => (
        <div key={ministry.id} className="card">
          <span className="avatar-circle">{ministry.name.charAt(0).toUpperCase()}</span>
          <p className="card-eyebrow">Ministry</p>
          <h3 className="card-title">{ministry.name}</h3>
        </div>
      )}
    />
  )
}
