import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

export const Devotionals: CollectionConfig = {
  slug: 'devotionals',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'cadence', 'date', '_status'],
  },
  versions: { drafts: true },
  access: publicContentAccess('devotionals.publish'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('devotionals')],
    afterDelete: [createAuditAfterDeleteHook('devotionals')],
  },
  fields: [
    tenantField,
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'body', type: 'richText', editor: lexicalEditor(), localized: true },
    { name: 'cadence', type: 'select', required: true, options: ['daily', 'weekly', 'series'] },
    {
      name: 'series',
      type: 'relationship',
      relationTo: 'devotionals',
      admin: { description: 'Groups this devotional under a parent series entry' },
    },
    { name: 'date', type: 'date', required: true },
  ],
}
