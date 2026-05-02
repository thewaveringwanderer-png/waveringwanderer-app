'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Toaster, toast } from 'sonner'
import {
  Sparkles,
  Brain,
  Loader2,
  Target,
  Send,
  CheckCircle2,
  X,
  Trash2,
  ChevronDown,
} from 'lucide-react'

import LimitReachedPill from '@/components/ww/LimitReachedPill'
import ContentCardModal, { type ContentCard as SharedContentCard } from '@/components/ww/ContentCardModal'
import { useWwProfile } from '@/hooks/useWwProfile'
import { effectiveTier, getUsage, bumpUsage } from '@/lib/wwProfile'
import { useGeneratingMessages } from '@/hooks/useGeneratingMessages'

export const dynamic = 'force-dynamic'
// ---------- Supabase ----------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ---------- Types ----------
export type CalendarStatus = 'planned' | 'draft' | 'scheduled' | 'posted' | 'idea' | string
type CalendarFocus = 'release' | 'gig' | 'general' | 'growth'|'old release'
type IdeaCount = 3 | 5 | 7 | 10
type LyricsFocus = 'general' | 'hook' | 'verse' | 'chorus'
type IdeaDepth = 'simple' | 'balanced' | 'detailed'

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
  structured?: {
    title?: string
    platform?: string
    contentType?: string
    hook?: string
    concept?: string
    execution?: string
    cta?: string
    why?: string[]
  }
}

type StructuredIdea = {
  title?: string
  platform?: string
  contentType?: string
  hook?: string
  concept?: string
  execution?: string
  cta?: string
  why?: string[]
}

type ContextSourceType = 'manual' | 'campaign' | 'release_strategy'

type CampaignContextLite = {
  id: string
  title?: string | null
  notes?: string | null
  created_at: string
  inputs?: any
  concepts?: any
}

