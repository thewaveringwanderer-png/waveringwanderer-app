// lib/pdf/layout.ts

export const LAYOUT = {
  page: { unit: 'pt' as const, format: 'a4' as const },

  // Page
  marginX: 64,
  marginTop: 72,
  marginBottom: 64,
  maxWidthPadding: 0,

  // Type
  titleSize: 28,
  subtitleSize: 12,
  sectionTitleSize: 12,
  bodySize: 11,

  titleLeading: 32,
  subtitleLeading: 18,
  sectionTitleLeading: 18,
  bodyLeading: 16,

  // Spacing
  titleGapAfter: 6,
  gapAfterSubtitle: 18,

  dividerPadTop: 16,
  dividerPadBottom: 14,

  // This is the "breathing room after divider" you keep trying to force.
  dividerExtraAfter: 6,

  // THIS is the missing piece that fixes the “first divider → first section title feels cramped”
  // and ensures ALL section titles sit nicely after divider lines.
  sectionTitlePadTop: 10,

  gapAfterSectionTitle: 8,
  gapAfterParagraph: 10,
} as const

export function normalizeText(s: string) {
  return (s || '').replace(/\u00A0/g, ' ').trim()
}

// pt -> px approximation for on-screen preview.
// (96dpi screens vs 72pt/in)
export function ptToPx(pt: number) {
  return `${Math.round((pt / 72) * 96)}px`
}
