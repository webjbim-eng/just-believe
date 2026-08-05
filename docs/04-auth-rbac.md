# Authentication & Authorization Design
## JBIM Ministry Management Platform

Status: Draft for review · Phase 3 of 5
Depends on: [02-architecture.md](02-architecture.md), [03-database-schema.md](03-database-schema.md)

---

## 1. Authentication

### 1.1 Mechanism
Payload's built-in `auth` on the `User` collection: email + password, bcrypt hashing, signed httpOnly SameSite=Lax session cookie carrying a short-lived JWT, refreshed on activity. No custom auth stack to build or audit — this is Payload's most heavily used, most audited subsystem.

| Requirement (from SRS §4) | How it's met |
|---|---|
| Secure login | Payload auth + rate-limited login endpoint (see §3) |
| Password reset | Payload's built-in token-based flow, email sent via Resend adapter |
| Email verification | Payload's `verify: true` on the Users collection; unverified users cannot log in |
| Session management | httpOnly/SameSite cookie, configurable expiry, server-side session invalidation on password change or admin-forced logout |
| Two-Factor Authentication | **Not built into Payload core** — added as a custom field (`twoFactorSecret`, encrypted) + TOTP verification step (`otplib`) inserted into the login flow via a custom `beforeLogin`/custom admin login view. Enforced (not optional) for Super Administrator and Finance Manager roles per NFR-04; optional for others. |
| Rate limiting | Applied at Vercel Edge Middleware in front of `/api/users/login`, `/api/users/reset-password`, and all public form-submission endpoints |
| Secure password hashing | Payload default (bcrypt) — not reinvented |

### 1.2 Platform Super Admin vs. tenant users
`isPlatformSuperAdmin` is a boolean on `User`, separate from the tenant-scoped `Role` system — it is checked first, and if true, bypasses tenant-scoping (but **not** audit logging — every platform-level action is still recorded). This keeps the "operates across all tenants" capability to a single, explicit, easily-reviewed flag rather than a role that could accidentally be granted broad cross-tenant reach through the normal permission-composition system.

---

## 2. Authorization — Database-Driven RBAC

The brief is explicit: *"Permissions must be database-driven. Do not hardcode permissions."* Payload's default pattern is access-control **functions** written in code (e.g. `access: { read: () => true }`), which by itself tends toward hardcoded role checks like `req.user.role === 'admin'`. We deliberately layer a data-driven permission model on top of that mechanism so the *functions* are generic and reusable, while the *decisions* they make live in the database.

### 2.1 The pattern
Every collection's access-control functions call one shared helper instead of encoding role logic themselves:

```ts
// src/access/hasPermission.ts
export const hasPermission = (permissionKey: string) =>
  async ({ req }: AccessArgs) => {
    const { user } = req
    if (!user) return false
    if (user.isPlatformSuperAdmin) return true

    const tenantId = getResolvedTenantId(req)         // from edge-resolved context
    const membership = user.tenantMemberships?.find(
      (m) => m.tenant === tenantId
    )
    if (!membership) return false

    const role = await req.payload.findByID({
      collection: 'roles',
      id: membership.role,
      depth: 1,                                        // resolves permissions array
    })

    return role.permissions.some((p) => p.key === permissionKey)
  }
```

```ts
// src/collections/Sermons.ts
export const Sermons: CollectionConfig = {
  slug: 'sermons',
  access: {
    read: () => true,                    // public
    create: hasPermission('sermons.publish'),
    update: hasPermission('sermons.publish'),
    delete: hasPermission('sermons.publish'),
  },
  // ...fields
}
```

Adding a new permission or reshaping a role **never touches this file** — it's a data change in the `Roles`/`Permissions` collections via the admin UI, exactly satisfying "database-driven, not hardcoded." The code only ever asks "does this user's role, for this tenant, contain permission X?" — it never asks "is this user's role named Y?"

### 2.2 Tenant scoping is a separate, always-on layer
`hasPermission` answers "can this user do X *in this tenant*." It does not by itself answer "can this user see *this specific document*." A second layer — `withTenantScope` — is applied to every tenant-owned collection's `read`/`update`/`delete` to inject a `where: { tenant: { equals: resolvedTenantId } }` constraint into the query itself, so even a user with `sermons.publish` in Tenant A cannot retrieve Tenant B's sermons by ID, regardless of permission. Both layers must pass; neither is sufficient alone. This is what makes NFR-11 ("forged tenant ID fails closed") testable as a single reusable behavior instead of something re-verified per collection.

