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
 *
 * `create` additionally requires the request to be unauthenticated: these
 * collections only ever receive real visitor submissions (the public forms
 * POST to Payload's own REST API unauthenticated, so they're unaffected),
 * and Payload evaluates this same function against the logged-in admin's
 * session to decide whether to show "Create New" in the admin UI — so an
 * admin clicking Create and getting a blank submission to fill out (2026-
 * 08-16, Jimmy: "the forms should be editable... not trying to create the
 * actual request") was that button, not a separate thing to hide.
 */
export const submissionAccess = (
  readPermission: string,
  managePermission: string,
): CollectionConfig['access'] => ({
  create: (args) => (args.req.user ? false : withTenantScope()(args)),
  read: composeAccess(hasPermission(readPermission), withTenantScope()),
  update: composeAccess(hasPermission(managePermission), withTenantScope()),
  delete: composeAccess(hasPermission(managePermission), withTenantScope()),
})
