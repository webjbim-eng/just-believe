import type { Access, CollectionConfig, FieldAccess } from 'payload'
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

/**
 * secretKey is a live Paystack API credential (server-side charge
 * verification, Plan creation) — never returned to a browser. Collection
 * read access (ownTenantOnly) already limits who can reach this document at
 * all; this field-level check narrows it further to the same
 * website.settings permission that gates editing the rest of the tenant's
 * config, so a lower-permission tenant member with read access to their own
 * tenant still can't see it. There is no encryption-at-rest here — this is
 * app-layer access control only, same as every other access check in this
 * codebase (see docs/04-auth-rbac.md). Real encryption-at-rest would need a
 * field hook + KMS integration, which doesn't exist anywhere in this stack
 * yet and is out of scope for this build.
 */
const paystackSecretFieldAccess: FieldAccess = async ({ req }) => {
  if (isPlatformSuperAdmin(req.user)) return true
  return Boolean(await hasPermission('website.settings')({ req } as Parameters<Access>[0]))
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
      name: 'paystack',
      type: 'group',
      admin: { description: 'Per-tenant Paystack config — never a shared platform-wide account. Use test-mode keys (pk_test_/sk_test_) until this tenant is ready to accept live donations.' },
      fields: [
        {
          name: 'publicKey',
          type: 'text',
          admin: { description: 'Safe to expose client-side — used to open the Paystack checkout popup (pk_test_... or pk_live_...)' },
        },
        {
          name: 'secretKey',
          type: 'text',
          access: { read: paystackSecretFieldAccess },
          admin: { description: 'Server-side only — verifies transactions and creates recurring Plans. Never sent to the browser (sk_test_... or sk_live_...)' },
        },
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
