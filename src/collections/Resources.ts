import type { CollectionConfig } from 'payload'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { getResolvedTenantId } from '../access/getResolvedTenantId'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

export const Resources: CollectionConfig = {
  slug: 'resources',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'type', 'gated'],
  },
  access: publicContentAccess('resources.manage'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('resources')],
    afterDelete: [createAuditAfterDeleteHook('resources')],
  },
  fields: [
    tenantField,
    { name: 'title', type: 'text', required: true },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'leadership',
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
    { name: 'externalLink', type: 'text' },
    { name: 'description', type: 'textarea' },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: ['study-guide', 'prayer-guide', 'discipleship-manual', 'teaching-notes'],
    },
    {
      name: 'gated',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Requires visitor contact info to download' },
    },
  ],
}
