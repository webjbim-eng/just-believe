import type { CollectionConfig } from 'payload'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * FR-HOME's entire data model (docs/03-database-schema.md §2): which
 * blocks, in what order, with what per-instance config. The block
 * components themselves live in code (src/blocks/, not built yet) — this
 * only names them. `blockType` options mirror the block list in
 * docs/02-architecture.md §4; add here as src/blocks/ grows. See
 * SiteSettings.ts for why this is a collection (unique tenant) rather than
 * a Payload Global.
 */
export const HomepageLayout: CollectionConfig = {
  slug: 'homepage-layout',
  admin: {
    useAsTitle: 'tenant',
    group: 'Website',
  },
  versions: { drafts: true },
  access: publicContentAccess('homepage.manage'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('homepage-layout')],
    afterDelete: [createAuditAfterDeleteHook('homepage-layout')],
  },
  fields: [
    { ...tenantField, unique: true },
    {
      name: 'sections',
      type: 'array',
      fields: [
        {
          name: 'blockType',
          type: 'select',
          required: true,
          options: [
            'Hero',
            'WelcomeMessage',
            'FeaturedSermons',
            'FeaturedEvents',
            'FeaturedBooks',
            'MinistriesOverview',
            'Testimonials',
            'PartnershipInvitation',
            'NewsletterSignup',
            'RichText',
            'CTA',
          ],
        },
        { name: 'order', type: 'number', defaultValue: 0 },
        { name: 'visible', type: 'checkbox', defaultValue: true },
        { name: 'config', type: 'json', admin: { description: 'Per-block instance config — shape depends on blockType' } },
      ],
    },
  ],
}
