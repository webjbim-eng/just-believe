import type { Field } from 'payload'

/**
 * Lightweight in-house SEO field group (FR-CMS-03/FR-SEO-01) rather than
 * @payloadcms/plugin-seo — kept hand-rolled for this batch to avoid taking
 * on an unreviewed plugin's exact API surface across a dozen collections at
 * once. Revisit swapping to the official plugin in isolation later; the
 * field shape (metaTitle/metaDescription/ogImage) is compatible either way.
 */
export const seoFields: Field = {
  name: 'seo',
  type: 'group',
  admin: { position: 'sidebar' },
  fields: [
    { name: 'metaTitle', type: 'text', localized: true },
    { name: 'metaDescription', type: 'textarea', localized: true },
    { name: 'ogImage', type: 'upload', relationTo: 'media' },
    { name: 'noIndex', type: 'checkbox', defaultValue: false },
  ],
}
