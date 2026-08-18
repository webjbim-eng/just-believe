import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Ministry } from '../../../payload-types'
import { TENANT_HEADER } from '../../../access/getResolvedTenantId'
import { ScrollReveal } from '../../../components/ScrollReveal'
import { Stagger, StaggerItem } from '../../../components/Stagger'
import { IconCardGrid, type IconKey } from '../../../components/IconCardGrid'
import { ministryDefinitions } from '../../../seed/ministries'

// Matches ministryDefinitions' order (src/seed/ministries.ts) exactly —
// same mapping the About page's "What We Do" icon-grid uses.
const MINISTRY_ICON_ORDER: IconKey[] = ['evangelism', 'prayer', 'leadership', 'family', 'children', 'youth', 'women', 'compassion']
function iconFor(ministry: Ministry): IconKey {
  const index = ministryDefinitions.findIndex((m) => m.name === ministry.name)
  return index >= 0 ? MINISTRY_ICON_ORDER[index] : 'compassion'
}

export const metadata: Metadata = {
  title: 'Our Ministries — Just Believe International Missions',
  description: 'How JBIM serves: evangelism, prayer, leadership development, family, education, youth, women, and community outreach.',
}

/** Same fallback-imagery reasoning as the ministry detail page — see src/seed/ministries.ts. */
function imageFor(ministry: Ministry): string | undefined {
  if (typeof ministry.image === 'object' && ministry.image?.url) return ministry.image.url
  return ministryDefinitions.find((m) => m.name === ministry.name)?.image
}

function shortTextFor(ministry: Ministry): string {
  return ministry.shortDescription || ministryDefinitions.find((m) => m.name === ministry.name)?.shortDescription || ''
}

export default async function MinistriesPage() {
  const tenantId = (await headers()).get(TENANT_HEADER)

  const ministries = tenantId
    ? (
        await getPayload({ config }).then((payload) =>
          payload.find({
            collection: 'ministries',
            where: { and: [{ tenant: { equals: tenantId } }, { _status: { equals: 'published' } }] },
            sort: 'order',
            limit: 50,
            overrideAccess: true,
          }),
        )
      ).docs
    : []

  const [primary, secondFeature, thirdFeature, ...rest] = ministries

  return (
    <main>
      <section className="section" style={{ paddingBottom: 0, textAlign: 'center' }}>
        <div className="container container--narrow">
          <ScrollReveal>
            <p className="section-eyebrow">What We Do</p>
            <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>
              Our <span className="text-accent">Ministries</span>
            </h1>
            <hr className="heading-underline heading-underline--center" />
            <p style={{ fontSize: 'var(--text-subheading)' }}>
              Lasting change begins with transformed hearts. Through evangelism, discipleship, leadership development,
              prayer, and compassionate outreach, we demonstrate both the truth and the love of Christ.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {ministries.length === 0 ? (
        <section className="section">
          <div className="container" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>Ministry pages are coming soon.</p>
          </div>
        </section>
      ) : (
        <>
          {/* Primary: one large editorial feature — full photo, short intro only. */}
          <section className="section decorative-flourish">
            <div className="container">
              <ScrollReveal>
                <div className="split-layout">
                  {imageFor(primary) && (
                    <div
                      className="split-layout-media"
                      style={{
                        backgroundImage: `url(${imageFor(primary)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: 'var(--radius-card)',
                        aspectRatio: '4 / 5',
                        boxShadow: 'var(--shadow-card-lg)',
                      }}
                    />
                  )}
                  <div>
                    <p className="section-eyebrow">Featured Ministry</p>
                    <h2 style={{ fontSize: 'var(--text-heading-lg)', marginBottom: '1rem' }}>{primary.name}</h2>
                    {shortTextFor(primary) && <p style={{ fontSize: 'var(--text-subheading)', marginBottom: '1.5rem' }}>{shortTextFor(primary)}</p>}
                    <a className="link-arrow" href={`/ministries/${primary.slug}`}>
                      Explore Ministry <span className="link-arrow-glyph">→</span>
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Secondary: two side-by-side mini editorial blocks, real photography, still short-form. */}
          {(secondFeature || thirdFeature) && (
            <section className="section section--surface">
              <div className="container">
                <Stagger className="ministry-secondary-grid" role="list">
                  {[secondFeature, thirdFeature].filter((m): m is Ministry => Boolean(m)).map((ministry) => (
                    <StaggerItem key={ministry.id} role="listitem">
                      <div>
                        {imageFor(ministry) && (
                          <div
                            className="hover-zoom"
                            style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden', aspectRatio: '16 / 10', marginBottom: '1.25rem' }}
                          >
                            <div
                              aria-hidden="true"
                              className="hover-zoom-bg"
                              style={{ width: '100%', height: '100%', backgroundImage: `url(${imageFor(ministry)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                            />
                          </div>
                        )}
                        <h3 style={{ fontSize: 'var(--text-heading-sm)', marginBottom: '0.5rem' }}>{ministry.name}</h3>
                        {shortTextFor(ministry) && <p style={{ marginBottom: '0.75rem' }}>{shortTextFor(ministry)}</p>}
                        <a className="link-arrow" href={`/ministries/${ministry.slug}`}>
                          Explore Ministry <span className="link-arrow-glyph">→</span>
                        </a>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            </section>
          )}

          {/* Supporting: icon-card grid, matching public/jbim/ministries.html's
              "More Ways We Serve" section exactly — same treatment as the
              About page's "What We Do" grid, not a bare thumbnail row list. */}
          {rest.length > 0 && (
            <section className="section decorative-flourish decorative-flourish--reverse">
              <div className="container container--narrow">
                <ScrollReveal>
                  <p className="section-eyebrow" style={{ textAlign: 'center' }}>
                    More Ways We Serve
                  </p>
                </ScrollReveal>
                <IconCardGrid
                  items={rest.map((ministry) => ({
                    icon: iconFor(ministry),
                    title: ministry.name,
                    subtitle: shortTextFor(ministry),
                    href: `/ministries/${ministry.slug}`,
                  }))}
                />
              </div>
            </section>
          )}

          <section className="section section--surface">
            <div className="container container--narrow" style={{ textAlign: 'center' }}>
              <ScrollReveal>
                <h2>
                  Get <span className="text-accent">Involved</span>
                </h2>
                <hr className="heading-underline heading-underline--center" />
                <p style={{ fontSize: 'var(--text-subheading)', marginBottom: '2rem' }}>
                  Wherever you feel called, there&rsquo;s a place for you in this work.
                </p>
                <a className="btn-accent" href="/contact">
                  Get In Touch
                </a>
              </ScrollReveal>
            </div>
          </section>
        </>
      )}
    </main>
  )
}
