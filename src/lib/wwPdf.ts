'use client'

export type MetaItem = { label: string; value?: string | null }

export type PdfLine =
  | { kind: 'title'; text: string }
  | { kind: 'subtitle'; text: string }
  | { kind: 'divider' }
  | { kind: 'sectionTitle'; text: string }
  | { kind: 'body'; text: string }
  | { kind: 'spacer'; height: number }
  | { kind: 'meta'; items: MetaItem[] }
  | {
      kind: 'twoCol'
      heading?: string
      leftTitle?: string
      left: string[]
      rightTitle?: string
      right: string[]
    }

export type RenderPdfOptions = {
  includeDate?: boolean
  slug?: string
  prefix?: string
  date?: Date
}

export function normalizeText(s: string) {
  return (s || '')
    .replace(/\u00A0/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim()
}

function sanitizeSlug(s: string) {
  return normalizeText(s)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatDateYYYYMMDD(d: Date) {
  const yyyy = String(d.getFullYear())
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function buildStandardHeader(opts: {
  title: string
  subtitle?: string
  meta?: MetaItem[]
}): PdfLine[] {
  const lines: PdfLine[] = []
  lines.push({ kind: 'title', text: normalizeText(opts.title) })
  if (opts.subtitle) lines.push({ kind: 'subtitle', text: normalizeText(opts.subtitle) })
  if (opts.meta?.length) lines.push({ kind: 'meta', items: opts.meta })
  lines.push({ kind: 'divider' })
  return lines
}

export function metaBlock(items: MetaItem[]): PdfLine {
  return { kind: 'meta', items }
}

export function twoColSection(args: {
  heading?: string
  leftTitle?: string
  left: string[]
  rightTitle?: string
  right: string[]
}): PdfLine {
  return { kind: 'twoCol', ...args }
}

export function buildPdfFilename(
  filenameBase: string,
  options?: RenderPdfOptions
) {
  const prefix = options?.prefix ?? 'ww'
  const includeDate = options?.includeDate ?? false
  const date = options?.date ?? new Date()
  const baseSlug = options?.slug
    ? sanitizeSlug(options.slug)
    : sanitizeSlug(filenameBase || 'export')

  return includeDate
    ? `${prefix}_${baseSlug}_${formatDateYYYYMMDD(date)}.pdf`
    : `${prefix}_${baseSlug}.pdf`
}