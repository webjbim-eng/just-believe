import type { CollectionConfig } from 'payload'
import { submissionAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * General website enquiries (the public /contact form) — distinct from
 * PrayerRequests/CounselingRequests, which carry more sensitive content
 * and their own dedicated permissions. Same submissionAccess shape as
 * those two: anyone can create (public form), reading/managing requires
 * messages.view/messages.manage.
 */
export const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    useAsTitle: 'subject',
    group: 'Engagement',
    defaultColumns: ['name', 'subject', 'status', 'assignedTo', 'createdAt'],
  },
  access: submissionAccess('messages.view', 'messages.manage'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('messages')],
    afterDelete: [createAuditAfterDeleteHook('messages')],
  },
  fields: [
    tenantField,
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'subject', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'read', 'in-progress', 'resolved', 'archived'],
    },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users' },
  ],
}
