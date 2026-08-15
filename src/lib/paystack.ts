import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Payload } from 'payload'

/**
 * Thin wrapper over Paystack's REST API — no SDK dependency, same style as
 * src/app/api/internal/resolve-tenant/route.ts's raw fetch() calls. Every
 * function here takes the *tenant's* secretKey explicitly rather than
 * reading an env var, since this is a multi-tenant platform where each
 * tenant supplies their own Paystack account (Tenants.ts's `paystack`
 * group) — there is no shared platform-wide key.
 */

const PAYSTACK_BASE_URL = 'https://api.paystack.co'

export type PaystackVerifyResponse = {
  status: boolean
  data?: {
    status: 'success' | 'failed' | 'abandoned'
    reference: string
    amount: number // subunit (kobo/cents)
    currency: string
    customer?: { email?: string }
    plan?: string | null
    plan_object?: { plan_code?: string } | null
    metadata?: Record<string, unknown> | null
  }
  message?: string
}

export async function verifyTransaction(secretKey: string, reference: string): Promise<PaystackVerifyResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  })
  return res.json()
}

export type PaystackPlanResponse = {
  status: boolean
  data?: { plan_code: string }
  message?: string
}

/**
 * Paystack Plans are normally fixed-amount tiers set up ahead of time, but
 * a donor picks their own amount — so a one-off Plan is created for that
 * exact amount immediately before checkout, and Inline JS attaches the
 * charge to it via the `plan` param. Only used for recurring (monthly)
 * donations; one-time gifts skip this entirely.
 */
export async function createPlan(
  secretKey: string,
  args: { name: string; amountSubunit: number; currency: 'NGN' | 'USD'; interval: 'monthly' },
): Promise<PaystackPlanResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/plan`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: args.name,
      amount: args.amountSubunit,
      currency: args.currency,
      interval: args.interval,
    }),
  })
  return res.json()
}

/** NGN/USD to kobo/cents — Paystack always wants amounts in the smallest currency unit. */
export function toSubunit(majorAmount: number): number {
  return Math.round(majorAmount * 100)
}

export function fromSubunit(subunitAmount: number): number {
  return subunitAmount / 100
}

/**
 * Paystack signs webhook payloads with HMAC-SHA512 of the raw request body
 * using the secret key — no separate webhook secret. timingSafeEqual (not
 * ===) avoids leaking timing information about how much of the signature
 * matched, standard practice for any signature comparison.
 */
export function verifyWebhookSignature(secretKey: string, rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false
  const expected = createHmac('sha512', secretKey).update(rawBody).digest('hex')
  const expectedBuf = Buffer.from(expected, 'utf8')
  const receivedBuf = Buffer.from(signatureHeader, 'utf8')
  if (expectedBuf.length !== receivedBuf.length) return false
  return timingSafeEqual(expectedBuf, receivedBuf)
}

/**
 * Shared by api/donations/verify (client-reported success) and
 * api/webhooks/paystack/[tenantSlug] (server-pushed event) — whichever
 * fires first wins, the other is a no-op. `donorName`/`fund`/`anonymous`
 * aren't native Paystack transaction fields, so the client sends them as
 * `metadata` when opening the checkout popup and they round-trip back on
 * the verified transaction — never trusted from the client directly.
 */
export async function recordDonationFromVerifiedCharge(
  payload: Payload,
  tenantId: string | number,
  charge: NonNullable<PaystackVerifyResponse['data']>,
): Promise<void> {
  if (charge.status !== 'success') return

  const existing = await payload.find({
    collection: 'donations',
    where: { paystackReference: { equals: charge.reference } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs.length > 0) return

  const metadata = (charge.metadata ?? {}) as { fund?: string; donorName?: string; anonymous?: boolean }
  const amount = fromSubunit(charge.amount)
  const currency = charge.currency === 'USD' ? 'USD' : 'NGN'
  const planCode = charge.plan || charge.plan_object?.plan_code || undefined

  try {
    await payload.create({
      collection: 'donations',
      overrideAccess: true,
      data: {
        tenant: typeof tenantId === 'string' ? Number(tenantId) : tenantId,
        donorName: metadata.anonymous ? undefined : metadata.donorName,
        donorEmail: charge.customer?.email,
        amount,
        currency,
        usdAmount: currency === 'USD' ? amount : undefined,
        fund: (metadata.fund as 'tithe' | 'mission-projects' | 'child-sponsorship' | 'offering') || 'tithe',
        processor: 'paystack',
        paystackReference: charge.reference,
        paystackSubscriptionCode: planCode,
        status: 'completed',
      },
    })
  } catch (err) {
    // The client-side verify call and the webhook both reach this function
    // for the same charge in the normal case — whichever loses the race on
    // the unique paystackReference constraint throws here, and that's the
    // expected outcome, not a real failure. Anything else re-throws.
    const message = err instanceof Error ? err.message : String(err)
    if (!/unique|duplicate/i.test(message)) throw err
  }
}
