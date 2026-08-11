import type { CollectionConfig } from 'payload'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * docs/02-architecture.md §3 calls SiteSettings/Navigation/Footer/
 * HomepageLayout "tenant-scoped Globals, one instance per tenant" — but
 * Payload's native `globals` are process-wide singletons with no tenant
 * dimension, and the multi-tenant plugin that could reconcile that isn't
 * installed (see payload.config.ts). So these are modeled as ordinary
 * tenant-owned collections instead, with `tenant` marked `unique` to get
 * the same "exactly one row per tenant" guarantee at the database level
 * that a real Global would give for free. Same access shape as any other
 * public content collection: readable by anyone, writable by permission.
 */
export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  labels: { singular: 'Website Settings', plural: 'Website Settings' },
  admin: {
    useAsTitle: 'siteName',
    group: 'Website',
  },
  access: publicContentAccess('website.settings'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('site-settings')],
    afterDelete: [createAuditAfterDeleteHook('site-settings')],
  },
  fields: [
    { ...tenantField, unique: true },
    { name: 'siteName', type: 'text', required: true },
    { name: 'contactEmail', type: 'email' },
    { name: 'contactPhone', type: 'text' },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        { name: 'platform', type: 'select', options: ['facebook', 'instagram', 'youtube', 'x', 'tiktok'], required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'notificationPreferences',
      type: 'group',
      fields: [
        { name: 'newPrayerRequest', type: 'checkbox', defaultValue: true },
        { name: 'newCounselingRequest', type: 'checkbox', defaultValue: true },
        { name: 'newVolunteerApplication', type: 'checkbox', defaultValue: true },
        { name: 'newEventRegistration', type: 'checkbox', defaultValue: false },
        { name: 'newDonation', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      fields: [
        { name: 'gaId', type: 'text', admin: { description: 'Google Analytics' } },
        { name: 'gscId', type: 'text', admin: { description: 'Google Search Console' } },
        { name: 'clarityId', type: 'text', admin: { description: 'Microsoft Clarity' } },
      ],
    },
  ],
}
