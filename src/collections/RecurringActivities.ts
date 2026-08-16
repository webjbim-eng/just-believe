import type { CollectionConfig } from 'payload'
import { publicContentAccess } from '../access/publicContentAccess'
import { tenantField } from '../fields/tenantField'
import { slugField } from '../fields/slug'
import { setTenantFromRequest } from '../hooks/setTenantFromRequest'
import { createAuditAfterChangeHook, createAuditAfterDeleteHook } from '../hooks/auditLog'

const DAY_OPTIONS = [
  { label: 'Sunday', value: 'sun' },
  { label: 'Monday', value: 'mon' },
  { label: 'Tuesday', value: 'tue' },
  { label: 'Wednesday', value: 'wed' },
  { label: 'Thursday', value: 'thu' },
  { label: 'Friday', value: 'fri' },
  { label: 'Saturday', value: 'sat' },
]

/**
 * 2026-08-16 (Jimmy's request): standing weekly ministry programs
 * (Children's Bible Institute, Word and Worship Encounter, Prayer &
 * Intercession, ...) — replaces RecurringServices, which only supported
 * one flat schedule string per activity and couldn't represent real
 * content like Children's Bible Institute's two age-group sessions or
 * Prayer & Intercession's three differently-timezoned sessions. Distinct
 * from Events (one-off dated occasions, optional registration) and from
 * Locations (physical ministry presence) — `locationText` here is a free
 * label ("Online", a room name), not a relationship to Locations.
 */
export const RecurringActivities: CollectionConfig = {
  slug: 'recurring-activities',
  labels: { singular: 'Recurring Activity', plural: 'Recurring Activities' },
  admin: {
    useAsTitle: 'name',
    group: 'Website Content',
    defaultColumns: ['name', 'category', '_status'],
  },
  versions: { drafts: true },
  access: publicContentAccess('events.manage'),
  hooks: {
    beforeChange: [setTenantFromRequest],
    afterChange: [createAuditAfterChangeHook('recurring-activities')],
    afterDelete: [createAuditAfterDeleteHook('recurring-activities')],
  },
  fields: [
    tenantField,
    { name: 'name', type: 'text', required: true, localized: true, admin: { description: 'e.g. "Children\'s Bible Institute", "Prayer & Intercession"' } },
    slugField('recurring-activities'),
    { name: 'category', type: 'text', admin: { description: 'Optional free label, e.g. "Children\'s Ministry", "Prayer"' } },
    { name: 'shortDescription', type: 'text' },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'displayOrder', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    { name: 'language', type: 'text', admin: { description: 'e.g. "English, French, Italian" — free text, not every activity offers the same languages' } },
    { name: 'locationText', type: 'text', admin: { description: 'Free label, e.g. "Online", "Main Sanctuary" — not a link to Locations' } },
    { name: 'contactText', type: 'text', admin: { description: 'e.g. "Contact us for more details"' } },
    { name: 'contactUrl', type: 'text', admin: { description: 'Where the contact text links, e.g. "/contact" or a mailto: link' } },
    { name: 'registrationUrl', type: 'text' },
    { name: 'onlineMeetingUrl', type: 'text', admin: { description: 'Direct join link for the whole activity, e.g. a YouTube channel or Zoom link' } },
    { name: 'socialUrl', type: 'text' },
    {
      // Named `schedule` (not `scheduleEntries`) and its own `days` (not
      // `daysOfWeek`) below deliberately short — the auto-generated
      // identifier for a hasMany select nested inside a versioned array
      // (built from the collection slug + "_v_version_" + full field path)
      // exceeded Postgres's 63-char limit at the longer names, and a
      // manual `dbName` override on just the enum turned out to create a
      // live/versioned table-name mismatch (Payload names the "live" and
      // "_v" variants of a hasMany select's join table off the same
      // dbName, but only actually built the versioned one) — shorter
      // field names sidestep the whole problem instead.
      name: 'schedule',
      type: 'array',
      required: true,
      minRows: 1,
      admin: { description: 'One or more sessions — e.g. two age-group sessions, or three differently-timezoned prayer sessions' },
      fields: [
        { name: 'label', type: 'text', required: true, admin: { description: 'e.g. "Ages 2-12", "Evening Prayer", "Morning Prayer — IT"' } },
        { name: 'audienceLabel', type: 'text', admin: { description: 'Optional, e.g. "Ages 2-12" — shown separately from Label if both are set' } },
        { name: 'days', type: 'select', hasMany: true, required: true, options: DAY_OPTIONS },
        { name: 'startTime', type: 'text', required: true, admin: { description: 'e.g. "10:00 AM" — free text, not a time picker, so it displays exactly as typed' } },
        { name: 'endTime', type: 'text', admin: { description: 'Optional, e.g. "11:00 AM"' } },
        {
          name: 'timezoneLabel',
          type: 'text',
          required: true,
          admin: { description: 'Exactly as it should display, e.g. "Eastern Standard Time", "IT", "Ivory Coast" — not every session shares the organizer\'s timezone' },
        },
        { name: 'locationText', type: 'text', admin: { description: 'Optional override of the activity-level location for this specific session' } },
        { name: 'onlineMeetingUrl', type: 'text', admin: { description: 'Optional override of the activity-level join link for this specific session' } },
        { name: 'active', type: 'checkbox', defaultValue: true },
      ],
    },
  ],
}
