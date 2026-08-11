import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { slugField } from '../fields/slug'
import { seoFields } from '../fields/seo'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * Specific mission trips/projects — distinct from Ministries (ongoing
 * ministry areas like "Prayer & Intercession"). Same shortDescription/
 * description split as Ministries.ts, admin-authored (publicContentAccess,
 * not submissionAccess — nobody submits a mission from the public site).
 */
export const Missions: CollectionConfig = {
  slug: 'missions',
  admin: {
    useAsTitle: 'name',
    group: 'Ministry',
    defaultColumns: ['name', 'location', 'phase', 'startDate'],
  },
  versions: { drafts: true },
  access: publicContentAccess('missions.manage'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('missions')],
    afterDelete: [createAuditAfterDeleteHook('missions')],
  },
  fields: [
    tenantField,
    { name: 'name', type: 'text', required: true, localized: true },
    slugField('missions'),
    {
      name: 'shortDescription',
      type: 'text',
      localized: true,
      maxLength: 160,
      admin: { description: 'One sentence for overview/listing contexts. The full description below is for the individual mission page only.' },
    },
    { name: 'description', type: 'richText', editor: lexicalEditor(), localized: true, admin: { description: 'Full description — individual mission page only.' } },
    { name: 'location', type: 'text' },
    {
      // Not named `status` — collides with Payload's own auto-generated
      // `_status` field (from versions:{drafts:true}) at the Postgres enum
      // level (both resolve to `enum_missions_status`), which breaks the
      // dev schema push with an "invalid input value for enum" error.
      // Confirmed by inspecting pg_enum directly after the first failed
      // attempt: enum_missions_status already existed with draft/published
      // values (Payload's), conflicting with this field's intended
      // planning/active/completed values.
      name: 'phase',
      type: 'select',
      defaultValue: 'planning',
      options: ['planning', 'active', 'completed'],
    },
    { name: 'startDate', type: 'date' },
    { name: 'endDate', type: 'date' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    seoFields,
  ],
}
