import type { CollectionAfterChangeHook } from 'payload'

/**
 * Notifies the org when a real visitor submits the /contact form
 * (ContactForm.tsx posts straight to Payload's REST API for this
 * collection — no other write path exists for Messages). Sent to
 * SiteSettings.contactEmail specifically, matching Jimmy's request that
 * this go to "the email that's in the contact page" — same field
 * contact/page.tsx already reads, so the two can never drift apart.
 *
 * Gated by notificationPreferences.newMessage (defaults true) — the same
 * per-tenant opt-out shape SiteSettings already scaffolds for Prayer/
 * Counseling/Volunteer/Event/Donation notifications.
 */
export const sendMessageNotification: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc

  const tenantId = typeof doc.tenant === 'object' ? doc.tenant.id : doc.tenant

  const { docs: siteSettingsDocs } = await req.payload
    .find({ collection: 'site-settings', where: { tenant: { equals: tenantId } }, limit: 1, overrideAccess: true })
    .catch(() => ({ docs: [] }))
  const siteSettings = siteSettingsDocs[0]

  if (siteSettings?.notificationPreferences?.newMessage === false) return doc
  const contactEmail = siteSettings?.contactEmail
  if (!contactEmail) return doc

  try {
    await req.payload.sendEmail({
      to: contactEmail,
      replyTo: doc.email,
      subject: `New website message: ${doc.subject}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="margin-bottom: 1rem;">New message from the website</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem;">
            <tr><td style="padding: 0.4rem 0; color: #555; width: 30%;">From</td><td style="padding: 0.4rem 0; font-weight: 600;">${doc.name}</td></tr>
            <tr><td style="padding: 0.4rem 0; color: #555;">Email</td><td style="padding: 0.4rem 0;"><a href="mailto:${doc.email}">${doc.email}</a></td></tr>
            <tr><td style="padding: 0.4rem 0; color: #555;">Subject</td><td style="padding: 0.4rem 0;">${doc.subject}</td></tr>
          </table>
          <p style="white-space: pre-wrap; border-left: 3px solid #e5e5e5; padding-left: 1rem; color: #333;">${doc.message}</p>
          <p style="color: #999; font-size: 0.8em; margin-top: 2rem;">Reply directly to this email to respond to ${doc.name}.</p>
        </div>
      `,
    })
  } catch (err) {
    // A failed notification email must never roll back the Message write
    // itself — the submission is still safely recorded in /admin either way.
    req.payload.logger.error(`Failed to send message notification for message ${doc.id}: ${err instanceof Error ? err.message : String(err)}`)
  }

  return doc
}
