// src/app/calendar/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Toaster, toast } from 'sonner'
import { useWwProfile } from '@/hooks/useWwProfile'
import ContentCardModal, { type ContentCard as SharedContentCard } from '@/components/ww/ContentCardModal'
import { buildStandardHeader, renderWwPdf, type PdfLine } from '@/lib/wwPdf'
import ContentCard from '@/components/ww/ContentCard'

import {

  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  Target,
  SlidersHorizontal,
  Download,
  Send,
  CheckCircle2,
  Flame,
  Moon,
  Zap,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  X,
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'


// ---------- Supabase ----------
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// ---------- Types ----------
export type CalendarStatus = 'planned' | 'draft' | 'scheduled' | 'posted' | 'idea' | string
type CalendarFocus = 'release' | 'gig' | 'general' | 'growth'
type Energy = 'low' | 'medium' | 'high'

type CalendarItem = {
  id: string
  user_id: string
  title: string | null
  caption: string | null
  platform: string | null
  status: CalendarStatus | null
  scheduled_at: string | null
  hashtags: string[] | null
  feature?: string | null
  metadata?: any
  in_momentum?: boolean | null
  created_at?: string
  updated_at?: string
}

// ---------- Helpers ----------
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function toIsoAtDayWithMinutes(day: Date, minutesFromMidday: number) {
  const x = new Date(day)
  x.setHours(12, 0, 0, 0)
  x.setMinutes(x.getMinutes() + minutesFromMidday)
  return x.toISOString()
}

function dateFromKey(key: string) {
  // key: YYYY-MM-DD
  return new Date(key + 'T12:00:00')
}

function dateKey(d: Date) {
  // Prevent RangeError if d is Invalid Date
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) {
    return new Date().toISOString().slice(0, 10) // fallback to today
  }
  return d.toISOString().slice(0, 10)
}


function startOfWeekMonday(date: Date) {
  const d = startOfDay(date)
  const day = d.getDay() // 0 Sun
  const mondayIndex = (day + 6) % 7 // 0 Mon
  d.setDate(d.getDate() - mondayIndex)
  return d
}

