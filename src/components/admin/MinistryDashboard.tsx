import type { AdminViewServerProps } from 'payload'
import { hasPermission } from '../../access/hasPermission'
import { getResolvedTenantId } from '../../access/getResolvedTenantId'

type StatCard = { label: string; count: number; href: string; accent?: boolean }
type QuickAction = { label: string; href: string }

/**
 * The Ministry Dashboard — replaces Payload's stock `/admin` landing view
 * (wired via payload.config.ts's admin.components.views.dashboard). Since
 * `/admin` is already Payload's default post-login route, this becomes the
 * default authenticated experience automatically; no separate redirect
 * logic exists or is needed anywhere.
 *
 * Every section is gated by the SAME hasPermission() used by every
 * collection's own access control (src/access/hasPermission.ts) — not a
 * parallel authorization system. A Content Manager with no prayer.view
 * permission simply never sees that query run or that card render.
 */
export async function MinistryDashboard({ initPageResult }: AdminViewServerProps) {
  const { req } = initPageResult
  const payload = req.payload
  const user = req.user
  const tenantId = getResolvedTenantId(req)

  if (!user || !tenantId) {
    return (
      <div style={{ padding: '3rem', color: 'var(--theme-text)' }}>
        <p>No tenant resolved for this request — sign in again or check the request host.</p>
      </div>
    )
  }

  const tenantWhere = { tenant: { equals: tenantId } } as const

  const [
    canContent,
    canMinistries,
    canEvents,
    canMessages,
    canPrayer,
    canCounseling,
    canVolunteers,
    canNewsletter,
    canDonations,
    canAudit,
    canMedia,
  ] = await Promise.all([
    hasPermission('blog.publish')({ req }),
    hasPermission('ministries.manage')({ req }),
    hasPermission('events.manage')({ req }),
    hasPermission('messages.view')({ req }),
    hasPermission('prayer.view')({ req }),
    hasPermission('counseling.view')({ req }),
    hasPermission('volunteers.manage')({ req }),
    hasPermission('newsletter.manage')({ req }),
    hasPermission('donations.view')({ req }),
    hasPermission('audit.view')({ req }),
    hasPermission('media.upload')({ req }),
  ])

  const statCards: StatCard[] = []

  if (canContent === true) {
    const [{ totalDocs: published }, { totalDocs: drafts }] = await Promise.all([
      payload.count({ collection: 'blog-posts', where: { and: [tenantWhere, { _status: { equals: 'published' } }] }, overrideAccess: true }),
      payload.count({ collection: 'blog-posts', where: { and: [tenantWhere, { _status: { equals: 'draft' } }] }, overrideAccess: true }),
    ])
    statCards.push({ label: 'Published Articles', count: published, href: '/admin/collections/blog-posts?where[_status][equals]=published' })
    statCards.push({ label: 'Draft Articles', count: drafts, href: '/admin/collections/blog-posts?where[_status][equals]=draft' })
  }

  if (canEvents === true) {
    const { totalDocs } = await payload.count({
      collection: 'events',
      where: { and: [tenantWhere, { startDate: { greater_than_equal: new Date().toISOString() } }] },
      overrideAccess: true,
    })
    statCards.push({ label: 'Upcoming Events', count: totalDocs, href: '/admin/collections/events' })
  }

  if (canMessages === true) {
    const { totalDocs } = await payload.count({ collection: 'messages', where: { and: [tenantWhere, { status: { equals: 'new' } }] }, overrideAccess: true })
    statCards.push({ label: 'New Messages', count: totalDocs, href: '/admin/collections/messages?where[status][equals]=new', accent: totalDocs > 0 })
  }

  if (canPrayer === true) {
    const { totalDocs } = await payload.count({ collection: 'prayer-requests', where: { and: [tenantWhere, { status: { equals: 'new' } }] }, overrideAccess: true })
    statCards.push({ label: 'New Prayer Requests', count: totalDocs, href: '/admin/collections/prayer-requests?where[status][equals]=new', accent: totalDocs > 0 })
  }

  if (canCounseling === true) {
    const { totalDocs } = await payload.count({ collection: 'counseling-requests', where: { and: [tenantWhere, { status: { equals: 'new' } }] }, overrideAccess: true })
    statCards.push({ label: 'New Counseling Requests', count: totalDocs, href: '/admin/collections/counseling-requests?where[status][equals]=new', accent: totalDocs > 0 })
  }

  if (canVolunteers === true) {
    const { totalDocs } = await payload.count({ collection: 'volunteer-applications', where: { and: [tenantWhere, { status: { equals: 'new' } }] }, overrideAccess: true })
    statCards.push({ label: 'New Volunteer Applications', count: totalDocs, href: '/admin/collections/volunteer-applications?where[status][equals]=new' })
  }

  if (canNewsletter === true) {
    const { totalDocs } = await payload.count({ collection: 'newsletter-subscribers', where: tenantWhere, overrideAccess: true })
    statCards.push({ label: 'Newsletter Subscribers', count: totalDocs, href: '/admin/collections/newsletter-subscribers' })
  }

  if (canDonations === true) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { totalDocs } = await payload.count({
      collection: 'donations',
      where: { and: [tenantWhere, { createdAt: { greater_than_equal: thirtyDaysAgo } }] },
      overrideAccess: true,
    })
    statCards.push({ label: 'Donations (Last 30 Days)', count: totalDocs, href: '/admin/collections/donations' })
  }

  if (canMinistries === true) {
    const { totalDocs } = await payload.count({ collection: 'ministries', where: tenantWhere, overrideAccess: true })
    statCards.push({ label: 'Ministries', count: totalDocs, href: '/admin/collections/ministries' })
  }

  let recentActivity: { id: string | number; action: string; collectionSlug: string; documentId: string; createdAt: string }[] = []
  if (canAudit === true) {
    const { docs } = await payload.find({
      collection: 'audit-logs',
      where: tenantWhere,
      sort: '-createdAt',
      limit: 8,
      overrideAccess: true,
    })
    recentActivity = docs.map((d) => ({ id: d.id, action: d.action, collectionSlug: d.collectionSlug, documentId: d.documentId, createdAt: d.createdAt }))
  }

  const quickActions: QuickAction[] = []
  if (canContent === true) quickActions.push({ label: 'Create Article', href: '/admin/collections/blog-posts/create' })
  if (canEvents === true) quickActions.push({ label: 'Create Event', href: '/admin/collections/events/create' })
  quickActions.push({ label: 'Upload Sermon', href: '/admin/collections/sermons/create' })
  if (canMedia === true) quickActions.push({ label: 'Upload Media', href: '/admin/collections/media/create' })
  if (canMinistries === true) quickActions.push({ label: 'Add Ministry', href: '/admin/collections/ministries/create' })
  if (canMessages === true) quickActions.push({ label: 'View Messages', href: '/admin/collections/messages' })

  return (
    <div style={{ padding: '2.5rem clamp(1.5rem, 4vw, 3.5rem)', maxWidth: '1400px', margin: '0 auto', color: 'var(--theme-text)' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#C9A227' }}>
          Ministry Dashboard
        </p>
        <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 700 }}>Welcome back{user.name ? `, ${user.name}` : ''}</h1>
      </div>

      {quickActions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2.5rem' }}>
          {quickActions.map((action) => (
            <a
              key={action.href}
              href={action.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.625rem 1.25rem',
                borderRadius: '999px',
                background: '#1E3A8A',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {action.label}
            </a>
          ))}
        </div>
      )}

      {statCards.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {statCards.map((card) => (
            <a
              key={card.href}
              href={card.href}
              style={{
                display: 'block',
                padding: '1.5rem',
                borderRadius: '8px',
                background: 'var(--theme-elevation-0)',
                border: card.accent ? '1px solid #C9A227' : '1px solid var(--theme-elevation-100, rgba(0,0,0,0.1))',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <p style={{ margin: '0 0 0.375rem', fontSize: '0.8125rem', color: 'var(--theme-elevation-500, #6b7280)' }}>{card.label}</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: card.accent ? '#C9A227' : 'inherit' }}>{card.count}</p>
            </a>
          ))}
        </div>
      )}

      {statCards.length === 0 && (
        <p style={{ color: 'var(--theme-elevation-500, #6b7280)', marginBottom: '2.5rem' }}>
          Your role doesn&rsquo;t have visibility into any dashboard modules yet. Contact a Super Administrator if this seems wrong.
        </p>
      )}

      {canAudit === true && (
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p style={{ color: 'var(--theme-elevation-500, #6b7280)' }}>No recent activity.</p>
          ) : (
            <div style={{ borderTop: '1px solid var(--theme-elevation-100, rgba(0,0,0,0.1))' }}>
              {recentActivity.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid var(--theme-elevation-100, rgba(0,0,0,0.1))',
                    fontSize: '0.875rem',
                  }}
                >
                  <span>
                    <strong style={{ textTransform: 'capitalize' }}>{entry.action}</strong> on {entry.collectionSlug} #{entry.documentId}
                  </span>
                  <span style={{ color: 'var(--theme-elevation-500, #6b7280)' }}>{new Date(entry.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
