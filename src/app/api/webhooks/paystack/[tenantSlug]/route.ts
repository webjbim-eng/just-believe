import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { recordDonationFromVerifiedCharge, verifyWebhookSignature } from '../../../../../lib/paystack'

/**
 * A per-tenant path (not one shared /api/webhooks/paystack) rather than
 * resolving the tenant from the Host header like the rest of the app does
 * — Paystack's signature check needs the RIGHT tenant's secretKey before
 * the payload can be trusted at all, and which tenant that is can't itself
 * come from the unverified body. The slug is the tenant's own Tenants.slug
 * — register this URL as this tenant's webhook in the Paystack dashboard:
 * https://<domain>/api/webhooks/paystack/<tenant-slug>.
 */
export async function POST(request: Request, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params
  const rawBody = await request.text()

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: tenantSlug } },
    limit: 1,
    overrideAccess: true,
  })
  const tenant = docs[0]
  const secretKey = tenant?.paystack?.secretKey

  if (!tenant || !secretKey) {
    // Vague on purpose — don't confirm/deny a slug's existence to an
    // unauthenticated caller probing webhook URLs.
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const signature = request.headers.get('x-paystack-signature')
  if (!verifyWebhookSignature(secretKey, rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { event?: string; data?: unknown }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  if (event.event === 'charge.success' && event.data) {
    await recordDonationFromVerifiedCharge(
      payload,
      tenant.id,
      event.data as Parameters<typeof recordDonationFromVerifiedCharge>[2],
    )
  }

  // Paystack expects a fast 200 regardless of what the event was — anything
  // else gets retried on a backoff schedule, which would just re-process
  // the same handled/ignored event repeatedly.
  return NextResponse.json({ received: true })
}
