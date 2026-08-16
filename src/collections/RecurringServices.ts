import type { CollectionConfig } from 'payload'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * 2026-08-16 (Jimmy's request): standing weekly services (Sunday Service,
 * Midweek Service, ...) — distinct from Events, which models one-off
 * dated occasions with optional registration. A recurring service has no
 * single date, never requires registration, and its whole purpose is a
 * "join us" link (livestream/Zoom/YouTube) — forcing that through Events'
 * required `startDate` + always-on registration flow would be modeling it
 * as the wrong shape of thing. Reuses events.manage (same person manages
 * both) rather than a new permission key.
 */
export const RecurringServices: CollectionConfig = {
  slug: 'recurring-services',
  labels: { singular: 'Recurring Service', plural: 'Recurring Services' },
  admin: {
    useAsTitle: 'name',
    group: 'Engagement',
    defaultColumns: ['name', 'schedule', '_status'],
  },
  versions: { drafts: true },
  access: publicContentAccess('events.manage'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('recurring-services')],
    afterDelete: [createAuditAfterDeleteHook('recurring-services')],
  },
  fields: [
    tenantField,
    { name: 'name', type: 'text', required: true, localized: true, admin: { description: 'e.g. "Sunday Service", "Midweek Service"' } },
    { name: 'schedule', type: 'text', required: true, admin: { description: 'e.g. "Sundays · 10:00 AM" or "Wednesdays · 6:30 PM"' } },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'joinLabel', type: 'text', defaultValue: 'Join Live', admin: { description: 'Button text, e.g. "Join Live", "Watch on YouTube"' } },
    { name: 'joinLink', type: 'text', admin: { description: 'Livestream/Zoom/YouTube link people use to join' } },
    { name: 'displayOrder', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
