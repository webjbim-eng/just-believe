import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../../access/getResolvedTenantId'
import { ScrollReveal } from '../../../../components/ScrollReveal'
import { recordDonationFromStripeSession, retrieveCheckoutSession } from '../../../../lib/stripe'

export const metadata: Metadata = {
  title: 'Thank You — Just Believe International Missions',
  robots: { index: false },
}

/**
 * Stripe Checkout's redirect-based flow lands the donor back here with
 * ?session_id={CHECKOUT_SESSION_ID} (see api/donations/stripe/checkout's
 * success_url) — this page IS the "verify" step for Stripe, playing the
 * same role api/donations/verify plays for Paystack's popup flow. The
 * per-tenant webhook is still the backstop if the donor closes the tab
 * before this page finishes loading.
 */
export default async function GiveSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id: sessionId } = await searchParams
  const tenantId = (await headers()).get(TENANT_HEADER)

  let paid = false
  let donorEmail: string | undefined

  if (sessionId && tenantId) {
    const payload = await getPayload({ config })
    const tenant = await payload.findByID({ collection: 'tenants', id: tenantId, overrideAccess: true })
    const secretKey = tenant.stripe?.secretKey

    if (secretKey) {
      const session = await retrieveCheckoutSession(secretKey, sessionId)
      if (session.payment_status === 'paid') {
        paid = true
        donorEmail = session.customer_details?.email || session.customer_email || undefined
        await recordDonationFromStripeSession(payload, tenantId, session)
      }
    }
  }

  return (
    <main>
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container container--narrow">
          <ScrollReveal>
            <p className="section-eyebrow">Giving</p>
            {paid ? (
              <>
                <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>
                  Thank <span className="text-accent">You</span>
                </h1>
                <hr className="heading-underline heading-underline--center" />
                <p style={{ fontSize: 'var(--text-subheading)', maxWidth: '34rem', margin: '0 auto' }}>
                  Your gift was received{donorEmail ? ` — a confirmation has been sent to ${donorEmail}` : ''}. Thank you for
                  partnering with us.
                </p>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>We Couldn&rsquo;t Confirm That</h1>
                <hr className="heading-underline heading-underline--center" />
                <p style={{ fontSize: 'var(--text-subheading)', maxWidth: '34rem', margin: '0 auto 1.5rem' }}>
                  We weren&rsquo;t able to confirm this payment. If you completed checkout, it may still be processing —
                  otherwise nothing was charged.
                </p>
                <a className="btn-accent" href="/give">
                  Back to Give
                </a>
              </>
            )}
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
