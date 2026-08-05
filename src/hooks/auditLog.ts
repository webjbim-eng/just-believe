import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'
import { getResolvedTenantId } from '../access/getResolvedTenantId'

/**
 * Shared audit-logging hook, attached to every tracked collection's
 * afterChange/afterDelete. Writes happen through the same `req` the
 * triggering mutation used, so the audit entry participates in the same DB
 * transaction (NFR-12) — if the audit write fails, the content mutation
 * rolls back with it, rather than silently under-logging. Writes use
 * `overrideAccess: true` because AuditLogs.access.create is deliberately
 * always `false` for every other caller (FR-AUDIT-03) — this hook is the
 * one sanctioned exception. See docs/04-auth-rbac.md §4.
 */
const REDACTED = '[REDACTED]'

const DEFAULT_REDACT_PATHS = ['password', 'salt', 'hash', 'twoFactor.secret']

function redact(value: unknown, paths: string[]): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  const clone = JSON.parse(JSON.stringify(value)) as Record<string, unknown>

  for (const path of paths) {
    const segments = path.split('.')
    let node: Record<string, unknown> | undefined = clone
    for (let i = 0; i < segments.length - 1; i += 1) {
      if (!node || typeof node[segments[i]] !== 'object') {
        node = undefined
        break
      }
      node = node[segments[i]] as Record<string, unknown>
    }
    const lastKey = segments[segments.length - 1]
    if (node && lastKey in node) {
      node[lastKey] = REDACTED
    }
  }

  return clone
}

/**
 * Resolves the numeric tenant id to attach to the audit entry: prefer the
 * request-header-resolved tenant (a string, coerced to a number), falling
 * back to the mutated document's own `tenant` relationship field if present
 * (covers hooks running outside a tenant-resolved request context, e.g. a
 * future admin script). Returns null for platform-scope documents (Tenants
 * itself, or genuinely tenant-less records).
 */
function resolveAuditTenantId(doc: unknown, req: PayloadRequest): number | null {
  const headerTenantId = getResolvedTenantId(req)
  if (headerTenantId) return Number(headerTenantId)

  const docTenant = (doc as { tenant?: number | { id: number } | null } | null)?.tenant
  if (docTenant == null) return null
  return typeof docTenant === 'object' ? docTenant.id : docTenant
}

type AuditableOptions = {
  redactPaths?: string[]
}

export const createAuditAfterChangeHook = (
  collectionSlug: string,
  options: AuditableOptions = {},
): CollectionAfterChangeHook => {
  return async ({ doc, previousDoc, operation, req }) => {
    if (operation !== 'create' && operation !== 'update') return doc

    const redactPaths = options.redactPaths ?? DEFAULT_REDACT_PATHS

    await req.payload.create({
      collection: 'audit-logs',
      data: {
        user: req.user?.id ?? null,
        action: operation,
        collectionSlug,
        documentId: String(doc.id),
        tenant: resolveAuditTenantId(doc, req),
        previousValue: operation === 'update' ? redact(previousDoc, redactPaths) : null,
        newValue: redact(doc, redactPaths),
      },
      req,
      overrideAccess: true,
    })

    return doc
  }
}

export const createAuditAfterDeleteHook = (
  collectionSlug: string,
  options: AuditableOptions = {},
): CollectionAfterDeleteHook => {
  return async ({ doc, id, req }) => {
    const redactPaths = options.redactPaths ?? DEFAULT_REDACT_PATHS

    await req.payload.create({
      collection: 'audit-logs',
      data: {
        user: req.user?.id ?? null,
        action: 'delete',
        collectionSlug,
        documentId: String(id),
        tenant: resolveAuditTenantId(doc, req),
        previousValue: redact(doc, redactPaths),
        newValue: null,
      },
      req,
      overrideAccess: true,
    })

    return doc
  }
}
