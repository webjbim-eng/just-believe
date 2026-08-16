import type { CollectionConfig } from 'payload'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { slugField } from '../fields/slug'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    group: 'Engagement',
    defaultColumns: ['title', 'type', 'startDate', '_status'],
  },
  versions: { drafts: true },
  access: publicContentAccess('events.manage'),
  hooks: {
    beforeChange: [setTenantFromRequest],
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
    { name: 'speaker', type: 'text' },
    { name: 'livestreamUrl', type: 'text', admin: { description: 'For online/hybrid events — external embed only, see docs/02-architecture.md §8' } },
    { name: 'capacity', type: 'number', admin: { description: 'Leave empty for uncapped — EventRegistrations only auto-waitlists once this is set (FR-EVT-06)' } },
    { name: 'registrationOpen', type: 'date' },
    { name: 'registrationClose', type: 'date' },
    { name: 'materials', type: 'relationship', relationTo: 'media', hasMany: true },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    {
      // 2026-08-16 (Jimmy's request): the public registration form always
      // collects name/email/phone (EventRegistrations.ts's fixed fields)
      // — this is for whatever ELSE a specific event needs to ask (t-shirt
      // size, dietary restrictions, session picks, ...), varying per
      // event, so it's admin-defined here rather than hardcoded anywhere.
      // Answers land in EventRegistrations.responses, keyed by `label`.
      name: 'registrationFields',
      type: 'array',
      admin: { description: 'Extra questions to ask at registration, beyond name/email/phone. Answers appear on each registration.' },
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'fieldType',
          type: 'select',
          required: true,
          defaultValue: 'text',
          options: [
            { label: 'Short Text', value: 'text' },
            { label: 'Long Text', value: 'textarea' },
            { label: 'Multiple Choice', value: 'select' },
            { label: 'Yes / No', value: 'checkbox' },
          ],
        },
        {
          name: 'options',
          type: 'text',
          admin: {
            description: 'Comma-separated choices — only used when Field Type is "Multiple Choice"',
            condition: (_, siblingData) => siblingData?.fieldType === 'select',
          },
        },
        { name: 'required', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}
