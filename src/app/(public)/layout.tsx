import type { Metadata } from 'next'
import type React from 'react'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { MotionConfig } from 'motion/react'
import { TENANT_HEADER } from '../../access/getResolvedTenantId'
import { SiteNavigation } from '../../components/SiteNavigation'
import { SiteFooter } from '../../components/SiteFooter'
import './globals.css'

// 2026-08-11 redesign: --font-heading/--font-body are now plain system font
// stacks defined once in globals.css's :root, matching the public/brand/*
// mockups exactly (they don't load Google Fonts at all). Previously these
// were injected here via next/font/google's `variable` option (Playfair
// Display/Inter) — removed entirely rather than left alongside a competing
// :root definition, since a next/font `variable` class and :root have equal
// CSS specificity and whichever wins would depend on injection order, not
// anything explicit.

export const metadata: Metadata = {
  title: 'Just Believe International Missions',
  description:
    "Proclaiming the Gospel of Jesus Christ, equipping believers for spiritual maturity, and mobilizing intercessors worldwide.",
}

type BrandColors = { primary: string; secondary: string; accent: string }

// Fallback only — matches the confirmed JBIM palette, but this layout
// serves every tenant. Real values always come from the resolved tenant's
// branding.colors below; this is what renders if that lookup can't run
// (no tenant resolved, e.g. an unrecognized host) or fails.
const DEFAULT_COLORS: BrandColors = {
  primary: '#10182E',
  secondary: '#232C55',
  accent: '#C9973C',
}

async function getTenantBrandColors(tenantId: string | null): Promise<BrandColors> {
  if (!tenantId) return DEFAULT_COLORS

  try {
    const payload = await getPayload({ config })
    const tenant = await payload.findByID({ collection: 'tenants', id: tenantId, overrideAccess: true })
    return {
      primary: tenant.branding?.colors?.primary || DEFAULT_COLORS.primary,
      secondary: tenant.branding?.colors?.secondary || DEFAULT_COLORS.secondary,
      accent: tenant.branding?.colors?.accent || DEFAULT_COLORS.accent,
    }
  } catch {
    return DEFAULT_COLORS
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const tenantId = (await headers()).get(TENANT_HEADER)
  const colors = await getTenantBrandColors(tenantId)

  const cssVars = {
    '--color-primary': colors.primary,
    '--color-secondary': colors.secondary,
    '--color-accent': colors.accent,
  } as React.CSSProperties

  return (
    <html lang="en" style={cssVars}>
      <body>
        {/* reducedMotion="user" makes every motion.* component site-wide
            automatically honor prefers-reduced-motion — one place to get
            this right instead of checking it in every component. */}
        <MotionConfig reducedMotion="user">
          {tenantId && <SiteNavigation tenantId={tenantId} />}
          {children}
          {tenantId && <SiteFooter tenantId={tenantId} />}
        </MotionConfig>
      </body>
    </html>
  )
}
