import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
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
import { Ministries } from './collections/Ministries'
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
  // TODO: once Cloudflare R2 credentials exist, add @payloadcms/storage-s3
  // to the plugins array pointed at the R2 endpoint — Media.ts is already
  // storage-adapter-agnostic. See docs/02-architecture.md §1.
  sharp,
})