type ReleaseStrategyContextLite = {
  id: string
  title?: string | null
  notes?: string | null
  created_at: string
  inputs?: any
  result?: any
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

const PERFORMANCE_STYLE_EXAMPLES = [
  'I rap to camera over beats, no instruments. I make thoughtful content about my life and music, sometimes with a bit of comedy. I usually film at home, outside, or around London while working my bar job.',
  'I sing and play piano, mostly filming at home or in the studio. I mix live performance clips with behind-the-scenes songwriting content, and I am currently building towards my next single release.',
  'I am in a band and we film rehearsal clips, live shows, and studio sessions. We want ideas that help promote new releases, keep older songs moving, and show our personality outside of just performances.',
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

function parseIdeaCardCaptionBlock(caption: string | null | undefined) {
  const raw = safeString(caption)
  const lines = raw.split('\n')

  const readField = (label: string) => {
    const found = lines.find(line => line.startsWith(`${label}:`))
    return found ? found.replace(`${label}:`, '').trim() : ''
  }

  const pillar = readField('PILLAR')
  const format = readField('FORMAT')
  const idea = readField('IDEA')
  const angle = readField('ANGLE')
  const cta = readField('CTA')

  const blankIndex = lines.findIndex(line => !line.trim())
  const captionBody =
    blankIndex >= 0
      ? lines.slice(blankIndex + 1).join('\n').trim()
      : raw.trim()

  return {
    pillar,
    format,
    idea,
    angle,
    cta,
    captionBody,
  }
}

function contentTypeLabel(value: string | null | undefined) {
  const v = safeString(value).toLowerCase().trim()

  if (
    v.includes('performance')
  ) return 'Performance'
  if (
    v.includes('story') ||
    v.includes('talking') ||
    v.includes('camera')
  ) return 'Story'
  if (
    v.includes('bts') ||
    v.includes('behind')
  ) return 'BTS'
  if (
    v.includes('community') ||
    v.includes('audience')
  ) return 'Community'
  if (
    v.includes('education') ||
    v.includes('breakdown')
  ) return 'Education'
  if (
    v.includes('visual') ||
    v.includes('cinematic')
  ) return 'Visual'
  if (
    v.includes('humour') ||
    v.includes('humor') ||
    v.includes('funny')
  ) return 'Humour'

  return 'Idea'
}

function getStructuredIdea(item: CalendarItem): StructuredIdea | null {
  const structured = item?.metadata?.structured
  if (!structured || typeof structured !== 'object') return null
  return structured as StructuredIdea
}

function whyThisWorksLines(item: CalendarItem) {
  const parsed = parseIdeaCardCaptionBlock(item.caption)
  const lines: string[] = []

  if (parsed.angle) {
    lines.push(parsed.angle)
  }

  if (parsed.format) {
    lines.push(`${contentTypeLabel(parsed.format)} format gives the idea a clear structure.`)
  }

  if (parsed.pillar) {
    lines.push(`Built around your ${parsed.pillar.toLowerCase()} pillar so it stays on-brand.`)
  }

  if (!lines.length) {
    lines.push('Designed to give you a clearer hook, format, and posting angle.')
  }

  return lines.slice(0, 3)
}

function sourceLabel(item: CalendarItem) {
  const source = safeString(item.metadata?.contextSource)

  if (source === 'campaign') return 'Campaign'
  if (source === 'release_strategy') return 'Release Strategy'

  const focus = safeString(item.metadata?.focusMode)
  if (focus === 'old_release') return 'Old Release'
  if (focus === 'release') return 'Release'
  if (focus === 'gig') return 'Gig'
  if (focus === 'growth') return 'Growth'

  return 'Manual'
}

function sourceBadgeClass(label: string) {
  if (label === 'Campaign') {
    return 'border-ww-violet/25 bg-ww-violet/10 text-ww-violet'
  }
  if (label === 'Release Strategy') {
    return 'border-sky-400/25 bg-sky-400/10 text-sky-200'
  }
  if (label === 'Old Release') {
    return 'border-amber-400/25 bg-amber-400/10 text-amber-200'
  }
  return 'border-white/10 bg-black/40 text-white/65'
}

// ---------- Component ----------

function InputSection({
  title,
  hint,
  children,
  variant = 'default',
}: {
  title: string
  hint?: string
  children: React.ReactNode
  variant?: 'default' | 'subtle'
}) {
  const isSubtle = variant === 'subtle'

  return (
    <div
      className={[
        'rounded-2xl p-4 md:p-5 space-y-4 transition',
        isSubtle
          ? 'border border-white/8 bg-black/35'
          : 'border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.05] via-black to-black hover:border-ww-violet/35 hover:shadow-[0_0_18px_rgba(186,85,211,0.12)]',
      ].join(' ')}
    >
      <div>
        <div className="h-[2px] w-10 bg-ww-violet/60 rounded-full mb-3" />
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">{title}</p>
        {hint ? (
          <p className="mt-2 text-sm leading-relaxed text-white/66">
            {hint}
          </p>
        ) : null}
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  )
}

function IdeaResultCard({
  item,
  onOpen,
  onDelete,
}: {
  item: CalendarItem
  onOpen: () => void
  onDelete: () => void
}) {
  const [showWhy, setShowWhy] = useState(false)

  const parsed = parseIdeaCardCaptionBlock(item.caption)
const structured = getStructuredIdea(item)

const title =
  safeString(structured?.title).trim() ||
  safeString(item.title).trim() ||
  safeString(item.metadata?.api?.short_label).trim() ||
  'Untitled idea'

const concept =
  safeString(structured?.concept).trim() ||
  parsed.idea ||
  parsed.captionBody ||
  'A platform-ready content idea built from your artist brief.'

const rawHook = safeString(structured?.hook).trim() || ''
const titleLower = title.toLowerCase()
const conceptLower = concept.toLowerCase()

const hook =
  rawHook && rawHook.toLowerCase() !== titleLower
    ? rawHook
    : concept && conceptLower !== titleLower
    ? concept
    : ''

const execution =
  safeString(structured?.execution).trim() ||
  parsed.angle ||
  parsed.captionBody ||
  'Open the card to view the full idea.'

const cta =
  safeString(structured?.cta).trim() ||
  parsed.cta ||
  'Use this idea as a starting point and adapt it to your voice.'

const whyLines =
  Array.isArray(structured?.why) && structured!.why.length
    ? structured!.why.filter(Boolean).slice(0, 3)
    : whyThisWorksLines(item)



const formatLabel = contentTypeLabel(
  safeString(structured?.contentType).trim() ||
    safeString(item.metadata?.api?.pillar).trim() ||
    parsed.format ||
    safeString(item.metadata?.api?.format).trim()
)

const sourceTag = sourceLabel(item)

const searchParams = useSearchParams()



  return (
   <div className="relative h-full rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-4 md:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition hover:border-ww-violet/40 hover:shadow-[0_0_24px_rgba(186,85,211,0.18)] flex flex-col">
      {item.in_momentum ? (
        <div className="absolute top-3 left-3 z-10 text-[10px] px-2 py-1 rounded-full bg-ww-violet/15 text-ww-violet border border-ww-violet/30">
          In Momentum
        </div>
      ) : null}

      

      <div className="flex items-start justify-between gap-3">
  <div className="inline-flex items-center gap-2 flex-wrap pr-16">
    <span className="text-[10px] uppercase tracking-wide text-white/45">
      {platformLabel(item.platform)}
    </span>

    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide whitespace-nowrap ${sourceBadgeClass(sourceTag)}`}
    >
      {sourceTag}
    </span>
  </div>
</div>

<div className="absolute top-3 right-3">
  <span className="inline-flex items-center rounded-full border border-ww-violet/25 bg-ww-violet/10 px-2.5 py-1 text-[11px] text-ww-violet whitespace-nowrap">
    {formatLabel}
  </span>
</div>

      <div className="mt-3 space-y-3">
        <h3 className="text-lg md:text-xl font-semibold leading-snug text-white pr-6">
          {title}
        </h3>

        <p className="text-sm leading-relaxed text-white/62">
          {concept}
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {hook ? (
  <div className="rounded-2xl border border-white/8 bg-black/35 p-3">
    <p className="text-[11px] uppercase tracking-[0.16em] text-white/40 mb-1">Hook</p>
    <p className="text-sm font-medium leading-relaxed text-white">
      {hook}
    </p>
  </div>
) : null}

        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/40 mb-1.5">
            What happens
          </p>
          <p className="text-sm leading-relaxed text-white/72">
            {execution}
          </p>
        </div>

        {cta ? (
  <div>
    <p className="text-[11px] uppercase tracking-[0.16em] text-white/40 mb-1.5">
      CTA
    </p>
    <p className="text-sm leading-relaxed text-white/72">
      {cta}
    </p>
  </div>
) : null}
      </div>

      <div className="mt-auto pt-5">
  <div>
    <button
      type="button"
      onClick={() => setShowWhy(prev => !prev)}
      className="text-xs text-ww-violet hover:text-white transition"
    >
      {showWhy ? 'Hide why this works' : 'Why this works'}
    </button>

    {showWhy ? (
      <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3 space-y-2">
        {whyLines.map((line, index) => (
          <div key={index} className="flex gap-2 text-xs text-white/65 leading-relaxed">
            <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-ww-violet shrink-0" />
            <span>{line}</span>
          </div>
        ))}
      </div>
    ) : null}
  </div>

  <div className="mt-5 flex items-center gap-2">
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ww-violet px-4 h-10 text-xs font-semibold text-white shadow-[0_0_16px_rgba(186,85,211,0.45)] hover:shadow-[0_0_22px_rgba(186,85,211,0.7)] active:scale-95 transition"
    >
      Open idea
    </button>

    <button
      type="button"
      onClick={onDelete}
      className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/15 text-white/70 hover:border-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
      title="Delete idea card"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
</div>
    </div>
  )
}

function CalendarPageInner() {
  const router = useRouter()



  const {
    profile,
    hasProfile: hasAnyProfile,
    setLocalOnly: applyTo,
    updateProfile: save,
    updateProfile,
  } = useWwProfile()

useEffect(() => {
  if (profile && !profile.onboarding_started) {
    updateProfile({ onboarding_started: true })
  }
}, [profile])
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const tier = effectiveTier(profile)
  const usage = useMemo(() => (mounted ? getUsage(profile) : {}), [mounted, profile])
  const usedCalendarGenerations = Number((usage as any).calendar_generate_uses || 0)
const [calendarFreeLimitReached, setCalendarFreeLimitReached] = useState(false)

  const freeLimitReached =
  mounted && tier === 'free' && (usedCalendarGenerations >= 1 || calendarFreeLimitReached)

const isCalendarLocked = freeLimitReached
  const searchParams = useSearchParams()
  

  // ---------- Shared styles ----------
  const primaryBtn =
    'inline-flex items-center gap-2 px-4 h-10 rounded-full bg-ww-violet text-white text-xs md:text-sm font-semibold ' +
    'shadow-[0_0_16px_rgba(186,85,211,0.7)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] ' +
    'active:scale-95 transition disabled:opacity-60'

  const outlineBtn =
  'inline-flex items-center gap-2 px-4 h-10 rounded-full border border-white/15 text-white/80 text-xs md:text-sm ' +
  'hover:border-ww-violet/50 hover:bg-ww-violet/10 hover:text-white transition disabled:opacity-60'

  const miniOutlineBtn =
  'inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-white/10 text-[0.75rem] text-white/72 ' +
  'hover:border-ww-violet/50 hover:bg-ww-violet/10 hover:text-white transition disabled:opacity-60'

  const compactOutlineBtn =
  'inline-flex items-center gap-2 px-3 h-9 rounded-full border border-white/15 text-xs text-white/80 whitespace-nowrap ' +
  'hover:border-ww-violet/50 hover:bg-ww-violet/10 hover:text-white transition disabled:opacity-60'

 const selectClass =
  'w-full rounded-xl bg-black/60 px-3 py-2.5 text-sm text-white placeholder:text-white/30 ' +
  'border border-white/5 hover:border-white/10 focus:border-ww-violet/40 focus:ring-0 outline-none transition-all duration-200'

 const labelClass = 'text-xs text-white/78 flex items-center gap-1'

 const panelClass =
  'relative overflow-hidden rounded-[28px] border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.07] via-black/95 to-black shadow-[0_0_24px_rgba(186,85,211,0.10)]'

const sectionCardClass =
  'rounded-2xl border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.05] via-black to-black p-4 md:p-5 transition hover:border-ww-violet/35 hover:shadow-[0_0_18px_rgba(186,85,211,0.14)]'

const chipClass = (active: boolean) =>
  `px-3 h-9 rounded-full border text-xs transition ${
    active
      ? 'border-ww-violet/70 bg-ww-violet/18 text-white shadow-[0_0_10px_rgba(186,85,211,0.28)]'
      : 'border-white/8 bg-black/35 text-white/68 hover:border-ww-violet/40 hover:text-white'
  }`

const outputInnerCardClass =
  'rounded-2xl border border-white/10 bg-black/45 backdrop-blur-sm p-4'

  // ---------- Generator fields ----------
  const [artistName, setArtistName] = useState('')
const [genre, setGenre] = useState('')
const [artistType, setArtistType] = useState('other')
const [performanceStyle, setPerformanceStyle] = useState('')
const [audience, setAudience] = useState('')
const [goal, setGoal] = useState('')
const [tone, setTone] = useState('brand-consistent, concise, human, engaging')
const [ideaDepth, setIdeaDepth] = useState<IdeaDepth>('balanced')
const [lyrics, setLyrics] = useState('')
const [lyricsFocus, setLyricsFocus] = useState<LyricsFocus>('general')
const [focusMode, setFocusMode] = useState<CalendarFocus>('general')
const [releaseContext, setReleaseContext] = useState('')
const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok', 'instagram', 'youtube'])
const [contentTypes, setContentTypes] = useState<string[]>(['performance', 'story', 'bts'])
const [ideaCount, setIdeaCount] = useState<IdeaCount>(5)
useEffect(() => {
  if (mounted && tier === 'free' && ideaCount !== 7) {
    setIdeaCount(7)
  }
}, [mounted, tier, ideaCount])
const [showPerformanceStyleHelp, setShowPerformanceStyleHelp] = useState(false)
const [showAdvancedInputs, setShowAdvancedInputs] = useState(false)
const [sortMode, setSortMode] = useState<'newest' | 'platform' | 'content_type' | 'source'>('newest')
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
  

const [contextSource, setContextSource] = useState<ContextSourceType>('manual')

const [savedCampaigns, setSavedCampaigns] = useState<CampaignContextLite[]>([])
const [selectedCampaignId, setSelectedCampaignId] = useState('')
const [loadingCampaigns, setLoadingCampaigns] = useState(false)

const [savedReleaseStrategies, setSavedReleaseStrategies] = useState<ReleaseStrategyContextLite[]>([])
const [selectedReleaseStrategyId, setSelectedReleaseStrategyId] = useState('')
const [loadingReleaseStrategies, setLoadingReleaseStrategies] = useState(false)

const from = searchParams.get('from')
const brandEssence = searchParams.get('brandEssence')
const positioning = searchParams.get('positioning')
const audienceFromIdentity = searchParams.get('audience')
const toneFromIdentity = searchParams.get('tone')
const creativeWorldFromIdentity = searchParams.get('creativeWorld')

const campaignName = searchParams.get('campaignName')
const campaignHook = searchParams.get('campaignHook')
const campaignSynopsis = searchParams.get('campaignSynopsis')
const artistNameFromCampaign = searchParams.get('artistName')
useEffect(() => {
  if (from === 'identity') {
    setAudience(prev => prev || audienceFromIdentity || '')
    setTone(prev => prev || toneFromIdentity || '')
    setReleaseContext(prev => prev || creativeWorldFromIdentity || '')
    setGoal(prev => prev || positioning || '')
  }

  if (from === 'campaign') {
    setArtistName(prev => prev || artistNameFromCampaign || '')
    setReleaseContext(prev => prev || campaignName || '')
    setGoal(prev => prev || campaignHook || '')
    setTone(prev => prev || campaignSynopsis || '')
  }
}, [
  from,
  positioning,
  audienceFromIdentity,
  toneFromIdentity,
  creativeWorldFromIdentity,
  campaignName,
  campaignHook,
  campaignSynopsis,
  artistNameFromCampaign,
])

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

  useEffect(() => {
  if (
    releaseContext.trim() ||
    tone.trim() !== 'brand-consistent, concise, human, engaging' ||
    lyrics.trim() ||
    lyricsFocus !== 'general'
  ) {
    setShowAdvancedInputs(true)
  }
}, [releaseContext, tone, lyrics, lyricsFocus])

useEffect(() => {
  let cancelled = false



  ;(async () => {
    setLoadingCampaigns(true)
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        if (!cancelled) setSavedCampaigns([])
        return
      }

      const { data, error } = await supabase
        .from('campaign_concepts')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[idea-factory] campaigns load error', error)
        if (!cancelled) setSavedCampaigns([])
        return
      }

      if (!cancelled) {
        setSavedCampaigns((data as CampaignContextLite[]) || [])
      }
    } catch (e) {
      console.error('[idea-factory] campaigns load exception', e)
      if (!cancelled) setSavedCampaigns([])
    } finally {
      if (!cancelled) setLoadingCampaigns(false)
    }
  })()

  return () => {
    cancelled = true
  }
}, [])

useEffect(() => {
  let cancelled = false

  ;(async () => {
    setLoadingReleaseStrategies(true)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        if (!cancelled) setSavedReleaseStrategies([])
        return
      }

      const { data, error } = await supabase
        .from('release_strategies')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[idea-factory] release strategies load error', error)
        if (!cancelled) setSavedReleaseStrategies([])
        return
      }

      if (!cancelled) {
        setSavedReleaseStrategies((data || []) as ReleaseStrategyContextLite[])
      }
    } catch (e) {
      console.error('[idea-factory] release strategies load exception', e)
      if (!cancelled) setSavedReleaseStrategies([])
    } finally {
      if (!cancelled) setLoadingReleaseStrategies(false)
    }
  })()

  return () => {
    cancelled = true
  }
}, [])

  // ---------- Derived ----------
 const visibleItems = useMemo(() => {
  const base =
    viewMode === 'all' || !lastBatchId
      ? items
      : items.filter(it => safeString(it.metadata?.batchId) === lastBatchId)

  const filtered = base.filter(it => !it.in_momentum)

  const sorted = [...filtered]

  if (sortMode === 'platform') {
  sorted.sort((a, b) => platformLabel(a.platform).localeCompare(platformLabel(b.platform)))
} else if (sortMode === 'content_type') {
  sorted.sort((a, b) => {
    const aType = contentTypeLabel(
      safeString(getStructuredIdea(a)?.contentType).trim() ||
        safeString(a.metadata?.api?.pillar).trim() ||
        safeString(a.metadata?.api?.format).trim()
    )

    const bType = contentTypeLabel(
      safeString(getStructuredIdea(b)?.contentType).trim() ||
        safeString(b.metadata?.api?.pillar).trim() ||
        safeString(b.metadata?.api?.format).trim()
    )

    return aType.localeCompare(bType)
  })
} else if (sortMode === 'source') {
  sorted.sort((a, b) => sourceLabel(a).localeCompare(sourceLabel(b)))
} else {
  sorted.sort((a, b) => {
    const aTime = new Date(a.created_at || 0).getTime()
    const bTime = new Date(b.created_at || 0).getTime()
    return bTime - aTime
  })
}

  return sorted
}, [items, lastBatchId, viewMode, sortMode])

  const visibleCount = visibleItems.length

  const visiblePlatforms = useMemo(() => {
    return Array.from(new Set(visibleItems.map(it => safeString(it.platform)).filter(Boolean)))
  }, [visibleItems])

const generatingMessage = useGeneratingMessages(generating)

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

function applyCampaignContext(row: CampaignContextLite) {
  const inp = row.inputs || {}
  const concepts = row.concepts?.concepts || row.concepts || []
  const firstConcept = Array.isArray(concepts) ? concepts[0] : null

  setArtistName(inp.artistName || artistName)
  setGenre(inp.genre || genre)
  setAudience(inp.audience || audience)
  setGoal(inp.goal || goal)
  setShowAdvancedInputs(false)

  const campaignTitle = safeString(row.title || firstConcept?.name || '').trim()
  const campaignHook = safeString(firstConcept?.hook || '').trim()
  const campaignSynopsis = safeString(firstConcept?.synopsis || '').trim()

  

  const tones = Array.isArray(firstConcept?.caption_tones) ? firstConcept.caption_tones.filter(Boolean) : []
  if (tones.length && (!tone.trim() || tone === 'brand-consistent, concise, human, engaging')) {
  setTone(tones.join(', '))
}

  setContextSource('campaign')
  toast.success('Campaign context applied ✅')
}

function applyReleaseStrategyContext(row: ReleaseStrategyContextLite) {
  const inp = row?.inputs || {}
  const result = row?.result || {}

  setArtistName(inp.artistName || artistName)
  setGoal(inp.headlineGoal || goal)

  const project = safeString(inp.projectTitle || '').trim()
  const releaseTypeValue = safeString(inp.releaseType || '').trim()
  const releaseDateValue = safeString(inp.releaseDate || '').trim()
  const platformFocusValue = safeString(inp.platformFocus || '').trim()
  const coreStoryValue = safeString(inp.coreStory || '').trim()

  const releaseBits = [
    project ? `Project: ${project}` : '',
    releaseTypeValue ? `Type: ${releaseTypeValue}` : '',
    releaseDateValue ? `Date: ${releaseDateValue}` : '',
    platformFocusValue ? `Platform focus: ${platformFocusValue}` : '',
  ].filter(Boolean)

  if (releaseBits.length && !releaseContext.trim()) {
    setReleaseContext(releaseBits.join(' • '))
  }

  if (coreStoryValue && !performanceStyle.trim()) {
    setPerformanceStyle(coreStoryValue)
  }

  setContextSource('release_strategy')
  toast.success('Release strategy context applied ✅')
}

  // ---------- Actions ----------
  async function handleGenerateIdeas() {

    if (tier === 'free' && ideaCount !== 7) {
  setIdeaCount(7)
  toast.info('Free plan uses 7 ideas.')
  return
}

if (isCalendarLocked) {
  toast.info('Upgrade to Creator to keep using Idea Factory.')
  router.push('/#pricing')
  return
}

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
          artistType,
          performanceStyle,
          audience,
          goal,
          tone,
          ideaDepth,
          focusMode,
          releaseContext,
          lyrics: lyrics.trim(),
          lyricsFocus,
          platforms: selectedPlatforms.length ? selectedPlatforms : ['instagram'],
          ideaCount: tier === 'free' ? 7 : ideaCount,
          contentTypes: contentTypes.length ? contentTypes : ['performance', 'story'],
          avoidTitles,
          noveltySeed,
          contextSource,
selectedCampaignId: selectedCampaignId || null,
selectedReleaseStrategyId: selectedReleaseStrategyId || null,
campaignContext:
  contextSource === 'campaign'
    ? savedCampaigns.find(row => row.id === selectedCampaignId) || null
    : null,

releaseStrategyContext:
  contextSource === 'release_strategy'
    ? savedReleaseStrategies.find(row => row.id === selectedReleaseStrategyId) || null
    : null,
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
  toast.warning(
    data?._fallbackReason
      ? `Idea Factory used fallback output (${data._fallbackReason}).`
      : 'Idea Factory used fallback output.'
  )
}

      const apiItems: ApiCalendarItem[] = Array.isArray(data?.items) ? data.items : []
      if (!apiItems.length) {
        toast.error('No ideas were returned')
        return
      }

      const baseDate = new Date()
      const rows: Array<Partial<CalendarItem>> = apiItems.map((it, index) => {
        

        return {
          user_id: uid,
          feature: 'calendar',
          in_momentum: false,
          status: 'planned',
          platform: safeString(it.platform) || selectedPlatforms[0] || 'instagram',
          scheduled_at: null,
          title: pickTitle(it),
          caption: buildIdeaCaptionBlock(it),
          hashtags: null,
          metadata: {
  batchId,
  batchLabel,
  source: 'idea_factory_v1',
  contextSource,
  selectedCampaignId: selectedCampaignId || null,
  selectedReleaseStrategyId: selectedReleaseStrategyId || null,
  campaignTitle:
    contextSource === 'campaign'
      ? savedCampaigns.find(row => row.id === selectedCampaignId)?.title || null
      : null,
  releaseStrategyTitle:
    contextSource === 'release_strategy'
      ? savedReleaseStrategies.find(row => row.id === selectedReleaseStrategyId)?.title || null
      : null,
  ideaCount,
  contentTypes,
  focusMode,
  artistName,
  genre,
  artistType,
  performanceStyle,
  audience,
  goal,
  tone,
  ideaDepth,
  releaseContext: releaseContext || null,
  api: {
    short_label: safeString(it.short_label),
    pillar: safeString(it.pillar),
    format: safeString(it.format),
    idea: safeString(it.idea),
    angle: safeString(it.angle),
    cta: safeString(it.cta),
  },
  structured: it.structured || null,
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
  setCalendarFreeLimitReached(true)
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

    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
      <header className="border-b border-white/10 pb-6">
  <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
    <div className="max-w-3xl">
      <div className="inline-flex items-center gap-2 text-[13px] tracking-[0.22em] text-ww-violet/80 uppercase">
        <Brain className="w-4 h-4" />
        <span>Idea Factory</span>
      </div>

      <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">
        Turn ideas into content
      </h1>

      <p className="mt-3 text-sm md:text-base leading-relaxed text-white/65 max-w-2xl">
        Generate platform-ready content ideas tailored to your sound, audience, and current moment — without repeating yourself.
      </p>
    </div>
  </div>
</header>

{from === 'identity' ? (
  <div className="mb-4 rounded-2xl border border-ww-violet/20 bg-ww-violet/[0.06] p-4">
    <p className="text-[11px] uppercase tracking-[0.16em] text-ww-violet/80">Context loaded</p>
    <p className="mt-2 text-sm text-white/80 leading-relaxed">
      Using your Identity Kit to shape content ideas from your brand, audience, tone, and creative world.
    </p>
  </div>
) : null}

{from === 'campaign' ? (
  <div className="mb-4 rounded-2xl border border-ww-violet/20 bg-ww-violet/[0.06] p-4">
    <p className="text-[11px] uppercase tracking-[0.16em] text-ww-violet/80">Context loaded</p>
    <p className="mt-2 text-sm text-white/80 leading-relaxed">
      Using your campaign direction to shape content ideas from the selected concept, hook, and rollout angle.
    </p>
  </div>
) : null}

      <div className="grid gap-6 xl:gap-7 lg:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.15fr)] lg:items-start">
        {/* LEFT: INPUTS */}
        <section className={panelClass + ' self-start p-5 md:p-6 xl:p-7 space-y-5'}>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 left-1/2 h-[220px] w-[380px] -translate-x-1/2 rounded-full bg-ww-violet/10 blur-[80px]" />
          </div>

          <div className="relative flex items-start justify-between gap-4 flex-wrap">
  <div className="max-w-xl">
    <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Input</p>
    <h2 className="mt-1 text-lg md:text-xl font-semibold text-white">Build your content brief</h2>
    <p className="mt-2 text-sm text-white/62 leading-relaxed">
      Give the tool the real context behind your music, content style, and current moment so the ideas feel specific, usable, and less repetitive.
    </p>
  </div>

            {mounted && hasAnyProfile && (
              <button type="button" onClick={applyProfileFromCentral} className={compactOutlineBtn}>
                <Sparkles className="w-4 h-4" />
Use WW profile
              </button>
            )}
          </div>

          <div className={sectionCardClass}>
  <div>
    <div className="h-[2px] w-10 bg-ww-violet/60 rounded-full mb-3" />
    <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">Context source</p>
    <p className="mt-2 text-sm leading-relaxed text-white/66">
      Start from your manual brief, or load saved strategy context to turn bigger rollout thinking into content ideas.
    </p>
  </div>

  <div className="flex flex-wrap gap-2">
    {[
      { key: 'manual', label: 'Manual brief' },
      { key: 'campaign', label: 'Saved campaign' },
      { key: 'release_strategy', label: 'Release strategy' },
    ].map((option) => {
      const active = contextSource === option.key
      return (
        <button
          key={option.key}
          type="button"
          onClick={() => setContextSource(option.key as ContextSourceType)}
          className={chipClass(active)}
        >
          {option.label}
        </button>
      )
    })}
  </div>

  {contextSource === 'campaign' ? (
    <div className="space-y-2">
      <p className={labelClass}>Load saved campaign</p>
      {selectedCampaignId ? (
      <div className="mt-2 rounded-2xl border border-ww-violet/15 bg-black/40 p-3 space-y-2">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">
          Applied campaign context
        </p>

        {(() => {
          const row = savedCampaigns.find(item => item.id === selectedCampaignId)
          const conceptsRoot = row?.concepts?.concepts || row?.concepts || []
          const firstConcept = Array.isArray(conceptsRoot) ? conceptsRoot[0] : null

          return (
            <>
              <p className="text-sm font-medium text-white">
  {row?.title || firstConcept?.name || 'Saved campaign'}
</p>

              {firstConcept?.hook ? (
                <p className="text-xs text-white/58 leading-relaxed">
  <span className="text-white/42 uppercase tracking-[0.14em]">Hook:</span> {firstConcept.hook}
</p>
              ) : null}

              {firstConcept?.synopsis ? (
                <p className="text-xs text-white/58 leading-relaxed">
                  {firstConcept.synopsis}
                </p>
              ) : null}
            </>
          )
        })()}
      </div>
    ) : null}
      <select
        className={selectClass}
        value={selectedCampaignId}
        onChange={(e) => {
          const id = e.target.value
          setSelectedCampaignId(id)
          const row = savedCampaigns.find((item) => item.id === id)
          if (row) applyCampaignContext(row)
        }}
      >
        <option value="">{loadingCampaigns ? 'Loading campaigns...' : 'Select a saved campaign...'}</option>
        {savedCampaigns.map((row) => (
          <option key={row.id} value={row.id}>
            {(row.title || row.inputs?.artistName || 'Untitled campaign') +
              ' — ' +
              new Date(row.created_at).toLocaleDateString('en-GB')}
          </option>
        ))}
      </select>
    </div>
  ) : null}

  {contextSource === 'release_strategy' ? (
  <div className={outputInnerCardClass}>
    <div className="space-y-2">
      <p className={labelClass}>Load release strategy</p>
      <select
        className={selectClass}
        value={selectedReleaseStrategyId}
        onChange={(e) => {
          const id = e.target.value
          setSelectedReleaseStrategyId(id)
          const row = savedReleaseStrategies.find((item) => item.id === id)
          if (row) applyReleaseStrategyContext(row)
        }}
      >
        <option value="">
          {loadingReleaseStrategies ? 'Loading release strategies...' : 'Select a release strategy...'}
        </option>
        {savedReleaseStrategies.map((row) => (
          <option key={row.id} value={row.id}>
            {(row.title || row.inputs?.projectTitle || 'Untitled release strategy') +
              ' — ' +
              new Date(row.created_at).toLocaleDateString('en-GB')}
          </option>
        ))}
      </select>

      <p className="text-xs text-white/50">
        Load a saved release strategy to turn rollout planning into actual content ideas.
      </p>

      {selectedReleaseStrategyId ? (
        <div className="mt-3 rounded-2xl border border-ww-violet/15 bg-black/40 p-3 space-y-2">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">
            Applied release strategy
          </p>

          {(() => {
            const row = savedReleaseStrategies.find(item => item.id === selectedReleaseStrategyId)
            const inp = row?.inputs || {}
            const result = row?.result || {}

            return (
              <>
                <p className="text-sm font-medium text-white">
                  {row?.title || inp?.projectTitle || 'Saved release strategy'}
                </p>

                {inp?.releaseType || inp?.releaseDate ? (
                  <p className="text-xs text-white/58 leading-relaxed">
                    <span className="text-white/42 uppercase tracking-[0.14em]">Release:</span>{' '}
                    {[inp?.releaseType, inp?.releaseDate].filter(Boolean).join(' • ')}
                  </p>
                ) : null}

                {result?.summary ? (
                  <p className="text-xs text-white/58 leading-relaxed">
                    {String(result.summary)}
                  </p>
                ) : null}
              </>
            )
          })()}
        </div>
      ) : null}
    </div>
  </div>
) : null}
</div>
          <InputSection
  title="Core brief"
  hint="Define your artist context so the ideas feel specific to you."
>
  <div className="grid gap-3 md:grid-cols-2">
    <div className="space-y-1">
      <p className={labelClass}>Artist name</p>
      <input
        className={selectClass}
        placeholder="e.g. natestapes"
        value={artistName}
        onChange={e => setArtistName(e.target.value)}
      />
    </div>

    <div className="space-y-1">
      <p className={labelClass}>Genre / lane</p>
      <input
        className={selectClass}
        placeholder="e.g. introspective UK rap"
        value={genre}
        onChange={e => setGenre(e.target.value)}
      />
    </div>
  </div>

  <div className="grid gap-3 md:grid-cols-2">
    <div className="space-y-1">
      <p className={labelClass}>Artist type</p>
      <select
        className={selectClass}
        value={artistType}
        onChange={e => setArtistType(e.target.value)}
      >
        <option value="rapper">Rapper</option>
        <option value="singer">Singer</option>
        <option value="producer">Producer</option>
        <option value="dj">DJ</option>
        <option value="band">Band</option>
        <option value="instrumentalist">Instrumentalist</option>
        <option value="singer-songwriter">Singer-songwriter</option>
        <option value="other">Other</option>
      </select>
    </div>

    <div className="space-y-1">
      <p className={labelClass}>Guidance level</p>
      <select
        className={selectClass}
        value={ideaDepth}
        onChange={e => setIdeaDepth(e.target.value as IdeaDepth)}
      >
        <option value="simple">Simple</option>
        <option value="balanced">Balanced</option>
        <option value="detailed">Detailed</option>
      </select>
    </div>
  </div>

  <div className="space-y-1">
    <p className={labelClass}>Audience</p>
    <input
      className={selectClass}
      placeholder="Who are you talking to?"
      value={audience}
      onChange={e => setAudience(e.target.value)}
    />
  </div>

  <div className="space-y-1">
    <p className={labelClass}>Goal</p>
    <input
      className={selectClass}
      placeholder="Grow, deepen, convert, test a concept…"
      value={goal}
      onChange={e => setGoal(e.target.value)}
    />
  </div>

 

  <div
  className={`rounded-2xl border ${
    !performanceStyle.trim()
      ? 'border-ww-violet/25 bg-ww-violet/[0.04]'
      : 'border-white/8 bg-black/35'
  } p-3 space-y-3 transition`}
>
     <div className="space-y-3">
  <div className="flex items-center gap-2">
    <p className={labelClass}>How you create and post content</p>

    <span className="rounded-full border border-ww-violet/30 bg-ww-violet/10 px-2 py-0.5 text-[7px] uppercase tracking-wide text-ww-violet">
      Recommended
    </span>

    <button
      type="button"
      onClick={() => setShowPerformanceStyleHelp(prev => !prev)}
      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/15 text-[11px] text-white/60 transition hover:border-ww-violet/50 hover:text-white"
      aria-label="How you actually make content help"
      aria-expanded={showPerformanceStyleHelp}
    >
      ?
    </button>
  </div>

  {showPerformanceStyleHelp ? (
  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[11px] leading-relaxed text-white/72">
    This helps avoid generic ideas. The more specific you are here, the better your results will be.
    <br />
    <br />
    Describe how you actually create and post content. Include useful details like whether you sing,
    rap, play instruments, produce in a DAW, perform live, use lyric overlays, make thoughtful content,
    show your daily life, or sometimes add humour.
    <br />
    <br />
    You can also include what is going on in your life or career right now — for example whether you are
    going to the studio, promoting a new song, pushing an older release, rehearsing for live shows,
    working a full-time job, balancing parenting, low on money, or in a big momentum-building phase.
  </div>
) : null}
    <input
      className={selectClass}
      placeholder="e.g. I sing to camera with piano at home, and post thoughtful behind-the-scenes clips"
      value={performanceStyle}
      onChange={e => setPerformanceStyle(e.target.value)}
    />

    <div className="relative">
  <div className="-mx-1 overflow-x-auto pb-1 pr-10">
    <div className="flex w-max gap-2 px-1">
      {PERFORMANCE_STYLE_EXAMPLES.map(example => (
        <button
          key={example}
          type="button"
          onClick={() => setPerformanceStyle(example)}
          className="max-w-[320px] shrink-0 rounded-2xl border border-white/8 bg-black/35 px-3 py-2 text-left text-[11px] leading-relaxed text-white/68 transition hover:border-ww-violet/40 hover:bg-ww-violet/10 hover:text-white"
        >
          {example}
        </button>
      ))}
    </div>
  </div>

  <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/80 px-2 py-1 text-xs text-white/55">
    &gt;
  </div>
</div>
  </div>
</div>



  <div className="space-y-1">
    <p className={labelClass}>Focus mode</p>
    <select
      className={selectClass}
      value={focusMode}
      onChange={e => setFocusMode(e.target.value as CalendarFocus)}
    >
      <option value="general">General content</option>
      <option value="release">Upcoming release</option>
      <option value="old_release">Old release</option>
      <option value="gig">Upcoming gig</option>
      <option value="growth">Growth sprint</option>
    </select>
  </div>
</InputSection>

          <InputSection
            title="Content settings"
            hint="Choose platforms, content types, and how many ideas to generate."
          >
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
                {[3, 5, 7, 10].map((n) => {
  const active = ideaCount === n
  const disabled = tier === 'free' && n !== 7

  return (
    <button
      key={n}
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        setIdeaCount(n as IdeaCount)
      }}
      className={`px-3 h-9 rounded-full border text-xs transition ${
        disabled
          ? 'opacity-40 cursor-not-allowed text-white/35 border-white/10'
          : active
          ? 'border-ww-violet bg-ww-violet/20 text-white shadow-[0_0_12px_rgba(186,85,211,0.4)]'
          : 'border-white/15 text-white/70 hover:border-ww-violet'
      }`}
      title={disabled ? 'Creator only' : undefined}
    >
      {n} ideas
{mounted && disabled ? ' · Creator' : ''}
    </button>
  )
})}

              </div>
            </div>
          </InputSection>

         <div className="rounded-2xl border border-white/8 bg-black/35 p-4 transition">
  <button
    type="button"
    onClick={() => setShowAdvancedInputs(prev => !prev)}
    className="flex w-full items-center justify-between gap-3 text-left"
  >
    <div>
      <p className="text-[0.7rem] uppercase tracking-[0.14em] text-white/85 font-medium">
        Advanced settings
      </p>
      <p className="mt-1 text-[0.78rem] text-white/60 leading-relaxed">
        Add release context, lyrics, and extra detail when you want more tailored results.
      </p>
    </div>

    <span
  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-black/50 text-white/65 transition ${
    showAdvancedInputs ? 'rotate-180' : ''
  }`}
>
  <ChevronDown className="w-4 h-4" />
</span>
  </button>

  {showAdvancedInputs ? (
    <div className="mt-4 space-y-4 border-t border-white/8 pt-4">
      <div className="space-y-1">
        <p className={labelClass}>Content focus context</p>
        <input
          className={selectClass}
          placeholder="Song name, release angle, old release note, gig, theme..."
          value={releaseContext}
          onChange={e => setReleaseContext(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <p className={labelClass}>Tone</p>
        <input
          className={selectClass}
          placeholder="brand-consistent, concise, human, engaging"
          value={tone}
          onChange={e => setTone(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <p className={labelClass}>Lyrics focus</p>
        <select
          className={selectClass}
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
          className={selectClass + ' min-h-[120px] resize-none'}
          placeholder="Paste lyrics or a short section."
          value={lyrics}
          onChange={e => setLyrics(e.target.value)}
        />
      </div>
    </div>
  ) : null}
</div>

          <div className="relative pt-1 space-y-2">
  {isCalendarLocked && (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-ww-violet/20 bg-black/60 px-4 py-3 shadow-[0_0_18px_rgba(186,85,211,0.10)]">
      <p className="text-sm text-white/80">
        You’ve used your free Idea Factory preview.
      </p>

      <button
        type="button"
        onClick={() => router.push('/#pricing')}
        className="h-9 px-4 rounded-xl bg-gradient-to-r from-ww-violet/80 to-ww-violet text-white text-sm font-medium shadow-[0_0_12px_rgba(186,85,211,0.25)] hover:shadow-[0_0_18px_rgba(186,85,211,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Upgrade
      </button>
    </div>
  )}

  <button
    type="button"
    onClick={() => {
      if (isCalendarLocked) {
        toast.info('Upgrade to Creator to keep using Idea Factory.')
        router.push('/#pricing')
        return
      }

      if (!performanceStyle.trim()) {
        toast.info('Tip: adding how you actually make content usually gives much more targeted ideas.')
      }

      handleGenerateIdeas()
    }}
    disabled={generating}
    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ww-violet px-4 h-10 text-sm font-semibold text-white shadow-[0_0_16px_rgba(186,85,211,0.6)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] active:scale-95 transition disabled:opacity-60"
  >
    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
    {isCalendarLocked
      ? 'Upgrade to Creator to continue'
      : generating
      ? 'Generating ideas…'
      : 'Generate ideas'}
  </button>

  <p className="text-[0.75rem] text-white/50 min-h-[20px]">
    {generating
      ? generatingMessage
      : 'Better inputs create stronger hooks, formats, and content angles.'}
  </p>
</div>
        </section>

        {/* RIGHT: RESULTS */}
        <section className="relative self-start overflow-hidden rounded-[28px] border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.05] via-black to-black p-5 md:p-6 xl:p-7 space-y-5 shadow-[0_0_20px_rgba(186,85,211,0.08)]">
          <div className="relative flex flex-col gap-4 border-b border-white/10 pb-5">
  <div className="flex items-start justify-between gap-4">
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Output</p>
      <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-white">
        Your momentum stack
      </h2>
      <p className="mt-2 max-w-2xl text-sm md:text-base leading-relaxed text-white/62">
        Review the strongest ideas, open the ones worth developing, and send the best to Momentum Board.
      </p>
    </div>
  </div>

  <div className="rounded-2xl border border-white/8 bg-black/35 p-3 space-y-3">
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] uppercase tracking-[0.16em] text-white/42">Sort</span>

      {[
        { key: 'newest', label: 'Newest' },
        { key: 'platform', label: 'Platform' },
        { key: 'content_type', label: 'Content type' },
      ].map((option) => {
        const active = sortMode === option.key
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => setSortMode(option.key as typeof sortMode)}
            className={`px-3 h-8 rounded-full border text-xs transition ${
              active
                ? 'border-ww-violet/70 bg-ww-violet/18 text-white shadow-[0_0_10px_rgba(186,85,211,0.28)]'
                : 'border-white/8 bg-black/35 text-white/68 hover:border-ww-violet/40 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>

    <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/65">
      <span className="inline-flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-ww-violet" />
        Showing <span className="text-white/85 font-medium">{visibleCount}</span> cards
      </span>

      {contextSource === 'campaign' && selectedCampaignId ? (
        <span className="inline-flex items-center px-2 py-1 rounded-full border border-white/8 bg-black/40 text-white/62 whitespace-nowrap">
          Source: {savedCampaigns.find(row => row.id === selectedCampaignId)?.title || 'Saved campaign'}
        </span>
      ) : null}

      {contextSource === 'release_strategy' && selectedReleaseStrategyId ? (
        <span className="inline-flex items-center px-2 py-1 rounded-full border border-white/8 bg-black/40 text-white/62 whitespace-nowrap">
          Strategy: {savedReleaseStrategies.find(row => row.id === selectedReleaseStrategyId)?.title || 'Release strategy'}
        </span>
      ) : null}

      {lastBatchLabel ? (
        <span className="px-2 py-1 rounded-full border border-white/8 bg-black/55 text-white/72">
          {lastBatchLabel}
        </span>
      ) : null}

      {visiblePlatforms.length ? (
        <span className="text-white/55">
          Platforms: {visiblePlatforms.map(platformLabel).join(', ')}
        </span>
      ) : null}
    </div>
  </div>
</div>

<div className="flex flex-col gap-4">
  <div className="h-px w-full bg-white/10" />

  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="inline-flex items-center rounded-full border border-ww-violet/25 bg-black/50 p-1">
      <button
        type="button"
        onClick={() => setViewMode('latest')}
        className={`h-8 rounded-full px-3 text-xs font-medium transition ${
          viewMode === 'latest'
            ? 'bg-ww-violet text-white shadow-[0_0_14px_rgba(186,85,211,0.45)]'
            : 'text-white/60 hover:text-white'
        }`}
      >
        Latest
      </button>

      <button
        type="button"
        onClick={() => setViewMode('all')}
        className={`h-8 rounded-full px-3 text-xs font-medium transition ${
          viewMode === 'all'
            ? 'bg-ww-violet text-white shadow-[0_0_14px_rgba(186,85,211,0.45)]'
            : 'text-white/60 hover:text-white'
        }`}
      >
        All
      </button>
    </div>

    <div className="flex items-center justify-end gap-3 shrink-0">
      <button
        type="button"
        onClick={handleSendVisibleToMomentum}
        disabled={!visibleItems.length || sendingVisible}
        aria-label="Send to Momentum"
        className={`group relative h-12 w-12 rounded-xl border flex items-center justify-center transition ${
          !visibleItems.length || sendingVisible
            ? 'border-white/10 bg-black/30 text-white/30 cursor-not-allowed'
            : 'border-ww-violet/60 bg-black/55 text-ww-violet shadow-[0_0_18px_rgba(186,85,211,0.35)] hover:border-ww-violet/80 hover:bg-ww-violet/15 hover:text-white hover:shadow-[0_0_24px_rgba(186,85,211,0.55)]'
        }`}
      >
        {sendingVisible ? (
          <Loader2 className="w-4 h-4 animate-spin text-white/70" />
        ) : (
          <Send className="w-4 h-4" />
        )}

        <span className="pointer-events-none absolute -bottom-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/90 px-3 py-1 text-[11px] text-white/75 opacity-0 shadow-[0_0_16px_rgba(0,0,0,0.45)] transition group-hover:opacity-100">
          Send all to Momentum
        </span>
      </button>

      <button
        type="button"
        onClick={handleDeleteLastBatch}
        disabled={!lastBatchId || deletingBatch}
        aria-label="Delete batch"
        className={`group relative h-12 w-12 rounded-xl border flex items-center justify-center transition ${
          !lastBatchId || deletingBatch
            ? 'border-white/10 bg-black/30 text-white/30 cursor-not-allowed'
            : 'border-white/10 bg-black/55 text-white/70 hover:border-ww-violet/60 hover:bg-ww-violet/10 hover:text-white hover:shadow-[0_0_18px_rgba(186,85,211,0.35)]'
        }`}
      >
        {deletingBatch ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <X className="w-4 h-4" />
        )}

        <span className="pointer-events-none absolute -bottom-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/90 px-3 py-1 text-[11px] text-white/75 opacity-0 shadow-[0_0_16px_rgba(0,0,0,0.45)] transition group-hover:opacity-100">
          Delete batch
        </span>
      </button>

      <button
        type="button"
        onClick={handleClearAllIdeas}
        disabled={!items.length || clearingAll}
        aria-label="Clear all"
        className={`group relative h-12 w-12 rounded-xl border flex items-center justify-center transition ${
          !items.length || clearingAll
            ? 'border-white/10 bg-black/30 text-white/30 cursor-not-allowed'
            : 'border-white/10 bg-black/55 text-white/70 hover:border-red-400/60 hover:bg-red-400/10 hover:text-white hover:shadow-[0_0_18px_rgba(248,113,113,0.35)]'
        }`}
      >
        {clearingAll ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}

        <span className="pointer-events-none absolute -bottom-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/90 px-3 py-1 text-[11px] text-white/75 opacity-0 shadow-[0_0_16px_rgba(0,0,0,0.45)] transition group-hover:opacity-100">
          Clear all
        </span>
      </button>
    </div>
  </div>
</div>

          {loadingItems ? (
  <div className="text-xs text-white/55 flex items-center gap-2">
    <Loader2 className="w-4 h-4 animate-spin" />
    Loading your ideas…
  </div>
) : generating ? (
  <div className="space-y-4">
    <div className="rounded-2xl border border-ww-violet/15 bg-black/45 p-4">
      <p className="text-sm font-medium text-white/80">This is what your idea cards will look like</p>
      <p className="mt-1 text-xs text-white/50">
        We’re building your ideas now...
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[24px] border border-ww-violet/15 bg-gradient-to-br from-ww-violet/[0.05] via-black to-black p-4 md:p-5 opacity-90"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="h-3 w-16 rounded bg-white/10" />
            <div className="h-6 w-20 rounded-full bg-ww-violet/10 border border-ww-violet/20" />
          </div>

          <div className="mt-5 space-y-3 blur-[2px]">
            <div className="h-7 w-3/4 rounded bg-white/10" />
            <div className="h-4 w-full rounded bg-white/8" />
            <div className="h-4 w-5/6 rounded bg-white/8" />
          </div>

          <div className="mt-5 space-y-4 blur-[2px]">
            <div className="rounded-2xl border border-white/8 bg-black/35 p-3 space-y-2">
              <div className="h-3 w-12 rounded bg-white/10" />
              <div className="h-4 w-4/5 rounded bg-white/10" />
              <div className="h-4 w-2/3 rounded bg-white/10" />
            </div>

            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-white/10" />
              <div className="h-4 w-full rounded bg-white/8" />
              <div className="h-4 w-5/6 rounded bg-white/8" />
            </div>

            <div className="space-y-2">
              <div className="h-3 w-10 rounded bg-white/10" />
              <div className="h-4 w-2/3 rounded bg-white/8" />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <div className="h-10 flex-1 rounded-full bg-ww-violet/20" />
            <div className="h-10 w-10 rounded-full bg-white/8" />
          </div>
        </div>
      ))}
    </div>
  </div>
) : visibleItems.length ? (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {visibleItems.map(item => (
      <div key={item.id} className="group">
        <IdeaResultCard
          item={item}
          onOpen={() => setExpandedItem(toSharedCard(item))}
          onDelete={() => handleDeleteIdeaCard(item.id)}
        />
      </div>
    ))}
  </div>
) : (
  <div className="relative overflow-hidden rounded-[28px] border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.06] via-black to-black p-6 md:p-7 xl:p-8 shadow-[0_0_24px_rgba(186,85,211,0.10)]">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-20 left-1/2 h-[240px] w-[420px] -translate-x-1/2 rounded-full bg-ww-violet/10 blur-[90px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(186,85,211,0.07),transparent_55%)]" />
    </div>

    <div className="relative">
      <div className="relative rounded-2xl border border-ww-violet/20 bg-gradient-to-r from-ww-violet/[0.12] via-ww-violet/[0.05] to-transparent p-4">
  <p className="text-sm font-medium text-white">Turn strategy into actual content</p>
  <p className="mt-1 text-xs leading-relaxed text-white/60">
    Idea Factory is the execution engine of the workflow. Use your brief, campaigns, or release strategy
    to generate content ideas that are aligned, specific, and ready to develop.
  </p>
</div>
<span className="text-white/40 text-sm h-8">
  Tip: Load a campaign or release strategy to generate more focused ideas.
</span>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className={outputInnerCardClass}>
          <p className="text-xs uppercase tracking-wide text-white/45">Idea Factory gives you</p>
          <ul className="mt-3 space-y-2 text-sm text-white/78">
            <li>Platform-ready content angles</li>
            <li>Stronger hooks and clearer formats</li>
            <li>More variety without losing brand consistency</li>
            <li>Ideas you can send straight to Momentum Board</li>
          </ul>
        </div>

        <div className={outputInnerCardClass}>
  <p className="text-xs uppercase tracking-wide text-white/45">How Idea Factory fits the workflow</p>
  <ul className="mt-3 space-y-2 text-sm text-white/78">
    <li>Identity Kit gives you the brand foundation</li>
    <li>Campaigns and Release Strategy give you rollout direction</li>
    <li>Idea Factory turns that thinking into actual content ideas</li>
    <li>Captions sharpens the messaging on the strongest picks</li>
    <li>Momentum Board is where those ideas get scheduled and executed</li>
  </ul>
</div>
      </div>

      <div className="mt-6 rounded-2xl border border-ww-violet/15 bg-black/45 p-4">
        <p className="text-xs uppercase tracking-wide text-white/45">Start with the left panel</p>
        <p className="mt-2 text-sm text-white/70 leading-relaxed">
          Build the brief, choose your platforms and content types, then generate a fresh batch of ideas to review and develop.
        </p>
      </div>
    </div>
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
)}
export default function CalendarPage() {
  return (
    <Suspense fallback={null}>
      <CalendarPageInner />
    </Suspense>
  )
}