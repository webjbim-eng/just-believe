import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../access/getResolvedTenantId'
import { ScrollReveal } from '../../../components/ScrollReveal'
import { Stagger, StaggerItem } from '../../../components/Stagger'
import { formatDaysOfWeek } from '../../../lib/formatDaysOfWeek'

export const metadata: Metadata = {
  title: 'Recurring Activities — Just Believe International Missions',
  description: 'Standing weekly ministry programs from Just Believe International Missions — join us every week.',
}

export default async function RecurringActivitiesPage() {
  const tenantId = (await headers()).get(TENANT_HEADER)

  const activities = tenantId
    ? (
        await getPayload({ config }).then((payload) =>
          payload.find({
            collection: 'recurring-activities',
            where: { and: [{ tenant: { equals: tenantId } }, { _status: { equals: 'published' } }] },
            sort: ['-featured', 'displayOrder'],
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
            <p className="section-eyebrow">Every Week</p>
            <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>
              Recurring <span className="text-accent">Activities</span>
            </h1>
            <hr className="heading-underline heading-underline--center" />
            <p style={{ fontSize: 'var(--text-subheading)' }}>Standing weekly programs — join us wherever you are.</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section decorative-flourish">
        <div className="container container--narrow">
          {activities.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Recurring activities are coming soon.</p>
          ) : (
            <Stagger role="list" className="service-list">
              {activities.map((activity) => {
                const ctaHref = activity.onlineMeetingUrl || activity.registrationUrl || activity.contactUrl || '/contact'
                const ctaIsExternal = Boolean(activity.onlineMeetingUrl || activity.registrationUrl)
                return (
                  <StaggerItem key={activity.id} role="listitem">
                    <div className="card" style={{ padding: 'var(--card-padding)' }}>
                      <h2 style={{ fontSize: 'var(--text-heading)', marginBottom: activity.language ? '0.375rem' : '0.75rem' }}>{activity.name}</h2>
                      {activity.language && (
                        <p className="card-eyebrow" style={{ marginBottom: '0.75rem' }}>
                          {activity.language}
                        </p>
                      )}
                      {activity.description && <p style={{ marginBottom: '1.25rem' }}>{activity.description}</p>}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                        {(activity.schedule || [])
                          .filter((entry) => entry.active !== false)
                          .map((entry, index) => (
                            <div key={index} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                              {(entry.audienceLabel || entry.label) && (
                                <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>{entry.audienceLabel || entry.label}</p>
                              )}
                              <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)' }}>{formatDaysOfWeek(entry.days || [])}</p>
                              <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)' }}>
                                {entry.startTime}
                                {entry.endTime ? ` – ${entry.endTime}` : ''} {entry.timezoneLabel}
                              </p>
                              {(entry.locationText || activity.locationText) && (
                                <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)' }}>{entry.locationText || activity.locationText}</p>
                              )}
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
          )}
        </div>
      </section>
    </main>
  )
}
