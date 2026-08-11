import type { Access, CollectionConfig, FieldAccess, Where } from 'payload'
import { getResolvedTenantId } from '../access/getResolvedTenantId'
import { hasPermission } from '../access/hasPermission'
import { isPlatformSuperAdmin, platformSuperAdminOnlyField } from '../access/isPlatformSuperAdmin'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * Users are NOT tenant-owned the way Sermons/Events/etc. are — a single
 * user can hold different roles in different tenants (FR-RBAC-04), so the
 * generic withTenantScope() (which filters by a single `tenant` field)
 * doesn't apply here. Instead: a user can always read/update their own
 * record, and anyone with users.update/users.delete can additionally
 * read/manage users who have a tenantMemberships entry in their resolved
 * tenant. Platform Super Admin bypasses all of it.
 *
 * PRODUCTION NOTE: raw collection `create` is left permission-gated below
 * for the admin UI to work, but a dedicated "invite user" server action/
 * endpoint (validating the invited tenantMembership against the inviter's
 * own resolved tenant, and emailing a set-password link via Resend rather
 * than accepting a raw password) is the intended real invite flow per
 * FR-RBAC-05 — this collection-level access is the floor, not the whole
 * story.
 */
const isSelf = (userId: unknown, docId: unknown) => Boolean(userId) && String(userId) === String(docId)

const scopedUserAccess = (permissionKey: string): Access => {
  return async (args) => {
    const { req, id } = args
    if (isPlatformSuperAdmin(req.user)) return true
    if (!req.user) return false
    if (id && isSelf(req.user.id, id)) return true

    const tenantId = getResolvedTenantId(req)
    if (!tenantId) return false

    const permitted = await hasPermission(permissionKey)(args)
    if (!permitted) return false

    const where: Where = {
      or: [{ id: { equals: req.user.id } }, { 'tenantMemberships.tenant': { equals: tenantId } }],
    }
    return where
  }
}

const selfOrPlatformSuperAdminField: FieldAccess = ({ req, doc }) => {
  if (isPlatformSuperAdmin(req.user)) return true
  return Boolean(req.user) && isSelf(req.user?.id, doc?.id)
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    verify: true,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  admin: {
    useAsTitle: 'email',
    group: 'Administration',
    defaultColumns: ['name', 'email', 'status'],
  },
  access: {
    read: scopedUserAccess('users.update'),
    create: scopedUserAccess('users.create'),
    update: scopedUserAccess('users.update'),
    delete: scopedUserAccess('users.delete'),
  },
  hooks: {
    // password/twoFactor.secret are stripped via the hook's default redact
    // list before the audit entry is ever written — see src/hooks/auditLog.ts
    afterChange: [createAuditAfterChangeHook('users')],
    afterDelete: [createAuditAfterDeleteHook('users')],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    {
      name: 'isPlatformSuperAdmin',
      type: 'checkbox',
      defaultValue: false,
      access: {
        // Prevents privilege escalation: no tenant-scoped permission, no
        // matter how it's composed, can ever grant this flag.
        update: platformSuperAdminOnlyField,
      },
      admin: {
        position: 'sidebar',
        description: 'Cross-tenant operator access (blueinctech). Platform Super Admin-only to set.',
      },
    },
    {
      name: 'tenantMemberships',
      type: 'array',
      fields: [
        { name: 'tenant', type: 'relationship', relationTo: 'tenants', required: true },
        { name: 'role', type: 'relationship', relationTo: 'roles', required: true },
      ],
    },
    {
      name: 'twoFactor',
      type: 'group',
      access: {
        read: selfOrPlatformSuperAdminField,
        update: selfOrPlatformSuperAdminField,
      },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false },
        {
          name: 'secret',
          type: 'text',
          admin: { hidden: true, description: 'TOTP secret, encrypted at rest — never exposed to the admin UI' },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: ['active', 'deactivated'],
      admin: { position: 'sidebar' },
    },
  ],
}
