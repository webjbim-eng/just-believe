import type { CollectionConfig } from 'payload'
import { composeAccess } from '../access/composeAccess'
import { hasPermission } from '../access/hasPermission'
import { withTenantScope } from '../access/withTenantScope'
import { tenantField } from '../fields/tenantField'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * Records of truth for donations are written exclusively by server-side
 * verify/webhook routes for whichever processor handled the charge
 * (src/app/api/donations/verify + api/webhooks/paystack/[tenantSlug] for
 * Paystack; src/app/(public)/give/success + api/webhooks/stripe/[tenantSlug]
 * for Stripe — see docs/02-architecture.md §6), all calling the Local API
 * with `overrideAccess: true` after independently re-verifying the
 * transaction against that processor — never by a client-supplied
 * create/update through this collection's normal access path. Same
 * "system-writer, admin-reads-only" shape as AuditLogs.ts. A recurring
 * donation produces one row per successful charge (the initial payment and
 * every subsequent monthly charge each fire their own event) rather than a
 * separate subscription entity — matches how a real donation ledger reads.
 *
 * `useAsTitle: paystackReference` is blank for Stripe-originated rows (they
 * populate `stripeSessionId` instead) — Payload falls back to showing the
 * row's id in the admin list title for those, which is a plain reflection
 * of "this field doesn't apply" rather than a bug worth a synthetic title
 * field for.
 */
export const Donations: CollectionConfig = {
  slug: 'donations',
  admin: {
    useAsTitle: 'paystackReference',
    group: 'Giving',
    defaultColumns: ['donorName', 'amount', 'currency', 'processor', 'fund', 'status', 'createdAt'],
  },
  access: {
    read: composeAccess(hasPermission('donations.view'), withTenantScope()),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  hooks: {
    afterChange: [createAuditAfterChangeHook('donations')],
    afterDelete: [createAuditAfterDeleteHook('donations')],
  },
  fields: [
    tenantField,
    { name: 'donorName', type: 'text', admin: { description: 'Empty if the donor chose to give anonymously' } },
    { name: 'donorEmail', type: 'email' },
    { name: 'amount', type: 'number', required: true, admin: { description: 'Major currency unit (e.g. 5000 NGN, not kobo) — converted from Paystack\'s subunit amount on verify' } },
    { name: 'currency', type: 'select', required: true, options: ['NGN', 'USD'] },
    {
      name: 'usdAmount',
      type: 'number',
      admin: {
        description: 'Only populated when currency is already USD (amount === usdAmount). No live FX rate is integrated, so NGN donations leave this blank rather than show a fabricated conversion — see docs/00-decisions-log.md.',
      },
    },
    {
      // 2026-08-12: 'general'/'special-campaign' renamed to 'tithe'/
      // 'offering' — standard church-giving categories, per Jimmy's
      // correction. Renamed the enum values themselves, not just admin-
      // facing labels, since no real donation has ever been processed
      // (Give page/checkout still show "coming soon" everywhere this was
      // checked this session) — nothing depends on the old value strings.
      name: 'fund',
      type: 'select',
      required: true,
      options: ['tithe', 'mission-projects', 'child-sponsorship', 'offering'],
    },
    {
      name: 'processor',
      type: 'select',
      required: true,
      options: ['paystack', 'stripe'],
      admin: { description: 'Which gateway processed this charge — determines which reference field below is populated' },
    },
    {
      name: 'paystackReference',
      type: 'text',
      unique: true,
      admin: { description: 'Set only when processor is Paystack. NULLs don\'t collide under a unique constraint, so Stripe rows leaving this blank is fine.' },
    },
    {
      name: 'paystackSubscriptionCode',
      type: 'text',
      admin: { description: 'Set only when this Paystack charge belongs to a recurring Plan (monthly giving)' },
    },
    {
      name: 'stripeSessionId',
      type: 'text',
      unique: true,
      admin: { description: 'Set only when processor is Stripe — the Checkout Session id, this processor\'s idempotency key' },
    },
    {
      name: 'stripeSubscriptionId',
      type: 'text',
      admin: { description: 'Set only when this Stripe charge belongs to a subscription (monthly giving)' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: ['completed', 'refunded', 'failed'],
    },
  ],
}
