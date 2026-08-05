import type { Access } from 'payload'
import { getResolvedTenantId } from './getResolvedTenantId'
import { isPlatformSuperAdmin } from './isPlatformSuperAdmin'

/**
 * Second, independent access layer, always applied alongside hasPermission()
 * on every tenant-owned collection. hasPermission() answers "can this user
 * do X in this tenant"; this answers "which documents can they even see" by
 * injecting a `where: tenant = resolvedTenantId` constraint into the query
 * itself — so a user with e.g. sermons.publish in Tenant A cannot retrieve
 * Tenant B's sermons by ID, regardless of permission. Both layers must pass;
 * neither is sufficient alone. See docs/04-auth-rbac.md §2.2 and the
 * cross-tenant isolation test requirement in docs/01-srs.md NFR-11.
 */
export const withTenantScope = (): Access => {
  return ({ req }) => {
    if (isPlatformSuperAdmin(req.user)) return true

    const tenantId = getResolvedTenantId(req)
    if (!tenantId) return false

    return {
      tenant: {
        equals: tenantId,
      },
    }
  }
}