function addDays(date: Date, n: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function formatWeekRange(startMonday: Date) {
  const end = addDays(startMonday, 6)
  const a = startMonday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const b = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${a} – ${b}`
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function getMonthGrid(currentMonth: Date): Date[] {
  const first = startOfMonth(currentMonth)
  const startDay = first.getDay() // 0 Sun
  const mondayIndex = (startDay + 6) % 7
  const start = new Date(first)
  start.setDate(first.getDate() - mondayIndex)

  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    const x = new Date(start)
    x.setDate(start.getDate() + i)
    days.push(x)
  }
  return days
}

function focusLabel(f: CalendarFocus) {
  switch (f) {
    case 'release':
      return 'Upcoming release'
    case 'gig':
      return 'Upcoming gig'
    case 'growth':
      return 'Growth sprint'
    default:
      return 'General content'
  }
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

function statusDotColor(status: CalendarStatus | null | undefined) {
  const s = (status || '').toString()
  switch (s) {
    case 'planned':
    case 'idea':
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

function csvEscape(field: string | null | undefined): string {
  const value = (field ?? '').toString()
  const escaped = value.replace(/"/g, '""')
  return `"${escaped}"`
}

const ALL_PLATFORMS: Array<{ key: string; label: string }> = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube Shorts' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'x', label: 'X / Twitter' },
]

// ✅ Explicit mapping to shared modal type
function toSharedCard(it: CalendarItem): SharedContentCard {
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
   
    metadata: it.metadata,
    in_momentum: it.in_momentum ?? false,
  } as SharedContentCard
}

function energyIcon(e: Energy) {
  if (e === 'low') return <Moon className="w-3.5 h-3.5" />
  if (e === 'high') return <Zap className="w-3.5 h-3.5" />
  return <Flame className="w-3.5 h-3.5" />
}

function energyLabel(e: Energy) {
  if (e === 'low') return 'Low'
  if (e === 'high') return 'High'
  return 'Medium'
}

function clamp01(n: number) {
  return Math.max(0, Math.min(100, n))
}
function hashSeed(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function pick<T>(arr: T[], seed: number) {
  if (!arr.length) throw new Error('pick() called with empty array')
  return arr[seed % arr.length]
}


type MixState = {
  promo: number
  brand: number
  community: number
  bts: number
  lifestyle: number
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

function weeksFromScheduleLength(len: '7' | '14' | '30' | '60' | '90') {
  if (len === '7') return 1
  if (len === '14') return 2
  if (len === '60') return 8
  if (len === '90') return 13 // ~91 days
  return 4 // ~28 days (marketed as 30)
}


function safeString(x: any) {
  return typeof x === 'string' ? x : x == null ? '' : String(x)
}
function isGenericCaption(s: string) {
  const t = (s || '').trim().toLowerCase()
  if (!t) return true

  // Your old repeated template lines
  if (t.includes('turn today into a shareable moment')) return true
  if (t.includes('balanced format')) return true
  if (t.includes('angle: highlight your music')) return true

  // Other “non-caption” placeholders
  if (t.includes('(use quick caption in the card modal')) return true
  if (t === 'content slot') return true

  // Too short to be useful
  if (t.length < 40) return true

  return false
}


// ---------- Component ----------
export default function CalendarPage() {
  const {
  profile,
  hasProfile: hasAnyProfile,
  setLocalOnly: applyTo,
  updateProfile: save,
} = useWwProfile()

  


  // ---------- Shared styles ----------
  const primaryBtn =
    'inline-flex items-center gap-2 px-4 h-10 rounded-full bg-ww-violet text-white text-xs md:text-sm font-semibold ' +
    'shadow-[0_0_16px_rgba(186,85,211,0.7)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] ' +
    'active:scale-95 transition disabled:opacity-60'

  const outlineBtn =
    'inline-flex items-center gap-2 px-4 h-10 rounded-full border border-white/20 text-white/85 text-xs md:text-sm ' +
    'hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.6)] ' +
    'active:scale-95 transition disabled:opacity-60'

  const miniOutlineBtn =
  'inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-white/15 text-[0.75rem] text-white/80 ' +
  'hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_14px_rgba(186,85,211,0.55)] ' +
  'active:scale-95 transition disabled:opacity-60'


  const inputClass =
    'w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white placeholder-white/35 ' +
    'focus:border-ww-violet focus:outline-none transition'

  const labelClass = 'text-xs text-white/55 flex items-center gap-1'

  // ---------- WW profile fields ----------
  const [artistName, setArtistName] = useState('')
  const [genre, setGenre] = useState('')
  const [audience, setAudience] = useState('')
  const [goal, setGoal] = useState('')
  const [tone, setTone] = useState('brand-consistent, concise, human, engaging')

  // ---------- View mode ----------
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')

  // ---------- Calendar V2 controls ----------
  const [focusMode, setFocusMode] = useState<CalendarFocus>('general')
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()))
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  // Quality-first: lock volume (prevents repetitive outputs)
  const POSTS_PER_DAY = 1

  // ✅ Week plan span (local generator)
const [weekSpan, setWeekSpan] = useState<1 | 2>(1)

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok', 'instagram', 'youtube'])
  const [releaseContext, setReleaseContext] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // ✅ Schedule length for API generator
  const [scheduleLength, setScheduleLength] = useState<'7' | '14' | '30' | '60' | '90'>('30')


  // Energy pattern (Mon..Sun)
  const [energyPattern, setEnergyPattern] = useState<Energy[]>(['medium', 'low', 'medium', 'high', 'medium', 'high', 'low'])

  // ✅ Cleaner energy UI (compact + collapsible)
  const [energyPreset, setEnergyPreset] = useState<'balanced' | 'weekday-grind' | 'weekend-warrior' | 'custom'>('balanced')
  const [showEnergyControls, setShowEnergyControls] = useState(false)

  // Content mix
  const [mix, setMix] = useState<MixState>({
    promo: 40,
    brand: 35,
    community: 15,
    bts: 25,
    lifestyle: 10,
  })

  // ---------- Data state ----------
  const [loadingItems, setLoadingItems] = useState(true)
  const [items, setItems] = useState<CalendarItem[]>([])
  const [generating, setGenerating] = useState(false)
  // ✅ Batch controls (safety net)
  const [_lastBatchId, _setLastBatchId] = useState<string>('')
  const [_lastBatchLabel, _setLastBatchLabel] = useState<string>('')
  const [_clearing, _setClearing] = useState(false)
  const [_deletingBatch, _setDeletingBatch] = useState(false)

  // ---------- Modals ----------
  const [expandedItem, setExpandedItem] = useState<SharedContentCard | null>(null)

  // ---------- Hydrate profile fields (non-destructive) ----------
  useEffect(() => {
    if (profile.artistName && !artistName) setArtistName(profile.artistName)
    if (profile.genre && !genre) setGenre(profile.genre)
    if (profile.audience && !audience) setAudience(profile.audience)
    if (profile.goal && !goal) setGoal(profile.goal)
    if (profile.tone && tone === 'brand-consistent, concise, human, engaging') setTone(profile.tone)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  function applyProfileFromCentral() {
    applyTo({ setArtistName, setGenre, setAudience, setGoal, setTone })
    toast.success('Profile applied ✅')
  }

  // ---------- Load: ONLY calendar feature items ----------
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadingItems(true)
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError || !userData?.user) {
          setItems([])
          setLoadingItems(false)
          return
        }

        const { data, error } = await supabase
          .from('content_calendar')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('feature', 'calendar')
          .order('scheduled_at', { ascending: true })

        if (error) {
          console.error('[calendar-v2] load error', error)
          toast.error(error.message || 'Could not load Content Calendar')
          setItems([])
          setLoadingItems(false)
          return
        }

        if (!cancelled) setItems((data as CalendarItem[]) || [])
      } catch (e: any) {
        console.error('[calendar-v2] load exception', e)
        toast.error(e?.message || 'Could not load Content Calendar')
      } finally {
        if (!cancelled) setLoadingItems(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  // ---------- Week derived ----------
  const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart])

  const weekStartKey = dateKey(weekStart)
  const weekEndKey = dateKey(addDays(weekStart, 6))

  const weekItems = useMemo(() => {
    return items.filter(it => {
      if (!it.scheduled_at) return false
      const k = it.scheduled_at.slice(0, 10)
      return k >= weekStartKey && k <= weekEndKey
    })
  }, [items, weekStartKey, weekEndKey])

  const weekItemsByDay = useMemo(() => {
    const map: Record<string, CalendarItem[]> = {}
    for (const d of weekDays) map[dateKey(d)] = []
    for (const it of weekItems) {
      if (!it.scheduled_at) continue
      const k = it.scheduled_at.slice(0, 10)
      if (!map[k]) map[k] = []
      map[k].push(it)
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => {
        const ta = a.scheduled_at ? new Date(a.scheduled_at).getTime() : 0
        const tb = b.scheduled_at ? new Date(b.scheduled_at).getTime() : 0
        return ta - tb
      })
    }
    return map
  }, [weekDays, weekItems])

  // ---------- Month derived ----------
  const monthDays = useMemo(() => getMonthGrid(currentMonth), [currentMonth])

  const monthItemsByDay = useMemo(() => {
    const map: Record<string, CalendarItem[]> = {}
    for (const it of items) {
      if (!it.scheduled_at) continue
      const k = it.scheduled_at.slice(0, 10)
      if (!map[k]) map[k] = []
      map[k].push(it)
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => {
        const ta = a.scheduled_at ? new Date(a.scheduled_at).getTime() : 0
        const tb = b.scheduled_at ? new Date(b.scheduled_at).getTime() : 0
        return ta - tb
      })
    }
    return map
  }, [items])

  // ---------- Week nav ----------
  function goPrevWeek() {
    setWeekStart(prev => addDays(prev, -7))
  }
  function goNextWeek() {
    setWeekStart(prev => addDays(prev, 7))
  }
  function goThisWeek() {
    setWeekStart(startOfWeekMonday(new Date()))
  }

  // ---------- Month nav ----------
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
  function goThisMonth() {
    setCurrentMonth(startOfMonth(new Date()))
  }

  // ---------- DB helpers ----------
  async function insertCalendarRows(rows: Array<Partial<CalendarItem>>) {
    const { data, error } = await supabase.from('content_calendar').insert(rows).select('*')
    if (error) throw new Error(error.message || 'Could not save calendar plan')
    return (data as CalendarItem[]) || []
  }

  async function markItemsInMomentum(ids: string[], inMomentum: boolean) {
    if (!ids.length) return
    const { error } = await supabase.from('content_calendar').update({ in_momentum: inMomentum }).in('id', ids)
    if (error) throw new Error(error.message || 'Could not update momentum status')
    setItems(prev => prev.map(it => (ids.includes(it.id) ? { ...it, in_momentum: inMomentum } : it)))
  }

  async function updateManyScheduledAt(patches: Array<{ id: string; scheduled_at: string }>) {
    if (!patches.length) return
    const results = await Promise.all(
      patches.map(p => supabase.from('content_calendar').update({ scheduled_at: p.scheduled_at }).eq('id', p.id))
    )
    const firstError = results.find(r => r.error)?.error
    if (firstError) throw new Error(firstError.message || 'Could not reorder calendar items')
  }
  async function _deleteBatch(batchId: string) {
    if (!batchId) return
    _setDeletingBatch(true)
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        toast.error('You must be logged in')
        return
      }

      const uid = userData.user.id

      // delete only calendar feature rows where metadata.batchId matches
      const { error } = await supabase
        .from('content_calendar')
        .delete()
        .eq('user_id', uid)
        .eq('feature', 'calendar')
        .eq('metadata->>batchId', batchId)

      if (error) throw new Error(error.message || 'Could not delete batch')

      // local remove
      setItems(prev => prev.filter(it => (it.metadata?.batchId || '') !== batchId))

      toast.success('Deleted last generated batch ✅')
      _setLastBatchId('')
      _setLastBatchLabel('')
    } catch (e: any) {
      console.error('[calendar-v2] delete batch error', e)
      toast.error(e?.message || 'Could not delete batch')
    } finally {
      _setDeletingBatch(false)
    }
  }

  async function _clearAllCalendarItems() {
    const ok = window.confirm('Clear ALL calendar items? This cannot be undone.')
    if (!ok) return

    _setClearing(true)
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        toast.error('You must be logged in')
        return
      }

      const uid = userData.user.id

      const { error } = await supabase
        .from('content_calendar')
        .delete()
        .eq('user_id', uid)
        .eq('feature', 'calendar')

      if (error) throw new Error(error.message || 'Could not clear calendar')

      setItems([])
      toast.success('Calendar cleared ✅')
      _setLastBatchId('')
      _setLastBatchLabel('')
    } catch (e: any) {
      console.error('[calendar-v2] clear all error', e)
      toast.error(e?.message || 'Could not clear calendar')
    } finally {
      _setClearing(false)
    }
  }


  // ---------- Generation (local/week template) ----------
  function choosePlatform(i: number) {
    const pool = selectedPlatforms.length ? selectedPlatforms : ['instagram']
    return pool[i % pool.length]
  }

  function pickContentTypeFromMix(seed: number) {
    const buckets: Array<{ key: keyof MixState; w: number }> = [
      { key: 'promo', w: mix.promo },
      { key: 'brand', w: mix.brand },
      { key: 'community', w: mix.community },
      { key: 'bts', w: mix.bts },
      { key: 'lifestyle', w: mix.lifestyle },
    ]
    const total = buckets.reduce((a, b) => a + (b.w || 0), 0) || 1
    let r = (seed % 1000) / 1000
    r *= total
    for (const b of buckets) {
      r -= b.w
      if (r <= 0) return b.key
    }
    return 'promo'
  }

  function titleTemplate(opts: { focus: CalendarFocus; energy: Energy; contentType: keyof MixState; platform: string; dayName: string }) {
    const { focus, energy, contentType, platform, dayName } = opts
    const focusBit =
      focus === 'release' ? 'Release momentum' : focus === 'gig' ? 'Gig momentum' : focus === 'growth' ? 'Growth sprint' : 'Weekly momentum'

    const typeBit =
      contentType === 'promo'
        ? 'Promo'
        : contentType === 'brand'
          ? 'Brand story'
          : contentType === 'community'
            ? 'Community'
            : contentType === 'bts'
              ? 'BTS'
              : 'Human moment'

    const energyBit = energy === 'low' ? 'Low lift' : energy === 'high' ? 'High energy' : 'Balanced'
    const plat = platformLabel(platform)
    return `${focusBit} • ${typeBit} • ${energyBit} (${plat}) — ${dayName}`
  }

  function captionTemplate(opts: {
  focus: CalendarFocus
  energy: Energy
  contentType: keyof MixState
  platform: string
  dayName: string
  seed: number
}) {
  const { focus, energy, contentType, platform, dayName, seed } = opts

  const plat = platformLabel(platform)
  const focusBit =
    focus === 'release'
      ? 'Drive momentum to the release'
      : focus === 'gig'
        ? 'Build hype for the gig'
        : focus === 'growth'
          ? 'Grow reach + connection'
          : 'Stay visible + consistent'

  // --- banks (short, punchy, varied) ---
  const promoIdeas = [
    'Use a 6–10s hook snippet and put the lyrics on-screen.',
    'Tell the story behind one bar, then play the bar.',
    'Show “before vs after” (rough demo → finished version).',
    'Do a “rate this hook 1–10” and pin the best comment.',
    'Explain what the song means in one sentence, then hit the hook.',
  ]

  const brandIdeas = [
    'Share a lesson you learned this week (1 line → 1 story → 1 takeaway).',
    'Answer a question your audience is scared to ask.',
    'Talk about your “why” in a specific moment (not generic motivation).',
    'Show your routine for staying consistent (tiny, real, repeatable).',
    'Drop a “belief I changed my mind about” and why.',
  ]

  const communityIdeas = [
    'Ask a forced-choice question (A or B) tied to your music.',
    'Let them vote on a lyric / cover / snippet to post next.',
    'Ask for a relatable story, then reply to the best one.',
    'Do a “caption this” prompt with your clip.',
    'Ask “what should I write about next?” with 3 options.',
  ]

  const btsIdeas = [
    'Show the session: mic check → 1 take → playback reaction.',
    'Break down a verse: highlight 3 words and why they matter.',
    'Show your editing process in 3 quick cuts.',
    'Show your notes/voice memos then the final delivery.',
    'Show a tiny mistake and how you fixed it (human + real).',
  ]

  const lifestyleIdeas = [
    'Film a simple walk/commute clip + a voiceover about today’s thought.',
    'Show something ordinary that grounds you (then relate it back to music).',
    'Share a small win you didn’t post about.',
    'Talk about what you’re working on without over-explaining.',
    'Drop a “one line journal entry” and let the comments respond.',
  ]

  const hooks = [
    'If you’ve been feeling stuck, this is for you…',
    'Quick one — tell me if this bar hits…',
    'I wasn’t going to post this, but…',
    'This took me way too long to get right…',
    'POV: you’re rebuilding your life quietly…',
    'The moment I realised I had to level up was…',
  ]

  const ctas = [
    'If this resonates, hit save.',
    'Comment “ME” if you relate.',
    'Which line hit you most?',
    'Want the full version? I’ll drop it next.',
    'Rate the hook 1–10 honestly.',
    'Share this with someone who needs it.',
  ]

  const formatsByEnergy: Record<Energy, string[]> = {
    low: [
      'Low lift: talking-head + text overlay.',
      'Low lift: voiceover over a simple clip.',
      'Low lift: lyric-on-screen + static visual.',
    ],
    medium: [
      'Balanced: hook → context → payoff.',
      'Balanced: quick cuts + clear caption.',
      'Balanced: performance moment + 1 line story.',
    ],
    high: [
      'High energy: performance first, explanation later.',
      'High energy: fast cuts + big hook.',
      'High energy: bold statement → hook → CTA.',
    ],
  }

  const bank =
    contentType === 'promo'
      ? promoIdeas
      : contentType === 'brand'
        ? brandIdeas
        : contentType === 'community'
          ? communityIdeas
          : contentType === 'bts'
            ? btsIdeas
            : lifestyleIdeas

  const idea = pick(bank, seed + 3)
  const hook = pick(hooks, seed + 7)
  const format = pick(formatsByEnergy[energy], seed + 11)
  const cta = pick(ctas, seed + 19)

  const contextBits: string[] = []
  if (artistName) contextBits.push(artistName)
  if (genre) contextBits.push(genre)
  if (releaseContext.trim()) contextBits.push(releaseContext.trim())

  const contextLine = contextBits.length ? `Context: ${contextBits.join(' • ')}` : ''

  // Output = something the user can actually post
  const lines: string[] = []
  lines.push(`${dayName} • ${plat}`)
  if (contextLine) lines.push(contextLine)
  if (goal) lines.push(`Goal: ${goal}`)
  if (audience) lines.push(`Audience: ${audience}`)
  lines.push('')
  lines.push(`Focus: ${focusLabel(focus)} (${focusBit})`)
  lines.push(`Format: ${format}`)
  lines.push('')
  lines.push(`Idea: ${idea}`)
  lines.push(`Hook: ${hook}`)
  lines.push(`CTA: ${cta}`)
  lines.push('')
  lines.push('Caption draft:')
  lines.push(`${hook} ${idea} ${cta}`)

  return lines.join('\n')
}

     

  async function handleGenerateWeekPlan() {
    void save({ artistName, genre, audience, goal, tone })
    setGenerating(true)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        toast.error('You must be logged in to generate a week plan')
        return
      }

      const uid = userData.user.id
      const batchId = `cal_${Date.now()}`
const batchLabel = `Week plan (${dateKey(weekStart)})`

      const rows: Array<Partial<CalendarItem>> = []
const genDays = Array.from({ length: weekSpan * 7 }).map((_, i) => addDays(weekStart, i))

      genDays.forEach((day, dayIndex) => {

        const dayName = day.toLocaleDateString('en-GB', { weekday: 'long' })
        const energy = energyPattern[dayIndex] || 'medium'
        for (let j = 0; j < POSTS_PER_DAY; j++) {

          const seed = dayIndex * 101 + j * 37 + (artistName.length || 0)
          const contentType = pickContentTypeFromMix(seed)
          const platform = choosePlatform(dayIndex + j)

          rows.push({
            user_id: uid,
            feature: 'calendar',
            in_momentum: false,
            status: 'planned',
            platform,
            scheduled_at: toIsoAtDayWithMinutes(day, j), // keep order stable within the day
            title: titleTemplate({ focus: focusMode, energy, contentType, platform, dayName }),
            caption: captionTemplate({ focus: focusMode, energy, contentType, platform, dayName, seed }),

            hashtags: null,
            metadata: {
              batchId,
              batchLabel,
              source: 'calendar_v2_local',
              focusMode,
              energy,
              contentType,
              artistName,
              genre,
              audience,
              goal,
              tone,
              releaseContext: releaseContext || null,
              promptVersion: 'v2.2-ui-clean-energy',
            },
          })
        }
      })

      const saved = await insertCalendarRows(rows)
            _setLastBatchId(batchId)
      _setLastBatchLabel(batchLabel)

      setItems(prev => [...prev, ...saved])
      toast.success('Week plan generated and saved ✅')
    } catch (e: any) {
      console.error('[calendar-v2] generate error', e)
      toast.error(e?.message || 'Could not generate week plan')
    } finally {
      setGenerating(false)
    }
  }

  // ---------- Generation (API: 30/60/90 schedule) ----------
  async function handleGenerateScheduleFromApi() {
    void save({ artistName, genre, audience, goal, tone })
    setGenerating(true)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        toast.error('You must be logged in to generate a schedule')
        return
      }

      const uid = userData.user.id
      const weeks = weeksFromScheduleLength(scheduleLength)
      const batchId = `cal_${Date.now()}`
      const startDate = dateKey(weekStart)
const batchLabel = `${scheduleLength} schedule (${startDate})`

      

            // UI is posts/day -> API expects posts/week
      // Cap to avoid huge plans that become repetitive (e.g. 21/week)
      const postsPerWeek = POSTS_PER_DAY * 7


      

      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistName,
          genre,
          audience,
          goal,
          startDate,
          weeks,
          postsPerWeek,
          platforms: selectedPlatforms.length ? selectedPlatforms : ['instagram'],
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error || 'Failed to generate schedule')
        return
      }
if (data?._fallback) {
  toast.warning('Calendar used fallback (check OPENAI_API_KEY / API parse).')
}

      const apiItems: any[] = Array.isArray(data?.items) ? data.items : []
      if (!apiItems.length) {
        toast.error('No items returned from calendar API')
        return
      }

      const perDayIndex: Record<string, number> = {}
      const rows: Array<Partial<CalendarItem>> = apiItems
  .map((it: any) => {

        const dayKey = safeString(it.date).slice(0, 10)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) {
  // skip broken rows instead of crashing the page
  return null as any
}

        const idx = perDayIndex[dayKey] ?? 0
        perDayIndex[dayKey] = idx + 1

        const dayDate = dateFromKey(dayKey)
        const scheduled_at = toIsoAtDayWithMinutes(dayDate, idx)

        return {
          user_id: uid,
          feature: 'calendar',
          in_momentum: false,
          status: 'planned',
          platform: safeString(it.platform) || 'instagram',
          scheduled_at,
          title: (() => {
  const apiTitle = safeString(it.title).trim()
  if (apiTitle && apiTitle.toLowerCase() !== 'content slot') return apiTitle

  const pillar = safeString(it.pillar) || 'promo'
  const format = safeString(it.format)
  const angle = safeString(it.angle)
  const plat = platformLabel(safeString(it.platform) || 'instagram')

  const bits = [
    pillar ? pillar.toUpperCase() : null,
    format ? format : null,
    angle ? angle : null,
  ].filter(Boolean)

  return bits.length ? `${bits.join(' • ')} (${plat})` : `Content idea (${plat})`
})(),


          caption: (() => {
  const apiCaption = safeString(it.suggested_caption) || ''
  const idea = safeString(it.idea)
  const format = safeString(it.format)
  const angle = safeString(it.angle)
  const cta = safeString(it.cta)
  const pillar = safeString(it.pillar)

  const ideaBlockLines = [
    `IDEA: ${idea || '—'}`,
    `FORMAT: ${format || '—'}`,
    `ANGLE: ${angle || '—'}`,
    `CTA: ${cta || '—'}`,
    pillar ? `PILLAR: ${pillar}` : null,
    '',
  ].filter(Boolean) as string[]

  // If API caption is good, keep it, but prepend the idea block
  if (apiCaption && !isGenericCaption(apiCaption)) {
    return [...ideaBlockLines, apiCaption].join('\n')
  }

  // Otherwise fall back to your richer local captionTemplate
  const seed = hashSeed(`${dayKey}|${safeString(it.platform)}|${idx}|${focusMode}|${artistName}|${genre}|${audience}|${goal}`)
  const dayName = dayDate.toLocaleDateString('en-GB', { weekday: 'long' })
  const energy =
    energyPattern[
      Math.min(6, Math.max(0, new Date(dayDate).getDay() === 0 ? 6 : new Date(dayDate).getDay() - 1))
    ] || 'medium'

  const contentType = (safeString(it.pillar) as keyof MixState) || 'promo'

  const local = captionTemplate({
    focus: focusMode,
    energy,
    contentType: (['promo', 'brand', 'community', 'bts', 'lifestyle'].includes(contentType) ? contentType : 'promo') as keyof MixState,
    platform: safeString(it.platform) || 'instagram',
    dayName,
    seed,
  })

  return [...ideaBlockLines, local].join('\n')
})(),


          hashtags: null,
          metadata: {
            batchId,
            batchLabel,
            source: 'calendar_api_v1',
            scheduleLength,
            focusMode,
            artistName,
            genre,
            audience,
            goal,
            tone,
            releaseContext: releaseContext || null,
            api: {
              short_label: safeString(it.short_label),
              pillar: safeString(it.pillar),
              format: safeString(it.format),
              idea: safeString(it.idea),
              angle: safeString(it.angle),
              cta: safeString(it.cta),
            },
          },
        }
      })
        .filter(Boolean) as any


      const saved = await insertCalendarRows(rows)
            _setLastBatchId(batchId)
      _setLastBatchLabel(batchLabel)

      setItems(prev => [...prev, ...saved])
      toast.success(`${scheduleLength}-day schedule generated and saved ✅`)
    } catch (e: any) {
      console.error('[calendar-v2] generate schedule api error', e)
      toast.error(e?.message || 'Could not generate schedule')
    } finally {
      setGenerating(false)
    }
  }

  // ---------- Export week CSV ----------
  function handleExportWeekCsv() {
    if (!weekItems.length) return toast.info('No items in this week to export')

    const header = ['Date', 'Day', 'Platform', 'Status', 'Title', 'Caption', 'Hashtags', 'In Momentum']
    const rows = weekItems.map(it => {
      const d = it.scheduled_at ? new Date(it.scheduled_at) : null
      const dateStr = d ? d.toISOString().slice(0, 10) : ''
      const dayStr = d ? d.toLocaleDateString('en-GB', { weekday: 'short' }) : ''
      const tags = (it.hashtags || []).map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ')
      return [
        csvEscape(dateStr),
        csvEscape(dayStr),
        csvEscape(platformLabel(it.platform)),
        csvEscape((it.status || 'planned').toString()),
        csvEscape(it.title),
        csvEscape(it.caption),
        csvEscape(tags),
        csvEscape(it.in_momentum ? 'yes' : 'no'),
      ].join(',')
    })

    const csv = [header.join(','), ...rows].join('\r\n')
    try {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ww-calendar-week-${weekStartKey}-to-${weekEndKey}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Week exported as CSV ✅')
    } catch (e: any) {
      console.error('[calendar-v2] export week csv error', e)
      toast.error(e?.message || 'Could not export week CSV')
    }
  }

  function handleExportWeekPdf() {
  if (!weekItems.length) return toast.info('No items in this week to export')

  const title = artistName ? `${artistName} — Content Calendar (Week)` : 'Content Calendar (Week)'
  const subtitle = `${weekTitle} • ${selectedPlatforms.length ? selectedPlatforms.map(platformLabel).join(', ') : 'All platforms'}`

  const lines: PdfLine[] = [
    ...buildStandardHeader({
      title,
      subtitle,
      meta: [
        genre ? { label: 'Genre', value: genre } : null,
        audience ? { label: 'Audience', value: audience } : null,
        goal ? { label: 'Goal', value: goal } : null,
        focusMode ? { label: 'Focus', value: focusLabel(focusMode) } : null,
      ].filter(Boolean) as any,
    }),
  ]

  for (let i = 0; i < weekDays.length; i++) {
    const d = weekDays[i]
    const key = dateKey(d)
    const list = weekItemsByDay[key] || []
    const dayLabel = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })

    lines.push({ kind: 'sectionTitle', text: dayLabel })

    if (!list.length) {
      lines.push({ kind: 'body', text: '—' })
      lines.push({ kind: 'spacer', height: 10 } as any)
      continue
    }

    for (const it of list) {
      const plat = platformLabel(it.platform)
      const status = (it.status || 'planned').toString()
      const t = (it.title || 'Untitled').toString()
      lines.push({ kind: 'body', text: `• [${plat}] ${t} (${status})` })
    }

    lines.push({ kind: 'spacer', height: 12 } as any)
  }

  try {
    const base = artistName ? `${artistName} calendar week` : 'calendar week'
    renderWwPdf(lines, base)
    toast.success('Week exported as PDF ✅')
  } catch (e: any) {
    console.error('[calendar-v2] export week pdf error', e)
    toast.error(e?.message || 'Could not export week PDF')
  }
}


  // ---------- Export month CSV ----------
  function handleExportMonthCsv() {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const monthItems = items.filter(it => {
      if (!it.scheduled_at) return false
      const d = new Date(it.scheduled_at)
      return d.getFullYear() === year && d.getMonth() === month
    })

    if (!monthItems.length) return toast.info('No items in this month to export')

    const header = ['Date', 'Platform', 'Status', 'Title', 'Caption', 'Hashtags', 'In Momentum']
    const rows = monthItems.map(it => {
      const d = it.scheduled_at ? new Date(it.scheduled_at).toISOString().slice(0, 10) : ''
      const tags = (it.hashtags || []).map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ')
      return [
        csvEscape(d),
        csvEscape(platformLabel(it.platform)),
        csvEscape((it.status || 'planned').toString()),
        csvEscape(it.title),
        csvEscape(it.caption),
        csvEscape(tags),
        csvEscape(it.in_momentum ? 'yes' : 'no'),
      ].join(',')
    })

    const csv = [header.join(','), ...rows].join('\r\n')
    try {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const mm = String(month + 1).padStart(2, '0')
      a.href = url
      a.download = `ww-calendar-month-${year}-${mm}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Month exported as CSV ✅')
    } catch (e: any) {
      console.error('[calendar-v2] export month csv error', e)
      toast.error(e?.message || 'Could not export month CSV')
    }
  }

  // ---------- Send week to Momentum ----------
  async function handleSendWeekToMomentum() {
    const toSend = weekItems.filter(it => !it.in_momentum).map(it => it.id)
    if (!toSend.length) return toast.info('All items in this week are already in Momentum Board')
    try {
      await markItemsInMomentum(toSend, true)
      toast.success('Week sent to Momentum Board ✅')
    } catch (e: any) {
      console.error('[calendar-v2] send week error', e)
      toast.error(e?.message || 'Could not send week to Momentum Board')
    }
  }
  async function handleClearCurrentMonth() {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) return toast.error('You must be logged in')

    const uid = userData.user.id
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const monthStart = new Date(year, month, 1, 12, 0, 0).toISOString()
    const monthEnd = new Date(year, month + 1, 1, 12, 0, 0).toISOString()

    const { data: toDelete, error: loadErr } = await supabase
      .from('content_calendar')
      .select('id')
      .eq('user_id', uid)
      .eq('feature', 'calendar')
      .gte('scheduled_at', monthStart)
      .lt('scheduled_at', monthEnd)

    if (loadErr) throw loadErr

    const ids = (toDelete || []).map((x: any) => x.id)
    if (!ids.length) return toast.info('No items in this month to clear')

    const { error: delErr } = await supabase.from('content_calendar').delete().in('id', ids)
    if (delErr) throw delErr

    // update UI
    setItems(prev => prev.filter(it => !ids.includes(it.id)))
    toast.success('Month cleared ✅')
  } catch (e: any) {
    console.error('[calendar-v2] clear month error', e)
    toast.error(e?.message || 'Could not clear month')
  }
}

