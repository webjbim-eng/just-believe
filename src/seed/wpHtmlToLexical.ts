/**
 * Hand-written HTML -> Lexical converter, scoped to the actual tag set
 * found in the paulinemenoru.com WordPress export (h1-h6, p, em/strong/
 * sup/sub, ul/ol/li, hr, blockquote, figure>img, a, br, div wrappers) —
 * not a general-purpose HTML importer. Payload's own `convertHTMLToLexical`
 * exists but isn't part of `@payloadcms/richtext-lexical`'s public exports
 * map, so it can't be imported from normal ESM code without reaching into
 * an unexported deep path. Node shapes below were reverse-engineered from
 * each real Lexical node class's `exportJSON()` in node_modules (heading/
 * quote/list/listitem/text from `lexical` + `@lexical/rich-text` +
 * `@lexical/list`, link/upload/horizontalrule from
 * `@payloadcms/richtext-lexical`) rather than guessed, so the output is
 * byte-shape-compatible with what the real editor would have saved.
 */
import { JSDOM } from 'jsdom'

// Lexical TextNode format bitmask (lexical/Lexical.dev.mjs) — not exported
// for use outside the editor package, so mirrored here.
const IS_BOLD = 1
const IS_ITALIC = 1 << 1
const IS_STRIKETHROUGH = 1 << 2
const IS_UNDERLINE = 1 << 3
const IS_SUBSCRIPT = 1 << 5
const IS_SUPERSCRIPT = 1 << 6

type LNode = Record<string, any>

const SKIP_CLASS_PATTERN = /jetpack-subscriptions|sharedaddy|jp-relatedposts/i

export type ResolveImage = (src: string, alt: string) => Promise<number | null>

