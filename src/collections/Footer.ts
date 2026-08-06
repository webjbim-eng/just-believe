import type { CollectionConfig } from 'payload'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

// See SiteSettings.ts for why this is a collection (unique tenant) rather
// than a Payload Global.
export const Footer: CollectionConfig = {
  slug: 'footer',
  admin: {
    useAsTitle: 'tenant',
    group: 'Website',
  },
  access: publicContentAccess('navigation.manage'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('footer')],
    afterDelete: [createAuditAfterDeleteHook('footer')],
  },
  fields: [
    { ...tenantField, unique: true },
    {
      name: 'columns',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true, localized: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        { name: 'platform', type: 'select', options: ['facebook', 'instagram', 'youtube', 'x', 'tiktok'], required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    { name: 'copyrightText', type: 'text', localized: true },
  ],
}
