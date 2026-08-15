import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../../../access/getResolvedTenantId'
import { createCheckoutSession, toSubunit, type StripeCurrency } from '../../../../../lib/stripe'

const STRIPE_CURRENCIES: StripeCurrency[] = ['NGN', 'USD', 'CAD', 'EUR', 'GBP']

/**
 * Unlike Paystack (api/donations/prepare + client-side Inline JS popup),
 * Stripe Checkout is a single server-side call that returns a hosted URL —
 * the client just redirects the browser there, no Stripe.js needed. Donor-
 * chosen amount and recurring both fold into this one request since
 * Checkout Sessions accept inline price_data.recurring directly.
 */
export async function POST(request: Request) {
  const tenantId = request.headers.get(TENANT_HEADER)
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant resolved for this request' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  const amount = Number(body?.amount)
  const currency = STRIPE_CURRENCIES.includes(body?.currency) ? (body.currency as StripeCurrency) : null
  const recurring = Boolean(body?.recurring)
  const fund = typeof body?.fund === 'string' ? body.fund : 'tithe'
  const donorName = typeof body?.donorName === 'string' ? body.donorName : ''
  const donorEmail = typeof body?.donorEmail === 'string' ? body.donorEmail : ''
  const anonymous = Boolean(body?.anonymous)

  if (!currency || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount or currency' }, { status: 400 })
  }
  if (!donorEmail) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const tenant = await payload.findByID({ collection: 'tenants', id: tenantId, overrideAccess: true })
  const secretKey = tenant.stripe?.secretKey

  if (!secretKey) {
    return NextResponse.json({ error: 'Online giving via Stripe is not yet configured for this site' }, { status: 503 })
  }

  const origin = new URL(request.url).origin
  const session = await createCheckoutSession(secretKey, {
    amountSubunit: toSubunit(amount),
    currency,
    recurring,
    successUrl: `${origin}/give/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/give`,
    customerEmail: donorEmail,
    metadata: {
      fund,
      donorName: anonymous ? '' : donorName,
      anonymous: String(anonymous),
    },
  })

  if (session.error || !session.url) {
    return NextResponse.json({ error: session.error?.message || 'Could not start checkout' }, { status: 502 })
  }

  return NextResponse.json({ url: session.url })
}
