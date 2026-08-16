import type { CollectionConfig } from 'payload'
import { composeAccess } from '../access/composeAccess'
import { hasPermission } from '../access/hasPermission'
import { withTenantScope } from '../access/withTenantScope'

/**
 * Append-only by design (FR-AUDIT-03): `create` is blocked at the
 * collection-access level too, not just update/delete — the only
 * legitimate writer is src/hooks/auditLog.ts, which writes via the Local
 * API with `overrideAccess: true`, bypassing this restriction on purpose.
 * Nothing in a REST/GraphQL/admin-UI request path can ever create, edit, or
 * remove an entry. See docs/04-auth-rbac.md §4 and docs/03-database-schema.md §3.
 */
export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  labels: { singular: 'Activity Log', plural: 'Activity Log' },
  admin: {
    useAsTitle: 'documentId',
    group: 'Platform',
    defaultColumns: ['collectionSlug', 'action', 'user', 'documentId', 'createdAt'],
  },
  access: {
    read: composeAccess(hasPermission('audit.view'), withTenantScope()),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      index: true,
      admin: { description: 'Null for platform-scope actions (e.g. tenant creation itself)' },
    },
    { name: 'user', type: 'relationship', relationTo: 'users' },
    {
      name: 'action',
      type: 'select',
      required: true,
      options: ['create', 'update', 'delete'],
      index: true,
    },
    { name: 'collectionSlug', type: 'text', required: true, index: true },
    { name: 'documentId', type: 'text', required: true, index: true },
    {
      name: 'previousValue',
      type: 'json',
      admin: { description: 'Redacted of secrets (password, 2FA secret, etc.) before storage' },
    },
    {
      name: 'newValue',
      type: 'json',
      admin: { description: 'Redacted of secrets (password, 2FA secret, etc.) before storage' },
    },
  ],
}
