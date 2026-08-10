import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../../access/getResolvedTenantId'
import { lexicalToPlainText } from '../../../../lib/lexicalToPlainText'
import { ScrollReveal } from '../../../../components/ScrollReveal'
import { ministryDefinitions } from '../../../../seed/ministries'

async function getMinistry(slug: string) {
  const tenantId = (await headers()).get(TENANT_HEADER)
  if (!tenantId) return null

  const { docs } = await getPayload({ config }).then((payload) =>
    payload.find({
      collection: 'ministries',
      where: { and: [{ tenant: { equals: tenantId } }, { slug: { equals: slug } }, { _status: { equals: 'published' } }] },
      limit: 1,
      overrideAccess: true,
    }),
  )
  return docs[0] ?? null
}

/** Same fallback-imagery reasoning as the overview page — see src/seed/ministries.ts. */
function fallbackImageFor(name: string): string | undefined {
  return ministryDefinitions.find((m) => m.name === name)?.image
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const ministry = await getMinistry(slug)
  return {
    title: ministry ? `${ministry.name} — Just Believe International Missions` : 'Ministries — Just Believe International Missions',
    description: ministry?.shortDescription || undefined,
  }
}

export default async function MinistryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ministry = await getMinistry(slug)
  if (!ministry) notFound()

  const image = typeof ministry.image === 'object' && ministry.image?.url ? ministry.image.url : fallbackImageFor(ministry.name)
  const leader = typeof ministry.leader === 'object' ? ministry.leader : null

  return (
    <main>
      <section className="section">
        <div className="container">
          <ScrollReveal>
            <div className="split-layout">
              {image && (
                <div
                  className="split-layout-media"
                  style={{
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 'var(--radius-card)',
                    aspectRatio: '4 / 5',
                    boxShadow: 'var(--shadow-card-lg)',
                  }}
                />
              )}
              <div>
                <p className="section-eyebrow">Ministry</p>
                <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>{ministry.name}</h1>
                <hr className="heading-underline" />
                {ministry.description && (
                  <p style={{ fontSize: 'var(--text-body)', whiteSpace: 'pre-line' }}>{lexicalToPlainText(ministry.description)}</p>
                )}
                {leader && 'name' in leader && (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-body-sm)', marginTop: '1.5rem' }}>
                    Led by <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{leader.name}</span>
                  </p>
                )}
                <a className="btn-outline" href="/ministries" style={{ marginTop: '1.5rem' }}>
                  ← All Ministries
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
