import type { Field } from 'payload'

/**
 * The repeated slug field every tenant-owned content collection needs.
 * Indexed, not `unique: true` — uniqueness must be scoped to the tenant
 * (two tenants can each have a "/about" page), and Payload's `unique`
 * option is a global constraint, not a compound one. Per-tenant uniqueness
 * is left to a future validate hook if collisions become a real problem;
 * the composite `(tenant, slug)` index called for in
 * docs/03-database-schema.md §3 is what actually matters for query speed.
 */
export const slugField: Field = {
  name: 'slug',
  type: 'text',
  required: true,
  index: true,
}
