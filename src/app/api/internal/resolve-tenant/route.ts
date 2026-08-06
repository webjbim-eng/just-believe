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
 *
 * DEFAULT_TENANT_SLUG (confirmed with Jimmy 2026-08-06): while JBIM is the
 * only real tenant and no domain (jbim-platform.app or the custom
 * justbelieveintmissions.org, still on Hostinger per the client intake
 * form) actually points at this deployment yet, ANY unmatched host
 * — including the bare *.vercel.app URL — falls back to this tenant
 * rather than the generic empty placeholder. Remove or tighten this once
 * a second tenant exists and "no host match" needs to mean "no site"
 * again, not "show JBIM."
 */
export async function GET(request: Request) {
  const host = new URL(request.url).searchParams.get('host')
  if (!host) {
    return NextResponse.json({ tenantId: null }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const platformRootDomain = process.env.NEXT_PUBLIC_PLATFORM_ROOT_DOMAIN || 'jbim-platform.app'

  let tenant: { id: number } | undefined

  if (host.endsWith(`.${platformRootDomain}`)) {
    const slug = host.slice(0, -(`.${platformRootDomain}`.length))
    tenant = (
      await payload.find({
        collection: 'tenants',
        where: { slug: { equals: slug } },
        limit: 1,
        overrideAccess: true,
      })
    ).docs[0]
  } else {
    tenant = (
      await payload.find({
        collection: 'tenants',
        where: { 'domains.domain': { equals: host } },
        limit: 1,
        overrideAccess: true,
      })
    ).docs[0]
  }

  if (!tenant && process.env.DEFAULT_TENANT_SLUG) {
    tenant = (
      await payload.find({
        collection: 'tenants',
        where: { slug: { equals: process.env.DEFAULT_TENANT_SLUG } },
        limit: 1,
        overrideAccess: true,
      })
    ).docs[0]
  }

  return NextResponse.json({ tenantId: tenant ? String(tenant.id) : null })
}
