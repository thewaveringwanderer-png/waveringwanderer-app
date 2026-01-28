import jsPDF from 'jspdf'

// ---------- PDF Layout + Builder ----------

export const LAYOUT = {
  page: { unit: 'pt' as const, format: 'a4' as const },
  marginX: 64,
  marginTop: 72,
  marginBottom: 64,
  maxWidthPadding: 0,

  titleSize: 28,
  subtitleSize: 12,
  sectionTitleSize: 12,
  bodySize: 11,

  titleLeading: 32,
  subtitleLeading: 18,
  sectionTitleLeading: 18,
  bodyLeading: 16,

  // spacing
  titleGapAfter: 6,
  gapAfterSubtitle: 18,

  dividerPadTop: 16,
  dividerPadBottom: 14,

  // ✅ the “space after divider line” you’re fighting for
  dividerExtraAfter: 10,

  gapAfterSectionTitle: 8,
  gapAfterParagraph: 10,
}

export type PressKitState = {
  artistName: string
  tagline: string
  shortBio: string
  extendedBio: string
  location: string
  genre: string
  forFansOf: string
  keyAchievements: string
  notablePress: string
  liveHighlights: string
  pressAngle: string
  streamingLinks: string
  socialLinks: string
  contactName: string
  contactEmail: string
  contactPhone: string
  photoNotes: string
  heroPhotoUrl: string
  releaseTitle: string
}

export type PdfLine =
  | { kind: 'title'; text: string }
  | { kind: 'subtitle'; text: string }
  | { kind: 'divider' }
  | { kind: 'sectionTitle'; text: string }
  | { kind: 'body'; text: string }
  | { kind: 'spacer'; height: number }

export function normalizeText(s: string) {
  return (s || '').replace(/\u00A0/g, ' ').trim()
}

/**
 * Line-model is the source of truth.
 * - No “fake” spacers for subtitle gap (we apply subtitle gap in BOTH renderers)
 * - Divider always adds padding above AND (crucially) extra after
 */
export function buildPressKitPdfLines(pressKit: PressKitState): PdfLine[] {
  const lines: PdfLine[] = []

  const title = normalizeText(
    pressKit.artistName || pressKit.releaseTitle || 'Electronic Press Kit'
  )
  lines.push({ kind: 'title', text: title.toUpperCase() })

  lines.push({
    kind: 'subtitle',
    text: 'Wavering Wanderers — Electronic Press Kit',
  })

  // divider immediately after subtitle
  lines.push({ kind: 'divider' })

  // ARTIST
  const artistHeader: string[] = []
  if (pressKit.artistName) artistHeader.push(normalizeText(pressKit.artistName))
  if (pressKit.releaseTitle)
    artistHeader.push(normalizeText(pressKit.releaseTitle))
  else if (pressKit.tagline) artistHeader.push(normalizeText(pressKit.tagline))

  lines.push({ kind: 'sectionTitle', text: 'ARTIST' })
  if (artistHeader.length) {
    for (const t of artistHeader) lines.push({ kind: 'body', text: t })
  } else {
    lines.push({ kind: 'body', text: 'Add your artist name and tagline.' })
  }

  // OVERVIEW & BIO
  lines.push({ kind: 'divider' })
  lines.push({ kind: 'sectionTitle', text: 'OVERVIEW & BIO' })

  const facts: string[] = []
  if (pressKit.location)
    facts.push(`Location: ${normalizeText(pressKit.location)}`)
  if (pressKit.genre) facts.push(`Genre: ${normalizeText(pressKit.genre)}`)
  if (pressKit.forFansOf)
    facts.push(`For fans of: ${normalizeText(pressKit.forFansOf)}`)

  for (const f of facts) lines.push({ kind: 'body', text: f })

  if (pressKit.shortBio)
    lines.push({ kind: 'body', text: normalizeText(pressKit.shortBio) })
  if (pressKit.extendedBio)
    lines.push({ kind: 'body', text: normalizeText(pressKit.extendedBio) })

  if (!facts.length && !pressKit.shortBio && !pressKit.extendedBio) {
    lines.push({
      kind: 'body',
      text: 'Add your location, genre, and a short bio.',
    })
  }

  // Optional sections (each starts with divider)
  if (pressKit.keyAchievements) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'KEY ACHIEVEMENTS' })
    lines.push({ kind: 'body', text: normalizeText(pressKit.keyAchievements) })
  }

  if (pressKit.notablePress) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'NOTABLE PRESS' })
    lines.push({ kind: 'body', text: normalizeText(pressKit.notablePress) })
  }

  if (pressKit.liveHighlights) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'LIVE HIGHLIGHTS' })
    lines.push({ kind: 'body', text: normalizeText(pressKit.liveHighlights) })
  }

  if (pressKit.pressAngle) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'PRESS ANGLE / STORY HOOK' })
    lines.push({ kind: 'body', text: normalizeText(pressKit.pressAngle) })
  }

  if (pressKit.streamingLinks) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'STREAMING LINKS' })
    lines.push({ kind: 'body', text: normalizeText(pressKit.streamingLinks) })
  }

  if (pressKit.socialLinks) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'SOCIALS' })
    lines.push({ kind: 'body', text: normalizeText(pressKit.socialLinks) })
  }

  if (pressKit.contactName || pressKit.contactEmail || pressKit.contactPhone) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'CONTACT' })
    if (pressKit.contactName)
      lines.push({ kind: 'body', text: normalizeText(pressKit.contactName) })
    if (pressKit.contactEmail)
      lines.push({ kind: 'body', text: normalizeText(pressKit.contactEmail) })
    if (pressKit.contactPhone)
      lines.push({ kind: 'body', text: normalizeText(pressKit.contactPhone) })
  }

  if (pressKit.photoNotes) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'PRESS PHOTOS' })
    lines.push({ kind: 'body', text: normalizeText(pressKit.photoNotes) })
  }

  return lines
}

export function renderPressKitPdf(lines: PdfLine[], filenameBase: string) {
  const doc = new jsPDF({
    unit: LAYOUT.page.unit,
    format: LAYOUT.page.format,
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const x = LAYOUT.marginX
  const maxWidth = pageWidth - LAYOUT.marginX * 2 - LAYOUT.maxWidthPadding

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
      // ✅ guarantee visible space after EVERY divider
      const needed =
        LAYOUT.dividerPadTop + 2 + LAYOUT.dividerPadBottom + LAYOUT.dividerExtraAfter
      ensureSpace(needed)

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
      drawWrapped(line.text, LAYOUT.subtitleSize, LAYOUT.subtitleLeading, 'normal')
      // ✅ gap applied here (NOT via spacer line)
      y += LAYOUT.gapAfterSubtitle
      continue
    }

    if (line.kind === 'sectionTitle') {
      ensureSpace(LAYOUT.sectionTitleLeading + LAYOUT.gapAfterSectionTitle)
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
