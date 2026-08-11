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

/**
 * Dev-only convenience: there's no way to type jbim.jbim-platform.app (or
 * a custom domain) into a browser against a local dev server without
 * editing /etc/hosts, so ?tenant=<slug> lets you preview a specific
 * tenant locally (e.g. http://localhost:3000/?tenant=jbim). Synthesizes a
 * fake hostname and reuses the exact same subdomain-slug lookup path
 * above rather than adding a second code path. Gated on NODE_ENV so this
 * can never be used to override tenant resolution in production.
 */
function devTenantOverrideHostname(request: NextRequest): string | null {
  if (process.env.NODE_ENV === 'production') return null
  const slug = request.nextUrl.searchParams.get('tenant')
  if (!slug) return null
  const platformRootDomain = process.env.NEXT_PUBLIC_PLATFORM_ROOT_DOMAIN || 'jbim-platform.app'
  return `${slug}.${platformRootDomain}`
}

/**
 * admin.<root-domain> (e.g. admin.justbelieveintmissions.org) should BE
 * the Payload admin panel at its root, not another way to reach the
 * public site — this rewrites the path internally to /admin/* so the URL
 * bar stays clean (no visible /admin suffix) while the actual route
 * hasn't moved. Guards against double-prefixing a bookmarked deep link
 * (e.g. admin.example.com/admin/collections/users) and leaves /api/* and
 * Next internals alone since Payload's admin UI calls those as relative
 * same-origin paths regardless of which host served the page.
 *
 * This is DNS/Vercel-domain-configuration-dependent — the code is ready,
 * but admin.justbelieveintmissions.org won't actually reach this deployment
 * until that subdomain is pointed here (see project docs / chat for the
 * exact steps, that part isn't something this middleware can do).
 */
function isAdminHost(hostname: string): boolean {
  return hostname.split(':')[0].startsWith('admin.')
}

function rewriteAdminHostPath(request: NextRequest): NextRequest['nextUrl'] | null {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return null
  }
  const url = request.nextUrl.clone()
  url.pathname = `/admin${pathname === '/' ? '' : pathname}`
  return url
}

export async function middleware(request: NextRequest) {
  const hostname = devTenantOverrideHostname(request) || request.headers.get('host') || ''

  if (isAdminHost(hostname)) {
    // 2026-08-11 fix: this used to skip tenant resolution entirely for
    // admin.* hosts, which would have silently broken every permission
    // check on the new Ministry Dashboard (hasPermission() requires a
    // resolved tenant) the moment this subdomain actually went live —
    // admin.justbelieveintmissions.org is JBIM's own admin, the SAME
    // tenant as the main domain, not a tenant-less request. Resolve
    // against the bare root domain (strip the "admin." prefix) since a
    // Tenant's configured domain is the root, not the admin subdomain.
    const bareHost = hostname.split(':')[0]
    const rootHost = bareHost.replace(/^admin\./, '')
    const tenantId = await resolveTenantIdForHost(rootHost, request.url)

    const requestHeaders = new Headers(request.headers)
    if (tenantId) {
      requestHeaders.set(TENANT_HEADER, tenantId)
    }

    const rewrittenUrl = rewriteAdminHostPath(request)
    return rewrittenUrl
      ? NextResponse.rewrite(rewrittenUrl, { request: { headers: requestHeaders } })
      : NextResponse.next({ request: { headers: requestHeaders } })
  }

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
