import type { CollectionConfig } from 'payload'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { getResolvedTenantId } from '../access/getResolvedTenantId'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

export const Books: CollectionConfig = {
  slug: 'books',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'author', '_status'],
  },
  versions: { drafts: true },
  access: publicContentAccess('books.manage'),
  hooks: {
    afterChange: [createAuditAfterChangeHook('books')],
    afterDelete: [createAuditAfterDeleteHook('books')],
  },
  fields: [
    tenantField,
    { name: 'title', type: 'text', required: true },
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
    { name: 'externalLink', type: 'text', admin: { description: 'Mutually exclusive with coverImage+file, for an external retailer/listing link' } },
    { name: 'description', type: 'textarea' },
  ],
}
