import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../access/getResolvedTenantId'
import { lexicalToPlainText } from '../../../lib/lexicalToPlainText'

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
          <p className="section-eyebrow">What We Do</p>
          <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>Our Ministries</h1>
          <p style={{ fontSize: 'var(--text-subheading)' }}>
            Lasting change begins with transformed hearts. Through evangelism, discipleship, leadership development,
            prayer, and compassionate outreach, we demonstrate both the truth and the love of Christ.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {ministries.length === 0 ? (
            <p style={{ textAlign: 'center' }}>Ministry pages are coming soon.</p>
          ) : (
            <div className="grid">
              {ministries.map((ministry) => (
                <div key={ministry.id} className="card">
                  <span className="avatar-circle">{ministry.name.charAt(0).toUpperCase()}</span>
                  <h3 className="card-title">{ministry.name}</h3>
                  {ministry.description && <p>{lexicalToPlainText(ministry.description)}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
