import { NextResponse, type NextRequest } from 'next/server'
import { TENANT_HEADER } from './access/getResolvedTenantId'

/**
 * Was previously a bug, not just an incomplete stub: this returned the raw
 * subdomain *slug* (e.g. "jbim") and forwarded it as TENANT_HEADER, but
 * every access-control function (hasPermission, withTenantScope, ...) and
 * every `tenant` relationship field compares that header against a
 * Tenant's numeric *id*. A slug can never equal a numeric id, so any
 * tenant-scoped access check on a real subdomain request would silently
 * fail closed. Harmless while no real Tenant data existed; live now.
 *
 * The actual DB lookup lives in /api/internal/resolve-tenant, not here —
 * Edge-runtime middleware can't bundle Payload's Local API (Postgres
 * driver, undici, etc. don't compile into an Edge bundle), and Next.js
 * 15.4's Node.js middleware runtime still hits webpack errors on Payload's
 * own dependency tree (`node:console` via undici). A plain Route Handler
 * doesn't have either restriction, so middleware calls it over fetch
 * instead. See that route's matcher exclusion below to avoid the fetched
 * request recursing back through this same middleware.
 *
 * In-memory per-process cache, not a distributed one — each serverless
 * instance has its own, but it cuts repeat round-trips within a warm
 * instance's lifetime. Replace with a real edge/KV cache
 * (docs/02-architecture.md §2) before this needs to scale past a handful
 * of tenants / meaningful traffic.
 */
const TENANT_CACHE_TTL_MS = 60_000
const tenantIdCache = new Map<string, { tenantId: string | null; expiresAt: number }>()

async function lookupTenantIdForHost(bareHost: string, requestUrl: string): Promise<string | null> {
  try {
    const resolveUrl = new URL('/api/internal/resolve-tenant', requestUrl)
    resolveUrl.searchParams.set('host', bareHost)
    const res = await fetch(resolveUrl)
    if (!res.ok) return null
    const { tenantId } = (await res.json()) as { tenantId: string | null }
    return tenantId
  } catch {
    // DB/route unreachable — fail closed (no tenant), not a 500 for the
    // whole request; downstream access checks already treat "no tenant
    // resolved" as deny.
    return null
  }
}

async function resolveTenantIdForHost(hostname: string, requestUrl: string): Promise<string | null> {
  const bareHost = hostname.split(':')[0]

  const cached = tenantIdCache.get(bareHost)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.tenantId
  }

  const tenantId = await lookupTenantIdForHost(bareHost, requestUrl)
  tenantIdCache.set(bareHost, { tenantId, expiresAt: Date.now() + TENANT_CACHE_TTL_MS })
  return tenantId
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const tenantId = await resolveTenantIdForHost(hostname, request.url)

  const requestHeaders = new Headers(request.headers)
  if (tenantId) {
    requestHeaders.set(TENANT_HEADER, tenantId)
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/internal/resolve-tenant).*)'],
}
