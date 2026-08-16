function pageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set([1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)

  const withEllipsis: (number | 'ellipsis')[] = []
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) withEllipsis.push('ellipsis')
    withEllipsis.push(page)
  })
  return withEllipsis
}

/**
 * Basic page-number pagination, hrefs built from `basePath` so it works as
 * a plain server-rendered link list (no client JS needed to navigate) —
 * the blog listing is a server component and doesn't need anything richer.
 */
export function Pagination({ currentPage, totalPages, basePath }: { currentPage: number; totalPages: number; basePath: string }) {
  if (totalPages <= 1) return null

  const hrefFor = (page: number) => (page <= 1 ? basePath : `${basePath}?page=${page}`)

  return (
    <nav className="pagination" aria-label="Pagination">
      <a
        href={hrefFor(currentPage - 1)}
        className={`pagination-link${currentPage <= 1 ? ' pagination-link--disabled' : ''}`}
        aria-disabled={currentPage <= 1}
      >
        ← Prev
      </a>
      {pageNumbers(currentPage, totalPages).map((page, i) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="pagination-ellipsis">
            …
          </span>
        ) : (
          <a
            key={page}
            href={hrefFor(page)}
            className={`pagination-link${page === currentPage ? ' pagination-link--active' : ''}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </a>
        ),
      )}
      <a
        href={hrefFor(currentPage + 1)}
        className={`pagination-link${currentPage >= totalPages ? ' pagination-link--disabled' : ''}`}
        aria-disabled={currentPage >= totalPages}
      >
        Next →
      </a>
    </nav>
  )
}
