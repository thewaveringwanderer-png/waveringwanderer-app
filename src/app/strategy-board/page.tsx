// src/app/momentumboard/page.tsx
'use client'

import { useState, useEffect, useMemo, Fragment, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Toaster, toast } from 'sonner'
import {
  CalendarDays,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Maximize2,
  Clipboard,
  FileText,
  X,
  TrashIcon,
} from 'lucide-react'
import { Trash } from 'lucide-react'


import { DragDropContext, Droppable, Draggable, type DropResult, type DragUpdate } from '@hello-pangea/dnd'

// ✅ Shared card UI (tile/preview)
import ContentCard from '@/components/ww/ContentCard'

// ✅ Shared modal (unified edit/caption/pdf)
import ContentCardModal, { type ContentCard as SharedContentCard } from '@/components/ww/ContentCardModal'

// ✅ Universal PDF engine
import { type PdfLine, normalizeText, renderPdfFromLines } from '@/lib/wwPdf'

// ✅ WW profile hook (fallback context – does NOT change your storage yet)
import { useWwProfile } from '@/hooks/useWwProfile'

// ---------- Supabase ----------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ---------- Types ----------
type ContentCalendarItem = {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  title: string | null
  caption: string | null
  platform: string | null
  status: string | null
  scheduled_at: string | null
  hashtags: string[] | null
  feature: string | null
  metadata: any
  assets: any
  in_momentum: boolean
}

type FeatureFilter = 'all' | 'calendar' | 'trends' | 'captions' | 'identity'
type PlatformFilter = 'all' | 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x'
type SortOrder = 'newest' | 'oldest'

