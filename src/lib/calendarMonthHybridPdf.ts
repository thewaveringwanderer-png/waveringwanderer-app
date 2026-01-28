// src/lib/calendarMonthHybridPdf.ts
import jsPDF from 'jspdf'

type CalendarStatus = 'planned' | 'draft' | 'scheduled' | 'posted' | string

export type CalendarHybridItem = {
  title: string | null
  caption: string | null
  platform: string | null
  status: CalendarStatus | string | null
  scheduled_at: string | null
  hashtags?: string[] | null
  feature?: string | null
}

function normalizeText(s: string) {
  return (s || '')
    .replace(/\u00A0/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim()
}

function sanitizeFilename(base: string) {
  return (base || 'export')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .toLowerCase()
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

function statusShort(s: string | null) {
  if (!s) return 'Plan'
  if (s === 'planned') return 'Plan'
  if (s === 'draft') return 'Draft'
  if (s === 'scheduled') return 'Sched'
  if (s === 'posted') return 'Posted'
  return s
}

function statusLabel(s: string | null) {
  if (!s) return 'Planned'
  if (s === 'planned') return 'Planned'
  if (s === 'draft') return 'Draft'
  if (s === 'scheduled') return 'Scheduled'
  if (s === 'posted') return 'Posted'
  return s
}

/**
 * IMPORTANT:
 * Avoid toISOString() here — it can shift the day due to UTC conversion.
 */
function dateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function dateKeyFromISO(iso: string) {
  return iso.slice(0, 10)
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

function isInMonth(iso: string, month: Date) {
  const d = new Date(iso)
  return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth()
}

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

function formatMonthTitle(month: Date, headerTitle?: string) {
  return headerTitle || month.toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

function dayIndexLabel(dayKey: string) {
  const d = new Date(dayKey + 'T12:00:00')
  const weekday = d.toLocaleDateString(undefined, { weekday: 'short' })
  const dayNum = d.getDate()
  const monthName = d.toLocaleDateString(undefined, { month: 'short' })
  return `${weekday} ${dayNum} ${monthName}`
}

/**
 * Typings fix:
 * Some jspdf TypeScript defs don’t include getNumberOfPages(), but it exists at runtime.
 * This wrapper keeps TS happy across versions.
 */
function getPageCount(doc: jsPDF): number {
  const anyDoc = doc as any
  if (typeof anyDoc.getNumberOfPages === 'function') return anyDoc.getNumberOfPages()
  if (anyDoc?.internal && typeof anyDoc.internal.getNumberOfPages === 'function') return anyDoc.internal.getNumberOfPages()
  // fallback (should never hit, but keeps things safe)
  return 1
}

export function exportCalendarMonthHybridPdf(args: {
  month: Date
  items: CalendarHybridItem[]
  filenameBase?: string
  headerTitle?: string
  maxItemsPerDayTable?: number
}) {
  const { month, items, filenameBase, headerTitle, maxItemsPerDayTable = 4 } = args

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  // --------------------------
  // PAGE 1 — TABLE / GRID VIEW
  // --------------------------

  const marginX = 36
  const marginTop = 48
  const marginBottom = 36

  const headerH = 46
  const gridX = marginX
  const gridW = pageW - marginX * 2
  const gridY = marginTop + headerH + 10
  const gridH = pageH - gridY - marginBottom

  const cols = 7
  const rows = 6
  const cellW = gridW / cols
  const cellH = gridH / rows

  const days = getMonthGrid(month)
  const title = formatMonthTitle(month, headerTitle)

  // Index items by day for table
  const tableMap: Record<string, CalendarHybridItem[]> = {}
  for (const it of items || []) {
    if (!it.scheduled_at) continue
    const key = it.scheduled_at.slice(0, 10)
    if (!tableMap[key]) tableMap[key] = []
    tableMap[key].push(it)
  }

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text(title, marginX, marginTop + 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(90, 90, 90)
  doc.text('Wavering Wanderers — Content Calendar (Hybrid export)', marginX, marginTop + 34)

  // Weekday labels
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
  for (let c = 0; c <= cols; c++) {
    const x = gridX + c * cellW
    doc.line(x, gridY, x, gridY + rows * cellH)
  }
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
    const dayItems = tableMap[key] || []

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

    const visible = dayItems.slice(0, maxItemsPerDayTable)
    for (let k = 0; k < visible.length; k++) {
      const it = visible[k]
      const platform = platformShort(it.platform)
      const status = statusShort(it.status ? String(it.status) : null)
      const t = normalizeText(it.title || 'Untitled')

      const full = `[${platform}] ${t} (${status})`
      const truncated = truncateToWidth(doc, full, maxTextW)

      const y = startY + k * lineH
      if (y + lineH > cellY + cellH - 6) break
      doc.setTextColor(inMonth ? 30 : 150, inMonth ? 30 : 150, inMonth ? 30 : 150)
      doc.text(truncated, cellX + padX, y)
    }

    if (dayItems.length > maxItemsPerDayTable) {
      const extra = dayItems.length - maxItemsPerDayTable
      const y = startY + visible.length * lineH
      if (y + lineH <= cellY + cellH - 6) {
        doc.setTextColor(120, 120, 120)
        doc.text(`+${extra} more`, cellX + padX, y)
      }
    }
  }

  // --------------------------
  // PAGE 2 — INDEX (Day → Page)
  // --------------------------

  const monthItems = (items || [])
    .filter(it => it.scheduled_at && isInMonth(it.scheduled_at, month))
    .sort((a, b) => {
      const da = a.scheduled_at ? new Date(a.scheduled_at).getTime() : 0
      const db = b.scheduled_at ? new Date(b.scheduled_at).getTime() : 0
      return da - db
    })

  doc.addPage()
  const indexPageNumber = getPageCount(doc)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text(`Index — ${title}`, 56, 70)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(90, 90, 90)
  doc.text('Day jump list (use page numbers to navigate)', 56, 88)

  const dayToPage: Array<{ dayKey: string; label: string; page: number }> = []

  // --------------------------
  // PAGES 3+ — DETAILED TEXT
  // --------------------------

  if (monthItems.length) {
    doc.addPage()

    const dMarginX = 56
    const dTop = 56
    const dBottom = 56
    const maxW = pageW - dMarginX * 2

    let y = dTop

    const ensureSpace = (needed: number) => {
      if (y + needed <= pageH - dBottom) return
      doc.addPage()
      y = dTop
    }

    const writeWrapped = (
      text: string,
      opts?: { size?: number; bold?: boolean; color?: [number, number, number]; gapAfter?: number }
    ) => {
      const size = opts?.size ?? 11
      const bold = opts?.bold ?? false
      const color = opts?.color ?? ([0, 0, 0] as [number, number, number])
      const gapAfter = opts?.gapAfter ?? 10

      const safe = normalizeText(text)
      if (!safe) return

      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      doc.setFontSize(size)
      doc.setTextColor(color[0], color[1], color[2])

      const lines = doc.splitTextToSize(safe, maxW)
      const lineH = Math.max(12, size + 3)

      ensureSpace(lines.length * lineH + gapAfter)

      for (const ln of lines) {
        doc.text(ln, dMarginX, y)
        y += lineH
      }
      y += gapAfter
    }

    const drawDivider = () => {
      ensureSpace(18)
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.8)
      doc.line(dMarginX, y, pageW - dMarginX, y)
      y += 14
    }

    writeWrapped(`Content Calendar — ${title}`, { size: 16, bold: true, gapAfter: 6 })
    writeWrapped(`Detailed export (full text)`, { size: 10, color: [90, 90, 90], gapAfter: 16 })

    const byDay: Record<string, CalendarHybridItem[]> = {}
    for (const it of monthItems) {
      if (!it.scheduled_at) continue
      const k = dateKeyFromISO(it.scheduled_at)
      if (!byDay[k]) byDay[k] = []
      byDay[k].push(it)
    }

    const dayKeys = Object.keys(byDay).sort()

    for (const key of dayKeys) {
      const dayDate = new Date(key + 'T12:00:00')
      const dayLabelFull = dayDate.toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })

      ensureSpace(26)

      dayToPage.push({
        dayKey: key,
        label: dayIndexLabel(key),
        page: getPageCount(doc),
      })

      writeWrapped(dayLabelFull, { size: 12, bold: true, gapAfter: 10 })

      const dayItems = (byDay[key] || []).sort((a, b) => {
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

        writeWrapped(metaParts.join(' • '), { size: 10, color: [80, 80, 80], gapAfter: 6 })
        writeWrapped(it.title || 'Untitled', { size: 12, bold: true, gapAfter: 8 })

        if (it.caption) writeWrapped(it.caption, { size: 11, gapAfter: 10 })

        const tags =
          it.hashtags && it.hashtags.length
            ? it.hashtags.map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ')
            : ''

        if (tags) writeWrapped(tags, { size: 10, color: [90, 90, 90], gapAfter: 10 })

        drawDivider()
      }

      y += 6
    }
  }

  // --------------------------
  // FILL INDEX PAGE (Page 2)
  // --------------------------
  doc.setPage(indexPageNumber)

  const ixX = 56
  let ixY = 120
  const lineH = 12
  const colGap = 28
  const colW = (pageW - ixX * 2 - colGap) / 2

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(40, 40, 40)
  doc.text('Day', ixX, ixY)
  doc.text('Page', ixX + colW - 36, ixY)
  doc.text('Day', ixX + colW + colGap, ixY)
  doc.text('Page', ixX + colW + colGap + colW - 36, ixY)

  ixY += 14
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.8)
  doc.line(ixX, ixY, pageW - ixX, ixY)
  ixY += 14

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(20, 20, 20)

  if (!dayToPage.length) {
    doc.setTextColor(90, 90, 90)
    doc.text('No scheduled items found for this month.', ixX, ixY)
  } else {
    const leftX = ixX
    const rightX = ixX + colW + colGap

    const perCol = Math.ceil(dayToPage.length / 2)
    const left = dayToPage.slice(0, perCol)
    const right = dayToPage.slice(perCol)

    const renderCol = (arr: Array<{ label: string; page: number }>, x: number, startY: number) => {
      let y = startY
      for (const row of arr) {
        const dayText = row.label
        const pageText = `p.${row.page}`
        const dayTrunc = truncateToWidth(doc, dayText, colW - 52)

        doc.setTextColor(20, 20, 20)
        doc.text(dayTrunc, x, y)

        doc.setTextColor(90, 90, 90)
        doc.text(pageText, x + colW - 36, y)

        y += lineH
      }
    }

    renderCol(left.map(d => ({ label: d.label, page: d.page })), leftX, ixY)
    renderCol(right.map(d => ({ label: d.label, page: d.page })), rightX, ixY)
  }

  const base =
    filenameBase ||
    `ww-calendar-hybrid-${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`

  doc.save(`${sanitizeFilename(base)}.pdf`)
}
