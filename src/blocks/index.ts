import type { ComponentType } from 'react'
import { Hero } from './Hero'

/**
 * Maps HomepageLayout.sections[].blockType (a plain string field, see
 * docs/03-database-schema.md) to its React component. Types not yet built
 * (WelcomeMessage, FeaturedSermons, ...) are simply absent — the renderer
 * skips unregistered block types rather than crashing, so HomepageLayout
 * can already reference the full planned vocabulary
 * (docs/02-architecture.md §4) before every block exists in code.
 */
export const blockRegistry: Record<string, ComponentType<{ config: any }>> = {
  Hero,
}
