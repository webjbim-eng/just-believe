import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { AuditLogs } from './collections/AuditLogs'
import { BlogPosts } from './collections/Blog'
import { Books } from './collections/Books'
import { Categories } from './collections/Categories'
import { CounselingRequests } from './collections/CounselingRequests'
import { Devotionals } from './collections/Devotionals'
import { Donations } from './collections/Donations'
import { EventRegistrations } from './collections/EventRegistrations'
import { Events } from './collections/Events'
import { Footer } from './collections/Footer'
import { HomepageLayout } from './collections/HomepageLayout'
import { Leadership } from './collections/Leadership'
import { Media } from './collections/Media'
import { Messages } from './collections/Messages'
import { Ministries } from './collections/Ministries'
import { Missions } from './collections/Missions'
import { Navigation } from './collections/Navigation'
import { NewsletterSubscribers } from './collections/NewsletterSubscribers'
import { Pages } from './collections/Pages'
import { Partners } from './collections/Partners'
import { Permissions } from './collections/Permissions'
import { PrayerRequests } from './collections/PrayerRequests'
import { Resources } from './collections/Resources'
import { Roles } from './collections/Roles'
import { Sermons } from './collections/Sermons'
import { SiteSettings } from './collections/SiteSettings'
import { Tags } from './collections/Tags'
import { Tenants } from './collections/Tenants'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { VolunteerApplications } from './collections/Volunteers'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    components: {
      views: {
        // Payload's default post-login route is already /admin — replacing
        // just this view makes the Ministry Dashboard the default
        // authenticated experience with no separate redirect logic needed.
        dashboard: {
          Component: '/src/components/admin/MinistryDashboard.tsx#MinistryDashboard',
        },
      },
      beforeNavLinks: ['/src/components/admin/ViewWebsiteLink.tsx#ViewWebsiteLink'],
      graphics: {
        Logo: '/src/components/admin/AdminLogo.tsx#AdminLogo',
        Icon: '/src/components/admin/AdminLogo.tsx#AdminIcon',
      },
    },
  },
  collections: [
    // Platform / access control
    Tenants,
    Users,
    Roles,
    Permissions,
    Media,
    AuditLogs,
    // Taxonomy
    Categories,
    Tags,
    // Content
    Pages,
    Ministries,
    Missions,
    Leadership,
    Events,
    EventRegistrations,
    Sermons,
    Devotionals,
    Books,
    Resources,
    BlogPosts,
    // Website config (tenant-unique "singleton" collections, see SiteSettings.ts)
    SiteSettings,
    Navigation,
    Footer,
    HomepageLayout,
    // Care / submissions
    Messages,
    PrayerRequests,
    CounselingRequests,
    VolunteerApplications,
    Partners,
    Testimonials,
    NewsletterSubscribers,
    Donations,
  ],
  editor: lexicalEditor(),
  // Platform-wide set of locales content CAN exist in (FR-SITE-03, NFR-07).
  // This is distinct from a given tenant's *active* subset — Tenant.locales
  // .defaultLocale/.supportedLocales (Tenants.ts) is what the public site's
  // locale switcher and fallback logic actually read at render time; this
  // config only bounds what's selectable at the field level and what the
  // API defaults to when no locale is requested explicitly.
  localization: {
    locales: ['en', 'fr', 'it', 'es'],
    defaultLocale: 'en',
    fallback: true,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  email: resendAdapter({
    defaultFromAddress: process.env.RESEND_FROM_ADDRESS || 'no-reply@justbelieveintmissions.org',
    defaultFromName: 'Just Believe International Missions',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  // 2026-08-12: R2 credentials arrived, wired in — Media.ts was already
  // storage-adapter-agnostic (see its own comment), no collection changes
  // needed. Verified the S3-compatible credentials against the real
  // bucket before wiring in (HeadBucket + ListObjectsV2, both succeeded,
  // 0 existing objects so this was a zero-risk switch from local disk,
  // which doesn't survive on Vercel anyway). See docs/02-architecture.md
  // §1.
  //
  // 2026-08-16: switched from generateFileURL (R2's public "Public
  // Development URL", R2_PUBLIC_URL) to signedDownloads after that URL
  // started returning 401 "not publicly accessible" in production —
  // Cloudflare's own docs mark r2.dev subdomains as rate-limited/dev-only,
  // not a production guarantee. signedDownloads proxies file reads
  // through Payload's own /api/media/file route using short-lived
  // presigned S3 URLs generated server-side, so it has no dependency on
  // the bucket being publicly exposed at all.
  plugins: [
    s3Storage({
      collections: {
        media: {
          signedDownloads: true,
        },
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT || '',
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  ],
  sharp,
})
