'use client'


import jsPDF from 'jspdf'

/**
 * Shared WW PDF renderer (used across tools).
 * Goals:
 * - Consistent spacing + dividers
 * - Optional meta header block
 * - Optional 2-column blocks
 * - Stable exports so imports don't go red across features
 */

export const WW_PDF_LAYOUT = {
  page: { unit: 'pt' as const, format: 'a4' as const },
  marginX: 64,
  marginTop: 72,
  marginBottom: 64,
  maxWidthPadding: 0,

  titleSize: 18,
  subtitleSize: 11,
  sectionTitleSize: 11,
  bodySize: 11,
  metaLabelSize: 9,
  metaValueSize: 9,

  titleLeading: 22,
  subtitleLeading: 16,
  sectionTitleLeading: 16,
  bodyLeading: 16,
  metaLeading: 13,

  titleGapAfter: 6,
  gapAfterSubtitle: 14,

  dividerPadTop: 16,
  dividerPadBottom: 14,
  dividerExtraAfter: 10,

  // optional extra gap after divider line (Press Kit uses this)
  dividerAfterLineGap: 0,

  gapAfterSectionTitle: 8,
  gapAfterParagraph: 10,

  // meta block
  metaBoxPadX: 10,
  metaBoxPadY: 10,
  metaBoxRadius: 10,
  metaRowGap: 6,
  metaColGap: 14,

  // 2-col blocks
  twoColGap: 18,
  twoColInnerGap: 6,
}

export type PdfLayout = Partial<typeof WW_PDF_LAYOUT> & {
  page?: { unit: 'pt'; format: 'a4' }
}

export type MetaItem = { label: string; value?: string | null }

export type PdfLine =
  | { kind: 'title'; text: string }
  | { kind: 'subtitle'; text: string }
  | { kind: 'divider' }
  | { kind: 'sectionTitle'; text: string }
  | { kind: 'body'; text: string }
  | { kind: 'spacer'; height: number } // ✅ for PDF-accurate previews
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