// ---------- Helpers ----------
function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getMonthGrid(currentMonth: Date): Date[] {
  const firstOfMonth = startOfMonth(currentMonth)
  const startDay = firstOfMonth.getDay() // 0 = Sun
  const start = new Date(firstOfMonth)
  // Monday as first day of week
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

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function statusDotColor(status: string | null | undefined) {
  // support legacy "idea" plus calendar-style statuses
  switch ((status || '').toString()) {
    case 'idea':
    case 'planned':
      return 'bg-ww-violet'
    case 'draft':
      return 'bg-sky-300'
    case 'scheduled':
      return 'bg-amber-400'
    case 'posted':
      return 'bg-emerald-400'
    default:
      return 'bg-white/30'
  }
}

function statusLabel(status: string | null | undefined) {
  const s = (status || '').toString()
  if (!s || s === 'idea' || s === 'planned') return 'Planned'
  if (s === 'draft') return 'Draft'
  if (s === 'scheduled') return 'Scheduled'
  if (s === 'posted') return 'Posted'
  return s
}

function platformLabel(p: string | null | undefined) {
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

function featureLabel(f: string | null | undefined) {
  switch (f) {
    case 'calendar':
      return 'Calendar'
    case 'trends':
      return 'Trend Finder'
    case 'captions':
      return 'Captions'
    case 'identity':
      return 'Identity Kit'
    default:
      return 'Other'
  }
}

function featureBadgeClass(f: string | null | undefined) {
  switch (f) {
    case 'calendar':
      return 'bg-sky-500/15 text-sky-300 border-sky-500/40'
    case 'trends':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
    case 'captions':
      return 'bg-rose-500/15 text-rose-300 border-rose-500/40'
    case 'identity':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/40'
    default:
      return 'bg-white/5 text-white/50 border-white/15'
  }
}

function csvEscape(field: string | null | undefined): string {
  const value = (field ?? '').toString()
  const escaped = value.replace(/"/g, '""')
  return `"${escaped}"`
}

/**
 * ✅ Explicit mapping to shared modal type
 * Avoids dangerous `as unknown as` casts.
 */
function toSharedCard(it: ContentCalendarItem): SharedContentCard {
  return {
    id: it.id,
    user_id: it.user_id,
    created_at: it.created_at,
    updated_at: it.updated_at,
    title: it.title,
    caption: it.caption,
    platform: it.platform,
    status: it.status,
    scheduled_at: it.scheduled_at,
    hashtags: it.hashtags,
    feature: it.feature,
    metadata: it.metadata,
    assets: it.assets,
    in_momentum: it.in_momentum,
  } as SharedContentCard
}

// ---------- PDF mapping ----------
function buildMomentumPdfLines(
  item: ContentCalendarItem,
  profileFallback?: { artistName?: string; audience?: string; goal?: string }
): PdfLine[] {
  const title = normalizeText(item.title || 'Content card')

  const dateStr = item.scheduled_at
    ? new Date(item.scheduled_at).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Unscheduled'

  const meta = `${dateStr} • ${platformLabel(item.platform)} • ${statusLabel(item.status)} • ${featureLabel(
    item.feature
  )}`

  const lines: PdfLine[] = [
    { kind: 'title', text: title },
    { kind: 'subtitle', text: normalizeText(meta) },
    { kind: 'divider' },
  ]

  lines.push({ kind: 'sectionTitle', text: 'Caption / Notes' })
  lines.push({
    kind: 'body',
    text: normalizeText(item.caption || 'No caption/notes yet.'),
  })

  const tags =
    item.hashtags && item.hashtags.length
      ? item.hashtags.map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ')
      : ''

  if (tags) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Hashtags' })
    lines.push({ kind: 'body', text: normalizeText(tags) })
  }

  // Context (metadata first, then WW profile fallback)
  const m = item.metadata
  const metaArtist =
    m?.artistName || m?.artist || m?.profile?.artistName || m?.profile?.artist_name
  const metaGoal = m?.goal || m?.profile?.goal
  const metaAudience = m?.audience || m?.profile?.audience

  const artist = metaArtist || profileFallback?.artistName
  const goal = metaGoal || profileFallback?.goal
  const audience = metaAudience || profileFallback?.audience

  const metaLines: string[] = []
  if (artist) metaLines.push(`Artist: ${artist}`)
  if (goal) metaLines.push(`Goal: ${goal}`)
  if (audience) metaLines.push(`Audience: ${audience}`)

  if (metaLines.length) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Context' })
    for (const t of metaLines) lines.push({ kind: 'body', text: normalizeText(t) })
  }

  return lines
}

// ---------- Component ----------
export default function StrategyBoardPage() {
    useEffect(() => {
    return () => {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    }
  }, [])

  const { profile } = useWwProfile() // ✅ fallback only; does not enforce storage changes

  const [items, setItems] = useState<ContentCalendarItem[]>([])
  const [loading, setLoading] = useState(true)
  


  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
// ---------- Clear current month (ONLY scheduled items in this month) ----------
async function handleClearCurrentMonth() {
  const month = currentMonth.getMonth()
  const year = currentMonth.getFullYear()

  const inMonth = calendarItems.filter(it => {
    if (!it.scheduled_at) return false
    const d = new Date(it.scheduled_at)
    return d.getFullYear() === year && d.getMonth() === month
  })

  if (!inMonth.length) {
    toast.info('No scheduled items in this month to clear')
    return
  }

  const ok = window.confirm(`Clear ${inMonth.length} scheduled item(s) from this month? They will return to the idea pool (unscheduled).`)
  if (!ok) return

    // Optimistic UI
  const prevItems = items
  const ids = new Set(inMonth.map(x => x.id))
  setItems(prev => prev.map(it => (ids.has(it.id) ? { ...it, scheduled_at: null, status: 'planned' } : it)))

  try {
    const { error } = await supabase
      .from('content_calendar')
      .update({ scheduled_at: null, status: 'planned' })
      .in('id', Array.from(ids))

    if (error) throw new Error(error.message || 'Could not clear month')
    toast.success('Moved month back to pool ✅')
  } catch (e: any) {
    console.error('[momentum-clear-month] error', e)
    toast.error(e?.message || 'Could not clear month')
    setItems(prevItems) // ✅ revert
  }

}
  // Filters / sort / search
  const [featureFilter, setFeatureFilter] = useState<FeatureFilter>('all')
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [search, setSearch] = useState('')

  // Modals & interactions
  const [expandedItem, setExpandedItem] = useState<SharedContentCard | null>(null)
  const [expandedDay, setExpandedDay] = useState<Date | null>(null)
  const [exportingPressId, setExportingPressId] = useState<string | null>(null)
  const [exportingPdfId, setExportingPdfId] = useState<string | null>(null)
  // Undo delete
  const [pendingDelete, setPendingDelete] = useState<ContentCalendarItem | null>(null)
  const deleteTimerRef = useRef<any>(null)

  // Click-to-schedule: item armed from idea pool
  const [armedItemId, setArmedItemId] = useState<string | null>(null)

  // Visual: highlight idea pool as drop target + preview slot index
  const [draggingToPool, setDraggingToPool] = useState(false)
  const [poolDropIndex, setPoolDropIndex] = useState<number | null>(null)
const [showTrash, setShowTrash] = useState(false)
const [trashActive, setTrashActive] = useState(false)

  // Refs for scrolling + highlight
  const poolContainerRef = useRef<HTMLDivElement | null>(null)
  const poolItemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [recentlyDroppedId, setRecentlyDroppedId] = useState<string | null>(null)
 const pendingDeleteTimers = useRef<Record<string, any>>({})
const pendingDeleteItems = useRef<Record<string, ContentCalendarItem>>({})
 
const [recentlyScheduledDayKey, setRecentlyScheduledDayKey] = useState<string | null>(null)

  // ---------- Load data ----------
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError || !userData?.user) {
          setItems([])
          setLoading(false)
          return
        }

        // ✅ Hub rule: only show items explicitly sent to Momentum Board
        const { data, error } = await supabase
          .from('content_calendar')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('in_momentum', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('[momentum-board] select error', error)
          toast.error(error.message || 'Could not load Momentum Board')
          setItems([])
          setLoading(false)
          return
        }

        if (!cancelled) setItems((data as ContentCalendarItem[]) || [])
      } catch (e: any) {
        console.error('[momentum-board] load error', e)
        toast.error(e?.message || 'Could not load Momentum Board')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  // Scroll to + glow recently-dropped item
  useEffect(() => {
    if (!recentlyDroppedId) return
    const container = poolContainerRef.current
    const el = poolItemRefs.current[recentlyDroppedId]
    if (container && el) {
      const containerRect = container.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      const offset = elRect.top - containerRect.top + container.scrollTop - 32
      container.scrollTo({ top: offset, behavior: 'smooth' })
    }
    const timeout = setTimeout(() => setRecentlyDroppedId(null), 1600)
    return () => clearTimeout(timeout)
  }, [recentlyDroppedId, items])
  useEffect(() => {
  if (!recentlyScheduledDayKey) return
  const t = setTimeout(() => setRecentlyScheduledDayKey(null), 1600)
  return () => clearTimeout(t)
}, [recentlyScheduledDayKey])


  // ---------- Derived data ----------
  const days = useMemo(() => getMonthGrid(currentMonth), [currentMonth])

  const poolItems = useMemo(() => items.filter(it => !it.scheduled_at), [items])
  const calendarItems = useMemo(() => items.filter(it => it.scheduled_at), [items])

  const filteredPoolItems = useMemo(() => {
    let list = [...poolItems]

    if (featureFilter !== 'all') list = list.filter(it => (it.feature || '') === featureFilter)
    if (platformFilter !== 'all') list = list.filter(it => (it.platform || '') === platformFilter)

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        it =>
          (it.title || '').toLowerCase().includes(q) || (it.caption || '').toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => {
      const da = new Date(a.created_at).getTime()
      const db = new Date(b.created_at).getTime()
      return sortOrder === 'newest' ? db - da : da - db
    })

    return list
  }, [poolItems, featureFilter, platformFilter, sortOrder, search])

  const calendarItemsByDay = useMemo(() => {
    const map: Record<string, ContentCalendarItem[]> = {}
    for (const it of calendarItems) {
      if (!it.scheduled_at) continue
      const key = it.scheduled_at.slice(0, 10)
      if (!map[key]) map[key] = []
      map[key].push(it)
    }
    return map
  }, [calendarItems])

  // ---------- Navigation ----------
  function goPrevMonth() {
    const d = new Date(currentMonth)
    d.setMonth(d.getMonth() - 1)
    setCurrentMonth(startOfMonth(d))
  }

  function goNextMonth() {
    const d = new Date(currentMonth)
    d.setMonth(d.getMonth() + 1)
    setCurrentMonth(startOfMonth(d))
  }

  // ---------- Supabase update helpers ----------
  async function updateItemOnServer(
    id: string,
    patch: Partial<
      Pick<
        ContentCalendarItem,
        'status' | 'scheduled_at' | 'title' | 'caption' | 'platform' | 'hashtags' | 'in_momentum'
      >
    >
  ) {
    const { data, error } = await supabase
      .from('content_calendar')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('[momentum-board] update error', error)
      throw new Error(error.message || 'Could not update card')
    }

    const updated = data as ContentCalendarItem
    setItems(prev => prev.map(it => (it.id === id ? { ...it, ...updated } : it)))
    return updated
  }

  function patchLocalItem(id: string, patch: Partial<ContentCalendarItem>) {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, ...patch } : it)))
    // Keep modal instantly in sync if it's currently open on this item
    setExpandedItem(prev => (prev && prev.id === id ? ({ ...prev, ...patch } as any) : prev))
  }

  async function assignArmedItemToDate(day: Date) {
    if (!armedItemId) return
    const item = items.find(it => it.id === armedItemId)
    if (!item) {
      setArmedItemId(null)
      return
    }

    const iso = new Date(dateKey(day) + 'T12:00:00').toISOString()

    // optimistic UI
    setItems(prev =>
      prev.map(it =>
        it.id === item.id
          ? { ...it, scheduled_at: iso, status: item.status === 'posted' ? 'posted' : 'scheduled' }
          : it
      )
    )

    try {
      await updateItemOnServer(item.id, {
        scheduled_at: iso,
        status: item.status === 'posted' ? 'posted' : 'scheduled',
      })
      setRecentlyScheduledDayKey(dateKey(day))

      toast.success('Idea scheduled from pool ✅')
    } catch (e: any) {
      toast.error(e?.message || 'Could not schedule idea')
    } finally {
      setArmedItemId(null)
    }
  }

  // ---------- Drag & Drop (calendar <-> pool) ----------
  function handleDragUpdate(update: DragUpdate) {
    const dest = update.destination
    if (dest && dest.droppableId === 'idea-pool') {
      setDraggingToPool(true)
      setPoolDropIndex(dest.index)
    } else {
      setDraggingToPool(false)
      setPoolDropIndex(null)
    }
  }

  async function handleBoardDragEnd(result: DropResult) {

    setDraggingToPool(false)
    setPoolDropIndex(null)

    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const draggedItem = items.find(it => it.id === draggableId)
    if (!draggedItem) return

    const sourceId = source.droppableId
    const destId = destination.droppableId


    // Pool -> Day disabled (click + select date only)
    if (sourceId === 'idea-pool' && destId.startsWith('day-')) return

    // Day -> Pool (unschedule)
    if (sourceId.startsWith('day-') && destId === 'idea-pool') {
      setItems(prev =>
        prev.map(it => (it.id === draggedItem.id ? { ...it, scheduled_at: null, status: 'planned' } : it))
      )
      setRecentlyDroppedId(draggedItem.id)

      try {
        await updateItemOnServer(draggedItem.id, { scheduled_at: null, status: 'planned' })
      } catch (e: any) {
        toast.error(e?.message || 'Could not move card')
      }
      return
    }

    // Day -> Day (reschedule)
    if (sourceId.startsWith('day-') && destId.startsWith('day-')) {
      const dayKey = destId.replace('day-', '')
      const newDate = new Date(dayKey + 'T12:00:00')

      setItems(prev =>
        prev.map(it =>
          it.id === draggedItem.id
            ? {
                ...it,
                scheduled_at: newDate.toISOString(),
                status:
                  draggedItem.status === 'planned' || draggedItem.status === 'idea'
                    ? 'scheduled'
                    : draggedItem.status || 'scheduled',
              }
            : it
        )
      )

      try {
        await updateItemOnServer(draggedItem.id, {
          scheduled_at: newDate.toISOString(),
          status:
            draggedItem.status === 'planned' || draggedItem.status === 'idea'
              ? 'scheduled'
              : draggedItem.status || 'scheduled',
        })
      } catch (e: any) {
        toast.error(e?.message || 'Could not move card')
      }
    }
  }
