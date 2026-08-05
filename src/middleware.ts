import { NextResponse, type NextRequest } from 'next/server'
import { TENANT_HEADER } from './access/getResolvedTenantId'

/**
 * Resolves the incoming hostname to a tenant and forwards it as a request
 * header every access-control function reads via getResolvedTenantId(). This
 * is the ONE place tenant resolution happens — see docs/02-architecture.md
 * §2 "Tenant resolution flow."
 *
 * STUB: currently only resolves platform subdomains (e.g.
 * jbim.jbim-platform.app). Once the Tenants collection has real data,
 * replace this with a cached lookup of Tenants.domains for fully custom
 * domains (e.g. justbelieveintmissions.org) — almost certainly backed by a
 * short-TTL KV/edge cache in front of Postgres rather than a DB query on
 * every request. Flagging rather than faking this until it's real.
 */
function resolveTenantIdForHost(hostname: string): string | null {
  const platformRootDomain = process.env.NEXT_PUBLIC_PLATFORM_ROOT_DOMAIN || 'jbim-platform.app'
  const bareHost = hostname.split(':')[0]

  if (bareHost.endsWith(`.${platformRootDomain}`)) {
    return bareHost.slice(0, -(`.${platformRootDomain}`.length))
  }

  return null
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const tenantId = resolveTenantIdForHost(hostname)

  const requestHeaders = new Headers(request.headers)
  if (tenantId) {
    requestHeaders.set(TENANT_HEADER, tenantId)
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
