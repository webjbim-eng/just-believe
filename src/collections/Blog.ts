import type { CollectionConfig, Field } from 'payload'
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
    // 2026-08-11: deliberately only title + body sit in the main column
    // now — every other field moved to the sidebar below. This is the
    // standard "focused writing" CMS layout (WordPress, Ghost, Contentful
    // all do this): the body editor gets the full main-column width and
    // dominates the page instead of competing for space with six other
    // fields stacked above/around it.
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'body', type: 'richText', editor: lexicalEditor(), localized: true },

    // slugField() returns the widened `Field` union type (unlike
    // tenantField, which uses `satisfies Field` to stay narrow) — spreading
    // it and adding a property makes TS lose track of which union variant
    // it is, so the whole merged object needs the cast, not just the
    // spread source. Runtime shape is unchanged (still a plain text field
    // with a validate function); this is a type-narrowing limitation, not
    // a real type error.
    { ...slugField('blog-posts'), admin: { position: 'sidebar' } } as Field,
    {
      name: 'excerpt',
      type: 'text',
      localized: true,
      maxLength: 200,
      admin: {
        position: 'sidebar',
        description: 'One or two sentences for cards/listing contexts — the full post body is for the post page only.',
      },
    },
    {
      // 2026-08-12: added alongside the paulinemenoru.com import — every
      // post there has a real featured image, and until now Blog had no
      // way to store one at all (listing/detail pages rendered text-only).
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: { position: 'sidebar' },
    },
    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true, admin: { position: 'sidebar' } },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true, admin: { position: 'sidebar' } },
    { name: 'author', type: 'relationship', relationTo: ['users', 'leadership'], admin: { position: 'sidebar' } },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    seoFields,
  ],
}
