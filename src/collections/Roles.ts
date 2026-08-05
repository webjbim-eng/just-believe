import type { CollectionConfig } from 'payload'
import { composeAccess } from '../access/composeAccess'
import { hasPermission } from '../access/hasPermission'
import { withTenantScope } from '../access/withTenantScope'

/**
 * A Role is a named, tenant-scoped collection of Permissions — the entire
 * database-driven RBAC model in one small collection. Seed roles (Super
 * Administrator, Content Manager, Prayer Coordinator, ...) are created per
 * tenant with isSystemRole=true; tenant Super Admins can clone one into a
 * fully custom role. See docs/04-auth-rbac.md §2.4 and FR-RBAC-02/03.
 */
export const Roles: CollectionConfig = {
  slug: 'roles',
  admin: {
    useAsTitle: 'name',
    group: 'Access Control',
    defaultColumns: ['name', 'tenant', 'isSystemRole'],
  },
  access: {
    // Tenant members need to read their tenant's roles (e.g. the Users
    // admin screen showing "assign role"); withTenantScope also naturally
    // excludes tenant=null platform-scope roles for non-platform-admins.
    read: withTenantScope(),
    create: composeAccess(hasPermission('roles.manage'), withTenantScope()),
    update: composeAccess(hasPermission('roles.manage'), withTenantScope()),
    delete: composeAccess(hasPermission('roles.manage'), withTenantScope()),
  },
  hooks: {
    beforeDelete: [
      async ({ req, id }) => {
        const role = await req.payload.findByID({ collection: 'roles', id, req })
        if (role?.isSystemRole) {
          throw new Error('System roles cannot be deleted. Clone it into a custom role instead.')
        }
      },
    ],
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: {
        description: 'Leave empty only for platform-scope roles (Platform Super Admin tooling)',
      },
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'permissions',
      type: 'relationship',
      relationTo: 'permissions',
      hasMany: true,
      required: true,
    },
    {
      name: 'isSystemRole',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Seeded default role — editable, but protected from deletion',
        position: 'sidebar',
      },
    },
  ],
}
