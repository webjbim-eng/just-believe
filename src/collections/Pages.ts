import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { slugField } from '../fields/slug'
import { seoFields } from '../fields/seo'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * Arbitrary marketing/informational pages (About, Missions, Contact, ...).
 * `blocks` currently ships with a single RichText block — the full page-
 * builder block library (Hero, CTA, etc., src/blocks/) is shared with
 * HomepageLayout and gets built out separately; this field only needs the
 * `blocks` shape to be correct today; new block types add here as
 * src/blocks/ grows. See docs/02-architecture.md §4.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'slug', '_status'],
  },
  versions: { drafts: true },
  access: publicContentAccess('pages.publish'),
  hooks: {
    afterChange: [createAuditAfterChangeHook('pages')],
    afterDelete: [createAuditAfterDeleteHook('pages')],
  },
  fields: [
    tenantField,
    { name: 'title', type: 'text', required: true, localized: true },
    slugField('pages'),
    {
      name: 'blocks',
      type: 'blocks',
      blocks: [
        {
          slug: 'richText',
          fields: [{ name: 'content', type: 'richText', editor: lexicalEditor(), localized: true }],
        },
      ],
    },
    seoFields,
  ],
}
