import type { CollectionConfig } from 'payload'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { slugField } from '../fields/slug'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'type', 'startDate', '_status'],
  },
  versions: { drafts: true },
  access: publicContentAccess('events.manage'),
  hooks: {
    afterChange: [createAuditAfterChangeHook('events')],
    afterDelete: [createAuditAfterDeleteHook('events')],
  },
  fields: [
    tenantField,
    { name: 'title', type: 'text', required: true, localized: true },
    slugField('events'),
    {
      name: 'type',
      type: 'select',
      required: true,
      options: ['in-person', 'online', 'hybrid'],
    },
    { name: 'startDate', type: 'date', required: true },
    { name: 'endDate', type: 'date' },
    { name: 'location', type: 'text', admin: { description: 'For in-person/hybrid events' } },
    { name: 'livestreamUrl', type: 'text', admin: { description: 'For online/hybrid events — external embed only, see docs/02-architecture.md §8' } },
    { name: 'capacity', type: 'number', admin: { description: 'Leave empty for uncapped — EventRegistrations only auto-waitlists once this is set (FR-EVT-06)' } },
    { name: 'registrationOpen', type: 'date' },
    { name: 'registrationClose', type: 'date' },
    { name: 'materials', type: 'relationship', relationTo: 'media', hasMany: true },
  ],
}
