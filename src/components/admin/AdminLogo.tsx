/**
 * Rendered via admin.components.graphics.Logo (login page) and .Icon (nav
 * sidebar) — plain <img>, not next/image, since this renders inside
 * Payload's own component tree, not a Next App Router page.
 */
export function AdminLogo() {
  return <img src="/brand/jbim-logo-white.png" alt="Just Believe International Missions" style={{ height: 40, width: 'auto' }} />
}

export function AdminIcon() {
  return <img src="/brand/jbim-logo-white.png" alt="JBIM" style={{ height: 24, width: 'auto' }} />
}
