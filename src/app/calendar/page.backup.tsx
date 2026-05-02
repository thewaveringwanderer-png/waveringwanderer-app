'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Toaster, toast } from 'sonner'
import {
  Sparkles,
  Loader2,
  Target,
  Send,
  CheckCircle2,
  X,
  Trash2,
} from 'lucide-react'

import LimitReachedPill from '@/components/ww/LimitReachedPill'
import ContentCardModal, { type ContentCard as SharedContentCard } from '@/components/ww/ContentCardModal'
import ContentCard from '@/components/ww/ContentCard'
import { useWwProfile } from '@/hooks/useWwProfile'
import { effectiveTier, getUsage, bumpUsage } from '@/lib/wwProfile'

// ---------- Supabase ----------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ---------- Types ----------
export type CalendarStatus = 'planned' | 'draft' | 'scheduled' | 'posted' | 'idea' | string
type CalendarFocus = 'release' | 'gig' | 'general' | 'growth'
type IdeaCount = 3 | 5 | 7 | 10
type LyricsFocus = 'general' | 'hook' | 'verse' | 'chorus'

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

type ApiCalendarItem = {
  date?: string
  platform?: string
  title?: string
  short_label?: string
  pillar?: string
  format?: string
  idea?: string
  suggested_caption?: string
  angle?: string
  cta?: string
}

const ALL_PLATFORMS: Array<{ key: string; label: string }> = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube Shorts' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'x', label: 'X / Twitter' },
]

const ALL_CONTENT_TYPES: Array<{ key: string; label: string }> = [
  { key: 'performance', label: 'Performance' },
  { key: 'story', label: 'Story' },
  { key: 'bts', label: 'BTS' },
  { key: 'community', label: 'Community' },
  { key: 'education', label: 'Education' },
  { key: 'visual', label: 'Visual' },
  { key: 'humour', label: 'Humour' },
]

// ---------- Helpers ----------
function dateKey(d: Date) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) {
    return new Date().toISOString().slice(0, 10)
  }
  return d.toISOString().slice(0, 10)
}

