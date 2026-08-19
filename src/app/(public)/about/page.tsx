import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../access/getResolvedTenantId'
import { renderHeadingWithAccent } from '../../../lib/renderHeadingWithAccent'
import { ministryDefinitions } from '../../../seed/ministries'
import { ScrollReveal } from '../../../components/ScrollReveal'
import { Stagger, StaggerItem } from '../../../components/Stagger'
import { IconCardGrid, type IconKey } from '../../../components/IconCardGrid'
import { RichText } from '@payloadcms/richtext-lexical/react'

// Matches ministryDefinitions' order (src/seed/ministries.ts) exactly —
// evangelism, prayer, leadership, family, children, youth, women, compassion.
const MINISTRY_ICONS: IconKey[] = ['evangelism', 'prayer', 'leadership', 'family', 'children', 'youth', 'women', 'compassion']

export const metadata: Metadata = {
  title: 'About — Just Believe International Missions',
  description: "Christ-centered, faith-based nonprofit committed to advancing God's Kingdom by transforming lives, strengthening families, developing leaders, and serving communities around the world.",
}

const commitments = [
  'Biblical truth as the foundation for every ministry initiative.',
  'Christ-centered discipleship that produces spiritual maturity.',
  'Servant leadership characterized by integrity, humility, and accountability.',
  'Compassionate service that reflects the love of Jesus Christ in practical ways.',
]