async function _handleClearLastGeneratedBatch() {
  try {
    const lastBatchId = items
      .map(it => it.metadata?.batchId)
      .filter(Boolean)
      .slice(-1)[0]

    if (!lastBatchId) return toast.info('No generated schedule batch found')

    const { error } = await supabase.from('content_calendar').delete().eq('user_id', items[0]?.user_id).eq('feature', 'calendar').contains('metadata', { batchId: lastBatchId })

    if (error) throw new Error(error.message || 'Could not delete schedule batch')

    setItems(prev => prev.filter(it => it.metadata?.batchId !== lastBatchId))
    toast.success('Deleted generated schedule ✅')
  } catch (e: any) {
    console.error('[calendar-v2] clear batch error', e)
    toast.error(e?.message || 'Could not clear schedule')
  }
}
// ---------- Send current month to Momentum ----------
async function handleSendMonthToMomentum() {
  const month = currentMonth.getMonth()
  const year = currentMonth.getFullYear()

  const monthItems = items.filter(it => {
    if (!it.scheduled_at) return false
    const d = new Date(it.scheduled_at)
    return d.getFullYear() === year && d.getMonth() === month
  })

  const toSend = monthItems.filter(it => !it.in_momentum).map(it => it.id)
  if (!toSend.length) return toast.info('All items in this month are already in Momentum Board')

  try {
    await markItemsInMomentum(toSend, true)
    toast.success('Month sent to Momentum Board ✅')
  } catch (e: any) {
    console.error('[calendar-v2] send month error', e)
    toast.error(e?.message || 'Could not send month to Momentum Board')
  }
}

  // ---------- Drag & drop (MONTH) ----------
  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result
    if (!destination) return

    const fromDayKey = source.droppableId
    const toDayKey = destination.droppableId
    if (!fromDayKey.startsWith('day:') || !toDayKey.startsWith('day:')) return

    const fromKey = fromDayKey.replace('day:', '')
    const toKey = toDayKey.replace('day:', '')

    const dragged = items.find(it => it.id === draggableId)
    if (!dragged) return

    // Build per-day lists from current items
    const grouped: Record<string, CalendarItem[]> = {}
    for (const it of items) {
      if (!it.scheduled_at) continue
      const k = it.scheduled_at.slice(0, 10)
      if (!grouped[k]) grouped[k] = []
      grouped[k].push(it)
    }
    for (const k of Object.keys(grouped)) {
      grouped[k].sort((a, b) => {
        const ta = a.scheduled_at ? new Date(a.scheduled_at).getTime() : 0
        const tb = b.scheduled_at ? new Date(b.scheduled_at).getTime() : 0
        return ta - tb
      })
    }

    const fromList = grouped[fromKey] ? [...grouped[fromKey]] : []
    const toList = grouped[toKey] ? [...grouped[toKey]] : []

    // Remove dragged from source list
    const fromIndex = fromList.findIndex(x => x.id === draggableId)
    if (fromIndex === -1) return
    const [removed] = fromList.splice(fromIndex, 1)

    // Insert into destination list
    toList.splice(destination.index, 0, removed)

    // Create patches (scheduled_at encodes order via minutes)
    const patches: Array<{ id: string; scheduled_at: string }> = []

    if (fromKey === toKey) {
      const dayDate = dateFromKey(toKey)
      const finalList = reorder(grouped[toKey] || [], source.index, destination.index)
      finalList.forEach((it, idx) => {
        patches.push({ id: it.id, scheduled_at: toIsoAtDayWithMinutes(dayDate, idx) })
      })
    } else {
      const fromDate = dateFromKey(fromKey)
      const toDate = dateFromKey(toKey)

      fromList.forEach((it, idx) => {
        patches.push({ id: it.id, scheduled_at: toIsoAtDayWithMinutes(fromDate, idx) })
      })
      toList.forEach((it, idx) => {
        patches.push({ id: it.id, scheduled_at: toIsoAtDayWithMinutes(toDate, idx) })
      })
    }

    // Optimistic update
    setItems(prev =>
      prev.map(it => {
        const p = patches.find(x => x.id === it.id)
        return p ? { ...it, scheduled_at: p.scheduled_at } : it
      })
    )

    try {
      await updateManyScheduledAt(patches)
      toast.success('Updated schedule ✅')
    } catch (e: any) {
      console.error('[calendar-v2] dnd error', e)
      toast.error(e?.message || 'Could not update schedule')
    }
  }

  // ---------- Patch local item (modal sync) ----------
  function patchLocalItem(id: string, patch: Partial<CalendarItem>) {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, ...patch } : it)))
    setExpandedItem(prev => (prev && prev.id === id ? ({ ...prev, ...patch } as any) : prev))
  }

  // ---------- UI helpers ----------
  function togglePlatform(key: string) {
    setSelectedPlatforms(prev => (prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]))
  }

  function setDayEnergy(i: number, e: Energy) {
    setEnergyPattern(prev => {
      const next = [...prev]
      next[i] = e
      return next
    })
  }

  function applyEnergyPreset(p: 'balanced' | 'weekday-grind' | 'weekend-warrior' | 'custom') {
    setEnergyPreset(p)
    if (p === 'balanced') setEnergyPattern(['medium', 'medium', 'medium', 'medium', 'medium', 'medium', 'medium'])
    if (p === 'weekday-grind') setEnergyPattern(['medium', 'low', 'medium', 'medium', 'low', 'high', 'low'])
    if (p === 'weekend-warrior') setEnergyPattern(['low', 'low', 'medium', 'medium', 'medium', 'high', 'high'])
    // custom: don't overwrite
  }

  function MixSlider({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[0.72rem] text-white/60">
          <span>{label}</span>
          <span className="text-white/75">{value}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={e => onChange(clamp01(parseInt(e.target.value || '0', 10)))}
          className="w-full accent-[rgb(186,85,211)]"
        />
      </div>
    )
  }

  const weekTitle = formatWeekRange(weekStart)
  const monthTitle = currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })

  return (
    <main className="min-h-screen bg-black text-white">
      <Toaster position="top-center" richColors />

      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
              <CalendarDays className="w-7 h-7 text-ww-violet" />
              Content Calendar
            </h1>
            <p className="text-white/70 max-w-3xl">
              Calendar = <b className="text-white/85">generated ideas</b> • Momentum Board = <b className="text-white/85">master hub</b>
            </p>
          </div>

          {/* Apply WW profile as a clean button (no banner) */}
          {hasAnyProfile && (
            <button type="button" onClick={applyProfileFromCentral} className={outlineBtn}>
              <Sparkles className="w-4 h-4" />
              Apply WW profile
            </button>
          )}
        </header>

        {/* Layout (fixed left width, flexible right) */}
        <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)] xl:grid-cols-[460px_minmax(0,1fr)]">
          {/* LEFT: Inputs */}
          <section className="rounded-3xl border border-white/10 bg-black/80 p-5 md:p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">Setup</p>
                <h2 className="text-lg font-semibold mt-1 flex items-center gap-2">
                  <Target className="w-4 h-4 text-ww-violet" />
                  Generator
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className={
  "inline-flex items-center gap-1.5 px-3 h-8 rounded-full border text-[0.75rem] transition " +
  (showAdvanced
    ? "border-ww-violet bg-ww-violet/20 text-white shadow-[0_0_26px_rgba(186,85,211,0.95)]"
    : "border-ww-violet/50 bg-ww-violet/10 text-white/90 shadow-[0_0_18px_rgba(186,85,211,0.55)] hover:shadow-[0_0_24px_rgba(186,85,211,0.85)] hover:border-ww-violet")
}

              >
                <SlidersHorizontal className="w-3 h-3" />
                {showAdvanced ? 'Hide' : 'Advanced'}
              </button>
            </div>

            {/* Core context */}
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <p className={labelClass}>Artist name</p>
                  <input className={inputClass} placeholder="e.g. natestapes" value={artistName} onChange={e => setArtistName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <p className={labelClass}>Genre / lane</p>
                  <input className={inputClass} placeholder="e.g. introspective UK rap" value={genre} onChange={e => setGenre(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1">
                <p className={labelClass}>Audience</p>
                <input className={inputClass} placeholder="Who are you talking to?" value={audience} onChange={e => setAudience(e.target.value)} />
              </div>

              <div className="space-y-1">
                <p className={labelClass}>Goal</p>
                <input className={inputClass} placeholder="Grow, deepen, convert, test a concept…" value={goal} onChange={e => setGoal(e.target.value)} />
              </div>

              {showAdvanced && (
                <div className="space-y-1">
                  <p className={labelClass}>Tone (used by Quick Caption in cards)</p>
                  <input
                    className={inputClass}
                    placeholder="brand-consistent, concise, human, engaging"
                    value={tone}
                    onChange={e => setTone(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Focus + week */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className={labelClass}>Focus mode</p>
                <select className={inputClass} value={focusMode} onChange={e => setFocusMode(e.target.value as CalendarFocus)}>
                  <option value="general">General content</option>
                  <option value="release">Upcoming release</option>
                  <option value="gig">Upcoming gig</option>
                  <option value="growth">Growth sprint</option>
                </select>
              </div>

              <div className="space-y-1">
                <p className={labelClass}>Week starting (Mon)</p>
                <input
                  type="date"
                  className={inputClass}
                  value={dateKey(weekStart)}
                  onChange={e => {
  if (!e.target.value) return
  setWeekStart(startOfWeekMonday(new Date(e.target.value + 'T12:00:00')))
}}

                />
              </div>
            </div>

            {/* Platforms */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-white/50">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {ALL_PLATFORMS.map(p => {
                  const active = selectedPlatforms.includes(p.key)
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => togglePlatform(p.key)}
                      className={`px-3 h-9 rounded-full border text-xs transition ${
                        active
                          ? 'border-ww-violet bg-ww-violet/20 text-white shadow-[0_0_14px_rgba(186,85,211,0.5)]'
                          : 'border-white/15 text-white/70 hover:border-ww-violet/70 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-[0.7rem] text-white/45">Tip: pick 2–3 platforms for more consistent ideas.</p>
            </div>

            {/* Volume + context */}
            <div className="grid gap-3 md:grid-cols-2">

              

              <div className="space-y-1">
  <p className={labelClass}>Weeks</p>
  <select className={inputClass} value={weekSpan} onChange={e => setWeekSpan(parseInt(e.target.value, 10) as any)}>
    <option value={1}>1 week</option>
    <option value={2}>2 weeks</option>
  </select>
</div>


              <div className="space-y-1">
                <p className={labelClass}>Release / gig context (optional)</p>
                <input className={inputClass} placeholder="Single name, date, gig, theme…" value={releaseContext} onChange={e => setReleaseContext(e.target.value)} />
              </div>
            </div>

            {/* ✅ Schedule length (API generator) */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className={labelClass}>Schedule length</p>
                <select className={inputClass} value={scheduleLength} onChange={e => setScheduleLength(e.target.value as any)}>
                  <option value="7">1 week</option>
<option value="14">2 weeks</option>
<option value="30">30 days</option>
<option value="60">60 days</option>
<option value="90">90 days</option>

                </select>
              </div>
              <div className="space-y-1">
                <p className={labelClass}>Start date (from week)</p>
                <input
                  type="date"
                  className={inputClass}
                  value={dateKey(weekStart)}
                  onChange={e => {
  if (!e.target.value) return
  setWeekStart(startOfWeekMonday(new Date(e.target.value + 'T12:00:00')))
}}

                />
              </div>
            </div>

            {/* ✅ Clean energy controls (no squashed grid) */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <button
                type="button"
                onClick={() => setShowEnergyControls(v => !v)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">Energy</p>
                  <p className="text-[0.75rem] text-white/60 mt-0.5">Keep the UI clean — open only when needed.</p>
                </div>
                {showEnergyControls ? <ChevronDown className="w-5 h-5 text-white/70" /> : <ChevronRightIcon className="w-5 h-5 text-white/70" />}
              </button>

              {showEnergyControls && (
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className={labelClass}>Preset</p>
                      <select
                        className={inputClass}
                        value={energyPreset}
                        onChange={e => applyEnergyPreset(e.target.value as any)}
                      >
                        <option value="balanced">Balanced</option>
                        <option value="weekday-grind">Weekday grind</option>
                        <option value="weekend-warrior">Weekend warrior</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <p className={labelClass}>Preview</p>
                      <div className="rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white/70 flex flex-wrap gap-2">
                        {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((d, i) => (
                          <span key={d} className="inline-flex items-center gap-1.5">
                            <span className="text-white/45">{d}</span>
                            <span className="inline-flex items-center gap-1">
                              {energyIcon(energyPattern[i] || 'medium')}
                              {energyLabel(energyPattern[i] || 'medium')}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {energyPreset === 'custom' && (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-white/50">Custom per-day</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((d, i) => (
                          <div key={d} className="space-y-1">
                            <p className="text-[0.7rem] text-white/55">{d}</p>
                            <select
                              className={inputClass + ' h-9 py-0'}
                              value={energyPattern[i] || 'medium'}
                              onChange={e => setDayEnergy(i, e.target.value as Energy)}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content mix (advanced) */}
            {showAdvanced && (
              <div className="space-y-3 pt-1">
                <p className="text-xs uppercase tracking-wide text-white/50">Content mix</p>
                <MixSlider label="Promo (music marketing)" value={mix.promo} onChange={n => setMix(v => ({ ...v, promo: n }))} />
                <MixSlider label="Brand (story/values)" value={mix.brand} onChange={n => setMix(v => ({ ...v, brand: n }))} />
                <MixSlider label="Community (questions)" value={mix.community} onChange={n => setMix(v => ({ ...v, community: n }))} />
                <MixSlider label="BTS / Process" value={mix.bts} onChange={n => setMix(v => ({ ...v, bts: n }))} />
                <MixSlider label="Lifestyle / Human" value={mix.lifestyle} onChange={n => setMix(v => ({ ...v, lifestyle: n }))} />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
  type="button"
  onClick={() => {
    if (scheduleLength === '7') handleGenerateWeekPlan()
    else handleGenerateScheduleFromApi()
  }}
  disabled={generating}
  className={primaryBtn}
>

                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? 'Generating…' : 'Generate plan'}

              </button>

              

            
              


              
          

              

              

              <p className="text-[0.7rem] text-white/45">
                Week plan creates <span className="text-white/75 font-semibold">{POSTS_PER_DAY * 7 * weekSpan}

</span> cards.
              </p>
            </div>
          </section>

          {/* RIGHT: Week / Month view */}
          <section className="rounded-3xl border border-white/10 bg-black/80 p-5 md:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">{viewMode === 'week' ? 'Week view' : 'Month view'}</p>
                <h2 className="text-lg font-semibold mt-1">{viewMode === 'week' ? weekTitle : monthTitle}</h2>
                <p className="text-xs text-white/60 mt-1">Drag and drop works in Month view. Click a card to open it.</p>
                <div className="h-px bg-white/10 my-2" />

              </div>
              {/* Calendar actions */}
<div className="flex flex-wrap items-center gap-2">
  {viewMode === 'week' ? (
    <>
      <button type="button" onClick={handleExportWeekCsv} className={miniOutlineBtn}>
        <Download className="w-3 h-3" />
        CSV
      </button>

      <button type="button" onClick={handleExportWeekPdf} className={miniOutlineBtn}>
        <Download className="w-3 h-3" />
        PDF
      </button>

      <button type="button" onClick={handleSendWeekToMomentum} className={miniOutlineBtn}>
        <Send className="w-3 h-3" />
        Send week to Momentum
      </button>
    </>
  ) : (
    <>
      <button type="button" onClick={handleExportMonthCsv} className={miniOutlineBtn}>
        <Download className="w-3 h-3" />
        CSV
      </button>
      <button type="button" onClick={handleSendMonthToMomentum} className={miniOutlineBtn}>
  <Send className="w-3 h-3" />
  Send month to Momentum
</button>


      <button type="button" onClick={handleClearCurrentMonth} className={miniOutlineBtn}>
        <X className="w-3 h-3" />
        Clear month
      </button>
    </>
  )}
</div>



              <div className="flex flex-wrap items-center gap-2">

                <div className="inline-flex items-center rounded-full border border-ww-violet/40 bg-black/60 p-1 mr-1 shadow-[0_0_18px_rgba(186,85,211,0.35)] hover:shadow-[0_0_22px_rgba(186,85,211,0.55)] transition">

                  <button
                    type="button"
                    onClick={() => setViewMode('week')}
                    className={`px-3 h-8 rounded-full text-xs font-medium transition-all ${
                      viewMode === 'week'
                        ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.6)]'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('month')}
                    className={`px-3 h-8 rounded-full text-xs font-medium transition-all ${
                      viewMode === 'month'
                        ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.6)]'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Month
                  </button>
                </div>

                {viewMode === 'week' ? (
                  <>
                    <button type="button" onClick={goThisWeek} className={miniOutlineBtn}>
                      <CheckCircle2 className="w-3 h-3" />
                      This week
                    </button>
                    <button
                      type="button"
                      onClick={goPrevWeek}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/15 text-white/80 hover:border-ww-violet hover:text-white transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={goNextWeek}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/15 text-white/80 hover:border-ww-violet hover:text-white transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    

                  

                    <button type="button" onClick={goThisMonth} className={miniOutlineBtn}>
                      <CheckCircle2 className="w-3 h-3" />
                      This month
                    </button>
                    <button
                      type="button"
                      onClick={goPrevMonth}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/15 text-white/80 hover:border-ww-violet hover:text-white transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={goNextMonth}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/15 text-white/80 hover:border-ww-violet hover:text-white transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    
                  </>
                )}
              </div>
            </div>

            {loadingItems ? (
              <div className="text-xs text-white/55 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading your calendar…
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                {viewMode === 'week' ? (
                  <div className="overflow-x-auto pb-2">
                    <div className="flex gap-3 min-w-full">
                      {weekDays.map((d, i) => {
                        const k = dateKey(d)
                        const list = weekItemsByDay[k] || []
                        const isToday = k === dateKey(new Date())
                        const dayLabel = d.toLocaleDateString('en-GB', { weekday: 'short' })
                        const dateLabel = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                        const energy = energyPattern[i] || 'medium'

                        return (
                          <div
                            key={k}
                            className={`rounded-2xl border p-3 bg-black/70 space-y-2 shrink-0 w-[230px] sm:w-[260px] lg:w-[220px] xl:w-[240px] ${
                              isToday ? 'border-ww-violet/60' : 'border-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-[0.72rem] text-white/55 flex items-center gap-2">
                                  <span className="font-semibold text-white/80">{dayLabel}</span>
                                  <span>{dateLabel}</span>
                                </div>
                                <div className="text-[0.65rem] text-white/50 flex items-center gap-1 mt-1">
                                  {energyIcon(energy)}
                                  Energy: {energyLabel(energy)}
                                </div>
                              </div>
                              {isToday && (
                                <span className="text-[0.6rem] px-2 py-1 rounded-full bg-ww-violet/15 text-ww-violet border border-ww-violet/30">
                                  Today
                                </span>
                              )}
                            </div>

                            <div className="space-y-2">
                              {list.map(it => (
  <ContentCard
    key={it.id}
    variant="pool"
    title={it.title || 'Untitled'}
    subtitle={platformLabel(it.platform)}
    
    previewText={it.caption || ''}
    onOpen={() => setExpandedItem(toSharedCard(it))}
  
  />
))}


                              {!list.length && (
                                <div className="text-[0.75rem] text-white/45 border border-dashed border-white/10 rounded-xl p-3">
                                  No cards here yet.
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-7 text-[0.7rem] uppercase tracking-wide text-white/40">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <div key={d} className="px-1 pb-1 text-center">
                          {d}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-white/10 rounded-2xl overflow-hidden text-xs">
                      {monthDays.map((d, idx) => {
                        const inCurrentMonth = d.getMonth() === currentMonth.getMonth()
                        const k = dateKey(d)
                        const dayItems = monthItemsByDay[k] || []
                        const isToday = k === dateKey(new Date())

                        return (
                          <Droppable droppableId={`day:${k}`} key={`${k}-${idx}`}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={[
                                  'min-h-[120px] bg-black/70 p-2 flex flex-col gap-1 text-left border border-transparent transition'
,
                                  inCurrentMonth ? '' : 'opacity-40',
                                  isToday ? 'border-ww-violet/70' : '',
                                  snapshot.isDraggingOver ? 'bg-ww-violet/5' : '',
                                ].join(' ')}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[0.7rem] text-white/60">{d.getDate()}</span>
                                  {isToday && (
                                    <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-ww-violet/20 text-ww-violet">Today</span>
                                  )}
                                </div>

                                <div className="flex flex-col gap-2 mt-1 min-h-[10px] max-h-[140px] overflow-y-auto pr-1">

                                  {dayItems.map((item, itemIdx) => (
                                    <Draggable draggableId={item.id} index={itemIdx} key={item.id}>
                                      {(dragProvided, dragSnapshot) => (
                                        <div
  ref={dragProvided.innerRef}
  {...dragProvided.draggableProps}
  {...dragProvided.dragHandleProps}
  className={dragSnapshot.isDragging ? 'scale-[0.99]' : ''}
  onClick={e => {
    e.stopPropagation()
    setExpandedItem(toSharedCard(item))
  }}
>
  <ContentCard
    variant="mini"
    title={item.title || item.metadata?.api?.short_label || 'Untitled'}

    subtitle={platformLabel(item.platform)}
    statusDotClass={statusDotColor(item.status)}
    // optional: tiny preview line (only if you want it in month view)
    // previewText={item.caption || ''}
    onOpen={() => setExpandedItem(toSharedCard(item))}
    
  />
</div>



                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              </div>
                            )}
                          </Droppable>
                        )
                      })}
                    </div>
                  </div>
                )}
              </DragDropContext>
            )}
          </section>
        </div>
      </section>

      {/* ✅ Shared ContentCardModal */}
      {expandedItem && (
        <div className="fixed inset-0 z-50" onClick={() => setExpandedItem(null)} onTouchStart={() => setExpandedItem(null)}>
          <div className="fixed inset-0 bg-black/70 backdrop-blur" aria-hidden />
          <div
  className="fixed inset-0 flex items-center justify-center px-4"
  onClick={e => e.stopPropagation()}
>

            <ContentCardModal
              open={!!expandedItem}
              onClose={() => setExpandedItem(null)}
              item={expandedItem}
              onItemPatched={patch => patchLocalItem(expandedItem.id, patch as any)}
              showQuickCaptionGen={true}
              getQuickGenContext={() => ({
                artistName: expandedItem.metadata?.artistName || artistName || profile.artistName || '',
                tone: expandedItem.metadata?.tone || tone || profile.tone || 'brand-consistent, concise, human, engaging',
              })}
              showSendToMomentum={true}
              showPdfExport={true}
            />
          </div>
        </div>
      )}
    </main>
  )
}
