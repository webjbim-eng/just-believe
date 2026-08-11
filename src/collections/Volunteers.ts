import type { CollectionConfig } from 'payload'
import { submissionAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

export const VolunteerApplications: CollectionConfig = {
  slug: 'volunteer-applications',
  admin: {
    useAsTitle: 'name',
    group: 'Engagement',
    defaultColumns: ['name', 'areaOfInterest', 'status', 'createdAt'],
  },
  access: submissionAccess('volunteers.manage', 'volunteers.manage'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('volunteer-applications')],
    afterDelete: [createAuditAfterDeleteHook('volunteer-applications')],
  },
  fields: [
    tenantField,
    { name: 'name', type: 'text', required: true },
    { name: 'contact', type: 'text', required: true },
    { name: 'areaOfInterest', type: 'text' },
    { name: 'message', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: ['new', 'reviewing', 'approved', 'declined'],
    },
  ],
}
