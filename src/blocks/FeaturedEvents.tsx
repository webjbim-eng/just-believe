import { getPayload } from 'payload'
import config from '@payload-config'
import { ScrollReveal } from '../components/ScrollReveal'

export type FeaturedEventsConfig = {
  eyebrow?: string
  heading?: string
  body?: string
  image?: string
  limit?: number
}

/**
 * 2026-08-10: rebuilt as its own dark Royal Blue panel — the reference's
 * "Pilgrimage of Faith" section (photo + month-badge event list + one
 * gold CTA, the site's single deliberate gold-button moment).
 * 2026-08-16: /events + /events/[slug] now exist (real listing + real
 * registration form) — CTAs point there instead of the newsletter anchor
 * they used as a placeholder before that page existed.
 */
export async function FeaturedEvents({ config: blockConfig, tenantId }: { config: FeaturedEventsConfig; tenantId: string }) {
  const payload = await getPayload({ config })
  // This block runs with overrideAccess: true like every other block, so
  // the "only real, published, upcoming events" filter — which Events'
  // own drafts/versions system would otherwise enforce — has to be
  // re-applied explicitly here (2026-08-16 fix: was unfiltered, meaning
  // drafts and past events could leak onto the homepage).
  const { docs } = await payload.find({
    collection: 'events',
    where: {
      and: [
        { tenant: { equals: tenantId } },
        { _status: { equals: 'published' } },
        { startDate: { greater_than_equal: new Date().toISOString() } },
      ],
    },
    sort: 'startDate',
    limit: blockConfig.limit ?? 3,
    overrideAccess: true,
  })

  return (
    <section id="events" className="section decorative-flourish" style={{ background: 'var(--color-primary)' }}>
      <div className="container">
        <div className="split-layout">
          {blockConfig.image && (
            <ScrollReveal className="split-layout-media">
              <div
                style={{
                  borderRadius: 'var(--radius-card)',
                  overflow: 'hidden',
                  aspectRatio: '1 / 1',
                  backgroundImage: `url(${blockConfig.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  boxShadow: 'var(--shadow-card-lg)',
                }}
              />
            </ScrollReveal>
          )}
          <ScrollReveal delay={100}>
            <div>
              {blockConfig.eyebrow && <p className="section-eyebrow">{blockConfig.eyebrow}</p>}
              <h2 style={{ color: '#fff' }}>{blockConfig.heading || 'Upcoming Events'}</h2>
              {blockConfig.body && <p style={{ color: 'var(--color-text-muted-on-dark)', marginBottom: '1.5rem' }}>{blockConfig.body}</p>}

              {docs.length === 0 ? (
                <>
                  <p style={{ color: 'var(--color-text-muted-on-dark)' }}>
                    No upcoming events right now — subscribe and we&rsquo;ll let you know as soon as one is scheduled.
                  </p>
                  <a className="btn-outline" href="#newsletter" style={{ marginTop: '0.5rem' }}>
                    Get Notified
                  </a>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '2rem' }}>
                    {docs.map((event) => (
                      <a key={event.id} href={`/events/${event.slug}`} className="event-row" style={{ textDecoration: 'none' }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-heading), Georgia, serif', fontSize: 'var(--text-heading-sm)' }}>
                            {event.title}
                          </p>
                          {event.location && <p style={{ margin: 0, color: 'var(--color-text-muted-on-dark)', fontSize: 'var(--text-body-sm)' }}>{event.location}</p>}
                        </div>
                        {event.startDate && (
                          <span className="event-row-month">
                            {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short' })}
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                  <a className="btn-accent" href="/events">
                    Find Out More
                  </a>
                </>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
