# Decisions Log

Architecture-shaping decisions confirmed with the project owner (Jimmy, blueinctech.com) during Phase 1 Discovery on 2026-08-05. Every downstream document assumes these; if one changes, re-open the affected docs.

| # | Decision | Chosen | Rejected alternatives |
|---|---|---|---|
| D1 | Technical foundation | **Payload CMS 3** (TypeScript, Next.js App Router native) | Fully custom Next.js+NestJS+Prisma stack; Laravel+Filament |
| D2 | Hosting / infra | **Vercel** (app hosting) + **Neon** (serverless Postgres) + **Resend** (transactional email) + **Cloudflare** (DNS, and R2 for object storage — added as a consequence of D2, see note) + **GitHub** (source + CI) | Stay fully on Hostinger; hybrid Hostinger+cloud |
| D3 | V1 multi-tenancy scope | **Full multi-tenant platform in V1** — tenant onboarding, per-tenant branding/domains, isolated data, from the first release | Single-tenant JBIM launch with multi-tenant-ready schema only |
| D4 | Donation payments | **PayPal Checkout** (incl. PayPal Subscriptions for monthly giving) as the primary *integrated* processor | Stripe as primary; placeholder/no integration yet |
| D5 | Tenant onboarding model | **Operator-driven** — only a Platform Super Admin (blueinctech) creates tenants from an internal dashboard; no public self-serve signup or tenant-level billing | Public self-serve signup with tenant billing/plans |

## Notes and assumptions added on top of the user's answers (flagged, not silently assumed)

1. **Media storage (Cloudflare R2)** — Vercel's filesystem is ephemeral/read-only at runtime, so Payload's upload collections need an S3-compatible adapter. Since Cloudflare is already in the stack for DNS and R2 is S3-compatible with zero egress fees, R2 is the natural default. **Flag for confirmation**, not a question asked directly.
2. **Tenant onboarding is operator-driven, not public self-serve** — confirmed as [D5](#) above. "Full multi-tenant in V1" means: the platform supports many isolated ministries with their own branding/domain/admins/roles/content, and a Platform Super Admin (blueinctech) creates new tenants from an internal dashboard. No public "sign up your ministry" self-registration or tenant-level billing/plans in V1.
3. **PayPal is the integrated processor; bank transfer, Zelle are informational** — those two remain "instructions displayed on the Donate page" rather than automated flows, per the original brief. Card payments not routed through PayPal (if ever needed) are out of scope for V1.
4. **Payload's built-in localization** feature is used for the EN/FR/IT/ES multilingual requirement rather than a custom Languages collection — it's a first-class Payload capability, not a workaround.

## Still open

- Does JBIM already have Google Analytics / Search Console / Microsoft Clarity accounts, or do those need to be created during onboarding? (FR-SEO-02)
- Sentry proposed for error monitoring (NFR-10) — not yet explicitly confirmed.
