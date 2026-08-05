import type { FilterOptions } from 'payload'
import { getResolvedTenantId } from './getResolvedTenantId'

/**
 * Constrains a `relationTo: 'users'` field's admin-UI picker to members
 * holding a specific role in the resolved tenant — e.g. PrayerRequest.
 * assignedTo should only offer Prayer Coordinators, not every user
 * (docs/03-database-schema.md §2 "PrayerRequest"). This only narrows the
 * picker; it isn't itself an access-control boundary.
 */
export const filterUsersByRoleName = (roleName: string): FilterOptions => {
  return async ({ req }) => {
    const tenantId = getResolvedTenantId(req)
    if (!tenantId) return false

    const { docs: roles } = await req.payload.find({
      collection: 'roles',
      where: { and: [{ tenant: { equals: tenantId } }, { name: { equals: roleName } }] },
      limit: 1,
      req,
    })
    const roleId = roles[0]?.id
    if (!roleId) return false

    return { 'tenantMemberships.role': { equals: roleId } }
  }
}
