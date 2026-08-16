import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../access/getResolvedTenantId'
import { ScrollReveal } from '../../../components/ScrollReveal'
import { Stagger, StaggerItem } from '../../../components/Stagger'
import { ContactForm } from '../../../components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact — Just Believe International Missions',
  description: 'Get in touch with Just Believe International Missions.',
}

export default async function ContactPage() {
  const tenantId = (await headers()).get(TENANT_HEADER)

  const [siteSettings, footer] = tenantId
    ? await getPayload({ config }).then((payload) =>
        Promise.all([
          payload.find({ collection: 'site-settings', where: { tenant: { equals: tenantId } }, limit: 1, overrideAccess: true }).then((r) => r.docs[0]),
          payload.find({ collection: 'footer', where: { tenant: { equals: tenantId } }, limit: 1, overrideAccess: true }).then((r) => r.docs[0]),
        ]),
      )
    : [undefined, undefined]

  // 2026-08-16: was a third hardcoded copy of the same real email/YouTube/
  // Facebook links — see SiteFooter.tsx for the other two this now shares
  // a single real source with (SiteSettings.contactEmail, Footer.socialLinks).
  const contactLinks = [
    ...(siteSettings?.contactEmail ? [{ key: 'email', label: 'Email', value: siteSettings.contactEmail, href: `mailto:${siteSettings.contactEmail}` }] : []),
    ...(footer?.socialLinks ?? []).map((social) => ({
      key: social.platform,
      label: social.platform.charAt(0).toUpperCase() + social.platform.slice(1),
      value: social.label || social.platform.charAt(0).toUpperCase() + social.platform.slice(1),
      href: social.url,
    })),
  ]

  return (
    <main>
      <section className="section decorative-flourish">
        <div className="container">
          <ScrollReveal>
            <div className="split-layout">
              <div
                className="split-layout-media"
                style={{
                  backgroundImage: 'url(/images/hands-on-bible.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 'var(--radius-card)',
                  aspectRatio: '4 / 5',
                  boxShadow: 'var(--shadow-card-lg)',
                }}
              />
              <div>
                <p className="section-eyebrow">Get In Touch</p>
                <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>
                  Contact <span className="text-accent">Us</span>
                </h1>
                <hr className="heading-underline" />
                <p style={{ fontSize: 'var(--text-subheading)', marginBottom: '2rem' }}>
                  Whether through prayer, volunteering, financial partnership, community outreach, or collaborative
                  ministry — we&rsquo;d love to hear from you.
                </p>
                {contactLinks.length > 0 && (
                  <Stagger role="list" staggerDelay={0.1}>
                    {contactLinks.map((link, index) => (
                      <StaggerItem key={link.key} role="listitem">
                        <a
                          href={link.href}
                          style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '1rem',
                            padding: '1rem 0',
                            textDecoration: 'none',
                            borderBottom: index < contactLinks.length - 1 ? '1px solid var(--color-border)' : 'none',
                          }}
                        >
                          <span className="card-eyebrow" style={{ minWidth: '5.5rem', margin: 0 }}>
                            {link.label}
                          </span>
                          <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{link.value}</span>
                        </a>
                      </StaggerItem>
                    ))}
                  </Stagger>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section section--surface">
        <div className="container container--narrow">
          <ScrollReveal>
            <h2 style={{ textAlign: 'center' }}>Send Us a Message</h2>
            <hr className="heading-underline heading-underline--center" />
            <ContactForm />
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
