import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Internal-only route middleware.ts calls via fetch (not a direct import)
 * to resolve a hostname to a tenant id. Payload's Local API pulls in Node
 * dependencies (Postgres driver, undici, ...) that don't bundle cleanly
 * into Edge-runtime middleware — Route Handlers run in the Node.js
 * runtime by default and don't have that restriction, so the actual DB
 * lookup lives here instead. This path is excluded from middleware's own
 * matcher to avoid the request recursing back through itself.
 */
export async function GET(request: Request) {
  const host = new URL(request.url).searchParams.get('host')
  if (!host) {
    return NextResponse.json({ tenantId: null }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const platformRootDomain = process.env.NEXT_PUBLIC_PLATFORM_ROOT_DOMAIN || 'jbim-platform.app'

  if (host.endsWith(`.${platformRootDomain}`)) {
    const slug = host.slice(0, -(`.${platformRootDomain}`.length))
    const { docs } = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })
    return NextResponse.json({ tenantId: docs[0] ? String(docs[0].id) : null })
  }

  const { docs } = await payload.find({
    collection: 'tenants',
    where: { 'domains.domain': { equals: host } },
    limit: 1,
    overrideAccess: true,
  })
  return NextResponse.json({ tenantId: docs[0] ? String(docs[0].id) : null })
}
