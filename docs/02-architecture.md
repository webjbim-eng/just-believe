# System Architecture
## JBIM Ministry Management Platform

Status: Draft for review · Phase 3 of 5
Depends on: [00-decisions-log.md](00-decisions-log.md), [01-srs.md](01-srs.md)

---

## 1. Stack Summary

| Layer | Choice | Why |
|---|---|---|
| Application framework | **Next.js 15** (App Router) | Single app serves both public site and admin — required for the "one integrated application" goal. |
| CMS / admin engine | **Payload CMS 3** | Code-first, TypeScript-native, mounts directly inside Next.js; gives us schema-driven collections, access control, drafts/versioning, localization, an admin UI, REST/GraphQL/Local APIs, and an official multi-tenant plugin — the majority of the brief's dashboard requirements ship with the framework instead of being hand-built. |
| Database | **Neon** (serverless Postgres) | Branch-per-PR previews, scales to zero, standard Postgres (no vendor lock-in on the data model). |
| Object storage | **Cloudflare R2** | S3-compatible adapter for Payload uploads; required because Vercel has no persistent filesystem. Pairs naturally with Cloudflare DNS already in the stack. Zero egress fees matter once media-heavy tenants (sermon video thumbnails, galleries) scale up. *(Flagged assumption — see decisions log.)* |
| Email | **Resend** | Payload has an official `@payloadcms/email-resend` adapter; used for auth emails (verification, password reset), event confirmations, donation receipts, newsletter double opt-in. |
| DNS / domains | **Cloudflare** | Owns DNS for the platform domain and any tenant-brought custom domains; proxies to Vercel. |
| Hosting | **Vercel** | Next.js-native deploys, preview URLs per PR, edge middleware for tenant/domain resolution, easy multi-domain attachment per project (needed for per-tenant custom domains). |
| Source / CI | **GitHub** + Vercel's Git integration (GitHub Actions for lint/typecheck/test gates before merge) | Standard, already implied by "GitHub" in the hosting decision. |
| Payments | **PayPal Checkout + Subscriptions** | Per [D4](00-decisions-log.md); server-side webhook verification, never trust client-reported payment status. |

**One deployable unit.** Public site and admin dashboard are the same Next.js/Payload application — not two services calling each other over HTTP. This directly satisfies the brief's "function together as one integrated application" and avoids an entire class of API-versioning/auth-duplication problems a split frontend/backend would introduce.

---

## 2. High-Level Topology

```
                              ┌─────────────────────────────┐
                              │         Cloudflare           │
                              │  DNS for platform domain +   │
                              │  every tenant custom domain   │
                              └──────────────┬────────────────┘
                                             │
                                             ▼
                              ┌─────────────────────────────┐
                              │            Vercel             │
                              │  Edge Middleware: resolve      │
                              │  hostname → tenant             │
                              └──────────────┬────────────────┘
                                             │
                        ┌────────────────────┼────────────────────┐
                        ▼                                         ▼
             ┌─────────────────────┐                  ┌─────────────────────┐
             │  Public site routes   │                  │   /admin (Payload)   │
             │  (Next.js RSC, tenant- │                  │   dashboard, scoped  │
             │  themed by resolved id)│                  │   to resolved tenant │
             └──────────┬─────────────┘                  └──────────┬───────────┘
                        │                                            │
                        └───────────────┬────────────────────────────┘
                                        ▼
                         ┌───────────────────────────────┐
                         │      Payload Local API /        │
                         │      Access Control Layer        │
                         │  (every query tenant + permission │
                         │   scoped, see 04-auth-rbac.md)    │
                         └───────────────┬───────────────────┘
                                        ▼
                    ┌───────────────────┴───────────────────┐
                    ▼                                         ▼
         ┌─────────────────────┐                 ┌─────────────────────┐
         │   Neon (Postgres)     │                 │   Cloudflare R2       │
         │   all collections,     │                 │   media/uploads,       │
         │   tenant_id-scoped      │                 │   tenant-prefixed keys │
         └─────────────────────┘                 └─────────────────────┘

     Outbound integrations: Resend (email) · PayPal (payments + webhooks) ·
     Google Analytics / Search Console / Microsoft Clarity (per-tenant IDs, client-side)
```

