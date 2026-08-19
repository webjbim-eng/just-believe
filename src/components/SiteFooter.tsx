import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SocialIcon } from './SocialIcon'
import { NewsletterMiniForm } from './NewsletterMiniForm'

/* Same real, licensed photography already used across the site (Hero,
   Prayer, MinistryPathways, ...) — reused here purely as texture, same as
   every other decorative use of these photos, not claimed to depict a
   specific real JBIM event. */
const galleryThumbnails = [
  '/images/worship-service.jpg',
  '/images/open-bible.jpg',
  '/images/prayer-silhouette.jpg',
  '/images/congregation-seated.jpg',
  '/images/community-hands.jpg',
  '/images/candlelight.jpg',
]

/**
 * A proper conclusion, not a link dump (2026-08-10 directive). Explore
 * queries the live `navigation` collection directly rather than a
 * duplicated static copy — one source of truth, same pattern
 * SiteNavigation already uses, so it can never drift out of sync. No
 * "Ministries"/"Resources" columns: there's no per-ministry detail route
 * or resource library built yet, so a column of distinct links there would
 * be dead-end UX, not real content.
 *
 * Background is --navy-950 (the darkest structural tone, matching the nav
 * and announcement bar) rather than --color-base/--color-primary — those
 * two are still one step lighter (navy-900/navy-850) under the v8 dark
 * redesign, and the footer is meant to read as the deepest shade on the
 * page, same as public/jbim/css/ministry.css's .footer.
 */
export async function SiteFooter({ tenantId }: { tenantId: string }) {
  const payload = await getPayload({ config })
  const [{ docs: footerDocs }, { docs: navDocs }, { docs: siteSettingsDocs }] = await Promise.all([
    payload.find({ collection: 'footer', where: { tenant: { equals: tenantId } }, limit: 1, overrideAccess: true }),
    payload.find({ collection: 'navigation', where: { tenant: { equals: tenantId } }, limit: 1, overrideAccess: true }),
    payload.find({ collection: 'site-settings', where: { tenant: { equals: tenantId } }, limit: 1, overrideAccess: true }),
  ])
  const footer = footerDocs[0]
  const navItems = navDocs[0]?.items ?? []
  // 2026-08-19: infoEmail (not contactEmail — that's the Contact page's own
  // address) — three purpose-specific addresses now exist on SiteSettings,
  // see sendDonationReceipt.ts and contact/page.tsx for the other two.
  const infoEmail = siteSettingsDocs[0]?.infoEmail
  // 2026-08-16: this "Connect" column used to be a fourth hardcoded copy
  // of the same real email/YouTube/Facebook links footer.socialLinks (the
  // icon row above) and SiteSettings already store — one real source now,
  // admin-editable in two places instead of dead code in a fifth.
  const connectLinks = [
    ...(infoEmail ? [{ key: 'email', label: 'Email', value: infoEmail, href: `mailto:${infoEmail}` }] : []),
    ...(footer?.socialLinks ?? []).map((social) => ({
      key: social.platform,
      label: social.platform,
      value: social.label || social.platform.charAt(0).toUpperCase() + social.platform.slice(1),
      href: social.url,
    })),
  ]

  return (
    <footer style={{ background: 'var(--navy-950)', color: 'var(--color-text-muted-on-dark)', marginTop: '2rem', borderTop: '1px solid var(--line)' }}>
      <div className="container footer-grid" style={{ padding: '4.5rem 1.5rem 3rem', display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 1fr)', gap: '3rem' }}>
        <div style={{ maxWidth: '22rem' }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '1.25rem' }}>
            <Image
              src="/brand/jbim-logo-white.png"
              alt="Just Believe International Missions"
              width={40}
              height={40}
              style={{ objectFit: 'contain', height: 40, width: 'auto' }}
            />
            <span style={{ fontFamily: 'var(--font-heading), Georgia, serif', fontWeight: 700, fontSize: '1.0625rem', color: '#fff', lineHeight: 1.15 }}>
              Just Believe
              <br />
              International Missions
            </span>
          </a>
          <p style={{ color: 'var(--color-text-muted-on-dark)', fontSize: 'var(--text-body-sm)', marginBottom: '1.5rem' }}>
            A Christ-centered, faith-based nonprofit proclaiming the Gospel, equipping believers, and serving communities
            around the world.
          </p>
          {footer?.socialLinks && footer.socialLinks.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {footer.socialLinks.map((social, index) => (
                <a key={index} href={social.url} aria-label={social.platform} style={{ textDecoration: 'none' }}>
                  <SocialIcon platform={social.platform} />
                </a>
              ))}
            </div>
          )}
        </div>

        {navItems.length > 0 && (
          <div>
            <p className="card-eyebrow">Explore</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {navItems.map((item, index) => (
                <li key={index} style={{ marginBottom: '0.625rem' }}>
                  <a href={item.link} style={{ color: 'var(--color-text-muted-on-dark)', textDecoration: 'none' }}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="card-eyebrow">Connect</p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {connectLinks.map((link) => (
              <li key={link.key} style={{ marginBottom: '0.625rem' }}>
                <a href={link.href} style={{ color: 'var(--color-text-muted-on-dark)', textDecoration: 'none' }}>
                  {link.value}
                </a>
              </li>
            ))}
          </ul>
          <a className="btn-outline" href="/give" style={{ marginTop: '0.75rem', padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}>
            Give
          </a>
        </div>

        <div>
          <p className="card-eyebrow">Stay Connected</p>
          <p style={{ color: 'var(--color-text-muted-on-dark)', fontSize: 'var(--text-body-sm)', marginBottom: '1rem' }}>
            Get updates on new sermons, events, and ways to get involved.
          </p>
          <NewsletterMiniForm />
        </div>

        <div>
          <p className="card-eyebrow">Gallery</p>
          <div className="footer-gallery-grid">
            {galleryThumbnails.map((src) => (
              <div
                key={src}
                aria-hidden="true"
                style={{ aspectRatio: '1 / 1', borderRadius: '6px', backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
            ))}
          </div>
        </div>

        {footer?.columns?.map((column, index) => (
          <div key={index}>
            <p className="card-eyebrow">{column.title}</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {column.links?.map((link, linkIndex) => (
                <li key={linkIndex} style={{ marginBottom: '0.625rem' }}>
                  <a href={link.url} style={{ color: 'var(--color-text-muted-on-dark)', textDecoration: 'none' }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {footer?.copyrightText && (
        <div
          className="container"
          style={{
            padding: '1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.8125rem',
          }}
        >
          {footer.copyrightText}
        </div>
      )}
    </footer>
  )
}
