import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../access/getResolvedTenantId'
import { blockRegistry } from '../../blocks'

/**
 * Assembles the tenant's HomepageLayout section list (FR-HOME-01..06) via
 * the block registry. Falls back to a plain placeholder when no tenant
 * resolves or no HomepageLayout has been configured yet — this route must
 * never 500 just because a tenant hasn't set up their homepage. Locale-
 * segmented routing ([locale]/, FR-SITE-03) is not yet wired.
 */
export default async function HomePage() {
  const tenantId = (await headers()).get(TENANT_HEADER)
  if (!tenantId) return <FallbackPlaceholder />

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'homepage-layout',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    overrideAccess: true,
  })
  const sections = docs[0]?.sections

  if (!sections?.length) return <FallbackPlaceholder />

  const visibleSections = sections
    .filter((section) => section.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <main>
      {visibleSections.map((section, index) => {
        const Block = blockRegistry[section.blockType]
        if (!Block) return null // block not built yet — skip, don't crash the page
        return <Block key={index} config={section.config ?? {}} />
      })}
    </main>
  )
}

function FallbackPlaceholder() {
  return (
    <main style={{ padding: '4rem 2rem', maxWidth: 640, margin: '0 auto' }}>
      <h1>Just Believe International Missions</h1>
      <p>Platform foundation is live. Public site content ships module-by-module.</p>
    </main>
  )
}
