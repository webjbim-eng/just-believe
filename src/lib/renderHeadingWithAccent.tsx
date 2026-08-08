import type { ReactNode } from 'react'

/**
 * Wraps the first occurrence of `accentWord` within `heading` in a
 * `.text-accent` span — the two-tone (white + gold) heading treatment
 * pulled from the reachingthenationsministries.com reference ("Welcome to
 * RTNM", "Our Locations"). Returns the plain string when no accent word
 * is given or found, so callers can pass an optional field straight
 * through without a null check.
 */
export function renderHeadingWithAccent(heading: string, accentWord?: string): ReactNode {
  if (!accentWord) return heading
  const index = heading.indexOf(accentWord)
  if (index === -1) return heading

  return (
    <>
      {heading.slice(0, index)}
      <span className="text-accent">{accentWord}</span>
      {heading.slice(index + accentWord.length)}
    </>
  )
}
