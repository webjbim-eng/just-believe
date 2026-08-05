import type { CollectionConfig } from 'payload'
import { submissionAccess } from '../access/publicContentAccess'
import { filterUsersByRoleName } from '../access/filterUsersByRoleName'
import { tenantField } from '../fields/tenantField'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

export const PrayerRequests: CollectionConfig = {
  slug: 'prayer-requests',
  admin: {
    useAsTitle: 'name',
    group: 'Care',
    defaultColumns: ['name', 'status', 'assignedTo', 'createdAt'],
  },
  access: submissionAccess('prayer.view', 'prayer.manage'),
  hooks: {
    afterChange: [createAuditAfterChangeHook('prayer-requests')],
    afterDelete: [createAuditAfterDeleteHook('prayer-requests')],
  },
  fields: [
    tenantField,
    { name: 'name', type: 'text', required: true },
    { name: 'contact', type: 'text', required: true },
    { name: 'requestText', type: 'textarea', required: true },
    { name: 'isPrivate', type: 'checkbox', defaultValue: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'in-prayer', 'answered', 'closed'],
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      filterOptions: filterUsersByRoleName('Prayer Coordinator'),
    },
    {
      name: 'internalNotes',
      type: 'array',
      admin: { description: 'Staff-only — never exposed on public read' },
      fields: [
        { name: 'author', type: 'relationship', relationTo: 'users' },
        { name: 'note', type: 'textarea', required: true },
        { name: 'createdAt', type: 'date', defaultValue: () => new Date().toISOString() },
      ],
    },
  ],
}
