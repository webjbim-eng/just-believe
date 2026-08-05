import type { Access, Where } from 'payload'

/**
 * Combines a permission check with a tenant-scope filter into the single
 * Access function Payload expects per operation. Both must pass:
 *  - permission access returning `false` short-circuits to `false`.
 *  - otherwise the tenant-scope access's boolean/Where result is returned
 *    as-is (so `true` for platform super admins, or a `{ tenant: { equals } }`
 *    Where clause for everyone else).
 * See docs/04-auth-rbac.md §2.2.
 */
export const composeAccess = (permissionAccess: Access, tenantScopeAccess: Access): Access => {
  return async (args) => {
    const permitted = await permissionAccess(args)
    if (!permitted) return false

    return tenantScopeAccess(args)
  }
}

export const isWhereQuery = (result: boolean | Where): result is Where => typeof result === 'object'
