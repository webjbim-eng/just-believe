import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../../access/getResolvedTenantId'
import { ScrollReveal } from '../../../../components/ScrollReveal'
import { EventRegistrationForm } from '../../../../components/EventRegistrationForm'

const TYPE_LABELS: Record<string, string> = { 'in-person': 'In-Person', online: 'Online', hybrid: 'Hybrid' }

async function getEvent(slug: string) {
  const tenantId = (await headers()).get(TENANT_HEADER)
  if (!tenantId) return null

  const { docs } = await getPayload({ config }).then((payload) =>
    payload.find({
      collection: 'events',
      where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: slug } }, { _status: { equals: 'published' } }] },
      limit: 1,
      overrideAccess: true,
    }),
  )
  return docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)
  return { title: event ? `${event.title} — Just Believe International Missions` : 'Event — Just Believe International Missions' }
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) notFound()

  const start = new Date(event.startDate)
  const end = event.endDate ? new Date(event.endDate) : null
  const registrationClosed = event.registrationClose ? new Date(event.registrationClose) < new Date() : false
  const registrationNotYetOpen = event.registrationOpen ? new Date(event.registrationOpen) > new Date() : false
  const canRegister = !registrationClosed && !registrationNotYetOpen

  const registrationFields = (event.registrationFields || []).map((f) => ({
    label: f.label,
    fieldType: f.fieldType,
    options: f.options,
    required: f.required,
  }))

  return (
    <main>
      <article className="section">
        <div className="container container--narrow">
          <ScrollReveal>
            <p className="section-eyebrow">
              {TYPE_LABELS[event.type] || event.type}
              {event.location ? ` · ${event.location}` : ''}
            </p>
            <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>{event.title}</h1>
            <hr className="heading-underline" />

            <div className="card" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>
                {start.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)' }}>
                {start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                {end && ` – ${end.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`}
              </p>
              {event.speaker && <p style={{ margin: '0.75rem 0 0', color: 'var(--color-text-muted)' }}>Speaker: {event.speaker}</p>}
              {event.livestreamUrl && event.type !== 'in-person' && (
                <p style={{ margin: '0.75rem 0 0' }}>
                  <a href={event.livestreamUrl} className="btn-outline" target="_blank" rel="noopener noreferrer">
                    Watch Online
                  </a>
                </p>
              )}
            </div>

            <h2 style={{ fontSize: 'var(--text-heading)' }}>Register</h2>
            <hr className="heading-underline" />
            {!canRegister ? (
              <p style={{ color: 'var(--color-text-muted)' }}>
                {registrationNotYetOpen ? 'Registration opens soon.' : 'Registration for this event has closed.'}
              </p>
            ) : (
              <div className="card" style={{ padding: 'var(--card-padding)' }}>
                <EventRegistrationForm eventId={event.id} fields={registrationFields} />
              </div>
            )}

            <a className="btn-outline" href="/events" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
              ← Back to Events
            </a>
          </ScrollReveal>
        </div>
      </article>
    </main>
  )
}