function objectId(): string {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

function textNode(text: string, format = 0): LNode {
  return { type: 'text', text, format, detail: 0, mode: 'normal', style: '', version: 1 }
}

function elementNode(type: string, children: LNode[], extra: Record<string, unknown> = {}): LNode {
  return { type, children, direction: children.length ? 'ltr' : null, format: '', indent: 0, version: 1, ...extra }
}

async function convertLink(el: Element, format: number, resolveImage: ResolveImage): Promise<LNode> {
  const href = el.getAttribute('href') || ''
  const children = await convertInlineChildren(el, format, resolveImage)
  return {
    type: 'link',
    version: 3,
    id: objectId(),
    format: '',
    indent: 0,
    direction: children.length ? 'ltr' : null,
    fields: { linkType: 'custom', url: href, newTab: true },
    children: children.length ? children : [textNode(href, format)],
  }
}

async function convertInlineNode(node: ChildNode, format: number, resolveImage: ResolveImage): Promise<LNode[]> {
  if (node.nodeType === 3 /* TEXT_NODE */) {
    const text = (node.textContent || '').replace(/\s+/g, ' ')
    return text ? [textNode(text, format)] : []
  }
  if (node.nodeType !== 1 /* ELEMENT_NODE */) return []

  const el = node as Element
  const tag = el.tagName.toLowerCase()

  switch (tag) {
    case 'strong':
    case 'b':
      return convertInlineChildren(el, format | IS_BOLD, resolveImage)
    case 'em':
    case 'i':
      return convertInlineChildren(el, format | IS_ITALIC, resolveImage)
    case 'sup':
      return convertInlineChildren(el, format | IS_SUPERSCRIPT, resolveImage)
    case 'sub':
      return convertInlineChildren(el, format | IS_SUBSCRIPT, resolveImage)
    case 's':
    case 'strike':
    case 'del':
      return convertInlineChildren(el, format | IS_STRIKETHROUGH, resolveImage)
    case 'u':
      return convertInlineChildren(el, format | IS_UNDERLINE, resolveImage)
    case 'br':
      return [{ type: 'linebreak', version: 1 }]
    case 'a':
      return [await convertLink(el, format, resolveImage)]
    default:
      // span and any other unrecognized inline wrapper: keep its text,
      // drop the wrapper itself rather than losing the content.
      return convertInlineChildren(el, format, resolveImage)
  }
}

async function convertInlineChildren(el: Element, format: number, resolveImage: ResolveImage): Promise<LNode[]> {
  const out: LNode[] = []
  for (const child of Array.from(el.childNodes)) {
    out.push(...(await convertInlineNode(child, format, resolveImage)))
  }
  return out
}

async function convertBlock(node: ChildNode, resolveImage: ResolveImage): Promise<LNode[]> {
  if (node.nodeType === 3 /* TEXT_NODE */) {
    const text = (node.textContent || '').trim()
    return text ? [elementNode('paragraph', [textNode(text)])] : []
  }
  if (node.nodeType !== 1 /* ELEMENT_NODE */) return []

  const el = node as Element
  const tag = el.tagName.toLowerCase()
  const className = el.getAttribute('class') || ''
  if (SKIP_CLASS_PATTERN.test(className)) return []

  switch (tag) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      const inline = await convertInlineChildren(el, 0, resolveImage)
      return inline.length ? [elementNode('heading', inline, { tag })] : []
    }
    case 'p': {
      const inline = await convertInlineChildren(el, 0, resolveImage)
      return inline.length ? [elementNode('paragraph', inline)] : []
    }
    case 'blockquote': {
      // QuoteNode holds inline content directly (no nested paragraphs) —
      // join the blockquote's source <p>s with linebreaks instead.
      const inline: LNode[] = []
      for (const child of Array.from(el.childNodes)) {
        if (child.nodeType === 1 && (child as Element).tagName.toLowerCase() === 'p') {
          if (inline.length) inline.push({ type: 'linebreak', version: 1 })
          inline.push(...(await convertInlineChildren(child as Element, 0, resolveImage)))
        } else {
          inline.push(...(await convertInlineNode(child, 0, resolveImage)))
        }
      }
      return inline.length ? [elementNode('quote', inline)] : []
    }
    case 'ul':
    case 'ol': {
      const items: LNode[] = []
      let value = 1
      for (const child of Array.from(el.children)) {
        if (child.tagName.toLowerCase() !== 'li') continue
        const inline = await convertInlineChildren(child, 0, resolveImage)
        items.push({
          type: 'listitem',
          children: inline.length ? inline : [textNode('')],
          direction: inline.length ? 'ltr' : null,
          format: '',
          indent: 0,
          version: 1,
          value,
          checked: undefined,
        })
        value++
      }
      if (!items.length) return []
      return [{ type: 'list', children: items, direction: 'ltr', format: '', indent: 0, version: 1, listType: tag === 'ul' ? 'bullet' : 'number', start: 1, tag }]
    }
    case 'hr':
      return [{ type: 'horizontalrule', version: 1 }]
    case 'figure': {
      const img = el.querySelector('img')
      if (!img) return []
      const src = img.getAttribute('data-orig-file') || img.getAttribute('src') || ''
      if (!src) return []
      const mediaId = await resolveImage(src, img.getAttribute('alt') || '')
      if (!mediaId) return []
      return [{ type: 'upload', version: 3, id: objectId(), relationTo: 'media', value: mediaId, fields: null, format: '' }]
    }
    case 'a': {
      // Bare top-level <a> (e.g. a wp-block-button's inner link once its
      // wrapping divs are unwrapped below) — give it its own paragraph.
      return [elementNode('paragraph', [await convertLink(el, 0, resolveImage)])]
    }
    case 'div': {
      // WordPress block wrapper with no Lexical equivalent — recurse into
      // children instead of dropping whatever real content it holds.
      const out: LNode[] = []
      for (const child of Array.from(el.childNodes)) {
        out.push(...(await convertBlock(child, resolveImage)))
      }
      return out
    }
    default:
      return []
  }
}

export async function wpHtmlToLexical(html: string, resolveImage: ResolveImage) {
  const dom = new JSDOM(`<!doctype html><body>${html}</body>`)
  const body = dom.window.document.body
  const children: LNode[] = []
  for (const node of Array.from(body.childNodes)) {
    children.push(...(await convertBlock(node, resolveImage)))
  }
  return {
    root: {
      type: 'root',
      children: children.length > 0 ? children : [elementNode('paragraph', [])],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}
