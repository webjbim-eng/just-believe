import { getPayload } from 'payload'
import config from '@payload-config'
import { CardGridSection } from './shared/CardGridSection'

export type TestimonialsConfig = {
  heading?: string
  limit?: number
}

/**
 * Testimonials doesn't use Payload's drafts/versions system — visibility
 * is its own custom status field (submitted/approved/published), and its
 * collection access already restricts anonymous reads to status=published
 * (see Testimonials.ts). This query runs with overrideAccess: true like
 * every other block, so the status filter has to be applied explicitly
 * here to keep that same restriction.
 */
export async function Testimonials({ config: blockConfig, tenantId }: { config: TestimonialsConfig; tenantId: string }) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'testimonials',
    where: { and: [{ tenant: { equals: tenantId } }, { status: { equals: 'published' } }] },
    limit: blockConfig.limit ?? 3,
    overrideAccess: true,
  })

  return (
    <CardGridSection
      heading={blockConfig.heading || 'What People Are Saying'}
      emptyMessage="Testimonials are coming soon."
      items={docs}
      renderItem={(testimonial) => (
        <div key={testimonial.id} className="card">
          <span className="quote-mark" aria-hidden="true">
            &ldquo;
          </span>
          <span className="avatar-circle">{testimonial.submitterName.charAt(0).toUpperCase()}</span>
          <p style={{ fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{testimonial.submitterName}</p>
        </div>
      )}
    />
  )
}
