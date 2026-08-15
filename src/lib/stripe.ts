import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Payload } from 'payload'

/**
 * Thin wrapper over Stripe's REST API — no SDK dependency, same
 * no-SDK-for-a-simple-REST-integration choice as src/lib/paystack.ts. Every
 * function takes the *tenant's* secretKey/webhookSecret explicitly rather
 * than an env var, since each tenant supplies their own Stripe account
 * (Tenants.ts's `stripe` group) — there is no shared platform-wide key.
 *
 * Uses Stripe Checkout (hosted, redirect-based) rather than embedded
 * Elements — the whole flow is "server creates a Session, browser
 * redirects to the URL Stripe returns," so no Stripe.js/publishable key is
 * ever needed on the client at all. Simpler than Paystack's Inline-JS-popup
 * flow, and recurring donations don't need a separate Plan-creation step
 * first — Checkout Sessions accept inline `price_data.recurring` directly.
 */

const STRIPE_BASE_URL = 'https://api.stripe.com/v1'

/**
 * Stripe's real multi-currency support — wider than Paystack's NGN/USD
 * (src/components/GiveForm.tsx's CURRENCIES_BY_METHOD is the shared source
 * of truth for which processor accepts which currencies). None of these
 * five are zero-decimal currencies in Stripe's model, so toSubunit's ×100
 * is correct for all of them.
 */
export type StripeCurrency = 'NGN' | 'USD' | 'CAD' | 'EUR' | 'GBP'

/** Major unit to minor unit (kobo/cents/pence) — Stripe, like Paystack, wants amounts in the smallest currency unit. */
export function toSubunit(majorAmount: number): number {
  return Math.round(majorAmount * 100)
}

/**
 * Stripe's API expects application/x-www-form-urlencoded with PHP/Rails-
 * style bracket notation for nested objects/arrays
 * (line_items[0][price_data][currency]=usd), not JSON. This flattens a
 * plain nested object into that shape.
 */
function toFormBody(obj: Record<string, unknown>, prefix = ''): string[] {
  const pairs: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue
    const formKey = prefix ? `${prefix}[${key}]` : key
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item !== null && typeof item === 'object') {
          pairs.push(...toFormBody(item as Record<string, unknown>, `${formKey}[${index}]`))
        } else {
          pairs.push(`${encodeURIComponent(`${formKey}[${index}]`)}=${encodeURIComponent(String(item))}`)
        }
      })
    } else if (typeof value === 'object') {
      pairs.push(...toFormBody(value as Record<string, unknown>, formKey))
    } else {
      pairs.push(`${encodeURIComponent(formKey)}=${encodeURIComponent(String(value))}`)
    }
  }
  return pairs
}

async function stripeRequest<T>(secretKey: string, method: 'GET' | 'POST', path: string, body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${STRIPE_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: body ? toFormBody(body).join('&') : undefined,
  })
  return res.json()
}

export type StripeCheckoutSession = {
  id: string
  url?: string | null
  payment_status?: 'paid' | 'unpaid' | 'no_payment_required'
  mode?: 'payment' | 'subscription'
  customer_details?: { email?: string | null }
  customer_email?: string | null
  subscription?: string | null
  amount_total?: number | null
  currency?: string | null
  metadata?: Record<string, string> | null
  error?: { message: string }
}

export async function createCheckoutSession(
  secretKey: string,
  args: {
    amountSubunit: number
    currency: StripeCurrency
    recurring: boolean
    successUrl: string
    cancelUrl: string
    customerEmail: string
    metadata: Record<string, string>
  },
): Promise<StripeCheckoutSession> {
  const priceData: Record<string, unknown> = {
    currency: args.currency.toLowerCase(),
    product_data: { name: args.recurring ? 'Monthly Giving' : 'One-Time Gift' },
    unit_amount: args.amountSubunit,
  }
  if (args.recurring) {
    priceData.recurring = { interval: 'month' }
  }

  return stripeRequest<StripeCheckoutSession>(secretKey, 'POST', '/checkout/sessions', {
    mode: args.recurring ? 'subscription' : 'payment',
    line_items: [{ price_data: priceData, quantity: 1 }],
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    customer_email: args.customerEmail,
    metadata: args.metadata,
    // Copied onto the Subscription itself (not just this Session) so that
    // later renewal charges — which arrive as invoice.payment_succeeded
    // webhook events referencing the subscription, not this session — can
    // still recover fund/donorName/anonymous. Only meaningful when recurring.
    ...(args.recurring ? { subscription_data: { metadata: args.metadata } } : {}),
  })
}

export async function retrieveCheckoutSession(secretKey: string, sessionId: string): Promise<StripeCheckoutSession> {
  return stripeRequest<StripeCheckoutSession>(secretKey, 'GET', `/checkout/sessions/${encodeURIComponent(sessionId)}`)
}

/**
 * Stripe signs webhooks differently from Paystack: the `Stripe-Signature`
 * header carries a timestamp plus one or more `v1=` HMAC-SHA256 signatures
 * of `${timestamp}.${rawBody}`, computed with a *per-endpoint* webhook
 * signing secret (whsec_...) — not the account secretKey. A 5-minute
 * tolerance window guards against replaying an old captured request.
 */
