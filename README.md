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

**Foundation modules only.** What's implemented and reviewable right now:
- `Tenants`, `Users`, `Roles`, `Permissions`, `Media` collections
- The database-driven RBAC pattern (`src/access/hasPermission.ts`, `withTenantScope.ts`, `composeAccess.ts`) exactly as designed in `docs/04-auth-rbac.md`, now type-checked against real generated types (`src/payload-types.ts`, committed — regenerate with `npm run generate:types` after any schema change)
- `AuditLogs` collection (append-only — `create`/`update`/`delete` all blocked at the API level) plus the shared `afterChange`/`afterDelete` hook (`src/hooks/auditLog.ts`) wired into every collection above, with secret fields (password, 2FA secret) redacted before storage per FR-AUDIT
- `npm run seed` (`src/seed/run.ts`) — idempotent bootstrap: the full Permissions catalog, the JBIM tenant, its system Roles, and (optionally) an initial Super Admin user. See `.env.example` for the `SEED_*` vars it reads.
- Tenant-resolution middleware (currently a subdomain-only stub — custom-domain resolution needs real Tenant data to work against, see the comment in `src/middleware.ts`)
- Payload admin mounted at `/admin`, public site placeholder at `/`

**Not yet built** (see `docs/01-srs.md` for the full module list): homepage builder, content collections (Pages, Sermons, Events, Blog, etc.), prayer/counseling workflows, donations/PayPal integration, 2FA enforcement, localization routing, design system/component library (Phase 4 UX).

**Known environment gotcha (fixed, documented so it doesn't get re-broken):** `package.json` must keep `"type": "module"` — without it, `payload generate:types`/`generate:importmap` and any standalone script importing `payload.config.ts` fail on Node ≥23.5 (including the Node 24 used to build this) with CJS/ESM interop errors (`ERR_REQUIRE_ASYNC_MODULE`, `Cannot destructure ... of 'import_env.default'`). Standalone scripts like `src/seed/run.ts` additionally need to run via `node --import tsx/esm <file>` (already wired into `npm run seed`) rather than the plain `tsx` binary or `payload run`, which hit the same class of error.

## Local development

```bash
cp .env.example .env.local   # fill in a Neon DATABASE_URI and a PAYLOAD_SECRET at minimum
npm install
npm run seed                 # optional but recommended: seed permissions/roles/tenant (+ admin if SEED_ADMIN_* set)
npm run dev
```

Admin panel: `http://localhost:3000/admin` (if you didn't set `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`, first run prompts you to create the initial user instead). Public site: `http://localhost:3000`.

## Verification status

Verified as of this commit: `npm install`, `npm run typecheck`, `npx next build`, `npm run generate:types`, `npm run generate:importmap` all pass. `npm run seed` was run against an intentionally-unreachable Postgres port to confirm it loads config and reaches the DB-connect step cleanly (fails there with a plain `ECONNREFUSED`, as expected — proves the module-loading/type layer is sound). **Not yet verified against a real Neon database**: an actual full `npm run seed` run, `npm run dev`, logging into `/admin`, or confirming the RBAC access functions behave as designed against real data end-to-end. Do that before building further modules on top of this foundation.
