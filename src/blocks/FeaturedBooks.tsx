import { getPayload } from 'payload'
import config from '@payload-config'
import { CardGridSection } from './shared/CardGridSection'

export type FeaturedBooksConfig = {
  heading?: string
  limit?: number
}

export async function FeaturedBooks({ config: blockConfig, tenantId }: { config: FeaturedBooksConfig; tenantId: string }) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'books',
    where: { tenant: { equals: tenantId } },
    limit: blockConfig.limit ?? 3,
    overrideAccess: true,
  })

  return (
    <CardGridSection
      heading={blockConfig.heading || 'Books'}
      emptyMessage="Books are coming soon."
      items={docs}
      renderItem={(book) => (
        <div key={book.id} className="card">
          <p className="card-eyebrow">Book</p>
          <h3 className="card-title">{book.title}</h3>
        </div>
      )}
    />
  )
}
