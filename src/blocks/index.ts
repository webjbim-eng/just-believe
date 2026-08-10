import type { ComponentType } from 'react'
import { Hero } from './Hero'
import { WelcomeMessage } from './WelcomeMessage'
import { CTA } from './CTA'
import { PartnershipInvitation } from './PartnershipInvitation'
import { RichText } from './RichText'
import { NewsletterSignup } from './NewsletterSignup'
import { MinistriesOverview } from './MinistriesOverview'
import { Prayer } from './Prayer'
import { FeaturedSermons } from './FeaturedSermons'
import { FeaturedEvents } from './FeaturedEvents'
import { FeaturedBooks } from './FeaturedBooks'
import { Testimonials } from './Testimonials'

/**
 * Maps HomepageLayout.sections[].blockType (a plain string field, see
 * docs/03-database-schema.md) to its React component. Every entry in the
 * planned vocabulary (docs/02-architecture.md §4) is now registered — the
 * renderer still skips any future/unregistered type rather than crashing.
 * Every block receives {config, tenantId}; static-content blocks (Hero,
 * WelcomeMessage, CTA, ...) just ignore tenantId.
 */
export const blockRegistry: Record<string, ComponentType<{ config: any; tenantId: string }>> = {
  Hero,
  WelcomeMessage,
  FeaturedSermons,
  FeaturedEvents,
  FeaturedBooks,
  MinistriesOverview,
  Prayer,
  Testimonials,
  PartnershipInvitation,
  NewsletterSignup,
  RichText,
  CTA,
}
