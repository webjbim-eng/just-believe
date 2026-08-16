/**
 * Book titles follow a "TITLE: Subtitle" pattern (real Amazon listing
 * titles, e.g. "THE SACRED DIVIDE: Exploring the Mystery of Consecration
 * and Divine Purpose") — the subtitle is exactly the kind of detail a
 * compact card doesn't need; the full title still shows on the book's own
 * page. Falls back to the full title (clamped by CSS) for the few books
 * with no colon.
 */
export function shortTitle(title: string) {
  const [first] = title.split(':')
  return first.trim()
}
