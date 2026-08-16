import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../access/getResolvedTenantId'
import { lexicalToPlainText } from '../../../lib/lexicalToPlainText'
import { ScrollReveal } from '../../../components/ScrollReveal'
import { Stagger, StaggerItem } from '../../../components/Stagger'
import { TestimonialForm } from '../../../components/TestimonialForm'

export const metadata: Metadata = {
  title: 'Testimonials — Just Believe International Missions',
  description: 'Real stories of transformation from the Just Believe International Missions community.',
}

export default async function TestimonialsPage() {
  const tenantId = (await headers()).get(TENANT_HEADER)

  // Testimonials doesn't use Payload's drafts system — visibility is its
  // own status field (submitted/approved/published), and its access
  // control already restricts anonymous reads to status=published. This
  // query runs with overrideAccess: true like every other server-rendered
  // page, so that filter has to be re-applied explicitly here — same
  // pattern src/blocks/Testimonials.tsx already establishes.
  const published = tenantId
    ? (
        await getPayload({ config }).then((payload) =>
          payload.find({
            collection: 'testimonials',
            where: { and: [{ tenant: { equals: tenantId } }, { status: { equals: 'published' } }] },
            sort: '-updatedAt',
            limit: 50,
            overrideAccess: true,
          }),
        )
      ).docs
    : []

  return (
    <main>
      <section className="section" style={{ paddingBottom: 0, textAlign: 'center' }}>
        <div className="container container--narrow">
          <ScrollReveal>
            <p className="section-eyebrow">Changed Lives</p>
            <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>
              What People Are <span className="text-accent">Saying</span>
            </h1>
            <hr className="heading-underline heading-underline--center" />
            <p style={{ fontSize: 'var(--text-subheading)' }}>Real stories of how God is at work through this ministry.</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section decorative-flourish">
        <div className="container">
          {published.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', maxWidth: '32rem', margin: '0 auto' }}>
              Testimonials are coming soon. Has JBIM impacted your life? Share your story below.
            </p>
          ) : (
            <Stagger className="photo-caption-grid-2" role="list">
              {published.map((testimonial) => (
                <StaggerItem key={testimonial.id} role="listitem">
                  <div className="card card--tactile" style={{ padding: '2.5rem', height: '100%' }}>
                    <span className="quote-mark" aria-hidden="true">
                      &ldquo;
                    </span>
                    <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-text)', marginBottom: '1.5rem' }}>
                      {lexicalToPlainText(testimonial.content)}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="avatar-circle" style={{ marginBottom: 0 }}>
                        {testimonial.submitterName.charAt(0).toUpperCase()}
                      </span>
                      <p style={{ fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{testimonial.submitterName}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>

      <section className="section section--surface">
        <div className="container container--narrow">
          <ScrollReveal>
            <h2 style={{ textAlign: 'center' }}>
              Share Your <span className="text-accent">Story</span>
            </h2>
            <hr className="heading-underline heading-underline--center" />
            <div className="card" style={{ padding: 'var(--card-padding)', marginTop: '2rem' }}>
              <TestimonialForm />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
