// src/lib/calendarMonthDetailedPdf.ts
import {
  type PdfLayout,
  type PdfLine,
  normalizeText,
  renderPdfFromLines,
  sanitizeFilename,
} from '@/lib/wwPdf'

type CalendarStatus = 'planned' | 'draft' | 'scheduled' | 'posted' | string

export type CalendarDetailedItem = {
  title: string | null
  caption: string | null
  platform: string | null
  status: CalendarStatus | string | null
  scheduled_at: string | null
  hashtags?: string[] | null
  feature?: string | null
}

function platformLabel(p: string | null) {
  if (!p) return 'Unspecified'
  switch (p) {
    case 'instagram':
      return 'Instagram'
    case 'tiktok':
      return 'TikTok'
    case 'youtube':
      return 'YouTube Shorts'
    case 'facebook':
      return 'Facebook'
    case 'x':
      return 'X / Twitter'
    default:
      return p
  }
}

function statusLabel(s: string | null) {
  if (!s) return 'Planned'
  if (s === 'planned') return 'Planned'
  if (s === 'draft') return 'Draft'
  if (s === 'scheduled') return 'Scheduled'
  if (s === 'posted') return 'Posted'
  return s
}

function dateKeyFromISO(iso: string) {
  return iso.slice(0, 10) // YYYY-MM-DD
}

function isInMonth(iso: string, month: Date) {
  const d = new Date(iso)
  return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth()
}

const DEFAULT_LAYOUT: PdfLayout = {
  page: { unit: 'pt', format: 'a4' },
  marginX: 64,
  marginTop: 72,
  marginBottom: 64,
  maxWidthPadding: 0,

  titleSize: 20,
  subtitleSize: 11,
  sectionTitleSize: 11,
  bodySize: 11,

  titleLeading: 24,
  subtitleLeading: 16,
  sectionTitleLeading: 16,
  bodyLeading: 16,

  titleGapAfter: 6,
  gapAfterSubtitle: 14,

  dividerPadTop: 14,
  dividerPadBottom: 12,
  dividerExtraAfter: 8,
  dividerAfterLineGap: 0,

  gapAfterSectionTitle: 8,
  gapAfterParagraph: 10,
}

export function exportCalendarMonthDetailedPdf(args: {
  month: Date
  items: CalendarDetailedItem[]
  filenameBase?: string
  headerTitle?: string
  layout?: PdfLayout
}) {
  const { month, items, filenameBase, headerTitle, layout } = args
  const usedLayout = layout || DEFAULT_LAYOUT

  const monthItems = (items || [])
    .filter(it => it.scheduled_at && isInMonth(it.scheduled_at, month))
    .sort((a, b) => {
      const da = a.scheduled_at ? new Date(a.scheduled_at).getTime() : 0
      const db = b.scheduled_at ? new Date(b.scheduled_at).getTime() : 0
      return da - db
    })

  if (!monthItems.length) {
    throw new Error('No scheduled items in this month to export.')
  }

  const byDay: Record<string, CalendarDetailedItem[]> = {}
  for (const it of monthItems) {
    if (!it.scheduled_at) continue
    const key = dateKeyFromISO(it.scheduled_at)
    if (!byDay[key]) byDay[key] = []
    byDay[key].push(it)
  }

  const dayKeys = Object.keys(byDay).sort()

  const monthTitle = headerTitle || month.toLocaleString(undefined, { month: 'long', year: 'numeric' })

  const lines: PdfLine[] = []
  lines.push({ kind: 'title', text: normalizeText(`Content Calendar — ${monthTitle}`) })
  lines.push({
    kind: 'subtitle',
    text: normalizeText('Detailed export (full text) • Wavering Wanderers'),
  })
  lines.push({ kind: 'divider' })

  for (const key of dayKeys) {
    const dayDate = new Date(key + 'T12:00:00')
    const dayLabel = dayDate.toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    lines.push({ kind: 'sectionTitle', text: dayLabel })

    const dayItems = byDay[key] || []
    dayItems.sort((a, b) => {
      const da = a.scheduled_at ? new Date(a.scheduled_at).getTime() : 0
      const db = b.scheduled_at ? new Date(b.scheduled_at).getTime() : 0
      return da - db
    })

    for (const it of dayItems) {
      const timeStr = it.scheduled_at
        ? new Date(it.scheduled_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        : ''

      const metaParts = [
        timeStr || null,
        platformLabel(it.platform),
        statusLabel(it.status ? String(it.status) : null),
        it.feature ? String(it.feature) : null,
      ].filter(Boolean)

      lines.push({ kind: 'subtitle', text: normalizeText(metaParts.join(' • ')) })
      lines.push({ kind: 'body', text: normalizeText(it.title || 'Untitled') })

      if (it.caption) lines.push({ kind: 'body', text: normalizeText(it.caption) })

      const tags =
        it.hashtags && it.hashtags.length
          ? it.hashtags.map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ')
          : ''

      if (tags) lines.push({ kind: 'body', text: normalizeText(tags) })

      lines.push({ kind: 'divider' })
    }
  }

  const base =
    filenameBase ||
    `ww-calendar-detailed-${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`

  renderPdfFromLines({
    lines,
    filenameBase: sanitizeFilename(base),
    layout: usedLayout,
  })
}
