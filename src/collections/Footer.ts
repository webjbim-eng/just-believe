import type { CollectionConfig } from 'payload'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

// See SiteSettings.ts for why this is a collection (unique tenant) rather
// than a Payload Global.
export const Footer: CollectionConfig = {
  slug: 'footer',
  admin: {
    useAsTitle: 'tenant',
    group: 'Website Content',
  },
  // 2026-08-16: create disabled — one doc per tenant, same reasoning as
  // SiteSettings.ts.
  access: { ...publicContentAccess('navigation.manage'), create: () => false },
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('footer')],
    afterDelete: [createAuditAfterDeleteHook('footer')],
  },
  fields: [
    { ...tenantField, unique: true },
    {
      name: 'columns',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true, localized: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      // 2026-08-16: the only real social-link mechanism now — SiteSettings
      // used to duplicate a second, unread `socialLinks` field, and the
      // footer's "Connect" column had a THIRD, hardcoded copy of the same
      // real values. This one array now drives every social link on the
      // site (see SiteFooter.tsx, contact/page.tsx). `label` is optional
      // display-text control (e.g. "@jbiminc") — falls back to the
      // capitalized platform name when unset.
      name: 'socialLinks',
      type: 'array',
      fields: [
        { name: 'platform', type: 'select', options: ['facebook', 'instagram', 'youtube', 'x', 'tiktok'], required: true },
        { name: 'url', type: 'text', required: true },
        { name: 'label', type: 'text', admin: { description: 'Optional display text, e.g. "@jbiminc" — defaults to the platform name' } },
      ],
    },
    { name: 'copyrightText', type: 'text', localized: true },
  ],
}
