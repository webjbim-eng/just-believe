import type { CollectionConfig } from 'payload'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

// See SiteSettings.ts for why this is a collection (unique tenant) rather
// than a Payload Global.
const navItemFields = [
  { name: 'label' as const, type: 'text' as const, required: true, localized: true },
  { name: 'link' as const, type: 'text' as const, required: true },
  { name: 'order' as const, type: 'number' as const, defaultValue: 0 },
]

export const Navigation: CollectionConfig = {
  slug: 'navigation',
  admin: {
    useAsTitle: 'tenant',
    group: 'Website',
  },
  access: publicContentAccess('navigation.manage'),
  hooks: {
    afterChange: [createAuditAfterChangeHook('navigation')],
    afterDelete: [createAuditAfterDeleteHook('navigation')],
  },
  fields: [
    { ...tenantField, unique: true },
    {
      name: 'items',
      type: 'array',
      fields: [
        ...navItemFields,
        {
          name: 'children',
          type: 'array',
          fields: navItemFields,
        },
      ],
    },
  ],
}
