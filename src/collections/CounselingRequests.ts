import type { CollectionConfig } from 'payload'
import { submissionAccess } from '../access/publicContentAccess'
import { filterUsersByRoleName } from '../access/filterUsersByRoleName'
import { tenantField } from '../fields/tenantField'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

/**
 * Same shape as PrayerRequests, plus `type`. There is deliberately no
 * `confidential` field — visibility is enforced entirely by
 * submissionAccess (counseling.view/counseling.manage) + tenant scope, not
 * a toggle a submitter controls. See docs/03-database-schema.md §2.
 */
export const CounselingRequests: CollectionConfig = {
  slug: 'counseling-requests',
  admin: {
    useAsTitle: 'name',
    group: 'Engagement',
    defaultColumns: ['name', 'type', 'status', 'assignedTo', 'createdAt'],
  },
  access: submissionAccess('counseling.view', 'counseling.manage'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('counseling-requests')],
    afterDelete: [createAuditAfterDeleteHook('counseling-requests')],
  },
  fields: [
    tenantField,
    { name: 'name', type: 'text', required: true },
    { name: 'contact', type: 'text', required: true },
    { name: 'requestText', type: 'textarea', required: true },
    { name: 'type', type: 'select', required: true, options: ['biblical', 'family', 'marriage', 'individual'] },
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
      filterOptions: filterUsersByRoleName('Counseling Coordinator'),
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
