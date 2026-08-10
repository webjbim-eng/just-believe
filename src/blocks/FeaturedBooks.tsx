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
      emptyMessage="Books and resources are coming soon."
      emptyIcon={
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 4.5h6a2 2 0 0 1 2 2v13a1.5 1.5 0 0 0-1.5-1.5H5V4.5zM19 4.5h-6a2 2 0 0 0-2 2v13a1.5 1.5 0 0 1 1.5-1.5H19V4.5z" strokeLinejoin="round" />
        </svg>
      }
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
