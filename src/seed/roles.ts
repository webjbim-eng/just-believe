/**
 * Seed system roles, verbatim from docs/04-auth-rbac.md §2.4. Created per
 * tenant with isSystemRole=true — editable, protected from deletion (see
 * Roles.ts beforeDelete hook), and a starting point tenant Super Admins can
 * clone into fully custom roles (FR-RBAC-03).
 */
export type RoleSeed = {
  name: string
  permissions: string[]
}

const allPermissionKeys = (keys: string[]) => keys

export const systemRoleDefinitions: RoleSeed[] = [
  {
    name: 'Super Administrator',
    // Every tenant-scope permission. tenant.manage is deliberately excluded
    // — that one is platform-scope only, never grantable to a tenant role.
    permissions: allPermissionKeys([
      'users.create', 'users.update', 'users.delete', 'users.invite',
      'roles.manage', 'audit.view',
      'website.settings', 'homepage.manage', 'navigation.manage',
      'pages.publish', 'ministries.manage', 'missions.manage', 'leadership.manage',
      'events.manage', 'events.registrations.view', 'events.registrations.export',
      'sermons.publish', 'devotionals.publish',
      'books.manage', 'resources.manage',
      'media.upload', 'media.manage',
      'blog.publish', 'blog.categories.manage',
      'testimonials.approve',
      'prayer.view', 'prayer.manage',
      'counseling.view', 'counseling.manage',
      'messages.view', 'messages.manage',
      'volunteers.manage', 'partners.manage',
      'newsletter.manage', 'newsletter.export',
      'donations.view', 'donations.export', 'donations.settings',
      'analytics.view', 'seo.manage',
    ]),
  },
  {
    name: 'Administrator',
    // Same as Super Administrator minus roles.manage (docs/04-auth-rbac.md §2.4).
    permissions: allPermissionKeys([
      'users.create', 'users.update', 'users.delete', 'users.invite',
      'audit.view',
      'website.settings', 'homepage.manage', 'navigation.manage',
      'pages.publish', 'ministries.manage', 'missions.manage', 'leadership.manage',
      'events.manage', 'events.registrations.view', 'events.registrations.export',
      'sermons.publish', 'devotionals.publish',
      'books.manage', 'resources.manage',
      'media.upload', 'media.manage',
      'blog.publish', 'blog.categories.manage',
      'testimonials.approve',
      'prayer.view', 'prayer.manage',
      'counseling.view', 'counseling.manage',
      'messages.view', 'messages.manage',
      'volunteers.manage', 'partners.manage',
      'newsletter.manage', 'newsletter.export',
      'donations.view', 'donations.export', 'donations.settings',
      'analytics.view', 'seo.manage',
    ]),
  },
  {
    name: 'Content Manager',
    permissions: [
      'pages.publish', 'homepage.manage', 'ministries.manage', 'missions.manage', 'leadership.manage',
      'blog.publish', 'blog.categories.manage',
      'books.manage', 'resources.manage',
      'testimonials.approve', 'seo.manage',
    ],
  },
  {
    name: 'Media Manager',
    permissions: ['media.upload', 'media.manage'],
  },
  {
    name: 'Event Manager',
    permissions: ['events.manage', 'events.registrations.view', 'events.registrations.export'],
  },
  {
    name: 'Prayer Coordinator',
    permissions: ['prayer.view', 'prayer.manage'],
  },
  {
    name: 'Counseling Coordinator',
    permissions: ['counseling.view', 'counseling.manage'],
  },
  {
    name: 'Finance Manager',
    permissions: ['donations.view', 'donations.export', 'donations.settings'],
  },
  {
    name: 'Volunteer Coordinator',
    permissions: ['volunteers.manage', 'partners.manage'],
  },
  {
    name: 'Translator',
    // Deliberately no collection-level publish permissions — Translator
    // access is enforced at the field level (locale-restricted), not
    // through this permission list. See docs/04-auth-rbac.md §2.5.
    permissions: [],
  },
]
