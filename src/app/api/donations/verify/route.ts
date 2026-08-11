import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../../access/getResolvedTenantId'
import { recordDonationFromVerifiedCharge, verifyTransaction } from '../../../../lib/paystack'

/**
 * Called by GiveForm right after the Paystack popup reports success — the
 * client is never trusted to report success on its own, this re-verifies
 * the transaction server-side against Paystack before any Donation record
 * is written (docs/02-architecture.md §6). The per-tenant webhook route is
 * the backstop for the same write if this call never fires (browser closed
 * mid-flow); both funnel through the same idempotent
 * recordDonationFromVerifiedCharge, keyed on the unique paystackReference.
 */
export async function POST(request: Request) {
  const tenantId = request.headers.get(TENANT_HEADER)
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant resolved for this request' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  const reference = typeof body?.reference === 'string' ? body.reference : null
  if (!reference) {
    return NextResponse.json({ error: 'Missing transaction reference' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const tenant = await payload.findByID({ collection: 'tenants', id: tenantId, overrideAccess: true })
  const secretKey = tenant.paystack?.secretKey

  if (!secretKey) {
    return NextResponse.json({ error: 'Online giving is not yet configured for this site' }, { status: 503 })
  }

  const result = await verifyTransaction(secretKey, reference)
  if (!result.status || !result.data || result.data.status !== 'success') {
    return NextResponse.json({ error: 'Transaction could not be verified as successful' }, { status: 402 })
  }

  await recordDonationFromVerifiedCharge(payload, tenantId, result.data)

  return NextResponse.json({ ok: true })
}
