import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * Leadership profiles, including the Founder page (isFounder). Ministries
 * reference these via `leader`; Books default their `author` to whichever
 * record has isFounder=true. See docs/03-database-schema.md §2.
 */
export const Leadership: CollectionConfig = {
  slug: 'leadership',
  admin: {
    useAsTitle: 'name',
    group: 'Website Content',
    defaultColumns: ['name', 'title', 'isFounder'],
  },
  access: publicContentAccess('leadership.manage'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('leadership')],
    afterDelete: [createAuditAfterDeleteHook('leadership')],
  },
  fields: [
    tenantField,
    { name: 'name', type: 'text', required: true },
    { name: 'title', type: 'text' },
    { name: 'bio', type: 'richText', editor: lexicalEditor(), localized: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'isFounder',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Books.author defaults to whichever record has this set' },
    },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
