import type { CollectionConfig } from 'payload'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
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
    group: 'Website Content',
  },
  // 2026-08-16: create disabled — one doc per tenant, same reasoning as
  // SiteSettings.ts.
  access: { ...publicContentAccess('navigation.manage'), create: () => false },
  hooks: {
    beforeChange: [setTenantFromRequest],
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
