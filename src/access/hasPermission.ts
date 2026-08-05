import type { Access } from 'payload'
import type { User } from '../payload-types'
import { getResolvedTenantId } from './getResolvedTenantId'
import { isPlatformSuperAdmin } from './isPlatformSuperAdmin'

/**
 * The generic, reusable permission check every collection's access config
 * calls instead of hardcoding role logic. Adding a new permission or
 * reshaping a role is a data change in the Roles/Permissions collections —
 * this function never changes to support it. See docs/04-auth-rbac.md §2.1.
 */
export const hasPermission = (permissionKey: string): Access => {
  return async ({ req }) => {
    const user = req.user as User | null | undefined
    if (!user) return false
    if (isPlatformSuperAdmin(user)) return true

    const tenantId = getResolvedTenantId(req)
    if (!tenantId) return false

    // Relationship fields on req.user are typically un-populated (plain ids,
    // typed number | Tenant by the generated types) — coerce to string
    // before comparing against tenantId, which comes from a request header
    // and is therefore always a string. A bare `===` here would silently
    // never match and lock every tenant-scoped user out.
    const membership = user.tenantMemberships?.find((m) => {
      const membershipTenantId = typeof m.tenant === 'object' ? m.tenant.id : m.tenant
      return String(membershipTenantId) === tenantId
    })
    if (!membership) return false

    const roleId = typeof membership.role === 'object' ? membership.role.id : membership.role
    const role = await req.payload.findByID({
      collection: 'roles',
      id: roleId,
      depth: 1,
      req,
    })
    if (!role) return false

    return role.permissions.some((p) => typeof p === 'object' && p !== null && p.key === permissionKey)
  }
}
