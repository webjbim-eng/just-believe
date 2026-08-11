import type { CollectionConfig } from 'payload'
import { composeAccess } from '../access/composeAccess'
import { hasPermission } from '../access/hasPermission'
import { withTenantScope } from '../access/withTenantScope'
import { tenantField } from '../fields/tenantField'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * Records of truth for donations are written exclusively by the server-side
 * PayPal capture route and webhook handler (docs/02-architecture.md §6),
 * both of which call the Local API with `overrideAccess: true` after
 * independently re-verifying the transaction against PayPal — never by a
 * client-supplied create/update through this collection's normal access
 * path. Same "system-writer, admin-reads-only" shape as AuditLogs.ts.
 */
export const Donations: CollectionConfig = {
  slug: 'donations',
  admin: {
    useAsTitle: 'paypalTransactionId',
    group: 'Giving',
    defaultColumns: ['donorName', 'amount', 'fund', 'status', 'createdAt'],
  },
  access: {
    read: composeAccess(hasPermission('donations.view'), withTenantScope()),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  hooks: {
    afterChange: [createAuditAfterChangeHook('donations')],
    afterDelete: [createAuditAfterDeleteHook('donations')],
  },
  fields: [
    tenantField,
    { name: 'donorName', type: 'text', admin: { description: 'Empty if the donor chose to give anonymously' } },
    { name: 'donorEmail', type: 'email' },
    { name: 'amount', type: 'number', required: true },
    { name: 'currency', type: 'text', required: true },
    { name: 'usdAmount', type: 'number', required: true },
    {
      name: 'fund',
      type: 'select',
      required: true,
      options: ['general', 'mission-projects', 'child-sponsorship', 'special-campaign'],
    },
    { name: 'paypalTransactionId', type: 'text', required: true, unique: true },
    { name: 'paypalSubscriptionId', type: 'text', admin: { description: 'Set only for recurring donations' } },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: ['completed', 'refunded', 'failed'],
    },
  ],
}
