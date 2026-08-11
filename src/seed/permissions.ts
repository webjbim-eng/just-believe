/**
 * The full permission catalog, verbatim from docs/04-auth-rbac.md §2.3.
 * Reference data — new permissions ship as an addition here alongside the
 * code change that adds the capability they gate, not created ad hoc
 * through the admin UI (Permissions.access.create is Platform Super
 * Admin-only). Seeded idempotently by src/seed/run.ts (upsert by `key`).
 */
export type PermissionSeed = {
  key: string
  module: string
  description: string
}

export const permissionCatalog: PermissionSeed[] = [
  { key: 'users.create', module: 'Users', description: 'Invite/create users within the tenant' },
  { key: 'users.update', module: 'Users', description: 'Edit users within the tenant' },
  { key: 'users.delete', module: 'Users', description: 'Remove users within the tenant' },
  { key: 'users.invite', module: 'Users', description: 'Send user invitations' },

  { key: 'roles.manage', module: 'Access Control', description: 'Create/edit/delete roles and their permissions' },
  { key: 'audit.view', module: 'Access Control', description: 'View the audit log' },

  { key: 'website.settings', module: 'Website', description: 'Edit tenant branding, contact info, notification settings' },
  { key: 'homepage.manage', module: 'Website', description: 'Edit the homepage builder (sections, order, visibility)' },
  { key: 'navigation.manage', module: 'Website', description: 'Edit header navigation and footer' },

  { key: 'pages.publish', module: 'Content', description: 'Create/edit/publish arbitrary Pages' },
  { key: 'ministries.manage', module: 'Content', description: 'Manage Ministries program pages' },
  { key: 'missions.manage', module: 'Content', description: 'Manage Missions (specific mission trips/projects)' },
  { key: 'leadership.manage', module: 'Content', description: 'Manage Leadership profiles and the Founder page' },

  { key: 'events.manage', module: 'Events', description: 'Create/edit/publish Events' },
  { key: 'events.registrations.view', module: 'Events', description: 'View event registrants' },
  { key: 'events.registrations.export', module: 'Events', description: 'Export event registrant lists' },

  { key: 'sermons.publish', module: 'Sermons', description: 'Create/edit/publish Sermons' },
  { key: 'devotionals.publish', module: 'Devotionals', description: 'Create/edit/publish Devotionals' },

  { key: 'books.manage', module: 'Books & Resources', description: 'Manage Books' },
  { key: 'resources.manage', module: 'Books & Resources', description: 'Manage downloadable Resources' },

  { key: 'media.upload', module: 'Media', description: 'Upload media files' },
  { key: 'media.manage', module: 'Media', description: 'Edit/delete/organize media files' },

  { key: 'blog.publish', module: 'Blog', description: 'Create/edit/publish Blog posts' },
  { key: 'blog.categories.manage', module: 'Blog', description: 'Manage blog categories and tags' },

  { key: 'testimonials.approve', module: 'Testimonials', description: 'Approve and publish submitted testimonials' },

  { key: 'prayer.view', module: 'Prayer', description: 'View prayer requests' },
  { key: 'prayer.manage', module: 'Prayer', description: 'Update status/assignment/notes on prayer requests' },

  { key: 'counseling.view', module: 'Counseling', description: 'View counseling requests' },
  { key: 'counseling.manage', module: 'Counseling', description: 'Update status/assignment/notes on counseling requests' },

  { key: 'messages.view', module: 'Messages', description: 'View website contact enquiries' },
  { key: 'messages.manage', module: 'Messages', description: 'Update status/assignment on website contact enquiries' },

  { key: 'volunteers.manage', module: 'Volunteers', description: 'Review and manage volunteer applications' },
  { key: 'partners.manage', module: 'Partners', description: 'Manage partner records and logos' },

  { key: 'newsletter.manage', module: 'Newsletter', description: 'View/manage newsletter subscribers' },
  { key: 'newsletter.export', module: 'Newsletter', description: 'Export newsletter subscriber list' },

  { key: 'donations.view', module: 'Donations', description: 'View donation records' },
  { key: 'donations.export', module: 'Donations', description: 'Export donation records' },
  { key: 'donations.settings', module: 'Donations', description: 'Configure PayPal/fund settings' },

  { key: 'analytics.view', module: 'Analytics', description: 'View the analytics dashboard' },
  { key: 'seo.manage', module: 'SEO', description: 'Edit SEO metadata across content' },

  { key: 'tenant.manage', module: 'Platform', description: 'Create/suspend tenants (platform-scope only)' },
]
