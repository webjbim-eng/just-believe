'use client'

import { useState } from 'react'
import { useField, Button, toast } from '@payloadcms/ui'

/**
 * Admin-only convenience: reads the Amazon URL field (Books.externalLink)
 * and fills in title/description/format/cover from the real Amazon
 * product page, so the admin isn't retyping it by hand — see
 * src/app/api/internal/import-book/route.ts for the extraction logic and
 * why this is intentionally best-effort (Amazon doesn't serve og: tags on
 * these pages, and page structure could change). Never auto-saves —
 * everything lands in the open form for the admin to review before
 * hitting Save/Publish, same as if they'd typed it in themselves.
 *
 * useField({ path }) works for ANY field in the form, not just one this
 * component happens to be attached to — this is registered as its own
 * `type: 'ui'` field in Books.ts, right after the Amazon URL field.
 */
export function BookImportButton() {
  const [loading, setLoading] = useState(false)
  const { value: amazonUrl } = useField<string>({ path: 'externalLink' })
  const { setValue: setTitle } = useField<string>({ path: 'title' })
  const { setValue: setShortDescription } = useField<string>({ path: 'shortDescription' })
  const { setValue: setDescription } = useField<string>({ path: 'description' })
  const { setValue: setFormat } = useField<string>({ path: 'format' })
  const { setValue: setCoverImage } = useField<number>({ path: 'coverImage' })

  async function handleImport() {
    if (!amazonUrl) {
      toast.error('Enter the Amazon URL above first.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/internal/import-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amazonUrl }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.error || 'Import failed — enter the details manually.')
        return
      }
      if (data.title) setTitle(data.title)
      if (data.shortDescription) setShortDescription(data.shortDescription)
      if (data.description) setDescription(data.description)
      if (data.format) setFormat(data.format)
      if (data.coverImageId) setCoverImage(data.coverImageId)

      if (data.warning) {
        toast.warning(data.warning)
      } else {
        toast.success('Imported from Amazon — review the fields below before saving.')
      }
    } catch {
      toast.error('Import failed — enter the details manually.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <Button type="button" buttonStyle="secondary" disabled={loading} onClick={handleImport}>
        {loading ? 'Importing…' : 'Import from Amazon'}
      </Button>
      <p style={{ fontSize: '0.8125rem', color: 'var(--theme-elevation-500)', marginTop: '0.375rem' }}>
        Fills in the title, description, format, and cover from the Amazon URL above. Always review before saving.
      </p>
    </div>
  )
}
