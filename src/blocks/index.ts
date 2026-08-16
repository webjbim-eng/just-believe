import type { ComponentType } from 'react'
import { Hero } from './Hero'
import { QuickLinksBar } from './QuickLinksBar'
import { FoundationStatement } from './FoundationStatement'
import { WelcomeMessage } from './WelcomeMessage'
import { MinistryPathways } from './MinistryPathways'
import { PhotoCaptionGrid } from './PhotoCaptionGrid'
import { MinistryFeatureGrid } from './MinistryFeatureGrid'
import { CTA } from './CTA'
import { PartnershipInvitation } from './PartnershipInvitation'
import { RichText } from './RichText'
import { NewsletterSignup } from './NewsletterSignup'
import { BlogSpotlight } from './BlogSpotlight'
import { Prayer } from './Prayer'
import { FeaturedSermons } from './FeaturedSermons'
import { FeaturedEvents } from './FeaturedEvents'
import { FeaturedBooks } from './FeaturedBooks'
import { RecurringActivities } from './RecurringActivities'
import { Testimonials } from './Testimonials'
import { Leadership } from './Leadership'

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
  QuickLinksBar,
  FoundationStatement,
  WelcomeMessage,
  MinistryPathways,
  PhotoCaptionGrid,
  MinistryFeatureGrid,
  FeaturedSermons,
  FeaturedEvents,
  FeaturedBooks,
  RecurringActivities,
  BlogSpotlight,
  Prayer,
  Leadership,
  Testimonials,
  PartnershipInvitation,
  NewsletterSignup,
  RichText,
  CTA,
}
