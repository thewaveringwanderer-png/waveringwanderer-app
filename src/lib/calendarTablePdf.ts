// src/lib/calendarTablePdf.ts
import jsPDF from 'jspdf'

type CalendarStatus = 'idea' | 'scheduled' | 'posted'

export type CalendarTableItem = {
  title: string | null
  platform: string | null
  status: CalendarStatus | string | null
  scheduled_at: string | null
}

function normalizeText(s: string) {
  return (s || '')
    .replace(/\u00A0/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim()
}

function platformShort(p: string | null) {
  switch (p) {
    case 'instagram':
      return 'IG'
    case 'tiktok':
      return 'TT'
    case 'youtube':
      return 'YT'
    case 'facebook':
      return 'FB'
    case 'x':
      return 'X'
    default:
      return p ? p.slice(0, 2).toUpperCase() : '—'
  }
}

function statusShort(s: string | null) {
  if (!s || s === 'idea') return 'Idea'
  if (s === 'scheduled') return 'Sched'
  if (s === 'posted') return 'Posted'
  return s
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getMonthGrid(currentMonth: Date): Date[] {
  const firstOfMonth = startOfMonth(currentMonth)
  const startDay = firstOfMonth.getDay() // 0=Sun
  const start = new Date(firstOfMonth)
  // Monday-first
  const mondayIndex = (startDay + 6) % 7
  start.setDate(firstOfMonth.getDate() - mondayIndex)

  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  return days
}

function sanitizeFilename(base: string) {
  return (base || 'export')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .toLowerCase()
}

export function exportCalendarMonthTablePdf(args: {
  month: Date
  items: CalendarTableItem[]
  filenameBase?: string
  headerTitle?: string
  maxItemsPerDay?: number
  doc?: jsPDF
  save?: boolean
}) {

  const {
    month,
    items,
    filenameBase,
    headerTitle,
    maxItemsPerDay = 4,
  } = args

const doc = args.doc ?? new jsPDF({ unit: 'pt', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  // Layout
  const marginX = 36
  const marginTop = 48
  const marginBottom = 36

  const headerH = 46
  const weekdayH = 18

  const gridX = marginX
  const gridW = pageW - marginX * 2
  const gridY = marginTop + headerH + 10
  const gridH = pageH - gridY - marginBottom

  const cols = 7
  const rows = 6

  const cellW = gridW / cols
  const cellH = gridH / rows

  const days = getMonthGrid(month)

  // Index items by day
  const map: Record<string, CalendarTableItem[]> = {}
  for (const it of items) {
    if (!it.scheduled_at) continue
    const key = it.scheduled_at.slice(0, 10)
    if (!map[key]) map[key] = []
    map[key].push(it)
  }

  // Header
  const title =
    headerTitle ||
    month.toLocaleString(undefined, { month: 'long', year: 'numeric' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text(title, marginX, marginTop + 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(90, 90, 90)
  doc.text('Wavering Wanderers — Content Calendar', marginX, marginTop + 34)

  // Weekday labels (Mon..Sun)
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(70, 70, 70)

  for (let c = 0; c < cols; c++) {
    const x = gridX + c * cellW
    doc.text(weekdays[c], x + 6, gridY - 6)
  }

  // Grid lines
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.8)

  // Vertical lines
  for (let c = 0; c <= cols; c++) {
    const x = gridX + c * cellW
    doc.line(x, gridY, x, gridY + rows * cellH)
  }

  // Horizontal lines
  for (let r = 0; r <= rows; r++) {
    const y = gridY + r * cellH
    doc.line(gridX, y, gridX + cols * cellW, y)
  }

  // Cell content
  for (let i = 0; i < days.length; i++) {
    const d = days[i]
    const r = Math.floor(i / 7)
    const c = i % 7

    const cellX = gridX + c * cellW
    const cellY = gridY + r * cellH

    const inMonth = d.getMonth() === month.getMonth()
    const key = dateKey(d)
    const dayItems = map[key] || []

    // Day number
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(inMonth ? 0 : 150, inMonth ? 0 : 150, inMonth ? 0 : 150)
    doc.text(String(d.getDate()), cellX + 6, cellY + 14)

    // Items
    const startY = cellY + 28
    const lineH = 11
    const padX = 6
    const maxTextW = cellW - padX * 2

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)

    const visible = dayItems.slice(0, maxItemsPerDay)

    for (let k = 0; k < visible.length; k++) {
      const it = visible[k]
      const platform = platformShort(it.platform)
      const status = statusShort(it.status || null)
      const title = normalizeText(it.title || 'Untitled')

      // Compose one line: [IG] Title (Sched)
      const left = `[${platform}] `
      const right = ` (${status})`
      const full = `${left}${title}${right}`

      // Truncate to fit
      const truncated = truncateToWidth(doc, full, maxTextW)

      const y = startY + k * lineH
      if (y + lineH > cellY + cellH - 6) break // safety
      doc.setTextColor(inMonth ? 30 : 150, inMonth ? 30 : 150, inMonth ? 30 : 150)
      doc.text(truncated, cellX + padX, y)
    }

    if (dayItems.length > maxItemsPerDay) {
      const extra = dayItems.length - maxItemsPerDay
      const y = startY + visible.length * lineH
      if (y + lineH <= cellY + cellH - 6) {
        doc.setTextColor(120, 120, 120)
        doc.text(`+${extra} more`, cellX + padX, y)
      }
    }
  }

  const base =
    filenameBase ||
    `ww-calendar-${month.getFullYear()}-${String(month.getMonth() + 1).padStart(
      2,
      '0'
    )}`

  if (args.save !== false) {
  doc.save(`${sanitizeFilename(base)}.pdf`)
}
return doc

}

// --- small helper to truncate text to cell width ---
function truncateToWidth(doc: jsPDF, text: string, maxWidth: number) {
  const w = doc.getTextWidth(text)
  if (w <= maxWidth) return text

  const ellipsis = '…'
  let lo = 0
  let hi = text.length

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const candidate = text.slice(0, mid).trimEnd() + ellipsis
    if (doc.getTextWidth(candidate) <= maxWidth) lo = mid + 1
    else hi = mid
  }

  const cut = Math.max(0, lo - 1)
  return text.slice(0, cut).trimEnd() + ellipsis
}
