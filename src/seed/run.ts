/**
 * Idempotent bootstrap seed: the Permissions catalog, one tenant, its
 * system Roles, and (optionally) an initial tenant Super Admin user.
 *
 * This is exactly the "seed/fixture data for JBIM lives entirely in a
 * seed/ script, never inline in schema or component defaults" rule from
 * docs/02-architecture.md §4 — nothing tenant-specific lives in
 * collections/, access/, or hooks/.
 *
 * Run with `npm run seed`. Required env: DATABASE_URI, PAYLOAD_SECRET,
 * SEED_TENANT_NAME, SEED_TENANT_SLUG. Optional: SEED_TENANT_DOMAIN,
 * SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME — if the admin
 * vars are omitted, the tenant/roles/permissions are still seeded, just
 * without a ready-to-use login (create the first user via /admin instead).
 */
import { getPayload } from 'payload'
import config from '../payload.config'
import type { HomepageLayout } from '../payload-types'
import { permissionCatalog } from './permissions'
import { systemRoleDefinitions } from './roles'
import { ministryDefinitions } from './ministries'

function toLexicalParagraph(text: string) {
  return {
    root: {
      type: 'root',
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          version: 1,
          children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
        },
      ],
    },
  }
}

async function seed() {
  const payload = await getPayload({ config })

  payload.logger.info('Seeding permission catalog...')
  const permissionIdByKey = new Map<string, number>()
  for (const perm of permissionCatalog) {
    const existing = await payload.find({
      collection: 'permissions',
      where: { key: { equals: perm.key } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      permissionIdByKey.set(perm.key, existing.docs[0].id)
      continue
    }
    const created = await payload.create({ collection: 'permissions', data: perm, overrideAccess: true })
    permissionIdByKey.set(perm.key, created.id)
  }
  payload.logger.info(`Permissions ready: ${permissionIdByKey.size} total.`)

  const tenantName = process.env.SEED_TENANT_NAME
  const tenantSlug = process.env.SEED_TENANT_SLUG
  if (!tenantName || !tenantSlug) {
    throw new Error('SEED_TENANT_NAME and SEED_TENANT_SLUG are required to run the seed script.')
  }
  const tenantDomain = process.env.SEED_TENANT_DOMAIN

  let tenant = (
    await payload.find({
      collection: 'tenants',
      where: { slug: { equals: tenantSlug } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0]

  // Confirmed with Jimmy 2026-08-06: follow docs/source/JBIM WEBSITE
  // PROJECT BRIEF.docx's "Suggested colors" section literally (Royal Blue/
  // Deep Purple/Gold), not the fire-gradient logo asset. Only ever set on
  // first create below — re-running seed must never clobber colors an
  // admin has since customized via the UI.
  const brandColors = {
    primary: '#1E3A8A', // Royal Blue — Truth & Faithfulness
    secondary: '#4C1D95', // Deep Purple — Royal Priesthood
    accent: '#C9A227', // Gold — Glory of God
  }

  if (!tenant) {
    tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: tenantName,
        slug: tenantSlug,
        domains: tenantDomain ? [{ domain: tenantDomain }] : [],
        status: 'active',
        branding: { colors: brandColors },
      },
      overrideAccess: true,
    })
    payload.logger.info(`Created tenant "${tenantName}" (${tenant.id}).`)
  } else {
    payload.logger.info(`Tenant "${tenantName}" already exists (${tenant.id}).`)
    if (!tenant.branding?.colors?.primary) {
      tenant = await payload.update({
        collection: 'tenants',
        id: tenant.id,
        data: { branding: { colors: brandColors } },
        overrideAccess: true,
      })
      payload.logger.info('Backfilled branding.colors (was unset).')
    }
  }

  // v2 (2026-08-10): full structural replication of a "Chapel"-style
  // church template Jimmy provided, recolored to our brand — see
  // globals.css's v6 token-layer comment for the color-system side of
  // this. Section order/composition now follows that reference exactly:
  // Hero -> media strip -> ministry pathways (+ icon row) -> photo grid ->
  // ministry feature cards -> events (dark panel) -> testimonial spotlight
  // -> photo grid -> blog spotlight -> closing CTA. WelcomeMessage,
  // PartnershipInvitation, and NewsletterSignup aren't part of this
  // reference's section list, so they're left out of the default homepage
  // — still fully built and registered in src/blocks/index.ts, just not
  // seeded here. Giving/newsletter capture still work via the header
  // "Partner With Us" CTA, footer "Give" link, and footer's newsletter
  // mini-form. Copy is JBIM's own throughout — the reference's liturgical
  // wording (e.g. "Diverse Paths of Worship") only supplied the structural
  // pattern, not the words.
  const homepageSections: NonNullable<HomepageLayout['sections']> = [
    {
      blockType: 'Hero',
      order: 0,
      visible: true,
      config: {
        heading: 'For the Nations',
        accentWord: 'Nations',
        subheading: 'A Hub of Transformation, proclaiming the Gospel and equipping believers around the world.',
        ctaLabel: 'Learn More',
        ctaHref: '/about',
        backgroundImage: '/images/prayer-sanctuary.jpg',
      },
    },
    {
      blockType: 'HeroMediaStrip',
      order: 1,
      visible: true,
      config: {
        badgeImage: '/images/hands-on-bible.jpg',
        badgeHeading: "Faith: The Soul's Heartbeat",
        badgeSubheading: "God's Word, daily",
        badgeHref: '/about',
        videoImage: '/images/hero-worship-sunset.jpg',
        videoHref: 'https://youtube.com/@jbiminc?si=Q26o6jq34zseGPaF',
        quickLinks: [
          { image: '/images/worship-service.jpg', label: 'Our Ministries', href: '/ministries' },
          { image: '/images/congregation-seated.jpg', label: 'Upcoming Events', href: '#events' },
          { image: '/images/prayer-silhouette.jpg', label: 'Prayer Requests', href: '/contact' },
          { image: '/images/community-hands.jpg', label: 'Give', href: 'mailto:justbelieveinthot@gmail.com' },
        ],
      },
    },
    {
      blockType: 'MinistryPathways',
      order: 2,
      visible: true,
      config: {
        eyebrow: 'A Ministry for Every Season',
        heading: 'Pathways to Purpose',
        accentWord: 'Purpose',
        body: "Lasting change begins with transformed hearts. Through evangelism, discipleship, and prayer, we walk with people at every stage of their journey with Christ.",
        image: '/images/worship-service.jpg',
        imageCaptionEyebrow: 'Featured',
        imageCaptionTitle: 'Prayer & Intercession',
        listItems: [
          { title: ministryDefinitions[0].name, body: ministryDefinitions[0].description },
          { title: ministryDefinitions[1].name, body: ministryDefinitions[1].description },
        ],
        ctaLabel: 'Contact Us',
        ctaHref: '/contact',
        iconFeatures: [ministryDefinitions[0].name, ministryDefinitions[1].name, ministryDefinitions[2].name, ministryDefinitions[7].name],
      },
    },
    {
      // 2026-08-11: compact list layout, not the large photo-card grid —
      // this teaser follows MinistryPathways (already a large photo
      // section) and precedes /ministries itself (which has the real
      // featured+supporting hierarchy for browsing). It doesn't need to
      // repeat that visual weight, just index the ministries and point
      // there. The two PhotoCaptionGrid decorative mood-photo sections
      // that used to sandwich this were cut entirely — they didn't link
      // anywhere real and added no understanding beyond "we do things,"
      // which MinistryPathways' icon row already conveys.
      blockType: 'MinistryFeatureGrid',
      order: 3,
      visible: true,
      config: {
        eyebrow: 'Connecting in Spirit',
        heading: 'Our Ministries',
        ctaLabel: 'View All',
        ctaHref: '/ministries',
        layout: 'list',
        items: [
          { image: '/images/worship-service.jpg', title: ministryDefinitions[0].name, subtitle: 'Outreach & discipleship' },
          { image: '/images/prayer-silhouette.jpg', title: ministryDefinitions[1].name, subtitle: 'Intercession & fasting' },
          { image: '/images/pastoral-moment.jpg', title: ministryDefinitions[2].name, subtitle: 'Servant leadership' },
          { image: '/images/community-hands.jpg', title: ministryDefinitions[7].name, subtitle: 'Compassion in action' },
        ],
      },
    },
    {
      blockType: 'FeaturedEvents',
      order: 4,
      visible: true,
      config: {
        eyebrow: 'Seeking the Divine Connection',
        heading: 'Upcoming Events',
        body: 'Join us as we gather to worship, learn, and grow together.',
        image: '/images/congregation-seated.jpg',
      },
    },
    {
      blockType: 'Testimonials',
      order: 5,
      visible: true,
      config: {
        eyebrow: 'Changed Lives',
        heading: 'What People Are Saying',
        image: '/images/hands-on-bible.jpg',
      },
    },
    {
      // Restored 2026-08-11: the exact-reference replication had dropped
      // this entirely, but the design directive explicitly names Giving
      // as a section that deserves dignity, not an afterthought reachable
      // only via the header/footer. Placed here (not next to
      // FeaturedEvents, also a dark panel) to keep dark/light sections
      // alternating rather than stacking two dark panels back to back.
      blockType: 'PartnershipInvitation',
      order: 6,
      visible: true,
      config: {
        heading: 'Partner With Us',
        body: 'Every gift is stewarded with integrity and used to advance real ministry — transforming lives, strengthening families, and serving communities around the world.',
        ctaLabel: 'Contact Us',
        ctaHref: 'mailto:justbelieveinthot@gmail.com',
        backgroundImage: '/images/worship-service.jpg',
        ways: [
          { label: 'General Fund', description: 'Support the ongoing work of JBIM across every ministry area.' },
          { label: 'Mission Projects', description: 'Fund a specific outreach or mission initiative in the field.' },
          { label: 'Child Sponsorship', description: "Invest directly in a child's education, care, and future." },
        ],
      },
    },
    {
      blockType: 'BlogSpotlight',
      order: 7,
      visible: true,
      config: {
        eyebrow: 'Reflections',
        heading: 'Soulful Reflections',
      },
    },
    {
      blockType: 'CTA',
      order: 8,
      visible: true,
      config: {
        heading: 'Discover the Power of Faith & Spiritual Growth',
        body: 'Whether through prayer, worship, or service — there is a place for you here.',
        ctaLabel: 'Get In Touch',
        ctaHref: '/contact',
        backgroundImage: '/images/worship-hands-raised.jpg',
      },
    },
  ]

  const existingLayout = (
    await payload.find({
      collection: 'homepage-layout',
      where: { tenant: { equals: tenant.id } },
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0]

  // Full overwrite, not an additive field/section sync — this seed run is
  // a structural redesign (new section list/order, not just new fields on
  // existing sections), and no admin has ever logged in to hand-customize
  // this content yet (no SEED_ADMIN_* has been used, no /admin user
  // exists). Revisit this once a real client/admin starts editing the
  // homepage — at that point this needs to stop clobbering their changes.
  if (!existingLayout) {
    await payload.create({
      collection: 'homepage-layout',
      data: { tenant: tenant.id, sections: homepageSections },
      overrideAccess: true,
    })
    payload.logger.info(`Created starter HomepageLayout (${homepageSections.length} sections).`)
  } else {
    await payload.update({
      collection: 'homepage-layout',
      id: existingLayout.id,
      data: { sections: homepageSections },
      overrideAccess: true,
    })
    payload.logger.info(`Replaced HomepageLayout with ${homepageSections.length} v2 sections.`)
  }

  // Real ministry copy (src/seed/ministries.ts), not placeholder content —
  // only backfilled when the collection is genuinely empty for this
  // tenant, so an admin's edits/additions are never touched.
  const { totalDocs: existingMinistryCount } = await payload.find({
    collection: 'ministries',
    where: { tenant: { equals: tenant.id } },
    limit: 0,
    overrideAccess: true,
  })
  if (existingMinistryCount === 0) {
    for (const [index, ministry] of ministryDefinitions.entries()) {
      await payload.create({
        collection: 'ministries',
        data: {
          tenant: tenant.id,
          name: ministry.name,
          slug: ministry.name
            .toLowerCase()
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
          description: toLexicalParagraph(ministry.description),
          order: index,
          _status: 'published',
        },
        overrideAccess: true,
      })
    }
    payload.logger.info(`Created ${ministryDefinitions.length} starter Ministries.`)
  } else {
    payload.logger.info('Ministries already exist — leaving as-is.')
  }

  // Same reasoning as branding.colors/HomepageLayout above — only ever
  // backfill when genuinely empty, never overwrite an admin's edits.
  const existingNavigation = (
    await payload.find({ collection: 'navigation', where: { tenant: { equals: tenant.id } }, limit: 1, overrideAccess: true })
  ).docs[0]
  if (!existingNavigation) {
    await payload.create({
      collection: 'navigation',
      data: {
        tenant: tenant.id,
        items: [
          { label: 'Home', link: '/', order: 0 },
          { label: 'About', link: '/about', order: 1 },
          { label: 'Ministries', link: '/ministries', order: 2 },
          { label: 'Contact', link: '/contact', order: 3 },
        ],
      },
      overrideAccess: true,
    })
    payload.logger.info('Created starter Navigation.')
  } else if (existingNavigation.items?.length === 1) {
    // Still just the single "Home" link from the earlier seed run, not
    // anything an admin has customized yet (no admin login exists) — safe
    // to fill out with the fuller starter set, same reasoning as
    // HomepageLayout's section backfill above.
    await payload.update({
      collection: 'navigation',
      id: existingNavigation.id,
      data: {
        items: [
          { label: 'Home', link: '/', order: 0 },
          { label: 'About', link: '/about', order: 1 },
          { label: 'Ministries', link: '/ministries', order: 2 },
          { label: 'Contact', link: '/contact', order: 3 },
        ],
      },
      overrideAccess: true,
    })
    payload.logger.info('Expanded Navigation to 4 items.')
  }

  const existingFooter = (
    await payload.find({ collection: 'footer', where: { tenant: { equals: tenant.id } }, limit: 1, overrideAccess: true })
  ).docs[0]
  if (!existingFooter) {
    await payload.create({
      collection: 'footer',
      data: {
        tenant: tenant.id,
        socialLinks: [
          { platform: 'youtube', url: 'https://youtube.com/@jbiminc?si=Q26o6jq34zseGPaF' },
          { platform: 'facebook', url: 'https://www.facebook.com/profile.php?id=61570983282514' },
        ],
        copyrightText: `© ${new Date().getFullYear()} Just Believe International Missions. All rights reserved.`,
      },
      overrideAccess: true,
    })
    payload.logger.info('Created starter Footer.')
  }

  payload.logger.info('Seeding system roles...')
  const roleIdByName = new Map<string, number>()
  for (const roleDef of systemRoleDefinitions) {
    const existing = await payload.find({
      collection: 'roles',
      where: {
        and: [{ tenant: { equals: tenant.id } }, { name: { equals: roleDef.name } }],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs[0]) {
      roleIdByName.set(roleDef.name, existing.docs[0].id)
      continue
    }

    const permissionIds = roleDef.permissions.map((key) => {
      const id = permissionIdByKey.get(key)
      if (id === undefined) throw new Error(`Seed role "${roleDef.name}" references unknown permission "${key}"`)
      return id
    })

    const created = await payload.create({
      collection: 'roles',
      data: {
        tenant: tenant.id,
        name: roleDef.name,
        permissions: permissionIds,
        isSystemRole: true,
      },
      overrideAccess: true,
    })
    roleIdByName.set(roleDef.name, created.id)
  }
  payload.logger.info(`Roles ready: ${roleIdByName.size} total.`)

  const adminEmail = process.env.SEED_ADMIN_EMAIL
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  if (adminEmail && adminPassword) {
    const existingUser = (
      await payload.find({
        collection: 'users',
        where: { email: { equals: adminEmail } },
        limit: 1,
        overrideAccess: true,
      })
    ).docs[0]

    if (!existingUser) {
      const superAdminRoleId = roleIdByName.get('Super Administrator')
      await payload.create({
        collection: 'users',
        data: {
          email: adminEmail,
          password: adminPassword,
          name: process.env.SEED_ADMIN_NAME || 'Super Administrator',
          _verified: true,
          status: 'active',
          tenantMemberships: superAdminRoleId ? [{ tenant: tenant.id, role: superAdminRoleId }] : [],
        },
        overrideAccess: true,
        // _verified: true above marks the record verified, but Payload's
        // `verify: true` auth config still tries to *send* a verification
        // email as part of create() regardless — this is the documented
        // way to skip that. Needed because .env.local's Resend key isn't
        // valid in every environment this seed runs in (fails the whole
        // create() with an unhandled 401 otherwise, seed script included).
        disableVerificationEmail: true,
      })
      payload.logger.info(`Created initial admin user ${adminEmail}.`)
    } else {
      payload.logger.info(`Admin user ${adminEmail} already exists — leaving as-is.`)
    }
  } else {
    // NOT "create one at /admin" — Users.ts's create access explicitly
    // denies unauthenticated requests (2026-08-11 finding), so Payload's
    // usual open-registration-when-empty convenience doesn't apply here.
    // SEED_ADMIN_EMAIL/PASSWORD via this script is the only path.
    payload.logger.info('SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD not set — skipping initial user. Re-run with those env vars set to create one.')
  }

  payload.logger.info('Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