async function handleClearIdeaPool() {
  // only clears UNSCHEDULED items in Momentum Board
  const toClear = filteredPoolItems
  if (!toClear.length) return toast.info('No ideas in the pool to clear')

  const ok = window.confirm(`Clear ${toClear.length} idea(s) from the pool? This cannot be undone.`)
  if (!ok) return

  try {
    const ids = toClear.map(x => x.id)

    // delete from DB
    const { error } = await supabase.from('content_calendar').delete().in('id', ids)
    if (error) throw new Error(error.message || 'Could not clear idea pool')

    // update UI
    setItems(prev => prev.filter(it => !ids.includes(it.id)))
    toast.success('Idea pool cleared ✅')
  } catch (e: any) {
    console.error('[momentum-clear-pool] error', e)
    toast.error(e?.message || 'Could not clear idea pool')
  }
}

  // ---------- CSV Export: Pool ----------
  function handleExportPoolCsv() {
    const pool = filteredPoolItems
    if (!pool.length) {
      toast.info('No ideas in the pool to export with current filters')
      return
    }

    const header = ['Feature', 'Platform', 'Status', 'Title', 'Caption', 'Hashtags', 'Created At', 'Last Updated']
    const rows = pool.map(item => {
      const hashtagsJoined = (item.hashtags || []).map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ')
      return [
        csvEscape(featureLabel(item.feature)),
        csvEscape(platformLabel(item.platform)),
        csvEscape(statusLabel(item.status)),
        csvEscape(item.title),
        csvEscape(item.caption),
        csvEscape(hashtagsJoined),
        csvEscape(item.created_at ? new Date(item.created_at).toISOString() : ''),
        csvEscape(item.updated_at ? new Date(item.updated_at).toISOString() : ''),
      ].join(',')
    })

    const csv = [header.join(','), ...rows].join('\r\n')

    try {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')

      const a = document.createElement('a')
      a.href = url
      a.download = `ww-momentum-idea-pool-${yyyy}-${mm}-${dd}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Idea pool exported as CSV ✅')
    } catch (e: any) {
      console.error('[momentum-export-pool-csv] error', e)
      toast.error(e?.message || 'Could not export idea pool')
    }
  }

  // ---------- CSV Export: Current Month ----------
  function handleExportMonthCsv() {
    

    const month = currentMonth.getMonth()
    const year = currentMonth.getFullYear()

    const inMonth = calendarItems.filter(it => {
      if (!it.scheduled_at) return false
      const d = new Date(it.scheduled_at)
      return d.getFullYear() === year && d.getMonth() === month
    })

    if (!inMonth.length) {
      toast.info('No scheduled items in this month to export')
      return
    }

    const header = ['Date', 'Feature', 'Platform', 'Status', 'Title', 'Caption', 'Hashtags']
    const rows = inMonth.map(item => {
      const d = item.scheduled_at ? new Date(item.scheduled_at) : null
      const dateStr = d ? d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : ''

      const hashtagsJoined = (item.hashtags || []).map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ')
      return [
        csvEscape(dateStr),
        csvEscape(featureLabel(item.feature)),
        csvEscape(platformLabel(item.platform)),
        csvEscape(statusLabel(item.status)),
        csvEscape(item.title),
        csvEscape(item.caption),
        csvEscape(hashtagsJoined),
      ].join(',')
    })

    const monthName = currentMonth
      .toLocaleString('en-GB', { month: 'short', year: 'numeric' })
      .replace(' ', '-')

    const csv = [header.join(','), ...rows].join('\r\n')

    try {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `ww-momentum-month-${monthName}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Month view exported as CSV ✅')
    } catch (e: any) {
      console.error('[momentum-export-month-csv] error', e)
      toast.error(e?.message || 'Could not export month view')
    }
  }
    // ---------- Delete (single) with Undo ----------
