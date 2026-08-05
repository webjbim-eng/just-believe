import type { CollectionConfig } from 'payload'
import { platformSuperAdminOnly } from '../access/isPlatformSuperAdmin'

/**
 * Reference/seed data, not meant for ad-hoc creation through the UI — new
 * permissions ship with code changes that add new capabilities. Roles
 * compose these into named sets; nothing in application code ever checks a
 * role name directly. See docs/04-auth-rbac.md §2.3 for the full seed
 * catalog this collection is populated with (seed/permissions.ts).
 */
export const Permissions: CollectionConfig = {
  slug: 'permissions',
  admin: {
    useAsTitle: 'key',
    group: 'Access Control',
    defaultColumns: ['key', 'module', 'description'],
  },
  access: {
    // Any authenticated user needs to be able to read the catalog so the
    // role-builder UI can list available permissions to compose into a role.
    read: ({ req }) => Boolean(req.user),
    create: platformSuperAdminOnly,
    update: platformSuperAdminOnly,
    delete: platformSuperAdminOnly,
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'e.g. "sermons.publish", "donations.view" — dot-namespaced module.action',
      },
    },
    {
      name: 'module',
      type: 'text',
      required: true,
      admin: {
        description: 'Groups this permission in the Role-builder UI (e.g. "Sermons", "Donations")',
      },
    },
    {
      name: 'description',
      type: 'text',
    },
  ],
}
