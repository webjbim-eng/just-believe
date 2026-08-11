# Software Requirements Specification
## JBIM Ministry Management Platform

Status: Draft for review · Phase 2 of 5 (Discovery → **Product Planning** → Architecture → UX → Implementation)
Related: [00-decisions-log.md](00-decisions-log.md) for the locked stack/scope decisions this SRS assumes.

---

## 1. Introduction

### 1.1 Purpose
Defines what the JBIM Ministry Management Platform must do, for whom, and how success is measured — before any schema or UI is designed. First tenant is Just Believe International Missions (JBIM); the system is a multi-tenant platform from V1 per [D3](00-decisions-log.md).

### 1.2 Scope
One integrated Next.js + Payload CMS application serving:
- A public ministry website per tenant (custom domain/branding).
- An administrative dashboard (Payload's admin UI, extended) that manages 100% of public-site content and platform operations.
- A permissions engine, audit trail, and tenant-isolation layer underneath both.

Out of scope for V1 (explicitly deferred, not forgotten): native mobile apps, live-streaming infrastructure (embed only), a public tenant self-registration/billing flow (see open question in decisions log), offline support.

### 1.3 Definitions
- **Tenant** — one ministry organization (e.g., JBIM) with isolated data, branding, domain, users, and roles.
- **Platform Super Admin** — operates across all tenants (blueinctech, per decisions log assumption).
- **Tenant Admin roles** — scoped to a single tenant (Administrator, Content Manager, Event Manager, etc. per the brief).
- **Collection** — a Payload content type (maps to a DB table).
- **Global** — a Payload singleton (one record, e.g. Site Settings, Footer, Navigation).

### 1.4 Source documents
- `JBIM WEBSITE PROJECT BRIEF.docx` — sitemap, style, functional wishlist, SEO/security targets.
- `About us - JustBelieveInt.docx` — mission/vision/ministry-pillar copy (seed content).
- `Teqxure Global Questionnaire 2.csv` — operational facts (domain, hosting, payment methods, admin count, socials).
- The Master Development Prompt this SRS was commissioned under.

---

## 2. Overall Description

### 2.1 Users and roles

| Role | Scope | Primary needs |
|---|---|---|
| Visitor | Public | Read/watch/listen content, register, give, submit requests, subscribe |
| Super Administrator | Tenant | Full control of one tenant, incl. its users/roles |
| Platform Super Admin | Cross-tenant | Create/suspend tenants, cross-tenant support, never edits ministry content directly |
| Administrator | Tenant | Same as Super Admin minus destructive platform ops (e.g. deleting the tenant) |
| Content Manager | Tenant | Pages, blog, ministries, books/resources, homepage builder |
| Media Manager | Tenant | Media library, galleries |
| Event Manager | Tenant | Events, event registrations, event materials |
| Prayer Coordinator | Tenant | Prayer request queue, status, assignment |
| Counseling Coordinator | Tenant | Counseling request queue, confidential handling |
| Finance Manager | Tenant | Donations, payout/reporting visibility, no content edit rights |
| Volunteer Coordinator | Tenant | Volunteer applications, partner records |
| Translator | Tenant | Locale-scoped content editing only, cannot publish structural changes |

Roles are **not** hard-coded — every role above is a seed data example (a Role document = name + permission list), and Super Admins can create custom roles from any permission combination. See [04-auth-rbac.md](04-auth-rbac.md).

### 2.2 Product perspective
Single Next.js application. Payload mounts its admin UI at `/admin` and the public site is rendered by the same app's route groups, both reading from the same Postgres database — satisfying the brief's "website and dashboard function as one integrated application." Tenant resolution happens at the edge (domain → tenant) before either surface renders.

### 2.3 Constraints
- Must run on Vercel's serverless/edge runtime (no long-lived processes, no local filesystem persistence).
- Postgres via Neon (serverless, branchable — useful for preview deployments per PR).
- Must support 4 locales at launch (EN, FR, IT, ES) with room for more without schema change.
- PayPal is the only integrated payment rail for V1 ([D4](00-decisions-log.md)).

### 2.4 Assumptions
See "Notes and assumptions" in [00-decisions-log.md](00-decisions-log.md). Content gaps (Statement of Faith, leadership bios, brand hex codes, etc. — all blank in the intake questionnaire) are treated as empty CMS records to be filled by JBIM post-launch, not blockers.

---

## 3. Functional Requirements

Grouped by module. ID format: `FR-<MODULE>-<N>`.

### 3.1 Public Website (FR-SITE)
| ID | Requirement |
|---|---|
| FR-SITE-01 | System renders all pages listed in the brief's sitemap (Home, About incl. Our Story/Vision/Mission/Statement of Faith/Core Values/Leadership/Founder, Ministries, Events, Sermons, Devotionals, Books, Resources, Counseling, Missions, Partnership, Donate, Media, Blog, Contact) per tenant. |
| FR-SITE-02 | Homepage is assembled from an ordered, admin-configurable list of section blocks; no homepage content is hardcoded in the codebase. |
| FR-SITE-03 | Every page supports per-locale content (EN/FR/IT/ES); a locale switcher is present sitewide; missing translations fall back to the tenant's default locale. |
| FR-SITE-04 | Visitors can filter/search Sermons by topic, speaker, scripture reference, and date. |
| FR-SITE-05 | Visitors can browse Devotionals by daily/weekly/series, with archive search. |
| FR-SITE-06 | Visitors can register for an Event, receive a confirmation email, and download any attached event materials. |
| FR-SITE-07 | Visitors can submit a Prayer Request via a form (optionally anonymous/private). |
| FR-SITE-08 | Visitors can submit a Counseling Request (biblical/family/marriage/individual) through a confidential contact form. |
| FR-SITE-09 | Visitors can download Books/Resources (PDF) where the resource is marked downloadable; gated resources may require an email capture. |
| FR-SITE-10 | Visitors can subscribe to the newsletter from any page with a signup block. |
| FR-SITE-11 | Visitors can donate via PayPal Checkout for one-time or monthly recurring giving, optionally earmarked to a specific mission project/campaign. |
| FR-SITE-12 | Visitors can apply to volunteer via a structured application form. |
| FR-SITE-13 | Visitors can register partner/organization interest via a partnership form. |
| FR-SITE-14 | Blog and Sermon/Devotional detail pages expose social share buttons (Facebook, YouTube link, Instagram, LinkedIn, generic copy-link). |
| FR-SITE-15 | Every page renders tenant-specific branding (logo, colors, domain) with no cross-tenant leakage. |

### 3.2 Homepage Builder (FR-HOME)
| ID | Requirement |
|---|---|
| FR-HOME-01 | Admin can add/remove homepage sections from a defined block library (Hero, Welcome Message, Mission Statement, Upcoming Events, Latest Sermons, Daily Devotional, Prayer Request CTA, Featured Books, Ministries Overview, Testimonials, Partnership Invitation, Newsletter Signup, and generic Rich Text/Image/CTA blocks). |
| FR-HOME-02 | Admin can reorder sections via drag-and-drop; order persists and reflects immediately on publish. |
| FR-HOME-03 | Admin can toggle a section's visibility without deleting its configuration. |
| FR-HOME-04 | Admin can select which specific Sermons/Events/Books/Ministries populate a "featured" block, or set it to auto-populate from most-recent. |
| FR-HOME-05 | Admin can edit banner image, heading, subheading, and CTA button (label + link) per relevant block. |
| FR-HOME-06 | Changes are stored as drafts and require an explicit Publish action (draft/publish workflow), so edits are never live-preview-only. |

### 3.3 Content Management (FR-CMS)
| ID | Requirement |
|---|---|
| FR-CMS-01 | Admin can create/edit/delete arbitrary Pages beyond the fixed sitemap (e.g. a campaign landing page) with a block-based body editor. |
| FR-CMS-02 | Admin can manage site Navigation (header menu) and Footer content/links without a deploy. |
| FR-CMS-03 | Admin can set per-page/per-post SEO metadata (title, description, OG image, canonical URL, noindex flag). |
| FR-CMS-04 | Admin can upload, tag, and organize Media (images/video/PDF) in a searchable Media Library; media is reusable across collections. |
| FR-CMS-05 | Admin can manage Blog posts with Categories and Tags, and schedule future publish dates. |
| FR-CMS-06 | Admin can manage Ministries (the 9 program pages) as structured content, each with its own description, imagery, and leader assignment. |
| FR-CMS-07 | Admin can manage Leadership profiles and flag one as "Founder" for the dedicated Founder page. |
| FR-CMS-08 | Admin can manage Testimonials with an approval workflow (submitted → approved → published) before they appear publicly. |
| FR-CMS-09 | Admin can manage Partner logos/records for public display and internal tracking. |

### 3.4 Sermons, Devotionals, Books & Resources (FR-LIB)
| ID | Requirement |
|---|---|
| FR-LIB-01 | Admin can publish Sermons with type (audio/video/written), speaker, scripture reference(s), topic tags, and date; video/audio may be an upload or an external embed (YouTube). |
| FR-LIB-02 | Admin can publish Devotionals with a cadence (daily/weekly/series) and series grouping. |
| FR-LIB-03 | Admin can publish Books (with author defaulting to the ministry founder) and generic Resources (study guides, prayer guides, discipleship manuals, teaching notes) as downloadable files or external links. |
| FR-LIB-04 | Each item in this module gets its own SEO metadata (inherits FR-CMS-03 pattern) and locale variants. |

### 3.5 Events (FR-EVT)
| ID | Requirement |
|---|---|
| FR-EVT-01 | Admin can create Events (conference/prayer meeting/Bible study/retreat/seminar/livestream) with date/time, location or livestream link, capacity, and registration open/close dates. |
| FR-EVT-02 | System generates a downloadable calendar file (.ics) per event. |
| FR-EVT-03 | Admin can view, export, and manage the registrant list per event, including check-in status. |
| FR-EVT-04 | Registrants receive an automated confirmation email (via Resend) on successful registration. |
| FR-EVT-05 | Admin can attach downloadable materials to an event, released immediately or on a schedule (e.g., post-event). |
| FR-EVT-06 | Registration form supports a configurable capacity cap with a waitlist state once full. |

### 3.6 Prayer & Counseling (FR-CARE)
| ID | Requirement |
|---|---|
| FR-CARE-01 | Prayer Requests carry a status (New → In Prayer → Answered/Closed) and can be assigned to a Prayer Coordinator. |
| FR-CARE-02 | Submitter can optionally mark a prayer request private (visible only to assigned coordinator + Super Admin) or public (eligible for an opt-in public prayer wall). |
| FR-CARE-03 | Counseling Requests are always confidential-by-default, visible only to Counseling Coordinators and Super Admin, with a status pipeline (New → Scheduled → Completed). |
| FR-CARE-04 | Coordinators can add private internal notes to a request without exposing them to the submitter. |

### 3.7 Volunteers & Partnership (FR-PEOPLE)
| ID | Requirement |
|---|---|
| FR-PEOPLE-01 | Volunteer applications are reviewable with a status pipeline (New → Reviewing → Approved/Declined) by the Volunteer Coordinator. |
| FR-PEOPLE-02 | Partnership submissions capture the engagement type (prayer partner / financial partner / volunteer / project sponsor / mission-trip supporter) and route to the appropriate coordinator. |

### 3.8 Donations (FR-DON)
| ID | Requirement |
|---|---|
| FR-DON-01 | Visitor can give a one-time or recurring monthly donation via Paystack, in NGN or USD (donor's choice) — see [D4](00-decisions-log.md), updated 2026-08-11 from the original PayPal "any currency, auto-converted" behavior, which Paystack doesn't support. |
| FR-DON-02 | Donations can be earmarked to a fund/campaign (general, mission projects, child sponsorship, special campaigns). |
| FR-DON-03 | Successful donations trigger a receipt email to the donor and a notification to the configured donations-notification address. |
| FR-DON-04 | Finance Manager can view donation history/exports; cannot edit public content. |
| FR-DON-05 | Donation records store the Paystack transaction reference, amount, currency, fund, donor info (or "anonymous"), and timestamp — never raw payment credentials. |
| FR-DON-06 | Bank Transfer and Zelle are displayed as informational giving instructions (not automated) per [D4](00-decisions-log.md). |

### 3.9 Newsletter (FR-NEWS)
| ID | Requirement |
|---|---|
| FR-NEWS-01 | Newsletter signups are stored with double opt-in confirmation (via Resend) and an unsubscribe link on every send. |
| FR-NEWS-02 | Admin can export the subscriber list. |

### 3.10 Users, Roles & Permissions (FR-RBAC)
| ID | Requirement |
|---|---|
| FR-RBAC-01 | Every permission (e.g. `sermons.publish`, `donations.view`) is a row in a database-driven Permissions set, not a hardcoded switch in application code. |
| FR-RBAC-02 | A Role is a named collection of permissions, scoped to one tenant (or the special cross-tenant Platform scope). |
| FR-RBAC-03 | Super Admin can create custom roles and assign/revoke permissions without a code deploy. |
| FR-RBAC-04 | A user can hold different roles in different tenants (supports the future case of one person helping two ministries). |
| FR-RBAC-05 | Users module supports invite-by-email, deactivation, and forced password reset by an admin. |

### 3.11 Audit Logs (FR-AUDIT)
| ID | Requirement |
|---|---|
| FR-AUDIT-01 | Every create/update/delete on a tracked collection records: acting user, action, module/collection, previous value, new value, timestamp, tenant. |
| FR-AUDIT-02 | Audit log is read-only in the UI, filterable by user/module/date range, and itself access-controlled (`audit.view` permission). |
| FR-AUDIT-03 | Audit entries are immutable — no update/delete API path exists for them, including for Super Admins. |

### 3.12 Multi-Tenancy (FR-TENANT)
| ID | Requirement |
|---|---|
| FR-TENANT-01 | Platform Super Admin can create a new tenant (name, initial domain, initial Super Admin user) without touching code. |
| FR-TENANT-02 | Every tenant-owned collection is scoped by tenant ID at the data layer; no query can return another tenant's records, enforced in Payload access-control functions, not just UI filtering. |
| FR-TENANT-03 | Each tenant can configure its own branding (logo, color palette, typography choice within the design system), domain, SEO defaults, and analytics IDs. |
| FR-TENANT-04 | Domain-to-tenant resolution works for both subdomains (`jbim.platform.app`) and fully custom domains (`justbelieveintmissions.org`). |
| FR-TENANT-05 | Deleting/suspending a tenant is a Platform Super Admin-only, audit-logged, confirmation-gated action. |

### 3.13 SEO & Analytics (FR-SEO)
| ID | Requirement |
|---|---|
| FR-SEO-01 | Per-tenant, per-page SEO metadata as in FR-CMS-03; sitemap.xml and robots.txt generated per tenant/domain. |
| FR-SEO-02 | Google Analytics, Google Search Console verification, and Microsoft Clarity IDs are configurable per tenant in Website Settings — no hardcoded tracking IDs. |
| FR-SEO-03 | Admin-facing Analytics module surfaces visitor traffic, sermon engagement, event registrations, donation conversions, resource downloads, newsletter signups (via the configured analytics provider's API or embedded dashboard). |

### 3.14 System Settings (FR-SYS)
| ID | Requirement |
|---|---|
| FR-SYS-01 | Tenant-level Website Settings global covers site name, contact info, social links, default locale, supported locales, notification preferences. |
| FR-SYS-02 | Admin can configure which events (registration, prayer request, counseling, donation, newsletter, volunteer) trigger which notification channel (currently: email). |

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Performance | Public pages achieve Core Web Vitals "Good" thresholds (LCP < 2.5s, CLS < 0.1, INP < 200ms) on median mobile. |
| NFR-02 | Scalability | Architecture supports horizontal growth in tenants and traffic without core-code changes (serverless app tier + branchable managed Postgres). |
| NFR-03 | Security | HTTPS everywhere; CSRF protection on all mutating requests; output-encoded rendering to prevent XSS; parameterized queries only (Payload/Postgres ORM, no raw string SQL); rate limiting on auth and public form endpoints; secure password hashing (bcrypt/argon2, Payload default); signed, httpOnly, SameSite session cookies. |
| NFR-04 | Security | Two-factor authentication available for all admin-tier accounts, enforced for Super Admin and Finance Manager roles. |
| NFR-05 | Security | File uploads are type/size validated, virus-scanned or served from a non-executable object store (R2), and never trusted for path/filename input. |
| NFR-06 | Accessibility | Public site meets WCAG 2.1 AA (keyboard navigation, color contrast, alt text fields required on media, semantic landmarks). |
| NFR-07 | Internationalization | All admin-authorable text fields are localizable (EN/FR/IT/ES at launch); adding a 5th locale requires configuration only, no schema migration. |
| NFR-08 | Reliability | Automated daily database backups (Neon point-in-time recovery) with a documented restore procedure. |
| NFR-09 | Maintainability | No module may hardcode another tenant's data or ministry-specific business logic in shared/core code paths (validated in code review, see [02-architecture.md](02-architecture.md)). |
| NFR-10 | Observability | Structured error logging/monitoring wired before first admin invite goes out (choice deferred to Phase 3 architecture doc). |
| NFR-11 | Data isolation | A tenant-scoped query with a forged/mismatched tenant ID must fail closed (403/empty), verified by an automated test per collection. |
| NFR-12 | Auditability | Audit log write is part of the same transaction as the content mutation it describes — never best-effort/fire-and-forget. |

---

## 5. User Stories & Acceptance Criteria

Representative stories per role — the full backlog is derived from §3 during implementation planning, not exhaustively enumerated here.

### 5.1 Visitor — submit a prayer request
**As** a website visitor, **I want to** submit a prayer request, **so that** the ministry's prayer team can pray for my need.
- **AC1**: Form requires name, contact method, and request text; a "keep this private" checkbox defaults to checked.
- **AC2**: On submit, visitor sees a confirmation message; no page reload/dead-end error state.
- **AC3**: Request appears in the Prayer Coordinator's queue within seconds, status = New.
- **AC4**: If marked private, the request is never queryable by any non-coordinator role, including via the API.

### 5.2 Event Manager — publish an event with registration
**As** an Event Manager, **I want to** publish an event with a registration cap, **so that** attendance stays within venue capacity.
- **AC1**: Event isn't visible on the public Events page until explicitly published (draft/publish workflow).
- **AC2**: Once registrations reach capacity, the public form switches to a waitlist state automatically.
- **AC3**: Every successful registrant receives a confirmation email within 1 minute (Resend).
- **AC4**: Event Manager can export the registrant list as CSV at any time.

### 5.3 Content Manager — rearrange the homepage
**As** a Content Manager, **I want to** drag-and-drop reorder homepage sections and hide one temporarily, **so that** I can promote an upcoming conference without a developer.
- **AC1**: Drag-and-drop reorder persists on save and requires no code deploy.
- **AC2**: A hidden section's data is retained (not deleted) and can be re-shown later.
- **AC3**: Changes stay in draft until Publish is clicked; the live site is unaffected until then.

### 5.4 Finance Manager — reconcile donations
**As** a Finance Manager, **I want to** view and export donation records by fund and date range, **so that** I can reconcile against Paystack statements.
- **AC1**: Finance Manager role has `donations.view` and `donations.export` but not `content.*` or `users.*` permissions — verified by a permission-matrix test.
- **AC2**: Every donation record shows the Paystack transaction reference, fund, amount, currency, and (for USD donations) the USD amount.
- **AC3**: Export never includes payment credentials/tokens, only the transaction reference.

### 5.5 Super Admin — create a custom role
**As** a tenant Super Admin, **I want to** create a "Blog Editor" role with only blog-related permissions, **so that** a new volunteer writer can't touch donations or user management.
- **AC1**: Role creation UI lists all available permissions grouped by module, with no way to select a permission that doesn't exist in the system (no free-text permission entry).
- **AC2**: Assigning the new role to a user takes effect on their next request without requiring re-login.
- **AC3**: The role-creation action itself is captured in the Audit Log.

### 5.6 Platform Super Admin — onboard a second ministry
**As** the Platform Super Admin, **I want to** create a new tenant with its own domain and initial admin, **so that** a second ministry can launch without any code changes.
- **AC1**: New tenant is fully data-isolated from JBIM immediately upon creation — verified by NFR-11's automated test.
- **AC2**: New tenant's initial Super Admin receives an invite email to set their password.
- **AC3**: No existing collection, component, or route contains a JBIM-specific string, ID, or conditional (validated per NFR-09).

### 5.7 Translator — localize a page
**As** a Translator assigned to French, **I want to** edit the French version of the Ministries page, **so that** French-speaking visitors get accurate copy.
- **AC1**: Translator's role restricts them to editing locale-specific fields on permitted collections; they cannot change structural fields (layout, publish status) or non-French locale content.
- **AC2**: Locale switcher on the public site shows French once the Translator publishes, without needing English content to be re-approved.

---

## 6. Success Metrics
(Inherited from the brief, made measurable)

| Metric | Target |
|---|---|
| Core Web Vitals | "Good" on desktop and mobile for the homepage and top 5 traffic pages |
| Admin self-sufficiency | 0 developer-hours required for routine content updates post-launch (new sermon, event, homepage reorder) |
| Data isolation | 100% pass rate on automated cross-tenant access tests |
| Accessibility | WCAG 2.1 AA automated audit (axe) passes with 0 critical violations on public pages |
| Donation flow | < 3 clicks from Donate page to PayPal confirmation |

---

## 7. Open Items
1. Confirm Cloudflare R2 for media storage (flagged, not directly asked — see [00-decisions-log.md](00-decisions-log.md)).
2. Confirm whether Google Analytics/Search Console/Clarity accounts already exist per the brief's Analytics section, or need to be created during onboarding.

Tenant onboarding model resolved: **operator-driven** (D5 in [00-decisions-log.md](00-decisions-log.md)).

Phase 3 (Architecture) is complete: [02-architecture.md](02-architecture.md), [03-database-schema.md](03-database-schema.md), [04-auth-rbac.md](04-auth-rbac.md).
