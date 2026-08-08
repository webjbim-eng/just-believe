/**
 * Minimal Lexical editorState -> plain text extraction. No block/blog
 * page renders rich formatting yet (bold, links, lists) — this is enough
 * for card excerpts and simple body copy. Reach for a real Lexical React
 * renderer (@payloadcms/richtext-lexical/react) once a page actually
 * needs formatted output.
 */
type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] }

export function lexicalToPlainText(value: unknown): string {
  const root = (value as { root?: LexicalNode } | null | undefined)?.root
  if (!root) return ''

  const parts: string[] = []
  const walk = (node: LexicalNode) => {
    if (typeof node.text === 'string') parts.push(node.text)
    node.children?.forEach(walk)
  }
  walk(root)

  return parts.join(' ').replace(/\s+/g, ' ').trim()
}
