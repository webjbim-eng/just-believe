import type { Field } from 'payload'

/**
 * The repeated tenant-ownership field every tenant-owned collection needs.
 * Pairs with src/access/withTenantScope.ts, which filters queries by this
 * exact field name. See docs/03-database-schema.md.
 */
// `satisfies` (not `: Field`) deliberately keeps the narrow relationship-
// field literal type instead of widening to the whole `Field` union — the
// SiteSettings/Navigation/Footer/HomepageLayout "singleton per tenant"
// collections spread this and add `unique: true`, which only type-checks
// if the spread source is still known to be a relationship field.
export const tenantField = {
  name: 'tenant',
  type: 'relationship',
  relationTo: 'tenants',
  required: true,
  index: true,
  admin: { position: 'sidebar' },
} satisfies Field
