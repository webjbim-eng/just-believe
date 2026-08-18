import type { Metadata } from 'next'
import type React from 'react'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { MotionConfig } from 'motion/react'
import { Playfair_Display, Inter } from 'next/font/google'
import { TENANT_HEADER } from '../../access/getResolvedTenantId'
import { SiteNavigation } from '../../components/SiteNavigation'
import { SiteFooter } from '../../components/SiteFooter'
import './globals.css'

// 2026-08-18 v8 redesign: public/jbim/css/ministry.css specifies Playfair
// Display (headings) + Inter (body) explicitly, so these are back after a
// brief stretch on system fonts for an earlier mockup that didn't load
// Google Fonts at all. Fed into --font-heading/--font-body by name via the
// `variable` option, so globals.css's :root definitions (which reference
// var(--font-playfair)/var(--font-inter)) are the only call sites that
// needed to change — every other var(--font-heading)/var(--font-body) use
// sitewide keeps working unmodified.
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
})
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

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
  primary: '#0F1E3A',
  secondary: '#1B3462',
  accent: '#D3A441',
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
    <html lang="en" className={`${playfairDisplay.variable} ${inter.variable}`} style={cssVars}>
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
