import type { CollectionConfig } from 'payload'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { slugField } from '../fields/slug'
import { seoFields } from '../fields/seo'
import { getResolvedTenantId } from '../access/getResolvedTenantId'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

export const Books: CollectionConfig = {
  slug: 'books',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'author', 'featured', 'displayOrder', '_status'],
    // 2026-08-16: lets an admin open the live public page for the
    // current draft before hitting Publish — /books/[slug] checks for
    // ?preview=1 and fetches the draft version when present (still
    // gated by the same books.manage permission, not publicly reachable
    // just by knowing the URL).
    preview: (doc) => `/books/${doc.slug}?preview=1`,
  },
  versions: { drafts: true },
  access: publicContentAccess('books.manage'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('books')],
    afterDelete: [createAuditAfterDeleteHook('books')],
  },
  fields: [
    tenantField,
    { name: 'title', type: 'text', required: true },
    slugField('books'),
    { name: 'category', type: 'relationship', relationTo: 'categories' },
    {
      // 2026-08-16: powers the language filter on /books — several real
      // titles are separate French-edition Amazon listings, not a
      // translation of the English ones, so this is a real distinguishing
      // fact about the book (different ASIN/cover/title), not something
      // Payload's field-level localization (one record, many locales)
      // is the right fit for.
      name: 'language',
      type: 'select',
      defaultValue: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Français', value: 'fr' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers show first on the Books page and homepage.' },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'leadership',
      // Defaults to the tenant's Founder record (docs/03-database-schema.md
      // §2 "Book / Resource") — still editable, just pre-filled.
      defaultValue: async ({ req }) => {
        const tenantId = getResolvedTenantId(req)
        if (!tenantId) return undefined
        const { docs } = await req.payload.find({
          collection: 'leadership',
          where: { and: [{ tenant: { equals: tenantId } }, { isFounder: { equals: true } }] },
          limit: 1,
          req,
        })
        return docs[0]?.id
      },
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    {
      name: 'externalLink',
      type: 'text',
      label: 'Amazon URL',
      admin: { description: 'The Amazon product page for this book — used by the "Get This Book" button everywhere on the site.' },
    },
    {
      // 2026-08-16: custom admin-only button, no data of its own — reads
      // the Amazon URL field above and fills in title/author/format/
      // description/cover from the real Amazon product page, so the
      // admin isn't retyping everything by hand. Always editable/
      // reviewable before Save; never auto-publishes. See
      // src/components/admin/BookImportButton.tsx and
      // src/app/api/internal/import-book/route.ts.
      name: 'amazonImport',
      type: 'ui',
      admin: {
        components: {
          Field: '/src/components/admin/BookImportButton.tsx#BookImportButton',
        },
      },
    },
    {
      name: 'shortDescription',
      type: 'text',
      maxLength: 200,
      admin: { description: 'One or two sentences for cards and the homepage — the full description below is for the book\'s own page.' },
    },
    { name: 'description', type: 'textarea', label: 'Full Description' },
    {
      name: 'format',
      type: 'select',
      options: [
        { label: 'Paperback', value: 'paperback' },
        { label: 'Hardcover', value: 'hardcover' },
        { label: 'Kindle Edition', value: 'kindle' },
        { label: 'eBook', value: 'ebook' },
        { label: 'Audiobook', value: 'audiobook' },
      ],
    },
    { name: 'publicationDate', type: 'date' },
    seoFields,
  ],
}
