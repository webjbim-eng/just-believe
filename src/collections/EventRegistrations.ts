import type { CollectionConfig } from 'payload'
import { submissionAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

export const EventRegistrations: CollectionConfig = {
  slug: 'event-registrations',
  admin: {
    useAsTitle: 'name',
    group: 'Engagement',
    defaultColumns: ['name', 'event', 'registeredAt', 'waitlisted'],
  },
  access: submissionAccess('events.registrations.view', 'events.manage'),
  hooks: {
    // Auto-waitlist once the event's capacity is reached (FR-EVT-06) — the
    // submitter never sets this themselves, so it belongs in beforeChange,
    // not as a client-suppliable field.
    beforeChange: [
      setTenantFromRequest,
      async ({ data, req, operation }) => {
        if (operation !== 'create' || !data.event) return data

        const event = await req.payload.findByID({ collection: 'events', id: data.event, req })
        if (!event?.capacity) return data

        const { totalDocs: confirmedCount } = await req.payload.find({
          collection: 'event-registrations',
          where: { and: [{ event: { equals: data.event } }, { waitlisted: { equals: false } }] },
          limit: 0,
          req,
        })

        data.waitlisted = confirmedCount >= event.capacity
        return data
      },
    ],
    afterChange: [createAuditAfterChangeHook('event-registrations')],
    afterDelete: [createAuditAfterDeleteHook('event-registrations')],
  },
  fields: [
    tenantField,
    { name: 'event', type: 'relationship', relationTo: 'events', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    { name: 'registeredAt', type: 'date', defaultValue: () => new Date().toISOString(), admin: { readOnly: true } },
    { name: 'checkedIn', type: 'checkbox', defaultValue: false },
    {
      name: 'waitlisted',
      type: 'checkbox',
      defaultValue: false,
      admin: { readOnly: true, description: 'Set automatically once event.capacity is reached (FR-EVT-06)' },
    },
  ],
}
