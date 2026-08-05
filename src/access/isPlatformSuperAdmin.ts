import type { Access, FieldAccess } from 'payload'

/**
 * Cross-tenant escape hatch — deliberately a single explicit boolean flag on
 * User rather than something reachable through the composable Role/Permission
 * system, so cross-tenant reach can't be granted accidentally by combining
 * permissions. See docs/04-auth-rbac.md §2.2.
 */
export const isPlatformSuperAdmin = (user: unknown): boolean => {
  return Boolean((user as { isPlatformSuperAdmin?: boolean } | null | undefined)?.isPlatformSuperAdmin)
}

export const platformSuperAdminOnly: Access = ({ req }) => isPlatformSuperAdmin(req.user)

export const platformSuperAdminOnlyField: FieldAccess = ({ req }) => isPlatformSuperAdmin(req.user)
