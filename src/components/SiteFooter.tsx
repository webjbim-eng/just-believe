import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SocialIcon } from './SocialIcon'
import { NewsletterMiniForm } from './NewsletterMiniForm'

const contactLinks = [
  { label: 'Email', value: 'justbelieveinthot@gmail.com', href: 'mailto:justbelieveinthot@gmail.com' },
  { label: 'YouTube', value: '@jbiminc', href: 'https://youtube.com/@jbiminc?si=Q26o6jq34zseGPaF' },
  { label: 'Facebook', value: 'Just Believe International Missions', href: 'https://www.facebook.com/profile.php?id=61570983282514' },
]

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
 * Background is --color-primary (a fixed dark panel), NOT --color-base —
 * --color-base used to be the darkest tone back when the whole theme was
 * dark-dominant, which is what the white/rgba(255,255,255,...) text
 * throughout this file was written for. globals.css's v6 rewrite flipped
 * --color-base to mean the light cream page background instead, and this
 * component never got updated — same class of bug SiteNavigation had
 * (2026-08-11), just inverted (white text on a now-light background
 * instead of dark text on dark). Always use a dark-panel-specific token
 * or a fixed color here, never a bare --color-base/--color-text*, since
 * this component is always dark regardless of the page theme.
 */
export async function SiteFooter({ tenantId }: { tenantId: string }) {
  const payload = await getPayload({ config })
  const [{ docs: footerDocs }, { docs: navDocs }] = await Promise.all([
    payload.find({ collection: 'footer', where: { tenant: { equals: tenantId } }, limit: 1, overrideAccess: true }),
    payload.find({ collection: 'navigation', where: { tenant: { equals: tenantId } }, limit: 1, overrideAccess: true }),
  ])
  const footer = footerDocs[0]
  const navItems = navDocs[0]?.items ?? []

  return (
    <footer style={{ background: 'var(--color-primary)', color: 'var(--color-text-muted-on-dark)', marginTop: '2rem', borderTop: '1px solid var(--color-border-on-dark)' }}>
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
            {contactLinks.map((link) => (
              <li key={link.label} style={{ marginBottom: '0.625rem' }}>
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
