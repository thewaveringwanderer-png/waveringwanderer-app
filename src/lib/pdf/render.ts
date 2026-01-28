// lib/pdf/render.ts

import jsPDF from 'jspdf'
import { LAYOUT, normalizeText } from './layout'
import type { PdfLine } from './types'

export function renderPdf(lines: PdfLine[], filenameBase: string) {
  const doc = new jsPDF({
    unit: LAYOUT.page.unit,
    format: LAYOUT.page.format,
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const x = LAYOUT.marginX
  const maxWidth =
    pageWidth - LAYOUT.marginX * 2 - (LAYOUT.maxWidthPadding || 0)

  let y = LAYOUT.marginTop

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - LAYOUT.marginBottom) {
      doc.addPage()
      y = LAYOUT.marginTop
    }
  }

  const drawWrapped = (
    text: string,
    size: number,
    leading: number,
    font: 'normal' | 'bold'
  ) => {
    const safe = normalizeText(text)
    if (!safe) return
    doc.setFont('helvetica', font)
    doc.setFontSize(size)
    const wrapped = doc.splitTextToSize(safe, maxWidth)

    ensureSpace(wrapped.length * leading)
    doc.text(wrapped, x, y)
    y += wrapped.length * leading
  }

  for (const line of lines) {
    if (line.kind === 'spacer') {
      ensureSpace(line.height)
      y += line.height
      continue
    }

    if (line.kind === 'divider') {
      ensureSpace(
        LAYOUT.dividerPadTop +
          2 +
          LAYOUT.dividerPadBottom +
          LAYOUT.dividerExtraAfter
      )

      y += LAYOUT.dividerPadTop
      doc.setDrawColor(225, 225, 225)
      doc.setLineWidth(0.8)
      doc.line(x, y, pageWidth - x, y)
      y += 1
      y += LAYOUT.dividerPadBottom
      y += LAYOUT.dividerExtraAfter
      continue
    }

    if (line.kind === 'title') {
      drawWrapped(line.text, LAYOUT.titleSize, LAYOUT.titleLeading, 'bold')
      y += LAYOUT.titleGapAfter
      continue
    }

    if (line.kind === 'subtitle') {
      drawWrapped(
        line.text,
        LAYOUT.subtitleSize,
        LAYOUT.subtitleLeading,
        'normal'
      )
      y += LAYOUT.gapAfterSubtitle
      continue
    }

    if (line.kind === 'sectionTitle') {
      // ✅ Key: extra pad before section titles so divider spacing is consistent everywhere
      ensureSpace(
        LAYOUT.sectionTitlePadTop +
          LAYOUT.sectionTitleLeading +
          LAYOUT.gapAfterSectionTitle
      )

      y += LAYOUT.sectionTitlePadTop
      doc.setTextColor(0, 0, 0)
      drawWrapped(
        line.text.toUpperCase(),
        LAYOUT.sectionTitleSize,
        LAYOUT.sectionTitleLeading,
        'bold'
      )
      y += LAYOUT.gapAfterSectionTitle
      continue
    }

    if (line.kind === 'body') {
      drawWrapped(line.text, LAYOUT.bodySize, LAYOUT.bodyLeading, 'normal')
      y += LAYOUT.gapAfterParagraph
      continue
    }
  }

  const filename = (filenameBase || 'press-kit')
    .replace(/\s+/g, '-')
    .toLowerCase()

  doc.save(`${filename}.pdf`)
}