function addDays(date: Date, n: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toIsoAtDayWithMinutes(day: Date, minutesFromMidday: number) {
  const x = new Date(day)
  x.setHours(12, 0, 0, 0)
  x.setMinutes(x.getMinutes() + minutesFromMidday)
  return x.toISOString()
}

function randomSalt(len = 8) {
  const bytes = new Uint8Array(len)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

function safeString(x: any) {
  return typeof x === 'string' ? x : x == null ? '' : String(x)
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

function buildIdeaCaptionBlock(it: ApiCalendarItem) {
  const idea = safeString(it.idea)
  const format = safeString(it.format)
  const angle = safeString(it.angle)
  const cta = safeString(it.cta)
  const pillar = safeString(it.pillar)
  const caption = safeString(it.suggested_caption)

  const lines = [
    pillar ? `PILLAR: ${pillar}` : null,
    format ? `FORMAT: ${format}` : null,
    idea ? `IDEA: ${idea}` : null,
    angle ? `ANGLE: ${angle}` : null,
    cta ? `CTA: ${cta}` : null,
    '',
    caption || 'No caption generated yet.',
  ].filter(Boolean) as string[]

  return lines.join('\n')
}

function pickTitle(it: ApiCalendarItem) {
  const title = safeString(it.title).trim()
  if (title && title.toLowerCase() !== 'content slot') return title

  const shortLabel = safeString(it.short_label).trim()
  if (shortLabel) return shortLabel

  const pillar = safeString(it.pillar).trim()
  const format = safeString(it.format).trim()

  if (pillar && format) return `${pillar} • ${format}`
  if (pillar) return pillar
  if (format) return format

  return 'Content idea'
}

function toggleInArray(arr: string[], value: string) {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
}

// ---------- Component ----------

function InputSection({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-white/50">{title}</p>
        {hint ? <p className="text-[0.75rem] text-white/45 mt-1">{hint}</p> : null}
      </div>
      {children}
    </div>
  )
}

export default function CalendarPage() {
  const router = useRouter()

  const {
    profile,
    hasProfile: hasAnyProfile,
    setLocalOnly: applyTo,
    updateProfile: save,
  } = useWwProfile()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const tier = effectiveTier(profile)
  const usage = useMemo(() => (mounted ? getUsage(profile) : {}), [mounted, profile])
  const usedCalendarGenerations = Number((usage as any).calendar_generate_uses || 0)

  const freeLimitReached = mounted && tier === 'free' && usedCalendarGenerations >= 1
  const isCalendarLocked = freeLimitReached

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

  // ---------- Generator fields ----------
  const [artistName, setArtistName] = useState('')
  const [genre, setGenre] = useState('')
  const [audience, setAudience] = useState('')
  const [goal, setGoal] = useState('')
  const [tone, setTone] = useState('brand-consistent, concise, human, engaging')
  const [lyrics, setLyrics] = useState('')
  const [lyricsFocus, setLyricsFocus] = useState<LyricsFocus>('general')
  const [focusMode, setFocusMode] = useState<CalendarFocus>('general')
  const [releaseContext, setReleaseContext] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok', 'instagram', 'youtube'])
  const [contentTypes, setContentTypes] = useState<string[]>(['performance', 'story', 'bts'])
  const [ideaCount, setIdeaCount] = useState<IdeaCount>(5)

  // ---------- Data state ----------
  const [loadingItems, setLoadingItems] = useState(true)
  const [items, setItems] = useState<CalendarItem[]>([])
  const [generating, setGenerating] = useState(false)
  const [expandedItem, setExpandedItem] = useState<SharedContentCard | null>(null)
  const [viewMode, setViewMode] = useState<'latest' | 'all'>('latest')
  const [lastBatchId, setLastBatchId] = useState('')
  const [lastBatchLabel, setLastBatchLabel] = useState('')
  const [deletingBatch, setDeletingBatch] = useState(false)
  const [clearingAll, setClearingAll] = useState(false)
  const [sendingVisible, setSendingVisible] = useState(false)

  // ---------- Hydrate profile fields ----------
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

  // ---------- Load saved idea cards ----------
  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setLoadingItems(true)
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError || !userData?.user) {
          if (!cancelled) {
            setItems([])
            setLoadingItems(false)
          }
          return
        }

        const { data, error } = await supabase
          .from('content_calendar')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('feature', 'calendar')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('[idea-factory] load error', error)
          toast.error(error.message || 'Could not load ideas')
          if (!cancelled) {
            setItems([])
            setLoadingItems(false)
          }
          return
        }

        const nextItems = (data as CalendarItem[]) || []
        const newestBatchId =
          nextItems
            .map(it => safeString(it.metadata?.batchId))
            .find(Boolean) || ''

        const newestBatchLabel =
          nextItems.find(it => safeString(it.metadata?.batchId) === newestBatchId)?.metadata?.batchLabel || ''

        if (!cancelled) {
          setItems(nextItems)
          setLastBatchId(newestBatchId)
          setLastBatchLabel(newestBatchLabel)
        }
      } catch (e: any) {
        console.error('[idea-factory] load exception', e)
        toast.error(e?.message || 'Could not load ideas')
      } finally {
        if (!cancelled) setLoadingItems(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  // ---------- Derived ----------
  const visibleItems = useMemo(() => {
    if (viewMode === 'all' || !lastBatchId) return items
    return items.filter(it => safeString(it.metadata?.batchId) === lastBatchId)
  }, [items, lastBatchId, viewMode])

  const visibleCount = visibleItems.length

  const visiblePlatforms = useMemo(() => {
    return Array.from(new Set(visibleItems.map(it => safeString(it.platform)).filter(Boolean)))
  }, [visibleItems])

  // ---------- DB helpers ----------
  async function insertCalendarRows(rows: Array<Partial<CalendarItem>>) {
    const { data, error } = await supabase.from('content_calendar').insert(rows).select('*')
    if (error) throw new Error(error.message || 'Could not save idea cards')
    return (data as CalendarItem[]) || []
  }

  async function markItemsInMomentum(ids: string[], inMomentum: boolean) {
    if (!ids.length) return
    const { error } = await supabase.from('content_calendar').update({ in_momentum: inMomentum }).in('id', ids)
    if (error) throw new Error(error.message || 'Could not update momentum status')

    setItems(prev => prev.map(it => (ids.includes(it.id) ? { ...it, in_momentum: inMomentum } : it)))
  }

  function patchLocalItem(id: string, patch: Partial<CalendarItem>) {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, ...patch } : it)))
    setExpandedItem(prev => (prev && prev.id === id ? ({ ...prev, ...patch } as any) : prev))
  }

  // ---------- UI helpers ----------
  function togglePlatform(key: string) {
    setSelectedPlatforms(prev => toggleInArray(prev, key))
  }

  function toggleContentType(key: string) {
    setContentTypes(prev => toggleInArray(prev, key))
  }

  // ---------- Actions ----------
  async function handleGenerateIdeas() {
    void save({ artistName, genre, audience, goal, tone })
    setGenerating(true)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        toast.error('You must be logged in to generate ideas')
        return
      }

      const uid = userData.user.id
      const batchId = `idea_${Date.now()}`
      const batchLabel = `${ideaCount} ideas • ${new Date().toLocaleDateString('en-GB')}`
      const noveltySeed = randomSalt()
      const startDate = dateKey(new Date())

      const avoidTitles = items
        .slice(0, 60)
        .flatMap(it => {
          const t = safeString(it.title).trim()
          const c = safeString(it.caption).split('\n').slice(-1)[0]?.trim() || ''
          return [t, c]
        })
        .filter(Boolean)
        .slice(0, 60)

      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistName,
          genre,
          audience,
          goal,
          tone,
          focusMode,
          releaseContext,
          lyrics: lyrics.trim(),
          lyricsFocus,
          platforms: selectedPlatforms.length ? selectedPlatforms : ['instagram'],
          contentTypes: contentTypes.length ? contentTypes : ['performance', 'story'],
          ideaCount,
          avoidTitles,
          noveltySeed,
          // compatibility with your current route
          startDate,
          weeks: 1,
          postsPerWeek: ideaCount,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error || 'Failed to generate ideas')
        return
      }

      if (data?._fallback) {
        toast.warning('Idea Factory used fallback output.')
      }

      const apiItems: ApiCalendarItem[] = Array.isArray(data?.items) ? data.items : []
      if (!apiItems.length) {
        toast.error('No ideas were returned')
        return
      }

      const baseDate = new Date()
      const rows: Array<Partial<CalendarItem>> = apiItems.map((it, index) => {
        const dayDate = addDays(baseDate, index)
        const scheduled_at = toIsoAtDayWithMinutes(dayDate, index)

        return {
          user_id: uid,
          feature: 'calendar',
          in_momentum: false,
          status: 'planned',
          platform: safeString(it.platform) || selectedPlatforms[0] || 'instagram',
          scheduled_at,
          title: pickTitle(it),
          caption: buildIdeaCaptionBlock(it),
          hashtags: null,
          metadata: {
            batchId,
            batchLabel,
            source: 'idea_factory_v1',
            ideaCount,
            contentTypes,
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

      const saved = await insertCalendarRows(rows)

      setItems(prev => [...saved, ...prev])
      setLastBatchId(batchId)
      setLastBatchLabel(batchLabel)
      setViewMode('latest')

      toast.success(`${ideaCount} ideas generated ✅`)

      if (tier === 'free') {
        await bumpUsage('calendar_generate_uses' as any)
      }
    } catch (e: any) {
      console.error('[idea-factory] generate error', e)
      toast.error(e?.message || 'Could not generate ideas')
    } finally {
      setGenerating(false)
    }
  }

  async function handleDeleteIdeaCard(id: string) {
  const ok = window.confirm('Delete this idea card?')
  if (!ok) return

  try {
    const { error } = await supabase.from('content_calendar').delete().eq('id', id)
    if (error) throw new Error(error.message || 'Could not delete idea card')

    setItems(prev => prev.filter(item => item.id !== id))

    if (expandedItem?.id === id) {
      setExpandedItem(null)
    }

    toast.success('Idea card deleted ✅')
  } catch (e: any) {
    console.error('[idea-factory] delete card error', e)
    toast.error(e?.message || 'Could not delete idea card')
  }
}

  async function handleSendVisibleToMomentum() {
    const ids = visibleItems.filter(it => !it.in_momentum).map(it => it.id)
    if (!ids.length) {
      toast.info('These ideas are already in Momentum Board')
      return
    }

    setSendingVisible(true)
    try {
      await markItemsInMomentum(ids, true)
      toast.success('Ideas sent to Momentum Board ✅')
    } catch (e: any) {
      console.error('[idea-factory] send visible error', e)
      toast.error(e?.message || 'Could not send ideas to Momentum Board')
    } finally {
      setSendingVisible(false)
    }
  }

  async function handleDeleteLastBatch() {
    if (!lastBatchId) {
      toast.info('No recent batch found')
      return
    }

    const ok = window.confirm('Delete the latest generated idea batch?')
    if (!ok) return

    setDeletingBatch(true)
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
        .eq('metadata->>batchId', lastBatchId)

      if (error) throw new Error(error.message || 'Could not delete latest batch')

      const remaining = items.filter(it => safeString(it.metadata?.batchId) !== lastBatchId)
      const nextBatchId = remaining.map(it => safeString(it.metadata?.batchId)).find(Boolean) || ''
      const nextBatchLabel =
        remaining.find(it => safeString(it.metadata?.batchId) === nextBatchId)?.metadata?.batchLabel || ''

      setItems(remaining)
      setLastBatchId(nextBatchId)
      setLastBatchLabel(nextBatchLabel)

      toast.success('Latest batch deleted ✅')
    } catch (e: any) {
      console.error('[idea-factory] delete batch error', e)
      toast.error(e?.message || 'Could not delete latest batch')
    } finally {
      setDeletingBatch(false)
    }
  }

  async function handleClearAllIdeas() {
    const ok = window.confirm('Clear all saved idea cards? This cannot be undone.')
    if (!ok) return

    setClearingAll(true)
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

      if (error) throw new Error(error.message || 'Could not clear ideas')

      setItems([])
      setLastBatchId('')
      setLastBatchLabel('')
      toast.success('All ideas cleared ✅')
    } catch (e: any) {
      console.error('[idea-factory] clear all error', e)
      toast.error(e?.message || 'Could not clear ideas')
    } finally {
      setClearingAll(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Toaster position="top-center" richColors />

      <section className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <header className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-ww-violet" />
              Idea Factory
            </h1>
            <p className="text-white/70 max-w-3xl">
              Generate strong content ideas here. Organise and track them later in the Momentum Board.
            </p>
          </div>

          {mounted && hasAnyProfile && (
            <button type="button" onClick={applyProfileFromCentral} className={outlineBtn}>
              <Sparkles className="w-4 h-4" />
              Apply WW profile
            </button>
          )}
        </header>

        <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)] xl:grid-cols-[460px_minmax(0,1fr)]">
          {/* LEFT: Generator */}
          <section className="rounded-3xl border border-white/10 bg-black/80 p-5 md:p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">Setup</p>
                <h2 className="text-lg font-semibold mt-1 flex items-center gap-2">
                  <Target className="w-4 h-4 text-ww-violet" />
                  Generator
                </h2>
              </div>
            </div>

            <InputSection title="Core brief" hint="Who this is for and what the content needs to do.">
  <div className="grid gap-3 md:grid-cols-2">
    <div className="space-y-1">
      <p className={labelClass}>Artist name</p>
      <input
        className={inputClass}
        placeholder="e.g. natestapes"
        value={artistName}
        onChange={e => setArtistName(e.target.value)}
      />
    </div>

    <div className="space-y-1">
      <p className={labelClass}>Genre / lane</p>
      <input
        className={inputClass}
        placeholder="e.g. introspective UK rap"
        value={genre}
        onChange={e => setGenre(e.target.value)}
      />
    </div>
  </div>

  <div className="space-y-1">
    <p className={labelClass}>Audience</p>
    <input
      className={inputClass}
      placeholder="Who are you talking to?"
      value={audience}
      onChange={e => setAudience(e.target.value)}
    />
  </div>

  <div className="space-y-1">
    <p className={labelClass}>Goal</p>
    <input
      className={inputClass}
      placeholder="Grow, deepen, convert, test a concept…"
      value={goal}
      onChange={e => setGoal(e.target.value)}
    />
  </div>

  <div className="space-y-1">
    <p className={labelClass}>Focus mode</p>
    <select className={inputClass} value={focusMode} onChange={e => setFocusMode(e.target.value as CalendarFocus)}>
      <option value="general">General content</option>
      <option value="release">Upcoming release</option>
      <option value="gig">Upcoming gig</option>
      <option value="growth">Growth sprint</option>
    </select>
  </div>
</InputSection>

<InputSection title="Generation settings" hint="Choose what kind of ideas to generate.">
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
  </div>

  <div className="space-y-2">
    <p className="text-xs uppercase tracking-wide text-white/50">Content types</p>
    <div className="flex flex-wrap gap-2">
      {ALL_CONTENT_TYPES.map(t => {
        const active = contentTypes.includes(t.key)
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => toggleContentType(t.key)}
            className={`px-3 h-9 rounded-full border text-xs transition ${
              active
                ? 'border-ww-violet bg-ww-violet/20 text-white shadow-[0_0_14px_rgba(186,85,211,0.5)]'
                : 'border-white/15 text-white/70 hover:border-ww-violet/70 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  </div>

  <div className="space-y-2">
    <p className="text-xs uppercase tracking-wide text-white/50">Idea count</p>
    <div className="flex flex-wrap gap-2">
      {[3, 5, 7, 10].map(n => {
        const active = ideaCount === n
        return (
          <button
            key={n}
            type="button"
            onClick={() => setIdeaCount(n as IdeaCount)}
            className={`px-3 h-9 rounded-full border text-xs transition ${
              active
                ? 'border-ww-violet bg-ww-violet/20 text-white shadow-[0_0_14px_rgba(186,85,211,0.5)]'
                : 'border-white/15 text-white/70 hover:border-ww-violet/70 hover:text-white'
            }`}
          >
            {n} ideas
          </button>
        )
      })}
    </div>
  </div>
</InputSection>

<InputSection title="Optional context" hint="Extra detail to shape the ideas without cluttering the core brief.">
  <div className="space-y-1">
    <p className={labelClass}>Release / gig context</p>
    <input
      className={inputClass}
      placeholder="Single name, date, gig, theme…"
      value={releaseContext}
      onChange={e => setReleaseContext(e.target.value)}
    />
  </div>

  <div className="space-y-1">
    <p className={labelClass}>Lyrics focus</p>
    <select
      className={inputClass}
      value={lyricsFocus}
      onChange={e => setLyricsFocus(e.target.value as LyricsFocus)}
    >
      <option value="general">Use lyrics (general)</option>
      <option value="hook">Focus on hook</option>
      <option value="chorus">Focus on chorus</option>
      <option value="verse">Focus on verse</option>
    </select>
  </div>

  <div className="space-y-1">
    <p className={labelClass}>Lyrics</p>
    <textarea
      className={inputClass + ' min-h-[120px]'}
      placeholder="Paste lyrics or a short section."
      value={lyrics}
      onChange={e => setLyrics(e.target.value)}
    />
  </div>

</InputSection>

<div className="pt-1 space-y-2">
  <button
    type="button"
    onClick={() => {
      if (tier === 'free' && ideaCount > 3) {
        toast.error('Free plan can generate up to 3 ideas. Upgrade for more.')
        return
      }

      handleGenerateIdeas()
    }}
    disabled={generating || isCalendarLocked}
    className={`${primaryBtn} w-full justify-center ${freeLimitReached ? 'opacity-70' : ''}`}
  >
    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
    {generating ? 'Generating…' : 'Generate ideas'}
  </button>

  {freeLimitReached ? (
    <LimitReachedPill
      message="You've used your 1 free idea generation."
      onUpgrade={() => router.push('/#pricing')}
    />
  ) : null}

  <p className="text-[0.7rem] text-white/45">
    Generates <span className="text-white/75 font-semibold">{ideaCount}</span> idea cards.
  </p>
</div>

          </section>

          {/* RIGHT: Results */}
          <section className="rounded-3xl border border-white/10 bg-black/80 p-5 md:p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">Results</p>
                <h2 className="text-lg font-semibold mt-1">Idea cards</h2>
                <p className="text-xs text-white/60 mt-1">
                  Generate, review, then send the best ones to Momentum Board.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center rounded-full border border-ww-violet/40 bg-black/60 p-1 shadow-[0_0_18px_rgba(186,85,211,0.35)]">
                  <button
                    type="button"
                    onClick={() => setViewMode('latest')}
                    className={`px-3 h-8 rounded-full text-xs font-medium transition-all ${
                      viewMode === 'latest'
                        ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.6)]'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Latest batch
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('all')}
                    className={`px-3 h-8 rounded-full text-xs font-medium transition-all ${
                      viewMode === 'all'
                        ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.6)]'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    All ideas
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSendVisibleToMomentum}
                  disabled={!visibleItems.length || sendingVisible}
                  className={miniOutlineBtn}
                >
                  {sendingVisible ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Send to Momentum
                </button>

                <button
                  type="button"
                  onClick={handleDeleteLastBatch}
                  disabled={!lastBatchId || deletingBatch}
                  className={miniOutlineBtn}
                >
                  {deletingBatch ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                  Delete latest batch
                </button>

                <button
                  type="button"
                  onClick={handleClearAllIdeas}
                  disabled={!items.length || clearingAll}
                  className={miniOutlineBtn}
                >
                  {clearingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                  Clear all
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-wrap items-center gap-3 text-xs text-white/65">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-ww-violet" />
                Showing <span className="text-white/85 font-medium">{visibleCount}</span> cards
              </span>

              {lastBatchLabel ? (
                <span className="px-2 py-1 rounded-full border border-white/10 bg-black/40 text-white/75">
                  {lastBatchLabel}
                </span>
              ) : null}

              {visiblePlatforms.length ? (
                <span className="text-white/55">
                  Platforms: {visiblePlatforms.map(platformLabel).join(', ')}
                </span>
              ) : null}
            </div>

            {loadingItems ? (
              <div className="text-xs text-white/55 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading your ideas…
              </div>
            ) : visibleItems.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {visibleItems.map(item => (
  <div key={item.id} className="relative group">
    {item.in_momentum ? (
      <div className="absolute top-2 left-2 z-10 text-[10px] px-2 py-1 rounded-full bg-ww-violet/15 text-ww-violet border border-ww-violet/30">
        In Momentum
      </div>
    ) : null}

    <button
      type="button"
      onClick={e => {
        e.stopPropagation()
        handleDeleteIdeaCard(item.id)
      }}
      className="absolute top-2 right-2 z-10 inline-flex items-center justify-center w-8 h-8 rounded-full border border-red-500/30 bg-black/70 text-red-300 opacity-0 group-hover:opacity-100 transition hover:bg-red-500/10 hover:border-red-400 hover:text-red-200"
      title="Delete idea card"
    >
      <Trash2 className="w-4 h-4" />
    </button>

    <ContentCard
      variant="pool"
      title={item.title || item.metadata?.api?.short_label || 'Untitled'}
      subtitle={platformLabel(item.platform)}
      previewText={item.caption || ''}
      statusDotClass={statusDotColor(item.status)}
      onOpen={() => setExpandedItem(toSharedCard(item))}
    />
  </div>
))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/40 p-8 text-center space-y-2">
                <p className="text-white/80 font-medium">No idea cards yet</p>
                <p className="text-sm text-white/50">
                  Generate a batch on the left and your ideas will appear here.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>

      {expandedItem && (
        <div className="fixed inset-0 z-50" onClick={() => setExpandedItem(null)} onTouchStart={() => setExpandedItem(null)}>
          <div className="fixed inset-0 bg-black/70 backdrop-blur" aria-hidden />
          <div className="fixed inset-0 flex items-center justify-center px-4" onClick={e => e.stopPropagation()}>
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