### 2.3 Seed permission catalog
Seeded at first boot (a `Permissions` collection is close to reference data, not meant for ad-hoc creation in the UI — new permissions ship with code changes that add new capabilities, matching the brief's own example list almost verbatim):

```
users.create        users.update        users.delete        users.invite
roles.manage
website.settings    homepage.manage     navigation.manage
pages.publish
ministries.manage   leadership.manage
events.manage       events.registrations.view   events.registrations.export
sermons.publish     devotionals.publish
books.manage        resources.manage
media.upload        media.manage
blog.publish        blog.categories.manage
testimonials.approve
prayer.view          prayer.manage
counseling.view      counseling.manage
volunteers.manage
partners.manage
newsletter.manage    newsletter.export
donations.view       donations.export    donations.settings
analytics.view
seo.manage
audit.view
tenant.manage         (platform-scope only — creating/suspending tenants)
```

### 2.4 Seed roles (examples, not a closed list — see FR-RBAC-03)
| Role | Representative permissions |
|---|---|
| Super Administrator | all tenant-scope permissions |
| Administrator | all except `roles.manage`, `tenant.manage` |
| Content Manager | `pages.*`, `homepage.manage`, `blog.publish`, `ministries.manage`, `books.manage`, `resources.manage`, `testimonials.approve` |
| Media Manager | `media.upload`, `media.manage` |
| Event Manager | `events.manage`, `events.registrations.*` |
| Prayer Coordinator | `prayer.view`, `prayer.manage` |
| Counseling Coordinator | `counseling.view`, `counseling.manage` |
| Finance Manager | `donations.view`, `donations.export`, `donations.settings` |
| Volunteer Coordinator | `volunteers.manage`, `partners.manage` |
| Translator | field-level locale-restricted access (see §2.5), no publish/structural permissions |

These ship as `isSystemRole: true` seed data per tenant on creation — editable, not deletable, and any tenant Super Admin can clone one into a custom role.

### 2.5 Field-level restriction for Translator
Payload access control can be defined per-field, not just per-collection. The Translator role is the one case in the brief needing this: they can write to localized fields for their assigned locale, but not to structural fields (`_status`, `order`, non-text fields). Implemented as a field-level `access.update` check that inspects the field's locale against the requesting Translator's assigned locale (`User.translatorLocale`), independent of the collection-level `hasPermission` check.

---

## 3. Security Controls (NFR-03 through NFR-06)

| Control | Implementation |
|---|---|
| HTTPS | Enforced at Vercel/Cloudflare edge; HSTS header set |
| CSRF | SameSite=Lax cookies + Payload's built-in CSRF token on state-changing admin requests; public form endpoints additionally require a same-origin check + honeypot field |
| XSS | React's default output escaping everywhere; rich-text fields (Lexical, Payload's default editor) sanitized on render; no `dangerouslySetInnerHTML` outside a single reviewed rich-text renderer |
| SQL injection | Not directly possible — all queries go through Payload's query builder / Postgres adapter, no raw string interpolation into SQL anywhere in the codebase (enforced by code review + a lint rule banning raw `sql\`...\`` outside a short allow-listed migrations folder) |
| Rate limiting | Edge middleware, token-bucket per IP+route, tightest on `/login` and public form POSTs |
| Secure file uploads | MIME/type allow-list, max size enforced both client- and server-side, files land in R2 (not an executable path), filenames sanitized/UUID'd before storage — original filename kept only as metadata |
| Secrets | PayPal client secret, Resend API key, R2 credentials, DB URL: Vercel encrypted environment variables, never committed; per-tenant PayPal client ID encrypted at rest in Postgres (application-level encryption, not just "restricted field") |

---

## 4. Audit Log Enforcement (ties back to FR-AUDIT)
The `hasPermission`/`withTenantScope` pair above governs *whether* an action is allowed. A separate, unconditional `afterChange`/`afterDelete` hook — attached at the collection-config level for every tracked collection — captures *that* the action happened, regardless of which permission path allowed it (including Platform Super Admin bypass). This hook writes in the same database transaction as the mutation (NFR-12), so a failed audit write rolls back the content change rather than silently under-logging.

---

Phase 3 (Architecture) is now complete: [02-architecture.md](02-architecture.md), [03-database-schema.md](03-database-schema.md), [04-auth-rbac.md](04-auth-rbac.md).
