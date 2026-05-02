'use client'

import type { PdfLine, MetaItem, RenderPdfOptions } from '@/lib/wwPdf'
import { normalizeText, buildPdfFilename } from '@/lib/wwPdf'

declare global {
  interface Window {
    jspdf?: {
      jsPDF: new (options?: {
        orientation?: 'portrait' | 'landscape'
        unit?: string
        format?: string
      }) => any
    }
  }
}

export async function renderWwPdf(
  lines: PdfLine[],
  filenameBase: string,
  options?: RenderPdfOptions
) {
  if (typeof window === 'undefined') {
    throw new Error('renderWwPdf must only run in the browser')
  }

  const jsPDF = window.jspdf?.jsPDF

  if (!jsPDF) {
    throw new Error('jsPDF script not loaded yet')
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const marginX = 18
  const marginTop = 24
  const marginBottom = 16
  const maxWidth = pageWidth - marginX * 2

  const WW = {
    violet: [186, 85, 211] as const,
    text: [20, 20, 24] as const,
    muted: [95, 95, 110] as const,
    soft: [215, 215, 225] as const,
    pale: [242, 239, 248] as const,
  }

  let y = marginTop

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - marginBottom) {
      doc.addPage()
      y = marginTop
    }
  }

  const drawWrapped = (
    text: string,
    size: number,
    font: 'normal' | 'bold',
    lineHeight: number,
    color: readonly number[] = WW.text
  ) => {
    const safe = normalizeText(text)
    if (!safe) return 0

    doc.setFont('helvetica', font)
    doc.setFontSize(size)
    doc.setTextColor(color[0], color[1], color[2])

    const wrapped = doc.splitTextToSize(safe, maxWidth)
    const h = wrapped.length * lineHeight
    ensureSpace(h)
    doc.text(wrapped, marginX, y)
    y += h
    return h
  }

  const drawAccentBar = () => {
    ensureSpace(4)
    doc.setFillColor(WW.violet[0], WW.violet[1], WW.violet[2])
    doc.roundedRect(marginX, y, 28, 1.6, 0.8, 0.8, 'F')
    y += 4
  }

  const drawDivider = () => {
    ensureSpace(8)
    y += 2
    doc.setDrawColor(WW.soft[0], WW.soft[1], WW.soft[2])
    doc.setLineWidth(0.35)
    doc.line(marginX, y, marginX + maxWidth, y)
    y += 5
  }

  const drawMeta = (items: MetaItem[]) => {
    const clean = items.filter(
      it => normalizeText(it.label) || normalizeText(it.value || '')
    )
    if (!clean.length) return

    const padX = 3
    const padY = 3
    const rowGap = 1.8
    const lineH = 4.8

    const estimatedHeight =
      padY * 2 + clean.length * lineH + (clean.length - 1) * rowGap
    ensureSpace(estimatedHeight + 2)

    doc.setFillColor(WW.pale[0], WW.pale[1], WW.pale[2])
    doc.setDrawColor(WW.soft[0], WW.soft[1], WW.soft[2])
    doc.roundedRect(marginX, y, maxWidth, estimatedHeight, 2.5, 2.5, 'FD')

    let cy = y + padY + 3.8
    for (const item of clean) {
      const label = normalizeText(item.label)
      const value = normalizeText(item.value || '—')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(WW.muted[0], WW.muted[1], WW.muted[2])
      doc.text(`${label}:`, marginX + padX, cy)

      const labelWidth = doc.getTextWidth(`${label}: `)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(WW.text[0], WW.text[1], WW.text[2])

      const wrapped = doc.splitTextToSize(
        value,
        maxWidth - padX * 2 - labelWidth - 2
      )

      doc.text(wrapped, marginX + padX + labelWidth + 1.5, cy)
      cy += Math.max(lineH, wrapped.length * 4.3) + rowGap
    }

    y += estimatedHeight + 4
  }

  const drawTwoCol = (line: Extract<PdfLine, { kind: 'twoCol' }>) => {
    if (line.heading) {
      drawAccentBar()
      drawWrapped(line.heading.toUpperCase(), 10.5, 'bold', 5.5, WW.muted)
      y += 1
    }

    const gap = 8
    const colW = (maxWidth - gap) / 2
    const leftX = marginX
    const rightX = marginX + colW + gap
    const startY = y

    let leftY = startY
    let rightY = startY

    const drawCol = (
      x: number,
      currentY: number,
      title: string | undefined,
      items: string[]
    ) => {
      let cy = currentY

      if (title) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9.5)
        doc.setTextColor(WW.text[0], WW.text[1], WW.text[2])
        const wrappedTitle = doc.splitTextToSize(normalizeText(title), colW)
        doc.text(wrappedTitle, x, cy)
        cy += wrappedTitle.length * 4.8
        cy += 1
      }

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(WW.text[0], WW.text[1], WW.text[2])

      for (const item of items) {
        const wrapped = doc.splitTextToSize(`• ${normalizeText(item)}`, colW)
        doc.text(wrapped, x, cy)
        cy += wrapped.length * 4.7
        cy += 0.8
      }

      return cy
    }

    ensureSpace(22)
    leftY = drawCol(leftX, leftY, line.leftTitle, line.left || [])
    rightY = drawCol(rightX, rightY, line.rightTitle, line.right || [])

    y = Math.max(leftY, rightY) + 4
  }

  for (const l of lines) {
    if (l.kind === 'spacer') {
      ensureSpace(l.height)
      y += l.height
      continue
    }

    if (l.kind === 'divider') {
      drawDivider()
      continue
    }

    if (l.kind === 'title') {
      drawAccentBar()
      drawWrapped(l.text, 19, 'bold', 8.5, WW.text)
      y += 1.5
      continue
    }

    if (l.kind === 'subtitle') {
      drawWrapped(l.text, 10.5, 'normal', 5.8, WW.muted)
      y += 3
      continue
    }

    if (l.kind === 'sectionTitle') {
      drawWrapped(l.text.toUpperCase(), 10, 'bold', 5.5, WW.violet)
      y += 2
      continue
    }

    if (l.kind === 'body') {
      drawWrapped(l.text, 10, 'normal', 5.1, WW.text)
      y += 2
      continue
    }

    if (l.kind === 'meta') {
      drawMeta(l.items)
      continue
    }

    if (l.kind === 'twoCol') {
      drawTwoCol(l)
      continue
    }
  }

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(WW.muted[0], WW.muted[1], WW.muted[2])

    const footerY = pageHeight - 6
    doc.text('Wavering Wanderers', marginX, footerY)

    const pageText = `Page ${i} / ${pageCount}`
    const pageTextWidth = doc.getTextWidth(pageText)
    doc.text(pageText, pageWidth - marginX - pageTextWidth, footerY)
  }

  const finalName = buildPdfFilename(filenameBase, options)
  doc.save(finalName)
}

export function renderPdfFromLines(args: {
  lines: PdfLine[]
  filenameBase: string
  options?: RenderPdfOptions
}) {
  return renderWwPdf(args.lines, args.filenameBase, args.options)
}