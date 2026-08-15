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
 * Shared by every live payment-gateway credential on this collection
 * (Paystack secretKey, Stripe secretKey/webhookSecret) — never returned to
 * a browser. Collection read access (ownTenantOnly) already limits who can
 * reach this document at all; this field-level check narrows it further to
 * the same website.settings permission that gates editing the rest of the
 * tenant's config, so a lower-permission tenant member with read access to
 * their own tenant still can't see it. There is no encryption-at-rest here
 * — this is app-layer access control only, same as every other access
 * check in this codebase (see docs/04-auth-rbac.md). Real encryption-at-
 * rest would need a field hook + KMS integration, which doesn't exist
 * anywhere in this stack yet and is out of scope for this build.
 */
const tenantSecretFieldAccess: FieldAccess = async ({ req }) => {
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
            { name: 'primary', type: 'text', admin: { description: 'Hex, e.g. #10182E (Ink)' } },
            { name: 'secondary', type: 'text', admin: { description: 'Hex, e.g. #232C55 (Indigo)' } },
            { name: 'accent', type: 'text', admin: { description: 'Hex, e.g. #C9973C (Gold)' } },
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
          access: { read: tenantSecretFieldAccess },
          admin: { description: 'Server-side only — verifies transactions and creates recurring Plans. Never sent to the browser (sk_test_... or sk_live_...)' },
        },
      ],
    },
    {
      name: 'stripe',
      type: 'group',
      admin: { description: 'Per-tenant Stripe config — a second donation option alongside Paystack, donor picks at checkout (2026-08-11). Use test-mode keys until this tenant is ready to accept live donations.' },
      fields: [
        {
          name: 'publishableKey',
          type: 'text',
          admin: { description: 'Not currently used server-side — Checkout Sessions are created and redirected to entirely server-side, no Stripe.js on the client. Stored for parity/future use only (pk_test_... or pk_live_...)' },
        },
        {
          name: 'secretKey',
          type: 'text',
          access: { read: tenantSecretFieldAccess },
          admin: { description: 'Server-side only — creates and retrieves Checkout Sessions. Never sent to the browser (sk_test_... or sk_live_...)' },
        },
        {
          name: 'webhookSecret',
          type: 'text',
          access: { read: tenantSecretFieldAccess },
          admin: { description: 'From the Stripe Dashboard when registering https://<domain>/api/webhooks/stripe/<tenant-slug> as an endpoint — verifies the Stripe-Signature header (whsec_...). Different from secretKey; Stripe signs webhooks with a per-endpoint secret, not the account key.' },
        },
      ],
    },
    {
      // 2026-08-12: a third giving option, deliberately not built like
      // Paystack/Stripe — those two have real API credentials (secret
      // keys) letting the server verify a transaction and write a
      // Donations record; PayPal here is just a business email, the
      // classic no-API-key "hosted donate button" pattern. There's no
      // secret to protect (businessEmail is meant to be handed to
      // donors), and no way to verify a payment happened or write a
      // Donations row — the donor completes the gift entirely on
      // PayPal's own site. See GiveForm.tsx and src/lib/paypal.ts.
      name: 'paypal',
      type: 'group',
      admin: { description: "Per-tenant PayPal donation email — a simple hosted-button redirect, not an API integration (no credentials to verify transactions, so PayPal gifts aren't recorded in Donations the way Paystack/Stripe ones are)." },
      fields: [
        {
          name: 'businessEmail',
          type: 'email',
          admin: { description: 'The PayPal account email donors send gifts to — safe to expose client-side, this is the same email you\'d hand out for a direct PayPal transfer.' },
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
