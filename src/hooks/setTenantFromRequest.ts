import type { CollectionBeforeChangeHook } from 'payload'
import { getResolvedTenantId } from '../access/getResolvedTenantId'
import { isPlatformSuperAdmin } from '../access/isPlatformSuperAdmin'

/**
 * Forces `data.tenant` to the resolved tenant on create, overwriting
 * whatever the client submitted. Without this, withTenantScope()'s create
 * check only verifies that *some* tenant is resolved for the request — it
 * does not validate that the submitted `tenant` field actually matches
 * it, since Payload's create access doesn't apply a Where filter against
 * incoming data the way read/update/delete do. A client could otherwise
 * POST an arbitrary `tenant` id (most exposed on the public-create
 * submission collections — PrayerRequests, NewsletterSubscribers, ...)
 * and write into a different tenant's data. Platform Super Admins may
 * legitimately target a specific tenant explicitly (e.g. an internal
 * dashboard creating a new tenant's first content), so their submitted
 * value is left alone. See docs/01-srs.md NFR-11.
 */
export const setTenantFromRequest: CollectionBeforeChangeHook = ({ data, req, operation }) => {
  if (operation !== 'create') return data
  if (isPlatformSuperAdmin(req.user)) return data

  const tenantId = getResolvedTenantId(req)
  if (tenantId) {
    // Header values are always strings; relationship fields need the
    // numeric id (same coercion as auditLog.ts's resolveAuditTenantId).
    data.tenant = Number(tenantId)
  }
  return data
}
