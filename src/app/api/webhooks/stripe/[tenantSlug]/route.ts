import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  recordDonationFromStripeInvoice,
  recordDonationFromStripeSession,
  verifyStripeWebhookSignature,
  type StripeCheckoutSession,
  type StripeInvoice,
} from '../../../../../lib/stripe'

/**
 * Per-tenant path, same reasoning as api/webhooks/paystack/[tenantSlug] —
 * verifying the Stripe-Signature header needs the right tenant's
 * webhookSecret before the payload can be trusted, and which tenant that
 * is can't come from the unverified body itself. Register this URL as this
 * tenant's endpoint in the Stripe Dashboard: it generates the whsec_...
 * value that goes in Tenants.stripe.webhookSecret.
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
  const webhookSecret = tenant?.stripe?.webhookSecret

  if (!tenant || !webhookSecret) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!verifyStripeWebhookSignature(webhookSecret, rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { type?: string; data?: { object?: unknown } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed' && event.data?.object) {
    await recordDonationFromStripeSession(payload, tenant.id, event.data.object as StripeCheckoutSession)
  } else if (event.type === 'invoice.payment_succeeded' && event.data?.object) {
    await recordDonationFromStripeInvoice(payload, tenant.id, event.data.object as StripeInvoice)
  }

  // Stripe expects a fast 2xx regardless of event type — anything else
  // gets retried on a backoff schedule.
  return NextResponse.json({ received: true })
}
