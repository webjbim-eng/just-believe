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
- The database-driven RBAC pattern (`src/access/hasPermission.ts`, `withTenantScope.ts`, `composeAccess.ts`) exactly as designed in `docs/04-auth-rbac.md`
- `AuditLogs` collection (append-only — `create`/`update`/`delete` all blocked at the API level) plus the shared `afterChange`/`afterDelete` hook (`src/hooks/auditLog.ts`) wired into every collection above, with secret fields (password, 2FA secret) redacted before storage per FR-AUDIT
- Tenant-resolution middleware (currently a subdomain-only stub — custom-domain resolution needs real Tenant data to work against, see the comment in `src/middleware.ts`)
- Payload admin mounted at `/admin`, public site placeholder at `/`

**Not yet built** (see `docs/01-srs.md` for the full module list): a seed script for the Permissions/Roles reference data (nothing in Roles/Permissions exists yet in a real database, so `hasPermission()` has nothing to check against until this exists), homepage builder, content collections (Pages, Sermons, Events, Blog, etc.), prayer/counseling workflows, donations/PayPal integration, 2FA enforcement, localization routing, design system/component library (Phase 4 UX).

## Local development

```bash
cp .env.example .env.local   # fill in a Neon DATABASE_URI and a PAYLOAD_SECRET at minimum
npm install
npm run dev
```

Admin panel: `http://localhost:3000/admin` (first run prompts you to create the initial user). Public site: `http://localhost:3000`.

## Verification status

`npm install`, `npm run typecheck`, and `npx next build` all pass as of this commit (build run with placeholder `PAYLOAD_SECRET`/`DATABASE_URI`/`RESEND_API_KEY` values — no live database or email connection has been exercised yet). **Not yet verified**: `npm run dev` against a real Neon database (creating the first admin user, confirming collections render correctly in the admin UI, confirming the RBAC access functions behave as designed against real data). Do that before building further modules on top of this foundation.