export type RenderPdfFromLinesArgs = {
  lines: PdfLine[]
  filenameBase: string
  layout?: PdfLayout
  options?: RenderPdfOptions
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

export function buildStandardHeader(opts: {
  title: string
  subtitle?: string
  meta?: MetaItem[]
}): PdfLine[] {
  const lines: PdfLine[] = []
  lines.push({ kind: 'title', text: normalizeText(opts.title) })
  if (opts.subtitle) lines.push({ kind: 'subtitle', text: normalizeText(opts.subtitle) })
  if (opts.meta && opts.meta.length) lines.push({ kind: 'meta', items: opts.meta })
  lines.push({ kind: 'divider' })
  return lines
}

function resolveLayout(layout?: PdfLayout) {
  return {
    ...WW_PDF_LAYOUT,
    ...(layout || {}),
    page: {
      unit: 'pt' as const,
      format: 'a4' as const,
      ...(layout?.page || {}),
    },
  }
}

/**
 * ✅ Preferred renderer used by newer pages (Press Kit)
 */
export function renderPdfFromLines(args: RenderPdfFromLinesArgs) {
  const { lines, filenameBase, layout, options } = args
  return renderWwPdf(lines, filenameBase, options, layout)
}

/**
 * ✅ Back-compat renderer used by older pages (Identity Kit etc.)
 * Also accepts an optional per-call layout override.
 */
export function renderWwPdf(
  lines: PdfLine[],
  filenameBase: string,
  options?: RenderPdfOptions,
  layoutOverride?: PdfLayout
) {
  const L = resolveLayout(layoutOverride)

  const doc = new jsPDF({
    unit: L.page.unit,
    format: L.page.format,
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const x = L.marginX
  const maxWidth = pageWidth - L.marginX * 2 - L.maxWidthPadding
  let y = L.marginTop

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - L.marginBottom) {
      doc.addPage()
      y = L.marginTop
    }
  }

  const measureWrappedHeight = (text: string, size: number, leading: number, width: number) => {
    const safe = normalizeText(text)
    if (!safe) return 0
    doc.setFontSize(size)
    const wrapped = doc.splitTextToSize(safe, width)
    return wrapped.length * leading
  }
  const drawDivider = () => {
    ensureSpace(L.dividerPadTop + L.dividerPadBottom + 2)
    y += L.dividerPadTop

    doc.setDrawColor(210, 210, 210)
    doc.setLineWidth(0.6)
    doc.line(x, y, x + maxWidth, y)

    y += L.dividerPadBottom
    if (L.dividerAfterLineGap) y += L.dividerAfterLineGap
    y += L.dividerExtraAfter
  }

  const drawMetaBlock = (items: MetaItem[]) => {
    const clean = (items || []).filter(it => normalizeText(it.label) || normalizeText(it.value || ''))
    if (!clean.length) return

    // measure roughly
    const colW = (maxWidth - L.metaColGap) / 2
    const rows = clean.length
    const boxH = L.metaBoxPadY * 2 + rows * L.metaLeading + (rows - 1) * L.metaRowGap

    ensureSpace(boxH + 10)

    // background box (subtle)
    doc.setDrawColor(230, 230, 230)
    doc.setLineWidth(0.6)
    ;(doc as any).roundedRect?.(x, y, maxWidth, boxH, L.metaBoxRadius, L.metaBoxRadius, 'S')

    let cy = y + L.metaBoxPadY + L.metaLeading

    doc.setFontSize(L.metaLabelSize)
    for (const it of clean) {
      const label = normalizeText(it.label)
      const value = normalizeText(it.value || '')

      doc.setFont('helvetica', 'bold')
      doc.text(label, x + L.metaBoxPadX, cy, { maxWidth: colW } as any)

      doc.setFont('helvetica', 'normal')
      doc.text(value || '—', x + L.metaBoxPadX + colW + L.metaColGap, cy, { maxWidth: colW } as any)

      cy += L.metaLeading + L.metaRowGap
    }

    y += boxH + L.gapAfterParagraph
  }

  const drawWrapped = (
  text: string,
  size: number,
  leading: number,
  font: 'normal' | 'bold',
  drawX: number,
  width: number
) => {
  const safe = normalizeText(String(text ?? ''))
  if (!safe) return { lines: 0, height: 0 }

  // Hard guards to prevent jsPDF.text crashing
  const w = Number(width)
  if (!Number.isFinite(drawX) || !Number.isFinite(y) || !Number.isFinite(w) || w <= 0) {
    console.error('[wwPdf] Invalid drawWrapped params', { text: safe, drawX, y, width })
    return { lines: 0, height: 0 }
  }

  doc.setFont('helvetica', font)
  doc.setFontSize(size)
  doc.setTextColor(0, 0, 0)

  // Ensure wrapped is a clean string[]
  const rawWrapped: any = doc.splitTextToSize(safe, w)
  const wrapped: string[] = Array.isArray(rawWrapped)
    ? rawWrapped.map((v: any) => String(v ?? '')).filter(Boolean)
    : [String(rawWrapped ?? '')].filter(Boolean)

  if (!wrapped.length) {
    console.warn('[wwPdf] splitTextToSize returned empty', { safe, width: w })
    return { lines: 0, height: 0 }
  }

  ensureSpace(wrapped.length * leading)
  doc.text(wrapped, drawX, y)

  const h = wrapped.length * leading
  y += h
  return { lines: wrapped.length, height: h }
}


  const drawTwoCol = (line: Extract<PdfLine, { kind: 'twoCol' }>) => {
    const leftItems = (line.left || []).map(normalizeText).filter(Boolean)
    const rightItems = (line.right || []).map(normalizeText).filter(Boolean)
    if (!leftItems.length && !rightItems.length && !line.heading) return

    if (line.heading) {
      ensureSpace(L.sectionTitleLeading + L.gapAfterSectionTitle)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(L.sectionTitleSize)
      doc.setTextColor(0, 0, 0)
      const wrapped = doc.splitTextToSize(normalizeText(line.heading).toUpperCase(), maxWidth)
      doc.text(wrapped, x, y)
      y += wrapped.length * L.sectionTitleLeading
      y += L.gapAfterSectionTitle
    }

    const gap = L.twoColGap
    const colW = (maxWidth - gap) / 2
    const leftX = x
    const rightX = x + colW + gap

    const titleH = (t?: string) =>
      t ? measureWrappedHeight(t, L.bodySize, L.bodyLeading, colW) + L.twoColInnerGap : 0

    const listH = (items: string[]) =>
      items.reduce((acc, it) => acc + measureWrappedHeight(`• ${it}`, L.bodySize, L.bodyLeading, colW), 0)

    const leftH = titleH(line.leftTitle) + listH(leftItems)
    const rightH = titleH(line.rightTitle) + listH(rightItems)
    const blockH = Math.max(leftH, rightH) + 6

    ensureSpace(blockH)

    const startY = y
    let yL = startY
    let yR = startY

    const drawCol = (colX: number, title: string | undefined, items: string[], side: 'L' | 'R') => {
      let cy = side === 'L' ? yL : yR

      if (title) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(L.bodySize)
        doc.setTextColor(0, 0, 0)
        const tWrap = doc.splitTextToSize(normalizeText(title), colW)
        doc.text(tWrap, colX, cy)
        cy += tWrap.length * L.bodyLeading
        cy += L.twoColInnerGap
      }

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(L.bodySize)
      doc.setTextColor(0, 0, 0)

      for (const it of items) {
        const wrapped = doc.splitTextToSize(`• ${it}`, colW)
        doc.text(wrapped, colX, cy)
        cy += wrapped.length * L.bodyLeading
      }

      if (side === 'L') yL = cy
      else yR = cy
    }

    drawCol(leftX, line.leftTitle, leftItems, 'L')
    drawCol(rightX, line.rightTitle, rightItems, 'R')

    y = Math.max(yL, yR) + L.gapAfterParagraph
  }

  for (const line of lines) {
    if (line.kind === 'spacer') {
      ensureSpace(line.height)
      y += line.height
      continue
    }

    if (line.kind === 'divider') {
      drawDivider()
      continue
    }

    if (line.kind === 'title') {
      drawWrapped(line.text, L.titleSize, L.titleLeading, 'bold', x, maxWidth)
      y += L.titleGapAfter
      continue
    }

    if (line.kind === 'subtitle') {
      drawWrapped(line.text, L.subtitleSize, L.subtitleLeading, 'normal', x, maxWidth)
      y += L.gapAfterSubtitle
      continue
    }

    if (line.kind === 'sectionTitle') {
      ensureSpace(L.sectionTitleLeading + L.gapAfterSectionTitle)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(L.sectionTitleSize)
      doc.setTextColor(0, 0, 0)
      const wrapped = doc.splitTextToSize(normalizeText(line.text).toUpperCase(), maxWidth)
      doc.text(wrapped, x, y)
      y += wrapped.length * L.sectionTitleLeading
      y += L.gapAfterSectionTitle
      continue
    }

    if (line.kind === 'meta') {
      drawMetaBlock(line.items)
      continue
    }

    if (line.kind === 'twoCol') {
      drawTwoCol(line)
      continue
    }

    drawWrapped(line.text, L.bodySize, L.bodyLeading, 'normal', x, maxWidth)
    y += L.gapAfterParagraph
  }

  const prefix = options?.prefix ?? 'ww'
  const includeDate = options?.includeDate ?? true
  const date = options?.date ?? new Date()

  const baseSlug = options?.slug ? sanitizeSlug(options.slug) : sanitizeSlug(filenameBase || 'export')
  const dated = includeDate ? `${prefix}_${baseSlug}_${formatDateYYYYMMDD(date)}` : `${prefix}_${baseSlug}`

  // ---- Footer (page numbers + WW mark)
const pageCount = (doc as any).internal?.pages?.length ? (doc as any).internal.pages.length - 1 : 1

for (let i = 1; i <= pageCount; i++) {
  doc.setPage(i)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)

  const footerY = pageHeight - 26
  doc.text(`Wavering Wanderers`, x, footerY)

  const rightText = `Page ${i} / ${pageCount}`
  const w = doc.getTextWidth(rightText)
  doc.text(rightText, pageWidth - x - w, footerY)
}



  doc.save(`${dated}.pdf`)
}

/**
 * ✅ Exported helper used by other PDF modules.
 * This prevents imports going red (e.g. calendarMonthDetailedPdf.ts).
 */
export function sanitizeFilename(base: string) {
  const slug = sanitizeSlug(base || 'export')
  return slug || 'export'
}

/**
 * Backwards-compatible aliases (helps when older files used these names).
 */
export const renderwwPdf = renderWwPdf
