'use client'

import { useState, type CSSProperties } from 'react'
import type { Book } from '../payload-types'

type BookLite = Pick<Book, 'id' | 'slug' | 'title' | 'shortDescription' | 'externalLink' | 'language' | 'format' | 'coverImage'> & {
  categoryLabel?: string | null
}

const FORMAT_LABELS: Record<string, string> = {
  paperback: 'Paperback',
  hardcover: 'Hardcover',
  kindle: 'Kindle Edition',
  ebook: 'eBook',
  audiobook: 'Audiobook',
}

/**
 * Client-side language filter for the "All Books" grid — all books are
 * already fetched server-side (one query, same one /books always ran),
 * this just toggles visibility locally, no re-fetch/URL state needed for
 * a filter this small. Reference: public/books.html's filter-pill row.
 */
export function BookFilterGrid({ books }: { books: BookLite[] }) {
  const [filter, setFilter] = useState<'all' | 'en' | 'fr'>('all')
  const hasFrench = books.some((b) => b.language === 'fr')
  const visible = filter === 'all' ? books : books.filter((b) => b.language === filter)

  function pillStyle(active: boolean): CSSProperties {
    return {
      padding: '0.5rem 1.125rem',
      borderRadius: 'var(--radius-button)',
      border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border-on-dark)'}`,
      background: active ? 'var(--color-accent)' : 'transparent',
      color: active ? 'var(--color-on-accent)' : 'var(--color-text-on-dark)',
      fontWeight: active ? 700 : 500,
      fontSize: 'var(--text-body-sm)',
      cursor: 'pointer',
    }
  }

  return (
    <div>
      {hasFrench && (
        <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '2.5rem' }}>
          <button type="button" style={pillStyle(filter === 'all')} onClick={() => setFilter('all')}>
            All Titles
          </button>
          <button type="button" style={pillStyle(filter === 'en')} onClick={() => setFilter('en')}>
            English
          </button>
          <button type="button" style={pillStyle(filter === 'fr')} onClick={() => setFilter('fr')}>
            Français
          </button>
        </div>
      )}
      <div className="photo-caption-grid-4">
        {visible.map((book) => {
          const cover = typeof book.coverImage === 'object' ? book.coverImage?.url : undefined
          return (
            <div key={book.id} className="card hover-zoom" style={{ padding: 0, overflow: 'hidden', textAlign: 'center' }}>
              <a href={`/books/${book.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                <div style={{ aspectRatio: '3 / 4', overflow: 'hidden', background: 'var(--color-base)' }}>
                  {cover && (
                    <div
                      aria-hidden="true"
                      className="hover-zoom-bg"
                      style={{ width: '100%', height: '100%', backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                  )}
                </div>
                <div style={{ padding: '1.25rem', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    {book.format && <span className="tag">{FORMAT_LABELS[book.format]}</span>}
                    {hasFrench && <span className="tag">{book.language === 'fr' ? 'Français' : 'English'}</span>}
                  </div>
                  <p className="card-title" style={{ fontSize: 'var(--text-heading-sm)', marginBottom: book.shortDescription ? '0.375rem' : 0 }}>
                    {book.title}
                  </p>
                  {book.shortDescription && <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>{book.shortDescription}</p>}
                </div>
              </a>
              {book.externalLink && (
                <div style={{ padding: '0 1.25rem 1.25rem' }}>
                  <a className="btn-outline" href={book.externalLink} target="_blank" rel="noopener noreferrer" style={{ width: '100%', fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>
                    Get This Book
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
