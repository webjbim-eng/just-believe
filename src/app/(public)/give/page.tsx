import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../../access/getResolvedTenantId'
import { ScrollReveal } from '../../../components/ScrollReveal'
import { GiveForm } from '../../../components/GiveForm'

export const metadata: Metadata = {
  title: 'Give — Just Believe International Missions',
  description: 'Support the work of Just Believe International Missions through a one-time or monthly gift.',
}

/**
 * Reads only paystack.publicKey and whether stripe.secretKey is set (never
 * either secretKey itself — see Tenants.ts's field-level access comment)
 * and hands them to the client GiveForm. Stripe's checkout is entirely
 * server-side (Checkout Session redirect), so the client never needs
 * stripe.publishableKey at all — just a boolean for whether to offer it.
 * Renders fine with both unset; GiveForm shows an honest "coming soon"
 * state rather than a broken checkout when a tenant hasn't configured
 * either processor in the admin yet.
 */
export default async function GivePage() {
  const tenantId = (await headers()).get(TENANT_HEADER)

  const tenant = tenantId
    ? await getPayload({ config }).then((payload) =>
        payload.findByID({ collection: 'tenants', id: tenantId, overrideAccess: true }),
      )
    : null
  const paystackPublicKey = tenant?.paystack?.publicKey ?? null
  const stripeEnabled = Boolean(tenant?.stripe?.secretKey)

  return (
    <main>
      <section className="section" style={{ paddingBottom: 0, textAlign: 'center' }}>
        <div className="container container--narrow">
          <ScrollReveal>
            <p className="section-eyebrow">Giving</p>
            <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>
              Give <span className="text-accent">Today</span>
            </h1>
            <hr className="heading-underline heading-underline--center" />
            <p style={{ fontSize: 'var(--text-subheading)', maxWidth: '38rem', margin: '0 auto' }}>
              Every gift proclaims the Gospel, equips believers, and mobilizes intercessors around the world.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section decorative-flourish">
        <div className="container container--narrow">
          <ScrollReveal>
            <GiveForm paystackPublicKey={paystackPublicKey} stripeEnabled={stripeEnabled} />
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
