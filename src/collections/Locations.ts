import type { CollectionConfig } from 'payload'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * 2026-08-16 (Jimmy's request): physical/regional ministry presence,
 * shown on the About page's "Our Locations" section — nothing about
 * location existed anywhere in the codebase before this (confirmed via
 * docs/source), so this ships with real intake-questionnaire data for
 * the headquarters and is otherwise empty until real additional
 * locations are added.
 */
export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    useAsTitle: 'name',
    group: 'Website Content',
    defaultColumns: ['name', 'country', 'city', 'active'],
  },
  versions: { drafts: true },
  access: publicContentAccess('locations.manage'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('locations')],
    afterDelete: [createAuditAfterDeleteHook('locations')],
  },
  fields: [
    tenantField,
    { name: 'name', type: 'text', required: true, localized: true, admin: { description: 'e.g. "Headquarters", "West Africa Office"' } },
    { name: 'country', type: 'text' },
    { name: 'city', type: 'text' },
    { name: 'address', type: 'text' },
    { name: 'region', type: 'text', admin: { description: 'State/province, optional' } },
    { name: 'postalCode', type: 'text' },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'mapUrl', type: 'text', admin: { description: 'A Google Maps (or similar) link, optional' } },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'meetingInfo', type: 'textarea', admin: { description: 'e.g. office hours, how to schedule a visit' } },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'displayOrder', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
