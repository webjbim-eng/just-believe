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

  // Minimal real starter content so the homepage isn't empty — copy drawn
  // from docs/source/About us - JustBelieveInt.docx, the logo's "Hub of
  // Transformation" tagline, and the real YouTube channel/email from the
  // client intake questionnaire (no lorem ipsum). The data-driven blocks
  // (MinistriesOverview, FeaturedSermons, FeaturedEvents, Testimonials)
  // are included even though nothing exists in those collections yet —
  // their empty states are honest, working UI, not something to hide
  // until content shows up.
  const homepageSections: NonNullable<HomepageLayout['sections']> = [
    {
      blockType: 'Hero',
      order: 0,
      visible: true,
      config: {
        eyebrow: 'Hub of Transformation',
        heading: 'Just Believe International Missions',
        accentWord: 'International Missions',
        subheading:
          "A Christ-centered, faith-based nonprofit committed to advancing God's Kingdom by transforming lives, strengthening families, developing leaders, and serving communities around the world.",
        ctaLabel: 'Learn More',
        ctaHref: '/about',
        secondaryCtaLabel: 'Watch Our Story',
        secondaryCtaHref: 'https://youtube.com/@jbiminc?si=Q26o6jq34zseGPaF',
        // Real Unsplash photo (free/commercial license), downloaded to
        // public/images/ — see git log for the source URL/photographer.
        backgroundImage: '/images/hero-worship-sunset.jpg',
      },
    },
    {
      blockType: 'WelcomeMessage',
      order: 1,
      visible: true,
      config: {
        heading: 'Our Mission',
        body: "To glorify God by making disciples of Jesus Christ, equipping believers for Kingdom service, strengthening families, developing ethical leaders, and extending Christ's compassion to communities through evangelism, discipleship, education, leadership development, and practical outreach.",
      },
    },
    { blockType: 'MinistriesOverview', order: 2, visible: true, config: {} },
    { blockType: 'FeaturedSermons', order: 3, visible: true, config: {} },
    { blockType: 'FeaturedEvents', order: 4, visible: true, config: {} },
    { blockType: 'Testimonials', order: 5, visible: true, config: {} },
    {
      blockType: 'PartnershipInvitation',
      order: 6,
      visible: true,
      config: {
        heading: 'Partner With Us',
        body: 'Join us in transforming lives, strengthening families, and serving communities around the world.',
        ctaLabel: 'Contact Us',
        ctaHref: 'mailto:justbelieveinthot@gmail.com',
        backgroundImage: '/images/worship-service.jpg',
      },
    },
    {
      blockType: 'NewsletterSignup',
      order: 7,
      visible: true,
      config: { heading: 'Stay Connected', subheading: 'Get updates on new sermons, events, and ways to get involved.' },
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

  if (!existingLayout) {
    await payload.create({
      collection: 'homepage-layout',
      data: { tenant: tenant.id, sections: homepageSections },
      overrideAccess: true,
    })
    payload.logger.info(`Created starter HomepageLayout (${homepageSections.length} sections).`)
  } else if ((existingLayout.sections?.length ?? 0) < 2) {
    // Still just the single Hero section from an earlier seed run, not
    // anything an admin has customized yet (no admin login exists) — safe
    // to fill out with the fuller starter set.
    await payload.update({
      collection: 'homepage-layout',
      id: existingLayout.id,
      data: { sections: homepageSections },
      overrideAccess: true,
    })
    payload.logger.info(`Expanded HomepageLayout to ${homepageSections.length} sections.`)
  } else {
    // Same "still just my own seed output, not an admin edit" reasoning —
    // sync any section still missing fields this seed script has since
    // added (secondaryCtaLabel, backgroundImage, ...) against the latest
    // starter config for that blockType, without touching sections an
    // admin may have reordered/customized differently.
    const sections = [...(existingLayout.sections ?? [])]
    let changed = false
    for (let i = 0; i < sections.length; i++) {
      const latest = homepageSections.find((s) => s.blockType === sections[i].blockType)
      if (!latest) continue
      const currentConfig = (sections[i].config ?? {}) as Record<string, unknown>
      const latestConfig = (latest.config ?? {}) as Record<string, unknown>
      const missingKeys = Object.keys(latestConfig).filter((key) => !(key in currentConfig))
      if (missingKeys.length > 0) {
        sections[i] = { ...sections[i], config: { ...currentConfig, ...Object.fromEntries(missingKeys.map((k) => [k, latestConfig[k]])) } }
        changed = true
      }
    }
    if (changed) {
      await payload.update({
        collection: 'homepage-layout',
        id: existingLayout.id,
        data: { sections },
        overrideAccess: true,
      })
      payload.logger.info('Synced HomepageLayout sections with newer starter fields.')
    } else {
      payload.logger.info('HomepageLayout already exists — leaving as-is.')
    }
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
      })
      payload.logger.info(`Created initial admin user ${adminEmail}.`)
    } else {
      payload.logger.info(`Admin user ${adminEmail} already exists — leaving as-is.`)
    }
  } else {
    payload.logger.info('SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD not set — skipping initial user. Create one at /admin.')
  }

  payload.logger.info('Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