export default async function AboutPage() {
  const tenantId = (await headers()).get(TENANT_HEADER)
  const leaders = tenantId
    ? (
        await getPayload({ config }).then((payload) =>
          payload.find({
            collection: 'leadership',
            where: { tenant: { equals: tenantId } },
            sort: ['-isFounder', 'order'],
            limit: 50,
            overrideAccess: true,
          }),
        )
      ).docs
    : []

  const locations = tenantId
    ? (
        await getPayload({ config }).then((payload) =>
          payload.find({
            collection: 'locations',
            where: { and: [{ tenant: { equals: tenantId } }, { active: { equals: true } }] },
            sort: 'displayOrder',
            limit: 50,
            overrideAccess: true,
          }),
        )
      ).docs
    : []

  return (
    <main>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container container--narrow" style={{ textAlign: 'center' }}>
          <ScrollReveal>
            <p className="section-eyebrow">About Us</p>
            <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>
              {renderHeadingWithAccent('Just Believe International Missions', 'International Missions')}
            </h1>
            <hr className="heading-underline heading-underline--center" />
            <p style={{ fontSize: 'var(--text-subheading)' }}>
              A Christ-centered, faith-based nonprofit organization committed to advancing God&rsquo;s Kingdom by transforming
              lives, strengthening families, developing leaders, and serving communities around the world.
            </p>
            <p>
              Founded on the unchanging truth of God&rsquo;s Word, JBIM exists to proclaim the Gospel of Jesus Christ while
              equipping individuals to grow in spiritual maturity, discover their God-given purpose, and become agents of
              lasting transformation within their homes, churches, workplaces, and communities.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section decorative-flourish">
        <div className="container">
          <ScrollReveal>
            <div className="split-layout">
              <div className="split-layout-media" style={{ position: 'relative' }}>
                <div
                  style={{
                    backgroundImage: 'url(/images/worship-service.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 'var(--radius-card)',
                    aspectRatio: '4 / 5',
                    boxShadow: 'var(--shadow-card-lg)',
                  }}
                />
                <span className="media-caption">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 21s-7-4.6-9.5-9.2C.8 8.4 2.4 5 6 5c2 0 3.3 1 4 2 .7-1 2-2 4-2 3.6 0 5.2 3.4 3.5 6.8C19 16.4 12 21 12 21Z" />
                  </svg>
                  Gathered in Worship
                </span>
              </div>
              <div>
                <p className="section-eyebrow">Our Mission</p>
                <h2 style={{ fontSize: 'var(--text-heading)' }}>
                  To glorify God by making disciples of Jesus Christ, <span className="text-accent">equipping believers</span>{' '}
                  for Kingdom service.
                </h2>
                <p style={{ fontSize: 'var(--text-body)', marginBottom: '2rem' }}>
                  Strengthening families, developing ethical leaders, and extending Christ&rsquo;s compassion to
                  communities through evangelism, discipleship, education, leadership development, and practical
                  outreach.
                </p>
                <hr className="heading-underline" />
                <p className="section-eyebrow">Our Vision</p>
                <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-text)' }}>
                  To see individuals, families, churches, and communities transformed by the Gospel of Jesus Christ,
                  raising generations of spiritually mature believers and servant leaders who influence every sphere of
                  society for the glory of God until Christ returns.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section section--primary decorative-flourish">
        <div className="container">
          <ScrollReveal>
            <div style={{ maxWidth: '38rem', margin: '0 auto 2.5rem', textAlign: 'center' }}>
              <p className="section-eyebrow" style={{ justifyContent: 'center', color: 'var(--color-accent)' }}>
                What We Do
              </p>
              <h2 style={{ margin: '0.9rem 0 0', color: '#fff' }}>Lasting change begins with transformed hearts.</h2>
              <p style={{ color: 'var(--color-text-muted-on-dark)', marginTop: '0.75rem' }}>
                Through evangelism, discipleship, leadership development, prayer, and compassionate outreach, we
                demonstrate both the truth and the love of Christ.
              </p>
            </div>
          </ScrollReveal>
          <IconCardGrid
            items={ministryDefinitions.map((ministry, index) => ({
              icon: MINISTRY_ICONS[index],
              title: ministry.name,
              subtitle: ministry.shortDescription,
            }))}
          />
        </div>
      </section>

      {leaders.length > 0 && (
        <section id="leadership" className="section decorative-flourish">
          <div className="container container--narrow">
            <ScrollReveal>
              <p className="section-eyebrow" style={{ textAlign: 'center' }}>
                Meet the Team
              </p>
              <h2 style={{ textAlign: 'center' }}>
                Our <span className="text-accent">Leadership</span>
              </h2>
              <hr className="heading-underline heading-underline--center" />
            </ScrollReveal>
            <Stagger className="leadership-list" role="list">
              {leaders.map((leader) => {
                const photo = typeof leader.photo === 'object' ? leader.photo : undefined
                return (
                  <StaggerItem key={leader.id} role="listitem">
                    <div className="leadership-profile">
                      <div
                        className="leadership-photo"
                        aria-hidden={!photo?.url}
                        // 'center top', not 'center' — see Leadership.tsx's
                        // comment: a square crop of a tall portrait clips
                        // the head under true centering.
                        style={photo?.url ? { backgroundImage: `url(${photo.url})`, backgroundSize: 'cover', backgroundPosition: 'center top' } : undefined}
                      />
                      <div>
                        <p className="card-title" style={{ marginBottom: '0.125rem' }}>
                          {leader.name}
                        </p>
                        {leader.title && <p style={{ margin: '0 0 0.75rem', color: 'var(--color-accent)', fontWeight: 600, fontSize: 'var(--text-body-sm)' }}>{leader.title}</p>}
                        {leader.bio && <RichText data={leader.bio} />}
                      </div>
                    </div>
                  </StaggerItem>
                )
              })}
            </Stagger>
          </div>
        </section>
      )}

      <section className="section section--primary decorative-flourish">
        <div className="container container--narrow">
          <ScrollReveal>
            <h2 style={{ color: '#fff', textAlign: 'center' }}>
              Our <span className="text-accent">Approach</span>
            </h2>
            <hr className="heading-underline heading-underline--center" />
            <p style={{ color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: '2.5rem' }}>
              Our ministry is built upon four foundational commitments.
            </p>
          </ScrollReveal>
          <Stagger className="approach-list" role="list">
            {commitments.map((commitment, index) => (
              <StaggerItem key={commitment} role="listitem">
                <div className="approach-item">
                  <span className="numbered-item-index" style={{ opacity: 0.85 }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span style={{ color: 'var(--color-text)', fontSize: '0.92rem', paddingTop: '0.15rem' }}>{commitment}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section">
        <div className="container container--narrow" style={{ textAlign: 'center' }}>
          <ScrollReveal>
            <p className="section-eyebrow">Our Commitment</p>
            <p style={{ fontSize: 'var(--text-body)' }}>
              Just Believe International Missions Inc. (JBIM) is a U.S.-registered 501(c)(3) nonprofit organization
              incorporated in the State of Texas, committed to faithful stewardship, ethical governance, financial
              integrity, and accountability in every aspect of our work. We strive to honor God through responsible
              management of the resources entrusted to us while partnering with churches, ministries, organizations,
              volunteers, and supporters who share our passion for advancing God&rsquo;s Kingdom.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {locations.length > 0 && (
        <section className="section decorative-flourish">
          <div className="container container--narrow">
            <ScrollReveal>
              <p className="section-eyebrow" style={{ textAlign: 'center' }}>
                Global Presence
              </p>
              <h2 style={{ textAlign: 'center' }}>
                Our <span className="text-accent">Global Presence</span>
              </h2>
              <hr className="heading-underline heading-underline--center" />
            </ScrollReveal>
            {/* 2026-08-18: no street address here anymore (registered-agent
                request) — a general tagline + phone/email instead of a
                per-location name/address card. */}
            <Stagger role="list" className="service-list">
              {locations.map((location) => (
                <StaggerItem key={location.id} role="listitem">
                  <div className="card" style={{ padding: 'var(--card-padding)', textAlign: 'center', maxWidth: '32rem', margin: '0 auto' }}>
                    {location.description && (
                      <p className="card-title" style={{ margin: '0 0 0.5rem', fontSize: 'var(--text-heading-sm)' }}>
                        {location.description}
                      </p>
                    )}
                    <p className="card-eyebrow" style={{ margin: 0 }}>
                      {[location.country, 'Serving Globally'].filter(Boolean).join(' · ')}
                    </p>
                    {(location.phone || location.email) && (
                      <p style={{ margin: '0.75rem 0 0', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {location.phone && <a href={`tel:${location.phone}`}>{location.phone}</a>}
                        {location.email && <a href={`mailto:${location.email}`}>{location.email}</a>}
                      </p>
                    )}
                    {location.meetingInfo && <p style={{ margin: '0.75rem 0 0', color: 'var(--color-text-muted)' }}>{location.meetingInfo}</p>}
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <section className="section section--surface">
        <div className="container container--narrow" style={{ textAlign: 'center' }}>
          <ScrollReveal>
            <h2>
              Join the <span className="text-accent">Mission</span>
            </h2>
            <hr className="heading-underline heading-underline--center" />
            <p style={{ fontSize: 'var(--text-subheading)', marginBottom: '2rem' }}>
              Whether through prayer, volunteering, financial partnership, community outreach, or collaborative ministry,
              we invite you to join us in sharing the hope of Jesus Christ and helping transform lives around the world.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a className="btn-accent" href="/get-involved">
                Get Involved
              </a>
              <a className="btn-outline" href="/contact">
                Contact Us
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
