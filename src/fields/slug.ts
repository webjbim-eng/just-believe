import type { CollectionSlug, Field, Validate } from 'payload'

/**
 * The repeated slug field every tenant-owned content collection needs.
 * Indexed, not `unique: true` — Payload's `unique` is a global constraint,
 * and two tenants must each be able to have e.g. a "/about" page. Per-
 * tenant uniqueness is instead enforced by the `validate` function below,
 * which is why this is a factory (needs the owning collection's slug to
 * query against) rather than a plain field constant. See
 * docs/03-database-schema.md §3.
 */
export const slugField = (collectionSlug: CollectionSlug): Field => {
  const validateUniquePerTenant: Validate = async (value, { data, req, id }) => {
    if (!value) return true

    const tenantId = typeof data?.tenant === 'object' ? data.tenant?.id : data?.tenant
    if (!tenantId) return true // tenantField's own `required` covers a missing tenant

    const { totalDocs } = await req.payload.find({
      collection: collectionSlug,
      where: {
        and: [
          { slug: { equals: value } },
          { tenant: { equals: tenantId } },
          ...(id ? [{ id: { not_equals: id } }] : []),
        ],
      },
      limit: 0,
      req,
    })

    return totalDocs === 0 || 'A document with this slug already exists for this tenant.'
  }

  return {
    name: 'slug',
    type: 'text',
    required: true,
    index: true,
    validate: validateUniquePerTenant,
  }
}