async function handleDeleteCard(id: string) {
  const item = items.find(it => it.id === id)
  if (!item) return

  // If already pending, don't double-schedule
  if (pendingDeleteTimers.current[id]) return

  // optimistic remove
  pendingDeleteItems.current[id] = item
  setItems(prev => prev.filter(it => it.id !== id))

  // show undo toast (we delete after a short delay)
  toast('Card deleted', {
    description: 'Undo?',
    action: {
      label: 'Undo',
      onClick: () => {
        // cancel deletion
        const t = pendingDeleteTimers.current[id]
        if (t) clearTimeout(t)
        delete pendingDeleteTimers.current[id]

        const restore = pendingDeleteItems.current[id]
        delete pendingDeleteItems.current[id]

        if (restore) {
          setItems(prev => [restore, ...prev])
          toast.success('Restored ✅')
        }
      },
    },
  })

  // schedule real delete
  pendingDeleteTimers.current[id] = setTimeout(async () => {
    try {
      const { error } = await supabase.from('content_calendar').delete().eq('id', id)
      if (error) throw error
      toast.success('Deleted ✅')
    } catch (e: any) {
      console.error('[momentum-delete-one] error', e)
      toast.error(e?.message || 'Could not delete card')

      // revert if delete failed
      const restore = pendingDeleteItems.current[id]
      if (restore) setItems(prev => [restore, ...prev])
    } finally {
      delete pendingDeleteTimers.current[id]
      delete pendingDeleteItems.current[id]
    }
  }, 5000)
}



  

  // ---------- Press-kit style export ----------
  async function handleExportPressKit(item: ContentCalendarItem) {
    setExportingPressId(item.id)
    try {
      const meta = item.metadata || {}

      const artistName =
        meta.artistName ||
        meta.artist ||
        meta.profile?.artistName ||
        profile.artistName ||
        'Artist'

      const audience = meta.audience || meta.profile?.audience || profile.audience || ''
      const goal = meta.goal || meta.profile?.goal || profile.goal || ''

      const campaignName =
        meta.campaign_name ||
        meta.campaign ||
        (item.feature === 'identity' ? 'Identity-driven campaign' : '')

      const scheduledDate = item.scheduled_at
        ? new Date(item.scheduled_at).toLocaleString('en-GB', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Not scheduled'

      const hashtagsBlock =
        item.hashtags && item.hashtags.length
          ? item.hashtags.map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ')
          : ''

      const lines: string[] = []
      lines.push('WAVERING WANDERERS • CONTENT PRESS KIT')
      lines.push('====================================')
      lines.push('')
      lines.push(`Artist: ${artistName}`)
      lines.push(`Platform: ${platformLabel(item.platform)}`)
      lines.push(`Source feature: ${featureLabel(item.feature)}`)
      lines.push(`Status: ${statusLabel(item.status)}`)
      lines.push(`Scheduled: ${scheduledDate}`)
      if (audience) lines.push(`Audience focus: ${audience}`)
      if (goal) lines.push(`Primary goal: ${goal}`)
      if (campaignName) lines.push(`Campaign: ${campaignName}`)
      lines.push('')
      lines.push('Title')
      lines.push('-----')
      lines.push(item.title || 'Untitled idea')
      lines.push('')
      if (item.caption) {
        lines.push('Caption')
        lines.push('-------')
        lines.push(item.caption)
        lines.push('')
      }
      if (hashtagsBlock) {
        lines.push('Hashtags')
        lines.push('--------')
        lines.push(hashtagsBlock)
        lines.push('')
      }
      if (meta && Object.keys(meta).length > 0) {
        lines.push('Notes / Metadata')
        lines.push('----------------')
        try {
          lines.push(JSON.stringify(meta, null, 2))
        } catch {}
        lines.push('')
      }
      lines.push('Ready to drop into: EPK, Google Doc, or PDF layout.')

      await navigator.clipboard.writeText(lines.join('\n'))
      toast.success('Press-kit text copied to clipboard ✅')
    } catch (e: any) {
      console.error('[momentum-presskit-export] error', e)
      toast.error(e?.message || 'Could not copy press-kit text')
    } finally {
      setExportingPressId(null)
    }
  }

  // ---------- PDF export ----------
  async function handleExportPdf(item: ContentCalendarItem) {
    setExportingPdfId(item.id)
    try {
      const lines = buildMomentumPdfLines(item, {
        artistName: profile.artistName,
        audience: profile.audience,
        goal: profile.goal,
      })

      const base =
        (item.title && item.title.trim()) ||
        (item.scheduled_at ? item.scheduled_at.slice(0, 10) : '') ||
        `momentum-card-${item.id.slice(0, 8)}`

      renderPdfFromLines({ lines, filenameBase: base })
      toast.success('Card exported as PDF ✅')
    } catch (e: any) {
      console.error('[momentum-pdf] error', e)
      toast.error(e?.message || 'Could not export card')
    } finally {
      setExportingPdfId(null)
    }
  }

  // ---------- Day click ----------
  function handleDayClick(day: Date) {
    if (armedItemId) assignArmedItemToDate(day)
    else setExpandedDay(day)
  }

  // ---------- JSX ----------
  return (
    <main className="min-h-screen bg-black text-white">
      <Toaster position="top-center" richColors />

      <section className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
              <CalendarDays className="w-7 h-7 text-ww-violet" />
              Momentum Board
            </h1>
            <p className="text-white/70 max-w-xl mt-1">
              Click an idea in the pool, then tap a date to send it there. Drag cards already on the
              calendar to tweak schedule.
            </p>
            {armedItemId && (
  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-ww-violet/40 bg-ww-violet/10 px-3 py-1 text-xs text-ww-violet shadow-[0_0_18px_rgba(186,85,211,0.35)]">
    <span>Idea selected — click a date to schedule</span>
    <button
      type="button"
      onClick={() => setArmedItemId(null)}
      className="ml-1 inline-flex items-center justify-center w-6 h-6 rounded-full border border-white/15 text-white/70 hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white transition"
      aria-label="Cancel date selection"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
)}

            <p className="text-xs text-white/45 mt-2">
              Only items you’ve sent to the Momentum Board appear here — this keeps your hub intentional.
            </p>
          </div>
        </div>

        <DragDropContext
  onDragStart={() => {
    setShowTrash(true)
    setTrashActive(false)
  }}
  onDragUpdate={update => {
    handleDragUpdate(update)
    setTrashActive(!!update.destination && update.destination.droppableId === 'trash-bin')
  }}
  onDragEnd={result => {
  setTrashActive(false)
  setShowTrash(false)

  if (result.destination?.droppableId === 'trash-bin') {
    void handleDeleteCard(result.draggableId)
    return
  }

  void handleBoardDragEnd(result)
}}
>


          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
            {/* IDEA POOL */}
            <section className="rounded-3xl border border-white/10 bg-black/80 p-4 md:p-5 flex flex-col">
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap sm:flex-nowrap">

                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">Idea pool</p>
                  <h2 className="text-lg font-semibold">Unscheduled concepts</h2>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">

                  <button
                    type="button"
                    onClick={handleExportPoolCsv}
                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-white/15 text-[0.7rem] text-white/80 hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] transition"
                  >
                    <Download className="w-3 h-3" />
                    <span className="hidden sm:inline">Pool CSV</span>
                  </button>
                  <button
  type="button"
  onClick={handleClearIdeaPool}
  className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-white/15 text-[0.7rem] text-white/80 hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] transition"
