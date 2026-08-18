import { getPayload } from 'payload'
import config from '@payload-config'
import { ScrollReveal } from '../components/ScrollReveal'
import { Stagger, StaggerItem } from '../components/Stagger'
import { formatDaysOfWeek } from '../lib/formatDaysOfWeek'

export type RecurringActivitiesConfig = {
  eyebrow?: string
  heading?: string
  body?: string
  limit?: number
}

/**
 * 2026-08-16 (Jimmy's request): homepage teaser for standing weekly
 * programs (Children's Bible Institute, Word and Worship Encounter,
 * Prayer & Intercession, ...) — its own section/page, not merged into
 * Events (see RecurringActivities.ts collection comment). Shows every
 * activity's schedule entries compactly; the full breakdown lives on
 * /recurring-activities.
 */
export async function RecurringActivities({ config: blockConfig, tenantId }: { config: RecurringActivitiesConfig; tenantId: string }) {
  const payload = await getPayload({ config })
  const { docs: activities } = await payload.find({
    collection: 'recurring-activities',
    where: { and: [{ tenant: { equals: tenantId } }, { _status: { equals: 'published' } }] },
    sort: ['-featured', 'displayOrder'],
    limit: blockConfig.limit ?? 4,
    overrideAccess: true,
  })

  if (activities.length === 0) return null

  return (
    <section className="section decorative-flourish">
      <div className="container">
        <ScrollReveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div>
              {blockConfig.eyebrow && <p className="section-eyebrow">{blockConfig.eyebrow}</p>}
              <h2 style={{ margin: 0 }}>{blockConfig.heading || 'Recurring Activities'}</h2>
              {blockConfig.body && <p style={{ margin: '0.75rem 0 0', maxWidth: '34rem' }}>{blockConfig.body}</p>}
            </div>
            <a className="btn-primary-pill" href="/recurring-activities">
              View All Activities
            </a>
          </div>
        </ScrollReveal>

        <Stagger role="list" className="activity-grid">
          {activities.map((activity) => {
            // A single CTA per activity, labeled by contactText regardless
            // of which link backs it — real examples mix "Contact us for
            // more details" (no link, just /contact) with "Join and follow
            // us on YouTube" (the online link itself), so contactText is
            // the generic CTA label, not strictly "get in touch" copy.
            const ctaHref = activity.onlineMeetingUrl || activity.registrationUrl || activity.contactUrl || '/contact'
            const ctaIsExternal = Boolean(activity.onlineMeetingUrl || activity.registrationUrl)
            return (
              <StaggerItem key={activity.id} role="listitem">
                <div className="card activity-card" style={{ padding: 'var(--card-padding)' }}>
                  <p className="card-title" style={{ margin: '0 0 0.25rem' }}>
                    {activity.name}
                  </p>
                  {activity.shortDescription && <p style={{ margin: '0 0 0.75rem', color: 'var(--color-text-muted)' }}>{activity.shortDescription}</p>}
                  <div className="activity-schedule">
                    {(activity.schedule || [])
                      .filter((entry) => entry.active !== false)
                      .map((entry, index) => (
                        <div key={index} className="activity-schedule-row">
                          <span className="activity-schedule-row-label">{entry.audienceLabel || entry.label}</span>
                          <span className="activity-schedule-row-value">
                            {formatDaysOfWeek(entry.days || [])} · {entry.startTime}
                            {entry.endTime ? `–${entry.endTime}` : ''} {entry.timezoneLabel}
                          </span>
                        </div>
                      ))}
                  </div>
                  {activity.contactText && (
                    <a className="btn-accent" href={ctaHref} {...(ctaIsExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                      {activity.contactText}
                    </a>
                  )}
                </div>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
