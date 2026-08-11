import type { CollectionConfig } from 'payload'
import { submissionAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * Partnership inquiries are modeled as a submission collection like Prayer/
 * Counseling/Volunteer (docs/02-architecture.md §5) — public create, staff-
 * gated read/manage via partners.manage (no separate view permission exists
 * in the seed catalog for this module).
 */
export const Partners: CollectionConfig = {
  slug: 'partners',
  admin: {
    useAsTitle: 'orgName',
    group: 'Ministry',
    defaultColumns: ['orgName', 'engagementType', 'status'],
  },
  access: submissionAccess('partners.manage', 'partners.manage'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('partners')],
    afterDelete: [createAuditAfterDeleteHook('partners')],
  },
  fields: [
    tenantField,
    { name: 'orgName', type: 'text', admin: { description: 'Leave empty for an individual partner — use individualName instead' } },
    { name: 'individualName', type: 'text' },
    { name: 'contact', type: 'text', required: true },
    {
      name: 'engagementType',
      type: 'select',
      required: true,
      options: ['prayer', 'financial', 'volunteer', 'project-sponsor', 'mission-trip'],
    },
    { name: 'logo', type: 'upload', relationTo: 'media', admin: { description: 'Optional — shown in the public "Partner Logos" display' } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'active', 'inactive'],
    },
  ],
}