>
  <X className="w-3 h-3" />
  <span className="hidden sm:inline">Clear pool</span>
</button>

              

                </div>
              {/* TRASH BIN (always mounted; only visually toggled) */}
<div
  className={[
    'fixed inset-x-0 bottom-4 z-40 flex justify-center pointer-events-none transition-all duration-150',
    showTrash ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
  ].join(' ')}
>
  <Droppable droppableId="trash-bin">
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className={[
          'pointer-events-auto w-[240px] rounded-2xl border px-4 py-3 text-center text-sm',
          snapshot.isDraggingOver || trashActive
            ? 'border-rose-400/70 bg-rose-500/15 text-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.45)]'
            : 'border-white/15 bg-black/70 text-white/70',
        ].join(' ')}
      >
        Drop here to delete
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</div>



              </div>

              {/* Filters */}
              <div className="space-y-2 mb-3">
                <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-white/60">
                  <span className="inline-flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    Filters
                  </span>

                  <select
                    value={featureFilter}
                    onChange={e => setFeatureFilter(e.target.value as FeatureFilter)}
                    className="bg-black border border-white/15 rounded-full px-2 py-1 hover:border-ww-violet hover:bg-ww-violet/10 focus:outline-none focus:border-ww-violet"
                  >
                    <option value="all">All features</option>
                    <option value="calendar">Calendar</option>
                    <option value="trends">Trend Finder</option>
                    <option value="captions">Captions</option>
                    <option value="identity">Identity Kit</option>
                  </select>

                  <select
                    value={platformFilter}
                    onChange={e => setPlatformFilter(e.target.value as PlatformFilter)}
                    className="bg-black border border-white/15 rounded-full px-2 py-1 hover:border-ww-violet hover:bg-ww-violet/10 focus:outline-none focus:border-ww-violet"
                  >
                    <option value="all">All platforms</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="x">X / Twitter</option>
                  </select>

                  <select
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value as SortOrder)}
                    className="bg-black border border-white/15 rounded-full px-2 py-1 hover:border-ww-violet hover:bg-ww-violet/10 focus:outline-none focus:border-ww-violet"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </div>

                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by title or caption…"
                  className="w-full px-3 py-1.5 rounded-full bg-black border border-white/15 text-xs text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                />
              </div>

              {/* Pool list */}
              <Droppable droppableId="idea-pool">
                {provided => (
                  <div
                    ref={el => {
                      provided.innerRef(el)
                      poolContainerRef.current = el
                    }}
                    {...provided.droppableProps}
                    className={`mt-1 space-y-2 overflow-y-auto pr-1 rounded-2xl border ${
                      draggingToPool
                        ? 'border-ww-violet/70 bg-ww-violet/10 shadow-[0_0_18px_rgba(186,85,211,0.5)]'
                        : 'border-transparent'
                    }`}
                    style={{ maxHeight: '72vh' }}
                  >
                    {filteredPoolItems.map((item, idx) => {
                      const isArmed = armedItemId === item.id
                      const isRecentlyDropped = recentlyDroppedId === item.id

                      const hashtagsPreview =
                        item.hashtags && item.hashtags.length
                          ? item.hashtags
                              .slice(0, 3)
                              .map(h => (h.startsWith('#') ? h : `#${h}`))
                              .join(' ') + (item.hashtags.length > 3 ? ' …' : '')
                          : ''

                      return (
                        <Draggable key={item.id} draggableId={item.id} index={idx} isDragDisabled={true}>
                          {dragProvided => (
                            <Fragment>
                              {poolDropIndex === idx && (
                                <div className="h-2 rounded-xl bg-ww-violet/30 transition-all" />
                              )}
                              provided.placeholder

                              <div
  ref={el => {
    dragProvided.innerRef(el)
    if (el) poolItemRefs.current[item.id] = el
  }}
  {...dragProvided.draggableProps}
  className="relative"

>
  <button
  type="button"
  onClick={e => {
    e.stopPropagation()
    handleDeleteCard(item.id)
  }}
  className="absolute top-2 right-2 z-10 inline-flex items-center justify-center w-7 h-7 rounded-full border border-white/20 bg-black/60 text-white/75 hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] transition"
  aria-label="Delete card"
  title="Delete"
>
  <X className="w-3.5 h-3.5" />
</button>


                                <ContentCard
                                  variant="pool"
                                  title={item.title || 'Untitled idea'}
                                  subtitle={platformLabel(item.platform)}
                                  statusDotClass={statusDotColor(item.status)}
                                  badge={{
                                    text: featureLabel(item.feature),
                                    className: featureBadgeClass(item.feature),
                                  }}
                                  previewText={item.caption || ''}
                                  hashtagsPreview={hashtagsPreview}
                                  highlighted={isRecentlyDropped}
                                  armed={isArmed}
                                  onOpen={() => setExpandedItem(toSharedCard(item))}
                                  actions={
                                    <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                                      <button
                                        type="button"
                                        onClick={e => {
                                          e.stopPropagation()
                                          setArmedItemId(isArmed ? null : item.id)
                                        }}
                                        className={`inline-flex items-center gap-1.5 px-3 h-7 rounded-full border text-[0.7rem] transition ${
                                          isArmed
                                            ? 'border-ww-violet bg-ww-violet/30 text-white shadow-[0_0_14px_rgba(186,85,211,0.6)]'
                                            : 'border-white/20 text-white/80 hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.7)]'
                                        }`}
                                      >
                                        <CalendarDays className="w-3 h-3" />
                                        {isArmed ? 'Date selected' : 'Pick date'}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={e => {
                                          e.stopPropagation()
                                          setExpandedItem(toSharedCard(item))
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full border border-white/20 text-[0.7rem] text-white/80 hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] transition"
                                      >
                                        <Maximize2 className="w-3 h-3" />
                                        Expand
                                      </button>

                                      <button
                                        type="button"
                                        onClick={e => {
                                          e.stopPropagation()
                                          handleExportPressKit(item)
                                        }}
                                        disabled={exportingPressId === item.id}
                                        className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full border border-white/20 text-[0.7rem] text-white/80 hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] transition disabled:opacity-60"
                                      >
                                        {exportingPressId === item.id ? (
                                          <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Copying…
                                          </>
                                        ) : (
                                          <>
                                            <Clipboard className="w-3 h-3" />
                                            Press-kit
                                          </>
                                        )}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={e => {
                                          e.stopPropagation()
                                          handleExportPdf(item)
                                        }}
                                        disabled={exportingPdfId === item.id}
                                        className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full border border-white/20 text-[0.7rem] text-white/80 hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] transition disabled:opacity-60"
                                      >
                                        {exportingPdfId === item.id ? (
                                          <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Exporting…
                                          </>
                                        ) : (
                                          <>
                                            <FileText className="w-3 h-3" />
                                            PDF
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  }
                                />
                              </div>
                            </Fragment>
                          )}
                        </Draggable>
                      )
                    })}

                    {poolDropIndex !== null && poolDropIndex >= filteredPoolItems.length && (
                      <div className="h-2 rounded-xl bg-ww-violet/30 transition-all" />
                    )}

                    {filteredPoolItems.length === 0 && !loading && (
                      <p className="text-[0.75rem] text-white/50">
                        No ideas in the pool with these filters. Send items here from other tools.
                      </p>
                    )}

                    {loading && (
                      <p className="text-[0.75rem] text-white/50 flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Loading ideas…
                      </p>
                    )}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </section>

            {/* CALENDAR */}
            <section
  className={
    'rounded-3xl border bg-black/80 p-4 md:p-5 space-y-4 transition ' +
    (armedItemId
      ? 'border-ww-violet/60 shadow-[0_0_22px_rgba(186,85,211,0.35)]'
      : 'border-white/10')
  }
>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">Calendar view</p>
                  <h2 className="text-lg font-semibold">
                    {currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportMonthCsv}
                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-white/15 text-[0.7rem] text-white/80 hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] transition"
                  >
                    <Download className="w-3 h-3" />
                    <span className="hidden sm:inline">Month CSV</span>
                  </button>
                  <button
  type="button"
  onClick={handleClearCurrentMonth}
  className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-white/15 text-[0.7rem] text-white/80 hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] transition"
>
  <X className="w-3 h-3" />
  <span className="hidden sm:inline">Clear month</span>
</button>

                  <button
                    type="button"
                    onClick={goPrevMonth}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/15 text-white/80 hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goNextMonth}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/15 text-white/80 hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 text-[0.7rem] uppercase tracking-wide text-white/40">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} className="px-1 pb-1 text-center">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-px bg-white/10 rounded-2xl overflow-hidden text-xs">
                {days.map((d, idx) => {
                  const key = dateKey(d)
                  const dayItems = calendarItemsByDay[key] || []
                  const inCurrentMonth = d.getMonth() === currentMonth.getMonth()
                  const isToday = dateKey(d) === dateKey(new Date())

                  return (
                    <Droppable key={`${key}-${idx}`} droppableId={`day-${key}`}>
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-[90px] bg-black/80 p-1.5 flex flex-col gap-1 border border-transparent cursor-pointer transition-colors ${
  inCurrentMonth ? '' : 'opacity-40'
} ${
  armedItemId
    ? 'hover:bg-ww-violet/10 hover:border-ww-violet/70 hover:shadow-[0_0_14px_rgba(186,85,211,0.25)]'
    : 'hover:bg-ww-violet/5 hover:border-ww-violet/40'
} ${isToday ? 'border-ww-violet/70' : ''} ${recentlyScheduledDayKey === key ? 'shadow-[0_0_18px_rgba(186,85,211,0.45)] border-ww-violet/80' : ''}
`}

                          onClick={() => handleDayClick(d)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[0.7rem] text-white/60">{d.getDate()}</span>
                            {isToday && (
                              <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-ww-violet/20 text-ww-violet">
                                Today
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col gap-1 mt-1">
                            {dayItems.slice(0, 3).map((item, index) => (
                              <Draggable key={item.id} draggableId={item.id} index={index}>
                                {draggableProvided => (
                                  <div
                                    ref={draggableProvided.innerRef}
                                    {...draggableProvided.draggableProps}
                                    {...draggableProvided.dragHandleProps}
                                    className="cursor-grab"
                                    onClick={e => {
                                      e.stopPropagation()
                                      setExpandedItem(toSharedCard(item))
                                    }}
                                  >
                                    
                                    <ContentCard
                                      variant="mini"
                                      title={item.title || 'Untitled'}
                                      subtitle={platformLabel(item.platform)}
                                      statusDotClass={statusDotColor(item.status)}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {dayItems.length > 3 && (
                              <span className="text-[0.6rem] text-white/40">
                                +{dayItems.length - 3} more
                              </span>
                            )}
                          </div>

                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  )
                })}
              </div>

              {loading && (
                <p className="text-xs text-white/50 flex items-center gap-2 mt-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading calendar…
                </p>
              )}
            </section>
          </div>
          {/* ✅ Trash drop zone (ALWAYS mounted; only visually toggled) */}
<div
  className={[
    'fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-150',
    showTrash ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
  ].join(' ')}
>
  <Droppable droppableId="trash-bin">
    {(provided, snapshot) => (
      <div ref={provided.innerRef} {...provided.droppableProps}>
        <div
          className={[
            'pointer-events-auto inline-flex items-center gap-2 px-5 py-3 rounded-full border text-xs transition',
            snapshot.isDraggingOver
              ? 'border-ww-violet/80 bg-ww-violet/20 text-white shadow-[0_0_22px_rgba(186,85,211,0.65)]'
              : 'border-white/20 bg-black/80 text-white/80 shadow-[0_0_18px_rgba(186,85,211,0.35)]',
          ].join(' ')}
        >
          <Trash className="w-4 h-4" />
          Drop here to delete
        </div>

        {provided.placeholder}
      </div>
    )}
  </Droppable>
</div>


        </DragDropContext>
        

      </section>

      {/* ✅ Unified expanded modal */}
      {expandedItem && (
        <ContentCardModal
          open={!!expandedItem}
          onClose={() => setExpandedItem(null)}
          item={expandedItem}
          onItemPatched={patch => patchLocalItem(expandedItem.id, patch as any)}
          showQuickCaptionGen={true}
          getQuickGenContext={() => ({
            artistName:
              expandedItem.metadata?.artistName ||
              expandedItem.metadata?.artist ||
              expandedItem.metadata?.profile?.artistName ||
              profile.artistName ||
              '',
            tone:
              expandedItem.metadata?.tone ||
              profile.tone ||
              'brand-consistent, concise, human, engaging',
          })}
          showSendToMomentum={false}
          showPdfExport={true}
        />
      )}

      {/* Expanded day modal (unchanged) */}
      {expandedDay && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur flex items-center justify-center px-4"
          onClick={() => setExpandedDay(null)}
        >
          <div
            className="max-w-2xl w-full rounded-2xl border border-white/15 bg-black/95 p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">Day view</p>
                <h3 className="text-lg font-semibold">
                  {expandedDay.toLocaleDateString(undefined, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
              </div>
              <button
                onClick={() => setExpandedDay(null)}
                className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-white/25 text-white/70 hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] transition text-xs"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {(calendarItemsByDay[dateKey(expandedDay)] || []).map(item => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/12 bg-black/80 p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor(item.status)}`} />
                      <span className="text-sm font-medium text-white truncate">
                        {item.title || 'Untitled'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
  <span className="text-[0.7rem] text-white/50">{platformLabel(item.platform)}</span>
  <span className="text-[0.6rem] px-2 py-0.5 rounded-full border border-ww-violet/30 bg-ww-violet/10 text-ww-violet">
    Scheduled
  </span>
</div>

                  </div>
                  {item.caption && <p className="text-xs text-white/75 line-clamp-3">{item.caption}</p>}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedItem(toSharedCard(item))}
                      className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-white/20 text-[0.7rem] text-white/80 hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] transition"
                    >
                      <Maximize2 className="w-3 h-3" />
                      Expand
                    </button>
                  </div>
                </div>
              ))}

              {!(calendarItemsByDay[dateKey(expandedDay)] || []).length && (
                <p className="text-xs text-white/50">
                  No items on this day yet. Click an idea in the pool, then tap this date to schedule it.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
