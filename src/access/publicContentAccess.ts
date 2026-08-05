import type { CollectionConfig } from 'payload'
import { composeAccess } from './composeAccess'
import { hasPermission } from './hasPermission'
import { withTenantScope } from './withTenantScope'

/**
 * The repeated access shape for genuinely public content collections
 * (Ministries, Sermons, Blog, Pages, ...): reads are open to anyone but
 * always tenant-filtered (no cross-tenant leakage even for public data, and
 * no permission needed just to read published content); writes require the
 * collection's manage permission AND tenant scope. See docs/04-auth-rbac.md.
 */
export const publicContentAccess = (managePermission: string): CollectionConfig['access'] => ({
  read: withTenantScope(),
  create: composeAccess(hasPermission(managePermission), withTenantScope()),
  update: composeAccess(hasPermission(managePermission), withTenantScope()),
  delete: composeAccess(hasPermission(managePermission), withTenantScope()),
})

/**
 * For visitor-submitted collections (Prayer Requests, Volunteer
 * Applications, Event Registrations, ...): anyone can create (tenant-scoped
 * only, no permission needed — that's the point of a public form), but
 * reading/managing existing submissions requires the given permissions.
 */
export const submissionAccess = (
  readPermission: string,
  managePermission: string,
): CollectionConfig['access'] => ({
  create: withTenantScope(),
  read: composeAccess(hasPermission(readPermission), withTenantScope()),
  update: composeAccess(hasPermission(managePermission), withTenantScope()),
  delete: composeAccess(hasPermission(managePermission), withTenantScope()),
})
