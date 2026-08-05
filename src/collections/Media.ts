import type { CollectionConfig } from 'payload'
import { composeAccess } from '../access/composeAccess'
import { hasPermission } from '../access/hasPermission'
import { withTenantScope } from '../access/withTenantScope'

/**
 * Upload storage location (Cloudflare R2, per docs/02-architecture.md) is
 * wired in payload.config.ts via @payloadcms/storage-s3 once R2 credentials
 * exist — this collection config is storage-adapter-agnostic. Local disk
 * (Payload's default) is fine for initial local development only; it will
 * NOT work on Vercel, which has no persistent filesystem.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: {
    read: () => true,
    create: composeAccess(hasPermission('media.upload'), withTenantScope()),
    update: composeAccess(hasPermission('media.manage'), withTenantScope()),
    delete: composeAccess(hasPermission('media.manage'), withTenantScope()),
  },
  upload: {
    mimeTypes: ['image/*', 'video/*', 'application/pdf'],
  },
  fields: [
    { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true, index: true, admin: { position: 'sidebar' } },
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: { description: 'Required for accessibility (NFR-06, WCAG 2.1 AA)' },
    },
    { name: 'tags', type: 'text', hasMany: true },
  ],
}
