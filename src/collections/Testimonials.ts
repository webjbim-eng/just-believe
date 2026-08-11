import type { Access, CollectionConfig, Where } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { composeAccess } from '../access/composeAccess'
import { hasPermission } from '../access/hasPermission'
import { withTenantScope } from '../access/withTenantScope'
import { getResolvedTenantId } from '../access/getResolvedTenantId'
import { isPlatformSuperAdmin } from '../access/isPlatformSuperAdmin'
import { tenantField } from '../fields/tenantField'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * Neither publicContentAccess (read always open) nor submissionAccess
 * (read always gated) fits: anonymous visitors may only see
 * status=published testimonials (FR-CMS-08), while staff with
 * testimonials.approve see the full moderation queue. So read needs its
 * own function that branches on permission rather than composing the two
 * generic helpers.
 */
const testimonialRead: Access = async (args) => {
  const { req } = args
  if (isPlatformSuperAdmin(req.user)) return true

  const tenantId = getResolvedTenantId(req)
  if (!tenantId) return false

  const canModerate = await hasPermission('testimonials.approve')(args)
  if (canModerate) {
    const tenantOnly: Where = { tenant: { equals: tenantId } }
    return tenantOnly
  }

  const publishedOnly: Where = { and: [{ tenant: { equals: tenantId } }, { status: { equals: 'published' } }] }
  return publishedOnly
}

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'submitterName',
    group: 'Ministry',
    defaultColumns: ['submitterName', 'status'],
  },
  access: {
    read: testimonialRead,
    create: withTenantScope(),
    update: composeAccess(hasPermission('testimonials.approve'), withTenantScope()),
    delete: composeAccess(hasPermission('testimonials.approve'), withTenantScope()),
  },
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('testimonials')],
    afterDelete: [createAuditAfterDeleteHook('testimonials')],
  },
  fields: [
    tenantField,
    { name: 'submitterName', type: 'text', required: true },
    { name: 'content', type: 'richText', editor: lexicalEditor(), localized: true, required: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'submitted',
      options: ['submitted', 'approved', 'published'],
      admin: { position: 'sidebar' },
    },
  ],
}
