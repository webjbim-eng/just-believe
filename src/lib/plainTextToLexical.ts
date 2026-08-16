/**
 * Wraps plain visitor-submitted text into the minimal valid Lexical JSON
 * shape a richText field expects — for public forms (e.g. testimonials)
 * that only offer a plain textarea, not a rich text editor. Splits on
 * blank lines so multi-paragraph submissions don't collapse into one
 * block. Mirrors src/seed/run.ts's local (unexported) toLexicalParagraph,
 * pulled out here since this is the first *public form* that needs it.
 */
export function plainTextToLexical(text: string) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return {
    root: {
      type: 'root',
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      children: (paragraphs.length > 0 ? paragraphs : ['']).map((paragraph) => ({
        type: 'paragraph',
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
        children: [{ type: 'text', text: paragraph, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
      })),
    },
  }
}
