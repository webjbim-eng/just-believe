import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { slugField } from '../fields/slug'
import { seoFields } from '../fields/seo'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: { singular: 'Blog Post', plural: 'Blog' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'author', 'publishedAt', '_status'],
  },
  versions: { drafts: true },
  access: publicContentAccess('blog.publish'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('blog-posts')],
    afterDelete: [createAuditAfterDeleteHook('blog-posts')],
  },
  fields: [
    tenantField,
    { name: 'title', type: 'text', required: true, localized: true },
    slugField('blog-posts'),
    { name: 'body', type: 'richText', editor: lexicalEditor(), localized: true },
    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'author', type: 'relationship', relationTo: ['users', 'leadership'] },
    { name: 'publishedAt', type: 'date' },
    seoFields,
  ],
}
