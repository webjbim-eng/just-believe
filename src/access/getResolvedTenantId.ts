import type { PayloadRequest } from 'payload'

/**
 * Single source of truth for "which tenant is this request for."
 *
 * Populated by src/middleware.ts, which resolves the incoming hostname
 * against the Tenants collection and forwards it as a request header. Both
 * the public route handlers and every access-control function in
 * src/collections/* read tenant context from here — there is exactly one
 * place tenant resolution happens. See docs/02-architecture.md §2.
 */
export const TENANT_HEADER = 'x-jbim-tenant-id'

export const getResolvedTenantId = (req: PayloadRequest): string | null => {
  return req.headers.get(TENANT_HEADER)
}
