import type { CollectionConfig } from 'payload'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { slugField } from '../fields/slug'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * Free-form tagging for Blog posts, separate from Categories
 * (docs/03-database-schema.md §1: BLOG_POST tagged by both).
 */
export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'slug'],
  },
  access: publicContentAccess('blog.categories.manage'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('tags')],
    afterDelete: [createAuditAfterDeleteHook('tags')],
  },
  fields: [
    tenantField,
    { name: 'name', type: 'text', required: true, localized: true },
    slugField('tags'),
  ],
}