### Tenant resolution flow
1. Request arrives at Vercel with a hostname (either `*.jbim-platform.app` subdomain or a fully custom domain like `justbelieveintmissions.org`).
2. Edge middleware looks up the hostname against the `Tenants` collection (cached), attaches the resolved `tenantId` to the request context.
3. Both the public route handlers and the Payload access-control functions read tenant context from that same source — there is exactly one place tenant resolution happens, not one per module.
4. A request with no matching tenant domain gets a platform-level 404, never a fallback to "default tenant" (prevents accidental data bleed).

---

## 3. Multi-Tenancy Strategy

Approach: **shared database, shared schema, row-level tenant scoping** (via `@payloadcms/plugin-multi-tenant`), not database-per-tenant or schema-per-tenant.

Why: hundreds of ministries as described in the brief's north-star question would make database-per-tenant an operational burden (migrations × N databases) for no isolation benefit Postgres row-level scoping + tested access control doesn't already provide. Shared-schema is the standard, proven approach at this scale (it's what Payload's own multi-tenant plugin, Vercel's own multi-tenant docs, and most SaaS platforms of this shape use).

- Every tenant-owned collection carries a `tenant` relationship field, populated automatically on create and immutable after.
- Every collection's `access` functions filter by `req.user`'s tenant membership **and** the resolved-domain tenant — a user authenticated for Tenant A cannot read Tenant B's data even by guessing an ID, because the query itself is scoped, not just the UI.
- Global singletons (Site Settings, Navigation, Footer, Homepage Layout) are tenant-scoped, one instance per tenant, not one shared instance with per-tenant fields bolted on. **Implementation note (2026-08-06):** these actually ship as ordinary `collections/` entries with a `unique: true` tenant field, not Payload's native `globals` — Payload Globals are process-wide singletons with no tenant dimension, and `@payloadcms/plugin-multi-tenant` (which could reconcile that) is named below but was never installed; every collection instead uses the hand-rolled `hasPermission`/`withTenantScope` access pattern. Revisit if/when the plugin is actually adopted.
- The `Tenants` collection itself and the `Platform Super Admin` role are the only cross-tenant-visible constructs in the system.
- NFR-11's automated test (forged tenant ID → must fail closed) runs against every tenant-owned collection in CI, not spot-checked manually.

---

## 4. Application Modules (folder structure)

```
jbim-platform/
├─ src/
│  ├─ app/
│  │  ├─ (public)/                 # public site route group, tenant-themed
│  │  │  ├─ [locale]/
│  │  │  │  ├─ page.tsx            # home
│  │  │  │  ├─ about/
│  │  │  │  ├─ ministries/
│  │  │  │  ├─ events/
│  │  │  │  ├─ sermons/
│  │  │  │  ├─ devotionals/
│  │  │  │  ├─ books/
│  │  │  │  ├─ counseling/
│  │  │  │  ├─ missions/
│  │  │  │  ├─ partnership/
│  │  │  │  ├─ donate/
│  │  │  │  ├─ media/
│  │  │  │  ├─ blog/
│  │  │  │  └─ contact/
│  │  │  └─ layout.tsx             # resolves tenant theme + locale
│  │  ├─ (payload)/admin/          # Payload's mounted admin UI
│  │  ├─ api/
│  │  │  ├─ webhooks/paypal/       # signature-verified payment webhooks
│  │  │  └─ [...payload]/          # Payload REST/GraphQL routes
│  │  └─ middleware.ts             # tenant + locale resolution
│  ├─ collections/                 # one file per Payload collection
│  │  ├─ Tenants.ts
│  │  ├─ Users.ts
│  │  ├─ Roles.ts
│  │  ├─ Pages.ts
│  │  ├─ Ministries.ts
│  │  ├─ Events.ts
│  │  ├─ EventRegistrations.ts
│  │  ├─ Sermons.ts
│  │  ├─ Devotionals.ts
│  │  ├─ Books.ts
│  │  ├─ Resources.ts
│  │  ├─ Media.ts
│  │  ├─ Blog.ts
│  │  ├─ Categories.ts / Tags.ts
│  │  ├─ PrayerRequests.ts
│  │  ├─ CounselingRequests.ts
│  │  ├─ Volunteers.ts
│  │  ├─ Partners.ts
│  │  ├─ Testimonials.ts
│  │  ├─ NewsletterSubscribers.ts
│  │  ├─ Donations.ts
│  │  ├─ Leadership.ts
│  │  ├─ AuditLogs.ts              # write-only from hooks, read via UI
│  │  └─ SiteSettings.ts / Navigation.ts / Footer.ts / HomepageLayout.ts
│  │                               # ^ tenant-scoped singletons — live here,
│  │                               #   not in a separate globals/, see §3 note
│  ├─ blocks/                      # reusable homepage/page builder blocks
│  │  ├─ Hero/ WelcomeMessage/ FeaturedSermons/ FeaturedEvents/
│  │  │  FeaturedBooks/ MinistriesOverview/ Testimonials/
│  │  │  PartnershipInvitation/ NewsletterSignup/ RichText/ CTA/
│  ├─ access/                      # shared, reusable access-control helpers
│  │  ├─ hasPermission.ts          # generic permission-string checker
│  │  ├─ withTenantScope.ts
│  │  └─ isPlatformSuperAdmin.ts
│  ├─ hooks/                       # Payload collection hooks (cross-cutting)
│  │  ├─ auditLog.ts               # attached to every tracked collection
│  │  └─ sendNotification.ts
│  ├─ integrations/
│  │  ├─ paypal/                   # checkout + subscriptions + webhook verify
│  │  ├─ resend/
│  │  └─ analytics/                # GA / Search Console / Clarity injection
│  ├─ components/                  # shared UI (design system, see 05-design-system.md)
│  ├─ lib/
│  └─ payload.config.ts
├─ tests/
│  ├─ access-control/              # NFR-11 cross-tenant isolation suite
│  ├─ e2e/                         # Playwright: registration, donation, prayer flows
│  └─ unit/
└─ docs/                           # this folder
```

**Rule enforced in code review (NFR-09):** nothing under `collections/`, `blocks/`, `access/`, or `hooks/` may reference JBIM, a specific tenant ID, or ministry-specific copy. Seed/fixture data for JBIM lives entirely in a `seed/` script, never inline in schema or component defaults.

---

## 5. Content Workflow

- **Drafts & versioning**: Payload's built-in draft system covers Pages, Blog, Ministries, Sermons, Devotionals, Books, Homepage Layout — content is edited as a draft and requires an explicit Publish action (FR-HOME-06), with version history for rollback.
- **Localization**: Payload's native `localization` config (not a custom collection) handles EN/FR/IT/ES field-level translation, satisfying FR-SITE-03 and NFR-07 without schema changes when a 5th locale is added.
- **SEO**: `@payloadcms/plugin-seo` attached to all public-facing collections for FR-CMS-03/FR-SEO-01.
- **Forms**: Prayer Requests, Counseling Requests, Volunteer Applications, and Partnership submissions are modeled as first-class collections (not generic form-builder submissions) because each has a distinct status pipeline and coordinator-role visibility rules that a generic form tool doesn't express well. A simple Contact form (no workflow) may use `@payloadcms/plugin-form-builder` if a fully generic, admin-defined form is wanted later — flagged as an option, not built by default.

---

## 6. Payments Architecture (Paystack + Stripe)

Two independent, donor-selectable processors (2026-08-11 — Stripe added alongside the existing Paystack integration, see [D4](00-decisions-log.md)). `/give` renders server-side, reading only the resolved tenant's `paystack.publicKey` and *whether* `stripe.secretKey` is set (never any secret) via the Local API, and passes those to the client `GiveForm`. The payment-method toggle only appears when a tenant has configured both; with only one configured, that one is used silently. `Donations.processor` records which gateway handled a given row.

**Paystack** (popup, stays on `/give`):
1. Paystack Inline JS (loaded via `next/script`, not an npm dependency) opens a checkout popup using the tenant's `paystack.publicKey` — per-tenant, stored in `Tenants.paystack` (never a platform-wide shared account).
2. Recurring (monthly) donations need a Paystack Plan before Inline JS can attach a subscription to a charge, and Plan amounts are donor-chosen rather than fixed tiers — so before opening the popup, the client calls `api/donations/prepare`, which creates a one-off Plan for that exact amount/currency via the tenant's `secretKey` and returns the `planCode`.
3. On popup success, the client calls `api/donations/verify` with the returned reference, which **re-verifies the transaction server-side against Paystack's Verify Transaction API** before writing a `Donations` record — the client is never trusted to report success. Writes are idempotent on `paystackReference` (unique), since the webhook below can race this same write.
4. Paystack webhooks post to a **per-tenant** path, `api/webhooks/paystack/[tenantSlug]`, not one shared endpoint — the tenant has to be known from the URL before the `x-paystack-signature` header can be verified (HMAC-SHA512 of the raw body using that tenant's `secretKey`), since which tenant's secret key to check the signature against can't itself come from the unverified payload. Handles `charge.success` as the backstop path for any donation the client-side verify call missed (browser closed mid-flow, etc.) — same idempotent-on-`paystackReference` write as above.

**Stripe** (hosted redirect, leaves `/give` entirely):
1. `api/donations/stripe/checkout` creates a Checkout Session server-side via the tenant's `stripe.secretKey` and returns its hosted URL — the client does a full-page redirect there. No Stripe.js and no `publishableKey` are ever needed client-side for this flow, unlike Paystack's embedded popup.
2. Donor-chosen amounts mean recurring donations use inline `price_data`/`recurring` on the Session itself (Stripe supports this directly), not a separate pre-created Plan step like Paystack needs — one API call handles both one-time and recurring.
3. Stripe redirects the donor back to `/give/success?session_id=...` on success — that page **is** the verify step (retrieves the Session server-side, checks `payment_status === 'paid'`, writes the `Donations` record), playing the same role `api/donations/verify` plays for Paystack.
4. Stripe webhooks post to a **per-tenant** path, `api/webhooks/stripe/[tenantSlug]`, same reasoning as Paystack's — verified via the `Stripe-Signature` header (HMAC-SHA256 of `${timestamp}.${rawBody}` using the tenant's own per-endpoint `stripe.webhookSecret`, not the account secret key — a real difference from Paystack's scheme, where the secret key itself signs). Handles `checkout.session.completed` (first charge, one-time or recurring) and `invoice.payment_succeeded` (subsequent monthly renewal charges, which arrive as a different event referencing the subscription rather than the original Session) — **the renewal path is unverified against a real Stripe account/webhook payload**, built to the documented event shape but not yet exercised live.

Both processors funnel through the same idempotent-on-unique-reference pattern (`paystackReference` / `stripeSessionId`), since each processor's client-redirect-or-popup path and its webhook can race to record the same charge.

Receipt email (Resend) firing from a Payload `afterChange` hook on `Donations` is **not yet implemented** for either processor — see docs/00-decisions-log.md open items; this build covers the checkout → verified-record path only.

---

## 7. Cross-Cutting Concerns

- **Audit logging (FR-AUDIT)**: implemented as a shared `afterChange`/`afterDelete` hook attached to every tracked collection, writing user/action/module/before/after/timestamp/tenant in the same transaction as the mutation (NFR-12) — not a separate best-effort call.
- **Rate limiting**: applied at Vercel edge middleware for public mutating endpoints (prayer/counseling/volunteer/newsletter forms, login) to satisfy NFR-03.
- **Error monitoring**: recommend Sentry (Vercel-native integration) — proposed default, open for confirmation, satisfies NFR-10.
- **CI gates**: typecheck, lint, the NFR-11 access-control suite, and Playwright smoke tests all run on every PR before merge to `main`; Vercel preview deploy uses a Neon database branch per PR so testing never touches production data.

---

## 8. What Ships in V1 vs. Deferred

Per [D3](00-decisions-log.md), multi-tenancy itself (isolation, per-tenant branding/domain, tenant creation) **is** V1, via an operator-driven onboarding model ([D5](00-decisions-log.md)). Explicitly deferred beyond V1:
- Public self-serve tenant signup + tenant-level billing.
- Native mobile apps.
- In-house live-streaming (V1 embeds YouTube/external streams only).
- Multi-currency donation support beyond the confirmed NGN/USD toggle (Paystack doesn't auto-convert "any currency" the way the original PayPal plan assumed — see [D4](00-decisions-log.md)) — no live FX rate integration exists, so a real currency-conversion display is deferred.
- Donation receipt emails (§6 item 5) — the verify/webhook routes write the `Donations` record; the Resend `afterChange` hook to actually send the receipt is not yet built.

---

Next: [03-database-schema.md](03-database-schema.md) (ERD + collection field definitions), then [04-auth-rbac.md](04-auth-rbac.md).
