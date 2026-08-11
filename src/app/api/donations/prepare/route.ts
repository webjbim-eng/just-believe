import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../../access/getResolvedTenantId'
import { createPlan, toSubunit } from '../../../../lib/paystack'

/**
 * Called before opening the Paystack checkout popup, only for recurring
 * (monthly) donations. Paystack Plans are normally fixed tiers set up
 * ahead of time, but a donor picks their own amount, so this creates a
 * one-off Plan for that exact amount right before checkout — Inline JS
 * then attaches the charge to it via the returned `planCode`. One-time
 * gifts skip this route entirely (the client only calls it when the donor
 * checked "monthly").
 */
export async function POST(request: Request) {
  const tenantId = request.headers.get(TENANT_HEADER)
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant resolved for this request' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  const amount = Number(body?.amount)
  const currency = body?.currency === 'USD' ? 'USD' : body?.currency === 'NGN' ? 'NGN' : null
  const recurring = Boolean(body?.recurring)

  if (!currency || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount or currency' }, { status: 400 })
  }

  if (!recurring) {
    return NextResponse.json({ ok: true })
  }

  const payload = await getPayload({ config })
  const tenant = await payload.findByID({ collection: 'tenants', id: tenantId, overrideAccess: true })
  const secretKey = tenant.paystack?.secretKey

  if (!secretKey) {
    return NextResponse.json({ error: 'Online giving is not yet configured for this site' }, { status: 503 })
  }

  const planResult = await createPlan(secretKey, {
    name: `Monthly Giving — ${currency} ${amount.toFixed(2)} — ${Date.now()}`,
    amountSubunit: toSubunit(amount),
    currency,
    interval: 'monthly',
  })

  if (!planResult.status || !planResult.data?.plan_code) {
    return NextResponse.json({ error: planResult.message || 'Could not set up the recurring plan' }, { status: 502 })
  }

  return NextResponse.json({ planCode: planResult.data.plan_code })
}
