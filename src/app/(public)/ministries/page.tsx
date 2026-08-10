import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../access/getResolvedTenantId'
import { lexicalToPlainText } from '../../../lib/lexicalToPlainText'
import { ScrollReveal } from '../../../components/ScrollReveal'
import { Stagger, StaggerItem } from '../../../components/Stagger'

export const metadata: Metadata = {
  title: 'Our Ministries — Just Believe International Missions',
  description: 'How JBIM serves: evangelism, prayer, leadership development, family, education, youth, women, and community outreach.',
}

export default async function MinistriesPage() {
  const tenantId = (await headers()).get(TENANT_HEADER)

  const ministries = tenantId
    ? (
        await getPayload({ config }).then((payload) =>
          payload.find({
            collection: 'ministries',
            where: { tenant: { equals: tenantId } },
            sort: 'order',
            limit: 50,
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

      <section className="section decorative-flourish">
        <div className="container">
          {ministries.length === 0 ? (
            <p style={{ textAlign: 'center' }}>Ministry pages are coming soon.</p>
          ) : (
            <>
              <ScrollReveal>
                <div className="card" style={{ marginBottom: '1.75rem', padding: '3rem' }}>
                  <p className="card-eyebrow">Featured Ministry</p>
                  <h2 style={{ fontSize: 'var(--text-heading)', marginBottom: '1rem' }}>{ministries[0].name}</h2>
                  {ministries[0].description && (
                    <p style={{ fontSize: 'var(--text-body)', maxWidth: '48rem' }}>{lexicalToPlainText(ministries[0].description)}</p>
                  )}
                </div>
              </ScrollReveal>
              {ministries.length > 1 && (
                <Stagger className="grid" role="list">
                  {ministries.slice(1).map((ministry) => (
                    <StaggerItem key={ministry.id} role="listitem">
                      <div className="card">
                        <span className="avatar-circle">{ministry.name.charAt(0).toUpperCase()}</span>
                        <p className="card-eyebrow">Ministry</p>
                        <h3 className="card-title">{ministry.name}</h3>
                        {ministry.description && <p>{lexicalToPlainText(ministry.description)}</p>}
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
