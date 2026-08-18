import { getPayload } from 'payload'
import config from '@payload-config'
import { ScrollReveal } from '../components/ScrollReveal'
import { Stagger, StaggerItem } from '../components/Stagger'

export type FeaturedEventsConfig = {
  eyebrow?: string
  heading?: string
  body?: string
  limit?: number
}

/**
 * 2026-08-10: rebuilt as its own dark Royal Blue panel — the reference's
 * "Pilgrimage of Faith" section (photo + month-badge event list + one
 * gold CTA, the site's single deliberate gold-button moment).
 * 2026-08-16: /events + /events/[slug] now exist (real listing + real
 * registration form) — CTAs point there instead of the newsletter anchor
 * they used as a placeholder before that page existed.
 * 2026-08-16: standing weekly programs (Sunday Service, Prayer &
 * Intercession, ...) live in their own RecurringActivities block/page
 * instead of here — they don't have a startDate and never need
 * registration, which doesn't fit this block's Events query.
 * 2026-08-17: photo+list-rows -> a plain 3-card event grid (docs/
 * index.html) — no photo config anymore. Date badge reuses
 * .event-list-row-date/-month/-day verbatim from the /events listing
 * page (src/app/(public)/events/page.tsx) rather than inventing new CSS
 * for the same "month + day" badge shape.
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
        <ScrollReveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div>
              {blockConfig.eyebrow && <p className="section-eyebrow">{blockConfig.eyebrow}</p>}
              <h2 style={{ margin: 0, color: '#fff' }}>{blockConfig.heading || 'Upcoming Events'}</h2>
              {blockConfig.body && <p style={{ margin: '0.75rem 0 0', color: 'var(--color-text-muted-on-dark)', maxWidth: '34rem' }}>{blockConfig.body}</p>}
            </div>
            {docs.length > 0 && (
              <a className="btn-outline" href="/events">
                See All Events
              </a>
            )}
          </div>
        </ScrollReveal>

        {docs.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted-on-dark)' }}>
            No upcoming events right now — subscribe and we&rsquo;ll let you know as soon as one is scheduled.
          </p>
        ) : (
          <Stagger className="event-card-grid" role="list">
            {docs.map((event) => {
              const start = new Date(event.startDate)
              return (
                <StaggerItem key={event.id} role="listitem">
                  <a href={`/events/${event.slug}`} className="card" style={{ display: 'block', textDecoration: 'none' }}>
                    <div className="event-date-strip">
                      <span className="event-date-strip-day">{start.getDate()}</span>
                      <span className="event-date-strip-month">{start.toLocaleDateString(undefined, { month: 'short' })}</span>
                    </div>
                    <p className="card-title" style={{ margin: 0, fontSize: 'var(--text-heading-sm)' }}>
                      {event.title}
                    </p>
                    {event.location && <p style={{ margin: '0.5rem 0 0', fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>{event.location}</p>}
                  </a>
                </StaggerItem>
              )
            })}
          </Stagger>
        )}
      </div>
    </section>
  )
}
