import type { Access } from 'payload'
import { getResolvedTenantId } from './getResolvedTenantId'
import { isPlatformSuperAdmin } from './isPlatformSuperAdmin'

/**
 * The generic, reusable permission check every collection's access config
 * calls instead of hardcoding role logic. Adding a new permission or
 * reshaping a role is a data change in the Roles/Permissions collections —
 * this function never changes to support it. See docs/04-auth-rbac.md §2.1.
 *
 * NOTE: `TenantMembership` is hand-typed here rather than imported from the
 * generated payload-types.ts, which doesn't exist until `npm run
 * generate:types` has run against a configured database. Once generated,
 * prefer importing the real `User` type instead of this local shape.
 */
type TenantMembership = {
  tenant: string
  role: string
}

type PermissionAwareUser = {
  id: string
  isPlatformSuperAdmin?: boolean
  tenantMemberships?: TenantMembership[]
}

export const hasPermission = (permissionKey: string): Access => {
  return async ({ req }) => {
    const user = req.user as PermissionAwareUser | null | undefined
    if (!user) return false
    if (isPlatformSuperAdmin(user)) return true

    const tenantId = getResolvedTenantId(req)
    if (!tenantId) return false

    const membership = user.tenantMemberships?.find((m) => m.tenant === tenantId)
    if (!membership) return false

    const role = await req.payload.findByID({
      collection: 'roles',
      id: membership.role,
      depth: 1,
      req,
    })

    if (!role) return false

    const permissions = (role.permissions ?? []) as Array<{ key?: string } | string>
    return permissions.some((p) => (typeof p === 'string' ? p === permissionKey : p.key === permissionKey))
  }
}
