import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../access/getResolvedTenantId'
import { ScrollReveal } from '../../../components/ScrollReveal'
import { Stagger, StaggerItem } from '../../../components/Stagger'
import { PartnerForm } from '../../../components/PartnerForm'

export const metadata: Metadata = {
  title: 'Partners — Just Believe International Missions',
  description: 'Partner with Just Believe International Missions through prayer, financial support, volunteering, or mission trips.',
}

export default async function PartnersPage() {
  const tenantId = (await headers()).get(TENANT_HEADER)

  // Partners is a submission collection (submissionAccess) — its `read`
  // access requires a staff permission, so a public page has to query it
  // server-side with overrideAccess: true and re-apply the "only show
  // real, approved partners" filter itself, same pattern Testimonials.tsx
  // already establishes for status-gated submission data on the homepage.
  const activePartners = tenantId
    ? (
        await getPayload({ config }).then((payload) =>
          payload.find({
            collection: 'partners',
            where: { and: [{ tenant: { equals: tenantId } }, { status: { equals: 'active' } }, { logo: { exists: true } }] },
            limit: 24,
            overrideAccess: true,
          }),
        )
      ).docs
    : []

  return (
    <main>
      <section className="section" style={{ paddingBottom: 0, textAlign: 'center' }}>
        <div className="container container--narrow">
          <ScrollReveal>
            <p className="section-eyebrow">Partnership</p>
            <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>
              Partner <span className="text-accent">With Us</span>
            </h1>
            <hr className="heading-underline heading-underline--center" />
            <p style={{ fontSize: 'var(--text-subheading)' }}>
              Through prayer, financial support, volunteering, project sponsorship, or a mission trip — join us in
              advancing the Gospel around the world.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {activePartners.length > 0 && (
        <section className="section decorative-flourish">
          <div className="container">
            <ScrollReveal>
              <p className="section-eyebrow" style={{ textAlign: 'center' }}>
                Our Partners
              </p>
            </ScrollReveal>
            <Stagger role="list" className="partner-logos-grid">
              {activePartners.map((partner) => {
                const logo = typeof partner.logo === 'object' ? partner.logo : undefined
                const name = partner.orgName || partner.individualName || 'Partner'
                if (!logo?.url) return null
                return (
                  <StaggerItem key={partner.id} role="listitem">
                    <img src={logo.url} alt={name} />
                  </StaggerItem>
                )
              })}
            </Stagger>
          </div>
        </section>
      )}

      <section className={`section${activePartners.length > 0 ? ' section--surface' : ' decorative-flourish'}`}>
        <div className="container container--narrow">
          <ScrollReveal>
            <h2 style={{ textAlign: 'center' }}>
              Become a <span className="text-accent">Partner</span>
            </h2>
            <hr className="heading-underline heading-underline--center" />
            <div className="card" style={{ padding: 'var(--card-padding)', marginTop: '2rem' }}>
              <PartnerForm />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
