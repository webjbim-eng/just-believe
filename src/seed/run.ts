/**
 * Idempotent bootstrap seed: the Permissions catalog, one tenant, its
 * system Roles, and (optionally) an initial tenant Super Admin user.
 *
 * This is exactly the "seed/fixture data for JBIM lives entirely in a
 * seed/ script, never inline in schema or component defaults" rule from
 * docs/02-architecture.md §4 — nothing tenant-specific lives in
 * collections/, access/, or hooks/.
 *
 * Run with `npm run seed`. Required env: DATABASE_URI, PAYLOAD_SECRET,
 * SEED_TENANT_NAME, SEED_TENANT_SLUG. Optional: SEED_TENANT_DOMAIN,
 * SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME — if the admin
 * vars are omitted, the tenant/roles/permissions are still seeded, just
 * without a ready-to-use login (create the first user via /admin instead).
 */
import { getPayload } from 'payload'
import config from '../payload.config'
import { permissionCatalog } from './permissions'
import { systemRoleDefinitions } from './roles'

async function seed() {
  const payload = await getPayload({ config })

  payload.logger.info('Seeding permission catalog...')
  const permissionIdByKey = new Map<string, number>()
  for (const perm of permissionCatalog) {
    const existing = await payload.find({
      collection: 'permissions',
      where: { key: { equals: perm.key } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      permissionIdByKey.set(perm.key, existing.docs[0].id)
      continue
    }
    const created = await payload.create({ collection: 'permissions', data: perm, overrideAccess: true })
    permissionIdByKey.set(perm.key, created.id)
  }
  payload.logger.info(`Permissions ready: ${permissionIdByKey.size} total.`)

  const tenantName = process.env.SEED_TENANT_NAME
  const tenantSlug = process.env.SEED_TENANT_SLUG
  if (!tenantName || !tenantSlug) {
    throw new Error('SEED_TENANT_NAME and SEED_TENANT_SLUG are required to run the seed script.')
  }
  const tenantDomain = process.env.SEED_TENANT_DOMAIN

  let tenant = (
    await payload.find({
      collection: 'tenants',
      where: { slug: { equals: tenantSlug } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0]

  if (!tenant) {
    tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: tenantName,
        slug: tenantSlug,
        domains: tenantDomain ? [{ domain: tenantDomain }] : [],
        status: 'active',
      },
      overrideAccess: true,
    })
    payload.logger.info(`Created tenant "${tenantName}" (${tenant.id}).`)
  } else {
    payload.logger.info(`Tenant "${tenantName}" already exists (${tenant.id}).`)
  }

  payload.logger.info('Seeding system roles...')
  const roleIdByName = new Map<string, number>()
  for (const roleDef of systemRoleDefinitions) {
    const existing = await payload.find({
      collection: 'roles',
      where: {
        and: [{ tenant: { equals: tenant.id } }, { name: { equals: roleDef.name } }],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs[0]) {
      roleIdByName.set(roleDef.name, existing.docs[0].id)
      continue
    }

    const permissionIds = roleDef.permissions.map((key) => {
      const id = permissionIdByKey.get(key)
      if (id === undefined) throw new Error(`Seed role "${roleDef.name}" references unknown permission "${key}"`)
      return id
    })

    const created = await payload.create({
      collection: 'roles',
      data: {
        tenant: tenant.id,
        name: roleDef.name,
        permissions: permissionIds,
        isSystemRole: true,
      },
      overrideAccess: true,
    })
    roleIdByName.set(roleDef.name, created.id)
  }
  payload.logger.info(`Roles ready: ${roleIdByName.size} total.`)

  const adminEmail = process.env.SEED_ADMIN_EMAIL
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  if (adminEmail && adminPassword) {
    const existingUser = (
      await payload.find({
        collection: 'users',
        where: { email: { equals: adminEmail } },
        limit: 1,
        overrideAccess: true,
      })
    ).docs[0]

    if (!existingUser) {
      const superAdminRoleId = roleIdByName.get('Super Administrator')
      await payload.create({
        collection: 'users',
        data: {
          email: adminEmail,
          password: adminPassword,
          name: process.env.SEED_ADMIN_NAME || 'Super Administrator',
          _verified: true,
          status: 'active',
          tenantMemberships: superAdminRoleId ? [{ tenant: tenant.id, role: superAdminRoleId }] : [],
        },
        overrideAccess: true,
      })
      payload.logger.info(`Created initial admin user ${adminEmail}.`)
    } else {
      payload.logger.info(`Admin user ${adminEmail} already exists — leaving as-is.`)
    }
  } else {
    payload.logger.info('SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD not set — skipping initial user. Create one at /admin.')
  }

  payload.logger.info('Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
