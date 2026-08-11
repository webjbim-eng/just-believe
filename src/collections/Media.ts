import type { CollectionConfig } from 'payload'
import { composeAccess } from '../access/composeAccess'
import { hasPermission } from '../access/hasPermission'
import { withTenantScope } from '../access/withTenantScope'
import { tenantField } from '../fields/tenantField'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * Upload storage location (Cloudflare R2, per docs/02-architecture.md) is
 * wired in payload.config.ts via @payloadcms/storage-s3 once R2 credentials
 * exist — this collection config is storage-adapter-agnostic. Local disk
 * (Payload's default) is fine for initial local development only; it will
 * NOT work on Vercel, which has no persistent filesystem.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Media' },
  access: {
    // Was unconditionally public (`() => true`) — an unscoped read let any
    // request enumerate every tenant's media, not just the resolved
    // tenant's. Same "public but tenant-filtered" shape as
    // publicContentAccess uses everywhere else.
    read: withTenantScope(),
    create: composeAccess(hasPermission('media.upload'), withTenantScope()),
    update: composeAccess(hasPermission('media.manage'), withTenantScope()),
    delete: composeAccess(hasPermission('media.manage'), withTenantScope()),
  },
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('media')],
    afterDelete: [createAuditAfterDeleteHook('media')],
  },
  upload: {
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
  },
  fields: [
    tenantField,
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Required for accessibility (NFR-06, WCAG 2.1 AA). Localized per NFR-07.' },
    },
    { name: 'tags', type: 'text', hasMany: true },
  ],
}
