import type { Access, CollectionConfig } from 'payload'
import { getResolvedTenantId } from '../access/getResolvedTenantId'
import { hasPermission } from '../access/hasPermission'
import { isPlatformSuperAdmin, platformSuperAdminOnly, platformSuperAdminOnlyField } from '../access/isPlatformSuperAdmin'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * The tenant IS the top-level scope, so it can't be scoped by a `tenant`
 * relationship field the way every other collection is — instead it's
 * scoped by comparing the document's own id to the resolved tenant. Tenant
 * creation and suspension (status) are Platform Super Admin-only per
 * FR-TENANT-01/05; a tenant's own admins can view and edit their branding
 * once `website.settings` is composed into their role.
 */
const ownTenantOnly: Access = ({ req }) => {
  if (isPlatformSuperAdmin(req.user)) return true
  const tenantId = getResolvedTenantId(req)
  if (!tenantId) return false
  return { id: { equals: tenantId } }
}

const ownTenantWithSettingsPermission: Access = async (args) => {
  if (isPlatformSuperAdmin(args.req.user)) return true
  const permitted = await hasPermission('website.settings')(args)
  if (!permitted) return false
  return ownTenantOnly(args)
}

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    group: 'Platform',
    defaultColumns: ['name', 'slug', 'status'],
  },
  access: {
    read: ownTenantOnly,
    create: platformSuperAdminOnly,
    update: ownTenantWithSettingsPermission,
    delete: platformSuperAdminOnly,
  },
  hooks: {
    afterChange: [createAuditAfterChangeHook('tenants')],
    afterDelete: [createAuditAfterDeleteHook('tenants')],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Used for the *.jbim-platform.app subdomain' },
    },
    {
      name: 'domains',
      type: 'array',
      admin: { description: 'Custom domains resolved to this tenant, e.g. justbelieveintmissions.org' },
      fields: [{ name: 'domain', type: 'text', required: true, unique: true }],
    },
    {
      name: 'branding',
      type: 'group',
      fields: [
        { name: 'logoLight', type: 'upload', relationTo: 'media' },
        { name: 'logoDark', type: 'upload', relationTo: 'media' },
        {
          name: 'colors',
          type: 'group',
          fields: [
            { name: 'primary', type: 'text', admin: { description: 'Hex, e.g. #1E3A8A (Royal Blue)' } },
            { name: 'secondary', type: 'text', admin: { description: 'Hex, e.g. #4C1D95 (Deep Purple)' } },
            { name: 'accent', type: 'text', admin: { description: 'Hex, e.g. #C9A227 (Gold)' } },
          ],
        },
      ],
    },
    {
      name: 'locales',
      type: 'group',
      fields: [
        {
          name: 'defaultLocale',
          type: 'select',
          defaultValue: 'en',
          options: ['en', 'fr', 'it', 'es'],
        },
        {
          name: 'supportedLocales',
          type: 'select',
          hasMany: true,
          defaultValue: ['en'],
          options: ['en', 'fr', 'it', 'es'],
        },
      ],
    },
    {
      name: 'paypal',
      type: 'group',
      admin: { description: 'Per-tenant PayPal Checkout config — never a shared platform-wide account' },
      fields: [
        { name: 'clientId', type: 'text', admin: { description: 'Encrypted at rest' } },
        { name: 'merchantEmail', type: 'email' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: ['active', 'suspended'],
      access: {
        update: platformSuperAdminOnlyField,
      },
      admin: {
        position: 'sidebar',
        description: 'Suspending/deleting a tenant is Platform Super Admin-only and audit-logged (FR-TENANT-05)',
      },
    },
  ],
}
