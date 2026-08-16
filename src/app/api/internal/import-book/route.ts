import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../../access/getResolvedTenantId'
import { isPlatformSuperAdmin } from '../../../../access/isPlatformSuperAdmin'
import { fetchAmazonBookMetadata } from '../../../../lib/amazonImport'

/**
 * Admin-only: powers the "Import from Amazon" button on the Books edit
 * screen (src/components/admin/BookImportButton.tsx). See
 * src/lib/amazonImport.ts for the actual extraction logic — shared with
 * the initial-seven-books seed script.
 */
export async function POST(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const tenantId = request.headers.get(TENANT_HEADER)
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant resolved for this request' }, { status: 400 })
  }

  if (!isPlatformSuperAdmin(user)) {
    const membership = user.tenantMemberships?.find((m) => {
      const membershipTenantId = typeof m.tenant === 'object' ? m.tenant.id : m.tenant
      return String(membershipTenantId) === tenantId
    })
    const roleId = membership && (typeof membership.role === 'object' ? membership.role.id : membership.role)
    const role = roleId ? await payload.findByID({ collection: 'roles', id: roleId, depth: 1, overrideAccess: true }) : null
    const canManageBooks = (role?.permissions ?? []).some((p) => typeof p === 'object' && p !== null && p.key === 'books.manage')
    if (!canManageBooks) {
      return NextResponse.json({ error: 'Not authorized to manage books' }, { status: 403 })
    }
  }

  const body = await request.json().catch(() => null)
  const amazonUrl = typeof body?.amazonUrl === 'string' ? body.amazonUrl.trim() : ''
  let parsedUrl: URL
  try {
    parsedUrl = new URL(amazonUrl)
  } catch {
    return NextResponse.json({ error: 'Enter a valid Amazon URL first' }, { status: 400 })
  }
  if (!/(^|\.)amazon\.[a-z.]+$|^a\.co$/i.test(parsedUrl.hostname)) {
    return NextResponse.json({ error: "That doesn't look like an Amazon URL" }, { status: 400 })
  }

  try {
    const metadata = await fetchAmazonBookMetadata(amazonUrl, payload, Number(tenantId))
    return NextResponse.json(metadata)
  } catch (err) {
    return NextResponse.json({ error: `Couldn't reach Amazon (${(err as Error).message}) — enter the details manually.` }, { status: 502 })
  }
}
