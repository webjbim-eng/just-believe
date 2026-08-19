import type { CollectionAfterChangeHook } from 'payload'

const FUND_LABELS: Record<string, string> = {
  tithe: 'Tithe',
  'mission-projects': 'Mission Projects',
  'child-sponsorship': 'Child Sponsorship',
  offering: 'Offering',
}

/**
 * Fires once per real donation — Donations' create path is idempotent
 * (unique paystackReference/stripeSessionId, see
 * recordDonationFromVerifiedCharge/recordDonationFromStripeSession), so
 * this afterChange hook only ever runs for the row that actually got
 * written, not once per code path that raced to write it. Covers both
 * processors and recurring renewal charges (each renewal is its own row —
 * see Donations.ts) without needing a separate hook per route.
 *
 * No donorEmail (a donor can give without one, e.g. some Paystack flows) is
 * a normal, silent no-op — not an error worth logging.
 */
export const sendDonationReceipt: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  if (!doc.donorEmail) return doc

  const tenantId = typeof doc.tenant === 'object' ? doc.tenant.id : doc.tenant
  const tenant = await req.payload.findByID({ collection: 'tenants', id: tenantId, overrideAccess: true }).catch(() => null)
  const orgName = tenant?.name || 'Just Believe International Missions'

  const { docs: siteSettingsDocs } = await req.payload
    .find({ collection: 'site-settings', where: { tenant: { equals: tenantId } }, limit: 1, overrideAccess: true })
    .catch(() => ({ docs: [] }))
  const contactEmail = siteSettingsDocs[0]?.contactEmail

  const amountFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: doc.currency, currencyDisplay: 'narrowSymbol' }).format(
    doc.amount,
  )
  const fundLabel = FUND_LABELS[doc.fund] || doc.fund
  const donorName = doc.donorName || 'Friend'
  const dateFormatted = new Date(doc.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const reference = doc.paystackReference || doc.stripeSessionId || String(doc.id)

  try {
    await req.payload.sendEmail({
      to: doc.donorEmail,
      subject: `Your gift to ${orgName} — receipt`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="margin-bottom: 0.25rem;">Thank you, ${donorName}!</h2>
          <p style="color: #555; margin-top: 0;">Your gift to ${orgName} has been received.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;">
            <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #e5e5e5; color: #555;">Amount</td><td style="padding: 0.5rem 0; border-bottom: 1px solid #e5e5e5; text-align: right; font-weight: 600;">${amountFormatted}</td></tr>
            <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #e5e5e5; color: #555;">Fund</td><td style="padding: 0.5rem 0; border-bottom: 1px solid #e5e5e5; text-align: right;">${fundLabel}</td></tr>
            <tr><td style="padding: 0.5rem 0; border-bottom: 1px solid #e5e5e5; color: #555;">Date</td><td style="padding: 0.5rem 0; border-bottom: 1px solid #e5e5e5; text-align: right;">${dateFormatted}</td></tr>
            <tr><td style="padding: 0.5rem 0; color: #555;">Reference</td><td style="padding: 0.5rem 0; text-align: right; font-family: monospace; font-size: 0.85em;">${reference}</td></tr>
          </table>
          <p style="color: #555; font-size: 0.9em;">
            Please keep this email for your records.${contactEmail ? ` Questions? Reach us at <a href="mailto:${contactEmail}">${contactEmail}</a>.` : ''}
          </p>
        </div>
      `,
    })
  } catch (err) {
    // A failed receipt email must never roll back the donation write itself
    // (the charge already succeeded) — log and move on.
    req.payload.logger.error(`Failed to send donation receipt for donation ${doc.id}: ${err instanceof Error ? err.message : String(err)}`)
  }

  return doc
}
