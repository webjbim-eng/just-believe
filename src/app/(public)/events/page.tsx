import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../access/getResolvedTenantId'
import { ScrollReveal } from '../../../components/ScrollReveal'
import { Stagger, StaggerItem } from '../../../components/Stagger'

export const metadata: Metadata = {
  title: 'Events — Just Believe International Missions',
  description: 'Upcoming events from Just Believe International Missions — join us to worship, learn, and grow together.',
}

const TYPE_LABELS: Record<string, string> = { 'in-person': 'In-Person', online: 'Online', hybrid: 'Hybrid' }

export default async function EventsPage() {
  const tenantId = (await headers()).get(TENANT_HEADER)

  const payload = tenantId ? await getPayload({ config }) : null

  const events = payload
    ? (
        await payload.find({
          collection: 'events',
          where: {
            and: [
              { tenant: { equals: tenantId } },
              { _status: { equals: 'published' } },
              { startDate: { greater_than_equal: new Date().toISOString() } },
            ],
          },
          sort: 'startDate',
          limit: 50,
          overrideAccess: true,
        })
      ).docs
    : []

  const recurringServices = payload
    ? (
        await payload.find({
          collection: 'recurring-services',
          where: { and: [{ tenant: { equals: tenantId } }, { _status: { equals: 'published' } }] },
          sort: 'displayOrder',
          overrideAccess: true,
        })
      ).docs
    : []

  return (
    <main>
      <section className="section" style={{ paddingBottom: 0, textAlign: 'center' }}>
        <div className="container container--narrow">
          <ScrollReveal>
            <p className="section-eyebrow">Join Us</p>
            <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>
              Upcoming <span className="text-accent">Events</span>
            </h1>
            <hr className="heading-underline heading-underline--center" />
          </ScrollReveal>
        </div>
      </section>

      {recurringServices.length > 0 && (
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="container container--narrow">
            <ScrollReveal>
              <p className="section-eyebrow">Every Week</p>
              <h2 style={{ marginBottom: '1.5rem' }}>Join a Service</h2>
            </ScrollReveal>
            <Stagger role="list" className="service-list">
              {recurringServices.map((service) => (
                <StaggerItem key={service.id} role="listitem">
                  <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0 }}>
                      <p className="card-title" style={{ margin: 0 }}>
                        {service.name}
                      </p>
                      <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)' }}>{service.schedule}</p>
                      {service.description && <p style={{ margin: '0.5rem 0 0' }}>{service.description}</p>}
                    </div>
                    {service.joinLink && (
                      <a className="btn-accent" href={service.joinLink} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                        {service.joinLabel || 'Join Live'}
                      </a>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <section className="section decorative-flourish">
        <div className="container container--narrow">
          {recurringServices.length > 0 && <h2 style={{ marginBottom: '1.5rem' }}>Upcoming Events</h2>}
          {events.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No upcoming events right now — check back soon.</p>
          ) : (
            <Stagger role="list" className="event-list-page">
              {events.map((event) => {
                const start = new Date(event.startDate)
                return (
                  <StaggerItem key={event.id} role="listitem">
                    <a href={`/events/${event.slug}`} className="event-list-row">
                      <div className="event-list-row-date">
                        <span className="event-list-row-date-month">{start.toLocaleDateString(undefined, { month: 'short' })}</span>
                        <span className="event-list-row-date-day">{start.getDate()}</span>
                      </div>
                      <div className="event-list-row-body">
                        <p className="card-eyebrow" style={{ marginBottom: '0.25rem' }}>
                          {TYPE_LABELS[event.type] || event.type}
                          {event.location ? ` · ${event.location}` : ''}
                        </p>
                        <h3 className="card-title" style={{ margin: 0 }}>
                          {event.title}
                        </h3>
                      </div>
                      <span className="link-arrow">
                        Register <span className="link-arrow-glyph">→</span>
                      </span>
                    </a>
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
