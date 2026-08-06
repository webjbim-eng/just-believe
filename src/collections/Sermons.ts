import type { CollectionConfig } from 'payload'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { seoFields } from '../fields/seo'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

export const Sermons: CollectionConfig = {
  slug: 'sermons',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'speaker', 'date', '_status'],
  },
  versions: { drafts: true },
  access: publicContentAccess('sermons.publish'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('sermons')],
    afterDelete: [createAuditAfterDeleteHook('sermons')],
  },
  fields: [
    tenantField,
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'type', type: 'select', required: true, options: ['audio', 'video', 'written'] },
    { name: 'speaker', type: 'text' },
    { name: 'scripture', type: 'text', hasMany: true },
    { name: 'topics', type: 'relationship', relationTo: 'categories', hasMany: true },
    { name: 'mediaFile', type: 'upload', relationTo: 'media', admin: { description: 'For self-hosted audio/video, mutually exclusive with embedUrl' } },
    { name: 'embedUrl', type: 'text', admin: { description: 'For an external embed (e.g. YouTube), mutually exclusive with mediaFile' } },
    { name: 'date', type: 'date', required: true },
    seoFields,
  ],
}