export function verifyStripeWebhookSignature(webhookSecret: string, rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [key, value] = part.split('=')
      return [key, value]
    }),
  )
  const timestamp = parts.t
  const signature = parts.v1
  if (!timestamp || !signature) return false

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp))
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) return false

  const expected = createHmac('sha256', webhookSecret).update(`${timestamp}.${rawBody}`).digest('hex')
  const expectedBuf = Buffer.from(expected, 'utf8')
  const receivedBuf = Buffer.from(signature, 'utf8')
  if (expectedBuf.length !== receivedBuf.length) return false
  return timingSafeEqual(expectedBuf, receivedBuf)
}

/**
 * Shared by the /give/success page (client-reported success via redirect)
 * and api/webhooks/stripe/[tenantSlug] (server-pushed event) — whichever
 * fires first wins, the other is a no-op. Mirrors
 * recordDonationFromVerifiedCharge in src/lib/paystack.ts.
 */
export async function recordDonationFromStripeSession(
  payload: Payload,
  tenantId: string | number,
  session: StripeCheckoutSession,
): Promise<void> {
  if (session.payment_status !== 'paid') return

  const metadata = session.metadata ?? {}
  await createDonationRowIdempotent(payload, tenantId, {
    referenceId: session.id,
    amountSubunit: session.amount_total ?? 0,
    currency: session.currency,
    donorEmail: session.customer_details?.email || session.customer_email,
    fund: metadata.fund,
    donorName: metadata.donorName,
    anonymous: metadata.anonymous === 'true',
    subscriptionId: session.subscription,
  })
}

export type StripeInvoice = {
  id: string
  status?: string
  amount_paid?: number
  currency?: string | null
  customer_email?: string | null
  subscription?: string | null
  subscription_details?: { metadata?: Record<string, string> | null } | null
}

/**
 * Renewal charges for a recurring gift arrive as invoice.payment_succeeded,
 * not another checkout.session.completed — Stripe only fires the latter
 * once, for the first charge. fund/donorName/anonymous are recovered from
 * subscription_data.metadata (set at Session creation, see
 * createCheckoutSession) via invoice.subscription_details.metadata; falls
 * back to the default fund/no name if that's ever absent, rather than
 * failing to record the renewal at all. Not yet exercised against a real
 * Stripe account/webhook payload — same honest caveat as the rest of this
 * build, see docs/00-decisions-log.md.
 */
export async function recordDonationFromStripeInvoice(
  payload: Payload,
  tenantId: string | number,
  invoice: StripeInvoice,
): Promise<void> {
  if (invoice.status !== 'paid') return

  const metadata = invoice.subscription_details?.metadata ?? {}
  await createDonationRowIdempotent(payload, tenantId, {
    referenceId: invoice.id,
    amountSubunit: invoice.amount_paid ?? 0,
    currency: invoice.currency,
    donorEmail: invoice.customer_email,
    fund: metadata.fund,
    donorName: metadata.donorName,
    anonymous: metadata.anonymous === 'true',
    subscriptionId: invoice.subscription,
  })
}

async function createDonationRowIdempotent(
  payload: Payload,
  tenantId: string | number,
  args: {
    referenceId: string
    amountSubunit: number
    currency?: string | null
    donorEmail?: string | null
    fund?: string
    donorName?: string
    anonymous: boolean
    subscriptionId?: string | null
  },
): Promise<void> {
  const existing = await payload.find({
    collection: 'donations',
    where: { stripeSessionId: { equals: args.referenceId } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs.length > 0) return

  const amount = args.amountSubunit / 100
  const upperCurrency = args.currency?.toUpperCase()
  const currency: StripeCurrency = (['NGN', 'USD', 'CAD', 'EUR', 'GBP'] as const).includes(upperCurrency as StripeCurrency)
    ? (upperCurrency as StripeCurrency)
    : 'NGN'

  try {
    await payload.create({
      collection: 'donations',
      overrideAccess: true,
      data: {
        tenant: typeof tenantId === 'string' ? Number(tenantId) : tenantId,
        donorName: args.anonymous ? undefined : args.donorName,
        donorEmail: args.donorEmail || undefined,
        amount,
        currency,
        usdAmount: currency === 'USD' ? amount : undefined,
        fund: (args.fund as 'tithe' | 'mission-projects' | 'child-sponsorship' | 'offering') || 'tithe',
        processor: 'stripe',
        // stripeSessionId doubles as the generic idempotency key for both
        // Checkout Session ids (first charge) and Invoice ids (renewals) —
        // both are unique Stripe object ids, the field name just predates
        // renewal handling being added.
        stripeSessionId: args.referenceId,
        stripeSubscriptionId: args.subscriptionId || undefined,
        status: 'completed',
      },
    })
  } catch (err) {
    // Same race as Paystack's recordDonationFromVerifiedCharge — the
    // success-page verify and the webhook can both reach here for the same
    // charge, and losing the unique stripeSessionId race is expected.
    const message = err instanceof Error ? err.message : String(err)
    if (!/unique|duplicate/i.test(message)) throw err
  }
}
