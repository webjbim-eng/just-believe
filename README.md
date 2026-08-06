# JBIM Ministry Management Platform

Multi-tenant public website + administrative dashboard for Just Believe International Missions (JBIM), built as a single Next.js + Payload CMS application. First tenant is JBIM; the platform is architected to onboard further ministries without core-code changes.

Full planning documentation — requirements, architecture, database schema, auth/RBAC design, and the decisions that shaped them — lives in [`docs/`](docs/):

1. [`docs/00-decisions-log.md`](docs/00-decisions-log.md) — locked stack/scope decisions
2. [`docs/01-srs.md`](docs/01-srs.md) — Software Requirements Specification
3. [`docs/02-architecture.md`](docs/02-architecture.md) — system architecture, stack, folder structure
4. [`docs/03-database-schema.md`](docs/03-database-schema.md) — ERD + collection field reference
5. [`docs/04-auth-rbac.md`](docs/04-auth-rbac.md) — authentication + database-driven RBAC design

Original client-supplied brief, ministry copy, intake questionnaire, and brand assets are preserved in [`docs/source/`](docs/source/) and [`public/brand/`](public/brand/).

## Stack

Next.js 15 (App Router) · Payload CMS 3 · Neon (Postgres) · Cloudflare R2 (media, not yet wired) · Resend (email) · Cloudflare (DNS) · Vercel (hosting) · PayPal Checkout (donations, not yet wired).

## Status

**Full backend schema built; frontend/integrations not started.** What's implemented and reviewable right now:
- The complete collection set from `docs/03-database-schema.md`: `Tenants`, `Users`, `Roles`, `Permissions`, `Media`, `AuditLogs`, taxonomy (`Categories`, `Tags`), content (`Pages`, `Ministries`, `Leadership`, `Events`, `EventRegistrations`, `Sermons`, `Devotionals`, `Books`, `Resources`, `Blog`), tenant website config (`SiteSettings`, `Navigation`, `Footer`, `HomepageLayout` — see the implementation note in `docs/02-architecture.md` §3 on why these are collections, not Payload Globals), and care/submission collections (`PrayerRequests`, `CounselingRequests`, `Volunteers`, `Partners`, `Testimonials`, `NewsletterSubscribers`, `Donations`)
- The database-driven RBAC pattern (`src/access/hasPermission.ts`, `withTenantScope.ts`, `composeAccess.ts`, `publicContentAccess.ts`) exactly as designed in `docs/04-auth-rbac.md`, applied consistently across every collection above
- Per-tenant slug uniqueness (`src/fields/slug.ts`'s `validate` function) and the FR-EVT-06 event-registration auto-waitlist hook
- `AuditLogs` collection (append-only — `create`/`update`/`delete` all blocked at the API level) plus the shared `afterChange`/`afterDelete` hook (`src/hooks/auditLog.ts`) wired into every collection above, with secret fields (password, 2FA secret) redacted before storage per FR-AUDIT
- `npm run seed` (`src/seed/run.ts`) — idempotent bootstrap: the full Permissions catalog, the JBIM tenant, its system Roles, and (optionally) an initial Super Admin user. See `.env.example` for the `SEED_*` vars it reads.
- Platform-wide localization config (EN/FR/IT/ES, `src/payload.config.ts`) — public-facing text fields are marked `localized: true` throughout
- Tenant-resolution middleware (currently a subdomain-only stub — custom-domain resolution needs real Tenant data to work against, see the comment in `src/middleware.ts`)
- Payload admin mounted at `/admin`, public site placeholder at `/`

**Not yet built** (see `docs/01-srs.md` for the full module list): the public site UI that actually consumes this schema, the homepage block library (`src/blocks/`), PayPal donation integration, Cloudflare R2 media storage wiring, GA/Search Console/Clarity analytics injection, 2FA enforcement, and the design system/component library (Phase 4 UX) — these need real values/credentials (brand colors, PayPal app credentials, R2 credentials, analytics account IDs) that are only the client's/Jimmy's to provide, not something to guess at.

**Known environment gotcha (fixed, documented so it doesn't get re-broken):** `package.json` must keep `"type": "module"` — without it, `payload generate:types`/`generate:importmap` and any standalone script importing `payload.config.ts` fail on Node ≥23.5 (including the Node 24 used to build this) with CJS/ESM interop errors (`ERR_REQUIRE_ASYNC_MODULE`, `Cannot destructure ... of 'import_env.default'`). Standalone scripts like `src/seed/run.ts` additionally need to run via `node --import tsx/esm <file>` rather than the plain `tsx` binary or `payload run`, which hit the same class of error. Unlike Next.js, plain Node doesn't auto-load `.env.local` — `npm run seed` handles this itself via `node --env-file=.env.local` (Node ≥20.6), so no separate env-loading step is needed.

## Local development

```bash
cp .env.example .env.local   # fill in a Neon DATABASE_URI and a PAYLOAD_SECRET at minimum
npm install
npm run seed                 # optional but recommended: seed permissions/roles/tenant (+ admin if SEED_ADMIN_* set)
npm run dev
```

Admin panel: `http://localhost:3000/admin` (if you didn't set `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`, first run prompts you to create the initial user instead). Public site: `http://localhost:3000`.

## Verification status

Verified as of this commit, end-to-end against a real Neon database: `npm run typecheck`, `npx next build`, `npm run generate:types`, and `npm run seed` all pass. `npm run dev` boots, pushes the full schema to Postgres, and serves `/admin` with a 200. `npm run seed` successfully creates the JBIM tenant, all 38 catalog permissions, and all 10 system roles (idempotent — safe to re-run). Not yet verified: an actual admin login (no `SEED_ADMIN_*` set in this environment — create the first user at `/admin`), or the RBAC access functions against real content data (no content has been created through the admin UI yet, only seeded via the Local API with `overrideAccess: true`).
