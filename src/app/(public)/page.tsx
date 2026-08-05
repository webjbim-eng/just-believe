/**
 * Placeholder home route. Real homepage rendering (draft/publish-aware,
 * assembled from the tenant's HomepageLayout global block list per
 * FR-HOME-01..06) is a follow-up module — see docs/01-srs.md §3.2.
 * Locale-segmented routing ([locale]/, FR-SITE-03) is also not yet wired.
 */
export default function HomePage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem 2rem', maxWidth: 640, margin: '0 auto' }}>
      <h1>Just Believe International Missions</h1>
      <p>Platform foundation is live. Public site content ships module-by-module.</p>
    </main>
  )
}
