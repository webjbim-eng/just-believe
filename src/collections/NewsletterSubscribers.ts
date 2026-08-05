import type { CollectionConfig } from 'payload'
import { submissionAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  admin: {
    useAsTitle: 'email',
    group: 'Care',
    defaultColumns: ['email', 'confirmed', 'unsubscribedAt'],
  },
  access: submissionAccess('newsletter.manage', 'newsletter.manage'),
  hooks: {
    afterChange: [createAuditAfterChangeHook('newsletter-subscribers')],
    afterDelete: [createAuditAfterDeleteHook('newsletter-subscribers')],
  },
  fields: [
    tenantField,
    { name: 'email', type: 'email', required: true },
    { name: 'confirmed', type: 'checkbox', defaultValue: false, admin: { description: 'Double opt-in confirmation, per docs/02-architecture.md §1 (Resend)' } },
    { name: 'confirmedAt', type: 'date' },
    {
      name: 'unsubscribedAt',
      type: 'date',
      admin: { description: 'Presence of a value = inactive subscriber' },
    },
  ],
}
