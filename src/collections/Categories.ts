import type { CollectionConfig } from 'payload'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { slugField } from '../fields/slug'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * Shared taxonomy used by both Blog and Sermons (docs/03-database-schema.md
 * §1). One catalog per tenant, not global across tenants — each ministry
 * curates its own category list.
 */
export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'slug'],
  },
  access: publicContentAccess('blog.categories.manage'),
  hooks: {
    afterChange: [createAuditAfterChangeHook('categories')],
    afterDelete: [createAuditAfterDeleteHook('categories')],
  },
  fields: [
    tenantField,
    { name: 'name', type: 'text', required: true, localized: true },
    slugField,
  ],
}
