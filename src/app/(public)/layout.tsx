import type { Metadata } from 'next'
import type React from 'react'
import { Inter, Playfair_Display } from 'next/font/google'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TENANT_HEADER } from '../../access/getResolvedTenantId'
import { SiteNavigation } from '../../components/SiteNavigation'
import { SiteFooter } from '../../components/SiteFooter'
import './globals.css'

const heading = Playfair_Display({ subsets: ['latin'], variable: '--font-heading', display: 'swap' })
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })

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
  primary: '#1E3A8A',
  secondary: '#4C1D95',
  accent: '#C9A227',
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
    <html lang="en" className={`${heading.variable} ${body.variable}`} style={cssVars}>
      <body>
        {tenantId && <SiteNavigation tenantId={tenantId} />}
        {children}
        {tenantId && <SiteFooter tenantId={tenantId} />}
      </body>
    </html>
  )
}
