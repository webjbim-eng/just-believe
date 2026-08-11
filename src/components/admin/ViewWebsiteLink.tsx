/**
 * Rendered via admin.components.beforeNavLinks — a plain link back to the
 * public site, since Payload's stock nav has no such affordance by
 * default.
 */
export function ViewWebsiteLink() {
  return (
    <a
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.625rem 0',
        marginBottom: '0.5rem',
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: 'var(--theme-text)',
        textDecoration: 'none',
      }}
    >
      <span aria-hidden="true">↗</span> View Website
    </a>
  )
}
