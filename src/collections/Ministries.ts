import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { slugField } from '../fields/slug'
import { seoFields } from '../fields/seo'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

export const Ministries: CollectionConfig = {
  slug: 'ministries',
  admin: {
    useAsTitle: 'name',
    group: 'Ministry',
    defaultColumns: ['name', 'leader', 'order'],
  },
  versions: { drafts: true },
  access: publicContentAccess('ministries.manage'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('ministries')],
    afterDelete: [createAuditAfterDeleteHook('ministries')],
  },
  fields: [
    tenantField,
    { name: 'name', type: 'text', required: true, localized: true },
    slugField('ministries'),
    {
      name: 'shortDescription',
      type: 'text',
      localized: true,
      maxLength: 160,
      admin: {
        description: 'One sentence for the Ministries overview page and homepage teasers. The full description below is for the individual ministry page only — never render it in a card grid.',
      },
    },
    { name: 'description', type: 'richText', editor: lexicalEditor(), localized: true, admin: { description: 'Full description — individual ministry page only.' } },
    { name: 'leader', type: 'relationship', relationTo: 'leadership' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    seoFields,
  ],
}
