'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
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
  attentionStrategy?: string
attentionReason?: string
  hook?: string
  onScreenText?: string
  concept?: string
  execution?: unknown
  caption?: string
  cta?: string
  why?: string[]
  bestFor?: string
}
}

type StructuredIdea = {
  title?: string
  platform?: string
  contentType?: string
  attentionStrategy?: string
attentionReason?: string
  hook?: string
  onScreenText?: string
  concept?: string
  execution?: unknown
  caption?: string
  cta?: string
  why?: string[]
  bestFor?: string
}

type ContextSourceType = 'manual' | 'identity' | 'campaign' | 'release_strategy'

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

type AudienceStage =
  | 'discovery'
  | 'awareness'
  | 'connection'
  | 'community'
  | 'release-support'
  | 'conversion'

type CameraConfidence =
  | 'love-camera'
  | 'comfortable'
  | 'neutral'
  | 'prefer-not'
  | 'faceless'

type SpeakingConfidence =
  | 'love-speaking'
  | 'comfortable'
  | 'short-scripted'
  | 'voiceover-only'
  | 'never-speak'

type PerformanceConfidence =
  | 'love-performing'
  | 'comfortable'
  | 'sometimes'
  | 'rarely'
  | 'avoid-performance'

type EditingConfidence =
  | 'very-simple'
  | 'moderate'
  | 'advanced'

type AvailableTime =
  | '10-minutes'
  | '30-minutes'
  | '1-hour'
  | 'half-day'
  | 'flexible'

type ContentProductionStyle =
  | 'Raw and authentic'
  | 'Minimal'
  | 'Cinematic'
  | 'Documentary'
  | 'Story-driven'
  | 'Educational'
  | 'Humorous'
  | 'Experimental'
  | 'Highly polished'

type SlideshowSlide = {
  slide: number
  visual: string
  text: string
  purpose: string
  transition?: string
}

const CONTENT_PRODUCTION_STYLE_OPTIONS: ContentProductionStyle[] = [
  'Raw and authentic',
  'Minimal',
  'Cinematic',
  'Documentary',
  'Story-driven',
  'Educational',
  'Humorous',
  'Experimental',
  'Highly polished',
]


const ALL_PLATFORMS: Array<{ key: string; label: string }> = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube Shorts' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'x', label: 'X / Twitter' },
]


const PERFORMANCE_STYLE_EXAMPLES = [
  'I rap to camera over beats, use lyrics on screen, and make POV-style videos. I mostly film at home, outside, or around my city. I want content that helps people discover my music, not just my personality.',

  'I sing to camera and sometimes perform acoustic versions of my songs. I use simple text overlays, emotional visuals, and short performance clips. I want ideas that connect people to the music and make them want to listen to the full song.',

  'I make slideshow posts using selfies, camera roll photos, and text on screen. I do not enjoy filming lots of videos, so I need simple content ideas that still help promote my music and grow my audience.',

  'I post studio clips, recording sessions, and snippets of unfinished songs. I like showing the creative process and bringing people into the journey behind the music.',

  'I perform live regularly and have footage from gigs, rehearsals, and soundchecks. I want content that helps turn live moments into posts that attract new listeners and keep momentum going.',

  'I create cinematic music content using outdoor locations, visual storytelling, and strong aesthetics. I want ideas that feel artistic and emotional while still keeping the music as the focus.',

  'I use lip syncing, facial expressions, and acting to bring lyrics to life. I want creative POV content that makes people relate to the song and then check out the full track.',

  'I am a small independent artist with limited time. Most of my content is filmed on my phone using simple performance clips, lyrics on screen, and text overlays. I need ideas that are realistic to make consistently.'
]

const CONTENT_STYLE_OPTIONS = [
  'Direct performance',
  'Behind the scenes',
  'Live footage',
  'Storytelling',
  'Text-on-screen',
  'Camera roll / slideshow',
  'Talking to camera',
  'Visual / cinematic',
]



const CONTENT_ENERGY_OPTIONS = [
  'Balanced',
  'High energy',
  'Confident',
  'Funny / playful',
  'Raw / emotional',
  'Reflective',
  'Hype / performance',
  'Chill / casual',
]

const IDEA_FACTORY_GENERATING_MESSAGES = [
  'Reading your creative direction...',
  'Mapping your audience and content style...',
  'Finding ideas that fit your current journey...',
  'Building hooks around your creative reality...',
  'Turning your direction into usable content...',
  'Adding new points to your creative map...',
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

  const contentType =
  safeString((it as any).content_type).trim() ||
  safeString((it as any).structured?.contentType).trim() ||
  safeString(it.format).trim()

return contentType || 'Content'

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

  if (v.includes('performance')) return 'Performance'

  if (
    v.includes('pov') ||
    v.includes('point-of-view') ||
    v.includes('point of view')
  ) {
    return 'POV'
  }

  if (
    v.includes('lyric') ||
    v.includes('lyrics')
  ) {
    return 'Lyrics'
  }

  if (
    v.includes('slideshow') ||
    v.includes('carousel')
  ) {
    return 'Slideshow'
  }

  if (
    v.includes('cinematic')
  ) {
    return 'Cinematic'
  }

  if (
    v.includes('bts') ||
    v.includes('behind') ||
    v.includes('studio')
  ) {
    return 'Studio / BTS'
  }

  if (
    v.includes('discovery') ||
    v.includes('found early') ||
    v.includes('underdog')
  ) {
    return 'Discovery'
  }

  if (
    v.includes('community') ||
    v.includes('audience')
  ) {
    return 'Community'
  }

  if (
    v.includes('humour') ||
    v.includes('humor') ||
    v.includes('funny')
  ) {
    return 'Humour'
  }

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

function extractInstruction(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }

  if (!value || typeof value !== 'object') {
    return ''
  }

  const record = value as Record<string, unknown>

  const possibleValues = [
    record.step,
    record.instruction,
    record.description,
    record.action,
    record.text,
    record.execution,
  ]

  const matchingValue = possibleValues.find(
    (item): item is string =>
      typeof item === 'string' && item.trim().length > 0,
  )

  return matchingValue?.trim() ?? ''
}

function splitExecutionSteps(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(extractInstruction)
      .filter((step): step is string => step.length > 0)
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>

    const nestedSteps =
      record.steps ??
      record.instructions ??
      record.executionSteps ??
      record.videoExecution

    if (Array.isArray(nestedSteps)) {
      return nestedSteps
        .map(extractInstruction)
        .filter((step): step is string => step.length > 0)
    }

    const singleInstruction = extractInstruction(value)

    return singleInstruction ? [singleInstruction] : []
  }

  if (typeof value !== 'string') {
    return []
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return []
  }

  // Handle a JSON string containing an array or object.
  try {
    const parsed: unknown = JSON.parse(
      trimmed
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, ''),
    )

    const parsedSteps = splitExecutionSteps(parsed)

    if (parsedSteps.length > 0) {
      return parsedSteps
    }
  } catch {
    // Continue with normal text parsing.
  }

  const withoutHeading = trimmed
    .replace(/^VIDEO EXECUTION\s*:?\s*/i, '')
    .replace(/^EXECUTION\s*:?\s*/i, '')

  // Split explicit numbered or bulleted instructions.
  const explicitSteps = withoutHeading
    .split(
      /\n(?=\s*(?:\d+[.)]|step\s+\d+\s*[:.)-]|[-•])\s*)|(?=\s+step\s+\d+\s*[:.)-])/gi,
    )
    .map((step) =>
      step
        .replace(/^\s*(?:\d+[.)]|step\s+\d+\s*[:.)-]|[-•])\s*/i, '')
        .trim(),
    )
    .filter(Boolean)

  if (explicitSteps.length > 1) {
    return explicitSteps
  }

  // Fallback for model output returned as one long paragraph.
  const sentenceSteps =
    withoutHeading.match(/[^.!?]+[.!?]+(?:["'”’])?|[^.!?]+$/g) ?? []

  return sentenceSteps
    .map((step) => step.trim())
    .filter((step) => step.length > 0)
}

function safeExecutionText(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  const steps = splitExecutionSteps(value)

  return steps.join('\n')
}

function getRecordString(
  record: Record<string, unknown>,
  keys: string[],
): string {
  for (const key of keys) {
    const value = record[key]

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

function normaliseSlideshowSlide(
  value: unknown,
  index: number,
): SlideshowSlide | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>

  const visual = getRecordString(record, [
    'visual',
    'visualDirection',
    'image',
    'imageDirection',
    'description',
  ])

  const text = getRecordString(record, [
    'text',
    'exampleText',
    'onScreenText',
    'overlayText',
    'caption',
  ])

  const purpose = getRecordString(record, [
    'purpose',
    'role',
    'objective',
  ])

  const transition =
    getRecordString(record, [
      'transition',
      'transitionDirection',
    ]) || undefined

  if (!visual && !text && !purpose) {
    return null
  }

  return {
    slide:
      typeof record.slide === 'number'
        ? record.slide
        : typeof record.slideNumber === 'number'
          ? record.slideNumber
          : index + 1,
    visual,
    text,
    purpose,
    transition,
  }
}

function parseTextSlideshowSlides(value: string): SlideshowSlide[] {
  const cleaned = value
    .replace(/^SLIDE PLAN\s*:?\s*/i, '')
    .replace(/^VIDEO EXECUTION\s*:?\s*/i, '')
    .trim()

  const blocks = cleaned
    .split(/(?=Slide\s*\d+\s*(?:—|-|:))/gi)
    .map((block) => block.trim())
    .filter(Boolean)

  return blocks.reduce<SlideshowSlide[]>((slides, block, index) => {
    const slideMatch = block.match(/Slide\s*(\d+)/i)
    const visualMatch = block.match(
      /Visual\s*:\s*(.*?)(?=\s*\|\s*Text\s*:|\s+Text\s*:|$)/i,
    )
    const textMatch = block.match(
      /Text\s*:\s*(.*?)(?=\s*\|\s*Purpose\s*:|\s+Purpose\s*:|$)/i,
    )
    const purposeMatch = block.match(
      /Purpose\s*:\s*(.*?)(?=\s*\|\s*Transition\s*:|\s+Transition\s*:|$)/i,
    )
    const transitionMatch = block.match(
      /Transition\s*:\s*(.*)$/i,
    )

    const visual = visualMatch?.[1]?.trim() ?? ''
    const text = textMatch?.[1]?.trim() ?? ''
    const purpose = purposeMatch?.[1]?.trim() ?? ''
    const transition = transitionMatch?.[1]?.trim() || undefined

    if (!visual && !text && !purpose) {
      return slides
    }

    slides.push({
      slide: slideMatch ? Number(slideMatch[1]) : index + 1,
      visual,
      text,
      purpose,
      transition,
    })

    return slides
  }, [])
}

function parseSlideshowSlides(value: unknown): SlideshowSlide[] {
  let source: unknown = value

  if (typeof source === 'string') {
    const trimmed = source
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')

    if (!trimmed) {
      return []
    }

    try {
      source = JSON.parse(trimmed)
    } catch {
      return parseTextSlideshowSlides(trimmed)
    }
  }

  if (
    source &&
    typeof source === 'object' &&
    !Array.isArray(source)
  ) {
    const record = source as Record<string, unknown>

    source =
      record.slides ??
      record.slidePlan ??
      record.slideshow ??
      record.execution ??
      source
  }

  if (!Array.isArray(source)) {
    return []
  }

  return source.reduce<SlideshowSlide[]>((slides, item, index) => {
    const slide = normaliseSlideshowSlide(item, index)

    if (slide) {
      slides.push(slide)
    }

    return slides
  }, [])
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

function SlideshowPlan({
  slides,
}: {
  slides: SlideshowSlide[]
}) {
  return (
    <div
      className="
        flex gap-3 overflow-x-auto pb-3
        snap-x snap-mandatory
        [scrollbar-width:thin]
        [scrollbar-color:rgba(186,85,211,0.45)_transparent]
      "
    >
      {slides.map((slide) => (
        <article
          key={slide.slide}
          className="
            w-[250px] min-w-[250px]
            snap-start
            rounded-2xl
            border border-white/10
            bg-black/30
            p-4
          "
        >
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ww-violet">
              Slide {slide.slide}
            </p>
          </div>

          <div className="space-y-3">
            {slide.visual ? (
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-white/35">
                  Visual
                </p>

                <p className="text-sm leading-relaxed text-white/75">
                  {slide.visual}
                </p>
              </div>
            ) : null}

            {slide.text ? (
              <div className="rounded-xl border border-white/10 bg-black/35 p-3">
                <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-white/35">
                  Text
                </p>

                <p className="text-sm italic leading-relaxed text-white/85">
                  {slide.text}
                </p>
              </div>
            ) : null}

            {slide.purpose ? (
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-white/35">
                  Purpose
                </p>

                <p className="text-sm leading-relaxed text-white/65">
                  {slide.purpose}
                </p>
              </div>
            ) : null}

            {slide.transition ? (
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-white/35">
                  Transition
                </p>

                <p className="text-sm leading-relaxed text-white/65">
                  {slide.transition}
                </p>
              </div>
            ) : null}
          </div>
        </article>
      ))}
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

const structuredExecution = structured?.execution

const execution: unknown =
  structuredExecution !== undefined &&
  structuredExecution !== null &&
  !(
    typeof structuredExecution === 'string' &&
    structuredExecution.trim() === ''
  )
    ? structuredExecution
    : parsed.angle ||
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



const formatLabel =
  safeString(item.metadata?.api?.content_type).trim() ||
  safeString(item.metadata?.api?.contentType).trim() ||
  safeString(item.metadata?.api?.format).trim() ||
  safeString(structured?.contentType).trim() ||
  parsed.format ||
  'Content'

const normalizedFormatLabel = formatLabel
  .toLowerCase()
  .replace(/[_–—]/g, '-')
  .replace(/\s+/g, ' ')
  .trim()

const isSlideshow =
  normalizedFormatLabel.includes('slideshow') ||
  normalizedFormatLabel.includes('camera roll') ||
  normalizedFormatLabel.includes('camera-roll') ||
  normalizedFormatLabel.includes('carousel')

const slideshowSlides = isSlideshow
  ? parseSlideshowSlides(execution)
  : []

const executionSteps = isSlideshow
  ? []
  : splitExecutionSteps(execution)



  return (
   <div className="relative h-full rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-4 md:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition hover:border-ww-violet/40 hover:shadow-[0_0_24px_rgba(186,85,211,0.18)] flex flex-col">
      {item.in_momentum ? (
        <div className="absolute top-3 left-3 z-10 text-[10px] px-2 py-1 rounded-full bg-ww-violet/15 text-ww-violet border border-ww-violet/30">
          In Momentum
        </div>
      ) : null}

<div className="absolute top-3 right-3">
  <span className="inline-flex items-center rounded-full border border-ww-violet/25 bg-ww-violet/10 px-2.5 py-1 text-[11px] text-ww-violet whitespace-nowrap">
    {formatLabel}
  </span>
</div>

      <div className="flex-1 space-y-4 pt-8">
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

{structured?.onScreenText ? (
  <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
    <p className="text-[11px] uppercase tracking-[0.16em] text-white/40 mb-1">
      On-screen text
    </p>
    <p className="text-sm italic font-medium leading-relaxed text-white/85">
      {structured.onScreenText}
    </p>
  </div>
) : null}

        {isSlideshow ? (
  slideshowSlides.length > 0 ? (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
  <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
    Slide plan
  </p>

  {slideshowSlides.length > 1 ? (
    <p className="text-[10px] text-white/30">
      Scroll to view all {slideshowSlides.length} slides →
    </p>
  ) : null}
</div>

      <SlideshowPlan slides={slideshowSlides} />
    </div>
  ) : safeExecutionText(execution) ? (
    <div>
      <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-white/40">
        Slide plan
      </p>

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/72">
        {safeExecutionText(execution)}
      </p>
    </div>
  ) : null
) : executionSteps.length > 0 ? (
  <div>
    <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-white/40">
      Video execution
    </p>

    <div className="space-y-2.5">
      {executionSteps.map((step, index) => (
        <div
          key={`${index}-${step}`}
          className="flex items-start gap-3"
        >
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ww-violet/30 bg-ww-violet/10 text-[10px] text-ww-violet">
            {index + 1}
          </span>

          <p className="pt-[1px] text-sm leading-relaxed text-white/72">
            {step}
          </p>
        </div>
      ))}
    </div>
  </div>
) : null}

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

const PRIMARY_GOAL_OPTIONS = [
  'Reach new listeners',
  'Deepen fan connection',
  'Promote a release',
  'Increase streams',
  'Build consistency',
  'Grow my mailing list',
  'Sell tickets',
  'Build community',
  'Test new content ideas',
  'Other',
]

const PRODUCTION_STYLE_OPTIONS = [
  'Raw',
  'Minimal',
  'Cinematic',
  'Story-driven',
  'Documentary',
  'Humorous',
  'Educational',
  'Experimental',
  'Highly polished',
]

const EQUIPMENT_OPTIONS = [
  'Phone',
  'Laptop',
  'Tripod',
  'Microphone',
  'DSLR / camera',
  'Lighting',
  'Screen recording',
  'Other',
]

const LOCATION_OPTIONS = [
  'Bedroom',
  'Home studio',
  'Living room',
  'Car',
  'Outside',
  'Live venue',
  'Workplace',
  'Multiple locations',
]

const AUDIENCE_STAGE_OPTIONS: Array<{
  value: AudienceStage
  label: string
  description: string
  guidance: string
}> = [
  {
    value: 'discovery',
    label: 'Discovery',
    description: "Most people don't know me yet.",
    guidance:
      'WW will prioritise immediate recognition, curiosity and music-first introductions.',
  },
  {
    value: 'awareness',
    label: 'Awareness',
    description: 'Some people recognise my name or music.',
    guidance:
      'WW will help turn recognition into repeat listening and stronger familiarity.',
  },
  {
    value: 'connection',
    label: 'Connection',
    description:
      "People listen, but they don't feel closely connected to me yet.",
    guidance:
      'WW will focus on personality, beliefs, process and emotional recognition.',
  },
  {
    value: 'community',
    label: 'Community',
    description: 'I have genuine fans who regularly engage with me.',
    guidance:
      'WW will prioritise participation, shared language and stronger fan rituals.',
  },
  {
    value: 'release-support',
    label: 'Release support',
    description: 'I want to activate existing listeners around a release.',
    guidance:
      'WW will focus on anticipation, reminders, momentum and release participation.',
  },
  {
    value: 'conversion',
    label: 'Conversion',
    description: 'I want listeners to take one meaningful next step.',
    guidance:
      'WW will build each idea around one clear action without overwhelming the viewer.',
  },
]

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
const hasIdeaFactoryAccess =
  tier === 'idea_factory' || tier === 'creator'
  
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

const [creativeReality, setCreativeReality] = useState('')
const [contentStyles, setContentStyles] = useState<string[]>([])
const [contentEnergy, setContentEnergy] = useState('Balanced')
const [audience, setAudience] = useState('')
const [audienceSize, setAudienceSize] = useState('')
const [monthlyListeners, setMonthlyListeners] = useState('')
const [goal, setGoal] = useState('')
const [tone, setTone] = useState('brand-consistent, concise, human, engaging')
const [ideaDepth, setIdeaDepth] = useState<IdeaDepth>('detailed')
const [lyrics, setLyrics] = useState('')
const [lyricsFocus, setLyricsFocus] = useState<LyricsFocus>('general')
const [focusMode, setFocusMode] = useState<CalendarFocus>('general')
const [releaseContext, setReleaseContext] = useState('')
const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok', 'instagram', 'youtube'])
const [contentTypes, setContentTypes] = useState<string[]>([])
const [ideaCount, setIdeaCount] = useState<IdeaCount>(5)
useEffect(() => {
  if (mounted && tier === 'free' && ideaCount !== 7) {
    setIdeaCount(7)
  }
}, [mounted, tier, ideaCount])
const [selectedContentStyles, setSelectedContentStyles] = useState<string[]>([])
const [showPerformanceStyleHelp, setShowPerformanceStyleHelp] = useState(false)
const [showAdvancedInputs, setShowAdvancedInputs] = useState(false)
const [sortMode, setSortMode] = useState<'newest' | 'platform' | 'content_type' | 'source'>('newest')
const [identityKitContext, setIdentityKitContext] = useState<any>(null)
const [mobilePanel, setMobilePanel] =
  useState<'create' | 'results'>('create')

const [audienceStage, setAudienceStage] =
  useState<AudienceStage>('discovery')

const [goalPreset, setGoalPreset] = useState('')

const [cameraConfidence, setCameraConfidence] =
  useState<CameraConfidence>('comfortable')

const [speakingConfidence, setSpeakingConfidence] =
  useState<SpeakingConfidence>('comfortable')

const [performanceConfidence, setPerformanceConfidence] =
  useState<PerformanceConfidence>('comfortable')

const [editingConfidence, setEditingConfidence] =
  useState<EditingConfidence>('very-simple')

const [productionStyles, setProductionStyles] = useState<string[]>([])

const [availableTime, setAvailableTime] = useState('30 minutes')

const [equipment, setEquipment] = useState<string[]>(['Phone'])

const [locations, setLocations] = useState<string[]>([])

const [budget, setBudget] = useState('No budget')

const [worksAlone, setWorksAlone] = useState('Yes')

const [existingFootage, setExistingFootage] = useState('No')

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
const [savedIdentityKits, setSavedIdentityKits] = useState<any[]>([])
const [selectedIdentityKitId, setSelectedIdentityKitId] = useState('')
const [loadingIdentityKits, setLoadingIdentityKits] = useState(false)
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
  let cancelled = false

  ;(async () => {
    setLoadingIdentityKits(true)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        if (!cancelled) setSavedIdentityKits([])
        return
      }

      const { data, error } = await supabase
        .from('identity_kits')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[idea-factory] identity kits load error', error)
        if (!cancelled) setSavedIdentityKits([])
        return
      }

      if (!cancelled) {
        setSavedIdentityKits(data || [])
      }
    } catch (e) {
      console.error('[idea-factory] identity kits load exception', e)
      if (!cancelled) setSavedIdentityKits([])
    } finally {
      if (!cancelled) setLoadingIdentityKits(false)
    }
  })()

  return () => {
    cancelled = true
  }
}, [])

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
const examplesRef = useRef<HTMLDivElement>(null)
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
        safeString(a.metadata?.api?.content_type).trim() ||
safeString(a.metadata?.api?.format).trim()
    )

    const bType = contentTypeLabel(
      safeString(getStructuredIdea(b)?.contentType).trim() ||
        safeString(b.metadata?.api?.content_type).trim() ||
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

const generatingMessage = useGeneratingMessages(
  generating,
  IDEA_FACTORY_GENERATING_MESSAGES
)

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

  function toggleContentStyle(value: string) {
  setContentStyles(prev => toggleInArray(prev, value))
}

function toggleArrayValue(
  value: string,
  setter: React.Dispatch<React.SetStateAction<string[]>>
) {
  setter(current =>
    current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value]
  )
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

function applyIdentityKitContext(row: any) {
  const inputs = row?.inputs || {}
  const result = row?.result || row?.kit || row || {}

  setIdentityKitContext({
    artistName: row?.artist_name || row?.artistName || inputs?.artistName || artistName,
    genre: row?.genre || inputs?.genre || genre,
    brandWords: inputs?.brandWords || '',
    audience: result?.audience?.persona || result?.artistSnapshot?.audiencePromise || audience,
    creativeWorld: result?.artistSnapshot?.visualShorthand || '',
    identityAnchors: result?.identityAnchors || [],
    strategicFoundations: result?.strategicFoundations || {},
    artistSnapshot: result?.artistSnapshot || {},
    coreIdentity: result?.coreIdentity || {},
    brandStrategy: result?.brandStrategy || {},
    audienceProfile: result?.audience || {},
    toneOfVoice: result?.toneOfVoice || {},
    visualSystem: result?.visualSystem || {},
    contentSystem: result?.contentSystem || {},
    brandGuardrails: result?.brandGuardrails || [],
  })
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
  toast.info('Upgrade to Idea Factory or Creator to keep using Idea Factory.')
  router.push('/pricing')
  return
}

if (!performanceStyle.trim()) {
  toast.error('Tell WW how you usually create content before generating ideas.')
  return
}

if (selectedContentStyles.length === 0) {
  toast.error('Choose at least one content style.')
  return
}

if (selectedContentStyles.length > 2) {
  toast.error('Choose a maximum of 2 content styles.')
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
          audienceStage,
cameraConfidence,
speakingConfidence,
performanceConfidence,
editingConfidence,
productionStyles,
availableTime,
equipment,
locations,
budget,
worksAlone,
existingFootage,
creativeReality: buildCreativeRealitySummary(),
          artistName,
          genre,
          artistType,
          performanceStyle,
          contentStyles: selectedContentStyles,
contentEnergy,
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
          contentTypes: selectedContentStyles,
          avoidTitles,
          noveltySeed,
          contextSource,
selectedCampaignId: selectedCampaignId || null,
selectedReleaseStrategyId: selectedReleaseStrategyId || null,

selectedIdentityKitId: selectedIdentityKitId || null,

identityKitContext:
  contextSource === 'identity'
    ? savedIdentityKits.find(row => row.id === selectedIdentityKitId) || null
    : null,
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
  contentTypes: selectedContentStyles,
  focusMode,
  artistName,
  genre,
  artistType,
  performanceStyle,
  contentStyles: selectedContentStyles,
contentEnergy,
  audience,
  goal,
  tone,
  ideaDepth,
  releaseContext: releaseContext || null,
  api: {
    short_label: safeString(it.short_label),
    content_type: safeString((it as any).content_type),
pillar: safeString((it as any).content_type),
format: safeString((it as any).content_type),
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

  function buildCreativeRealitySummary() {
  return [
    `Available time: ${availableTime}`,
    `Equipment: ${
      equipment.length ? equipment.join(', ') : 'Not specified'
    }`,
    `Locations: ${
      locations.length ? locations.join(', ') : 'Not specified'
    }`,
    `Budget: ${budget}`,
    `Works alone: ${worksAlone}`,
    `Existing footage: ${existingFootage}`,
    `Camera confidence: ${cameraConfidence}`,
    `Speaking confidence: ${speakingConfidence}`,
    `Performance confidence: ${performanceConfidence}`,
    `Editing confidence: ${editingConfidence}`,
    `Production style: ${
      productionStyles.length
        ? productionStyles.join(', ')
        : 'Not specified'
    }`,
    creativeReality.trim()
      ? `Restrictions and additional context: ${creativeReality.trim()}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')
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
    if (tier !== 'creator') {
  toast.info('Momentum Board is part of the full Creator system.')
  router.push('/pricing')
  return
}
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

  function renderIdeaSections(text: string) {
  const sections = [
    "CONTENT ANGLE",
    "HOOK",
    "ON-SCREEN TEXT",
    "VIDEO EXECUTION",
    "CAPTION",
    "CTA",
    "WHY THIS WORKS",
    "BEST FOR",
  ]

  let formatted = text

  sections.forEach(section => {
    formatted = formatted.replace(
      new RegExp(`${section}:`, "g"),
      `|||${section}:`
    )
  })

  return formatted
    .split("|||")
    .filter(Boolean)
}



const selectedAudienceStage =
  AUDIENCE_STAGE_OPTIONS.find(
    option => option.value === audienceStage
  ) ?? AUDIENCE_STAGE_OPTIONS[0]

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
        Turn your direction into consistent content
      </h1>

      <p className="mt-3 text-sm md:text-base leading-relaxed text-white/65 max-w-2xl">
        Transform your artist identity, ideas, and current journey into content that helps people understand your world — without losing yourself trying to keep up.
      </p>
    </div>
  </div>
</header>

{from === 'identity' ? (
  <div className="mb-4 rounded-2xl border border-ww-violet/20 bg-ww-violet/[0.06] p-4">
    <p className="text-[11px] uppercase tracking-[0.16em] text-ww-violet/80">Context loaded</p>
    <p className="mt-2 text-sm text-white/80 leading-relaxed">
      Your Identity Kit map is guiding this session. Ideas will stay connected to your audience, creative world, and long-term direction.
    </p>
  </div>
) : null}

{from === 'campaign' ? (
  <div className="mb-4 rounded-2xl border border-ww-violet/20 bg-ww-violet/[0.06] p-4">
    <p className="text-[11px] uppercase tracking-[0.16em] text-ww-violet/80">Context loaded</p>
    <p className="mt-2 text-sm text-white/80 leading-relaxed">
      Your campaign direction has been loaded. WW will help turn this milestone into content ideas that continue the journey.
    </p>
  </div>
) : null}

{/* MOBILE PANEL SWITCHER */}
<div className="sticky top-14 z-20 mb-4 md:hidden">
  <div className="rounded-2xl border border-white/10 bg-black/85 p-1 backdrop-blur">
    <div className="grid grid-cols-2 gap-1">
      <button
        type="button"
        onClick={() => setMobilePanel('create')}
        className={`h-10 rounded-xl text-sm font-semibold transition ${
          mobilePanel === 'create'
            ? 'bg-ww-violet text-white shadow-[0_0_14px_rgba(186,85,211,0.35)]'
            : 'text-white/55 hover:text-white'
        }`}
      >
        Create
      </button>

      <button
        type="button"
        onClick={() => setMobilePanel('results')}
        className={`h-10 rounded-xl text-sm font-semibold transition ${
          mobilePanel === 'results'
            ? 'bg-ww-violet text-white shadow-[0_0_14px_rgba(186,85,211,0.35)]'
            : 'text-white/55 hover:text-white'
        }`}
      >
        Results
      </button>
    </div>
  </div>
</div>

<div className="grid gap-6 xl:gap-7 lg:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.15fr)] lg:items-start"></div>

      <div className="grid gap-6 xl:gap-7 lg:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.15fr)] lg:items-start">
        {/* LEFT: INPUTS */}
        <section
  className={`${mobilePanel === 'create' ? 'block' : 'hidden'} md:block ${panelClass} self-start p-5 md:p-6 xl:p-7 space-y-5`}
>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 left-1/2 h-[220px] w-[380px] -translate-x-1/2 rounded-full bg-ww-violet/10 blur-[80px]" />
          </div>

          <div className="relative flex items-start justify-between gap-4 flex-wrap">
  <div className="max-w-xl">
    <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
Your Map
</p>

<h2 className="mt-1 text-lg md:text-xl font-semibold text-white">
Chart your creative direction
</h2>

<p className="mt-2 text-sm text-white/62 leading-relaxed">
Share where you are in your journey, how you create, and what you want to build. WW will help uncover content ideas that match your path.
</p>
  </div>

            
          </div>

          <div className={sectionCardClass}>
  <div>
    <div className="h-[2px] w-10 bg-ww-violet/60 rounded-full mb-3" />
    <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">Context source</p>
    <p className="mt-2 text-sm leading-relaxed text-white/66">
      Start from a fresh idea or continue from an existing map. Load your saved Identity Kit, campaigns, or release plans to keep your content aligned.
    </p>
  </div>

  <div className="flex flex-wrap gap-2">
    {[
      { key: 'manual', label: 'New direction' },
{ key: 'identity', label: 'Identity Kit' },
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

  {contextSource === 'identity' ? (
  <div className={outputInnerCardClass}>
    <div className="space-y-2">
      <p className={labelClass}>Load identity kit</p>

      <select
        className={selectClass}
        value={selectedIdentityKitId}
        onChange={(e) => {
          const id = e.target.value
          setSelectedIdentityKitId(id)
          const row = savedIdentityKits.find((item) => item.id === id)
          if (row) applyIdentityKitContext(row)
        }}
      >
        <option value="">
          {loadingIdentityKits ? 'Loading identity kits...' : 'Select an identity kit...'}
        </option>

        {savedIdentityKits.map((row) => (
          <option key={row.id} value={row.id}>
            {(row.artist_name || row.artistName || row.inputs?.artistName || 'Untitled identity kit') +
              ' — ' +
              new Date(row.created_at).toLocaleDateString('en-GB')}
          </option>
        ))}
      </select>

      <p className="text-xs text-white/50">
        Load a saved identity kit to turn the artist’s brand, audience, tone, visuals, and content pillars into stronger ideas.
      </p>

      {selectedIdentityKitId ? (
        <div className="mt-3 rounded-2xl border border-ww-violet/15 bg-black/40 p-3 space-y-2">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">
            Applied identity kit
          </p>

          {(() => {
            const row = savedIdentityKits.find(item => item.id === selectedIdentityKitId)
            const result = row?.result || row?.kit || {}
            const inputs = row?.inputs || {}

            return (
              <>
                <p className="text-sm font-medium text-white">
                  {row?.artist_name || row?.artistName || inputs?.artistName || 'Saved identity kit'}
                </p>

                {result?.oneLineIdentity || result?.brandEssence ? (
                  <p className="text-xs text-white/58 leading-relaxed">
                    {String(result.oneLineIdentity || result.brandEssence)}
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
  title="Starting Point"
  hint="Set where you are today so WW can guide ideas that fit your current stage."
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
        <option value="composer">Composer</option>
        <option value="other">Other</option>
      </select>
    </div>

    <div className="space-y-1">
      <p className={labelClass}>Idea detail</p>
      <select
        className={selectClass}
        value={ideaDepth}
        onChange={e => setIdeaDepth(e.target.value as IdeaDepth)}
      >
        <option value="simple">Quick</option>
        <option value="balanced">Balanced</option>
        <option value="detailed">Detailed</option>
      </select>
    </div>
  </div>

  <div className="space-y-3">
    <div>
      <p className={labelClass}>Audience stage</p>
      <p className="mt-1 text-xs leading-relaxed text-white/45">
        Choose the relationship most people currently have with you and your
        music.
      </p>
    </div>

    <div className="grid gap-2 md:grid-cols-2">
      {AUDIENCE_STAGE_OPTIONS.map(option => {
        const active = audienceStage === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setAudienceStage(option.value)}
            className={`rounded-xl border p-3 text-left transition ${
              active
                ? 'border-ww-violet/60 bg-ww-violet/15 shadow-[0_0_18px_rgba(168,85,247,0.16)]'
                : 'border-white/8 bg-white/[0.025] hover:border-ww-violet/30'
            }`}
          >
            <p
              className={`text-sm font-medium ${
                active ? 'text-white' : 'text-white/75'
              }`}
            >
              {option.label}
            </p>

            <p className="mt-1 text-xs leading-relaxed text-white/45">
              {option.description}
            </p>
          </button>
        )
      })}
    </div>

    <div className="rounded-xl border border-ww-violet/20 bg-ww-violet/[0.06] px-3 py-2.5">
      <p className="text-xs leading-relaxed text-ww-lilac/90">
        {selectedAudienceStage.guidance}
      </p>
    </div>
  </div>
</InputSection>

<InputSection
  title="Audience and direction"
  hint="Define who you are guiding toward your world and what you want this content to create."
>
  <div className="space-y-1">
    <p className={labelClass}>Who are you trying to reach?</p>
    <input
      className={selectClass}
      placeholder="Describe the listener this content should connect with."
      value={audience}
      onChange={e => setAudience(e.target.value)}
    />
  </div>

  <div className="space-y-1">
  <p className={labelClass}>Primary goal</p>

  <select
    className={selectClass}
    value={goalPreset}
    onChange={e => {
      const value = e.target.value
      setGoalPreset(value)

      if (value !== 'Other') {
        setGoal(value)
      } else {
        setGoal('')
      }
    }}
  >
    <option value="">Choose a primary goal...</option>

    {PRIMARY_GOAL_OPTIONS.map(option => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
</div>

{goalPreset === 'Other' ? (
  <div className="space-y-1">
    <p className={labelClass}>Describe your goal</p>
    <input
      className={selectClass}
      placeholder="What should this content help you achieve?"
      value={goal}
      onChange={e => setGoal(e.target.value)}
    />
  </div>
) : null}
</InputSection>


          <InputSection
  title="Creator Profile"
  hint="Tell WW how you naturally create so every idea feels like something you would actually enjoy making."
>
  <div
    className={`rounded-2xl border ${
      !performanceStyle.trim()
        ? 'border-ww-violet/25 bg-ww-violet/[0.04]'
        : 'border-white/8 bg-black/35'
    } p-3 space-y-3 transition`}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className={labelClass}>How do you usually create content?</p>
        <p className="mt-1 text-xs text-white/45">
          Describe what you genuinely make now, rather than what you think you
          should be making.
        </p>
      </div>

      <span className="rounded-full border border-ww-violet/40 bg-ww-violet/15 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-ww-lilac">
        Required
      </span>
    </div>

    <input
      className={selectClass}
      placeholder="e.g. I make simple slideshow posts, film alone and rarely speak to camera..."
      value={performanceStyle}
      onChange={e => setPerformanceStyle(e.target.value)}
    />

    <div className="relative">
      <button
        type="button"
        onClick={() =>
          examplesRef.current?.scrollBy({
            left: -400,
            behavior: 'smooth',
          })
        }
        className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/10 bg-black/90 p-2 text-white/70 backdrop-blur transition hover:border-ww-violet/40 hover:text-white md:flex"
      >
        ←
      </button>

      <button
        type="button"
        onClick={() =>
          examplesRef.current?.scrollBy({
            left: 400,
            behavior: 'smooth',
          })
        }
        className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/10 bg-black/90 p-2 text-white/70 backdrop-blur transition hover:border-ww-violet/40 hover:text-white md:flex"
      >
        →
      </button>

      <div
        ref={examplesRef}
        className="scrollbar-hide flex gap-3 overflow-x-auto px-10 pb-3"
      >
        {PERFORMANCE_STYLE_EXAMPLES.map(example => (
          <button
            key={example}
            type="button"
            onClick={() => setPerformanceStyle(example)}
            className="min-w-[360px] max-w-[360px] flex-shrink-0 rounded-xl border border-white/8 bg-white/[0.03] p-4 text-left text-xs leading-relaxed text-white/70 transition hover:border-ww-violet/40 hover:bg-ww-violet/10"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  </div>

  <div className="grid gap-4 md:grid-cols-2">
    <div className="space-y-1">
      <p className={labelClass}>Camera confidence</p>
      <select
        className={selectClass}
        value={cameraConfidence}
        onChange={e =>
          setCameraConfidence(e.target.value as CameraConfidence)
        }
      >
        <option value="love-camera">Love being on camera</option>
        <option value="comfortable">Comfortable</option>
        <option value="neutral">Neutral</option>
        <option value="prefer-not">Prefer not to show my face</option>
        <option value="faceless">Never show my face</option>
      </select>
    </div>

    <div className="space-y-1">
      <p className={labelClass}>Speaking confidence</p>
      <select
        className={selectClass}
        value={speakingConfidence}
        onChange={e =>
          setSpeakingConfidence(e.target.value as SpeakingConfidence)
        }
      >
        <option value="love-talking">Love talking</option>
        <option value="comfortable">Comfortable</option>
        <option value="short-scripted">Short scripted clips</option>
        <option value="voice-over">Voice-over only</option>
        <option value="never-speak">Never speak</option>
      </select>
    </div>

    <div className="space-y-1">
      <p className={labelClass}>Performance confidence</p>
      <select
        className={selectClass}
        value={performanceConfidence}
        onChange={e =>
          setPerformanceConfidence(
            e.target.value as PerformanceConfidence
          )
        }
      >
        <option value="love-performing">Love performing</option>
        <option value="comfortable">Comfortable</option>
        <option value="sometimes">Sometimes</option>
        <option value="rarely">Rarely</option>
        <option value="avoid-performance">Avoid performance</option>
      </select>
    </div>

    <div className="space-y-1">
      <p className={labelClass}>Editing confidence</p>
      <select
        className={selectClass}
        value={editingConfidence}
        onChange={e =>
          setEditingConfidence(e.target.value as EditingConfidence)
        }
      >
        <option value="very-simple">Very simple</option>
        <option value="moderate">Moderate</option>
        <option value="advanced">Advanced</option>
      </select>
    </div>
  </div>

  <div className="space-y-3">
    <div>
      <p className={labelClass}>Production style</p>
      <p className="mt-1 text-xs text-white/45">
        Choose up to three qualities that describe how you prefer content to
        feel.
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      {PRODUCTION_STYLE_OPTIONS.map(option => {
        const active = productionStyles.includes(option)

        return (
          <button
            key={option}
            type="button"
            onClick={() => {
              if (!active && productionStyles.length >= 3) {
                toast.info('Choose up to 3 production styles.')
                return
              }

              toggleArrayValue(option, setProductionStyles)
            }}
            className={`rounded-full px-4 py-2 text-xs transition ${
              active
                ? 'bg-ww-violet text-white shadow-[0_0_20px_rgba(168,85,247,0.45)]'
                : 'border border-white/10 bg-white/[0.03] text-white/65 hover:border-ww-violet/40 hover:text-white'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  </div>
</InputSection>

<InputSection
  title="Creative Reality"
  hint="Give WW the practical boundaries it must respect when designing your ideas."
>
  <div className="grid gap-3 md:grid-cols-2">
    <div className="space-y-1">
      <p className={labelClass}>Available time</p>
      <select
        className={selectClass}
        value={availableTime}
        onChange={e => setAvailableTime(e.target.value)}
      >
        <option value="10 minutes">10 minutes</option>
        <option value="30 minutes">30 minutes</option>
        <option value="1 hour">1 hour</option>
        <option value="Half day">Half day</option>
        <option value="Flexible">Flexible</option>
      </select>
    </div>

    <div className="space-y-1">
      <p className={labelClass}>Budget</p>
      <select
        className={selectClass}
        value={budget}
        onChange={e => setBudget(e.target.value)}
      >
        <option value="No budget">No budget</option>
        <option value="Small budget">Small budget</option>
        <option value="Flexible budget">Flexible budget</option>
      </select>
    </div>

    <div className="space-y-1">
      <p className={labelClass}>Do you normally work alone?</p>
      <select
        className={selectClass}
        value={worksAlone}
        onChange={e => setWorksAlone(e.target.value)}
      >
        <option value="Yes">Yes</option>
        <option value="Sometimes">Sometimes</option>
        <option value="Usually with others">Usually with others</option>
      </select>
    </div>

    <div className="space-y-1">
      <p className={labelClass}>Do you have existing footage?</p>
      <select
        className={selectClass}
        value={existingFootage}
        onChange={e => setExistingFootage(e.target.value)}
      >
        <option value="No">No</option>
        <option value="A small amount">A small amount</option>
        <option value="Yes">Yes</option>
      </select>
    </div>
  </div>

  <div className="space-y-3">
    <div>
      <p className={labelClass}>Available equipment</p>
      <p className="mt-1 text-xs text-white/45">
        Only select equipment you can realistically use.
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      {EQUIPMENT_OPTIONS.map(option => {
        const active = equipment.includes(option)

        return (
          <button
            key={option}
            type="button"
            onClick={() => toggleArrayValue(option, setEquipment)}
            className={`rounded-full px-4 py-2 text-xs transition ${
              active
                ? 'bg-ww-violet text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]'
                : 'border border-white/10 bg-white/[0.03] text-white/65 hover:border-ww-violet/40 hover:text-white'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  </div>

  <div className="space-y-3">
    <div>
      <p className={labelClass}>Available locations</p>
      <p className="mt-1 text-xs text-white/45">
        Select places you can genuinely film without extra planning.
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      {LOCATION_OPTIONS.map(option => {
        const active = locations.includes(option)

        return (
          <button
            key={option}
            type="button"
            onClick={() => toggleArrayValue(option, setLocations)}
            className={`rounded-full px-4 py-2 text-xs transition ${
              active
                ? 'bg-ww-violet text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]'
                : 'border border-white/10 bg-white/[0.03] text-white/65 hover:border-ww-violet/40 hover:text-white'
            }`}
          >
            {option}
          </button>
        )
      })}
    </div>
  </div>

  <div className="space-y-1">
    <p className={labelClass}>Restrictions and extra context</p>
    <p className="mt-1 text-xs leading-relaxed text-white/45">
      Add anything WW must never assume or ask you to do.
    </p>

    <textarea
      className={`${selectClass} mt-3 min-h-[120px] resize-none`}
      placeholder={`Examples:
• I do not show my face
• I cannot film outside
• I do not have anyone to film me
• Do not use archive footage
• I am not comfortable speaking`}
      value={creativeReality}
      onChange={e => setCreativeReality(e.target.value)}
    />

    <p className="mt-2 text-xs text-ww-violet/80">
      WW will treat this as your creative reality — not a limitation.
    </p>
  </div>
</InputSection>

<InputSection
  title="Content Style"
  hint="Choose the formats you want WW to use when building this batch."
>
  <div className="space-y-3">
    <div>
      <p className={labelClass}>Choose up to two styles</p>
      <p className="mt-1 text-xs text-white/45">
        WW will stay inside these selected formats instead of choosing randomly.
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      {CONTENT_STYLE_OPTIONS.map(option => {
        const active = selectedContentStyles.includes(option)

        return (
          <button
            key={option}
            type="button"
            onClick={() => {
              if (!active && selectedContentStyles.length >= 2) {
                toast.info(
                  'Choose up to 2 content styles for a stronger mix.'
                )
                return
              }

              setSelectedContentStyles(current =>
                active
                  ? current.filter(item => item !== option)
                  : [...current, option]
              )
            }}
            className={`rounded-full px-4 py-2 text-xs transition ${
              active
                ? 'bg-ww-violet text-white shadow-[0_0_20px_rgba(168,85,247,0.45)]'
                : 'border border-white/10 bg-white/[0.03] text-white/65 hover:border-ww-violet/40 hover:text-white'
            }`}
          >
            {option}
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
        <p className={labelClass}>Song / project context</p>
        <input
          className={selectClass}
          placeholder="Song title, release context, story, theme, sound or campaign focus..."
          value={releaseContext}
          onChange={e => setReleaseContext(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <p className={labelClass}>Desired mood</p>
        <input
          className={selectClass}
          placeholder="e.g. nocturnal, playful, intimate, defiant, reflective..."
          value={tone}
          onChange={e => setTone(e.target.value)}
        />
      </div>

      <div className="space-y-1">
  <p className={labelClass}>How should WW use lyrics?</p>

  <select
    className={selectClass}
    value={lyricsFocus}
    onChange={e => setLyricsFocus(e.target.value as LyricsFocus)}
  >
    <option value="general">General themes only</option>
    <option value="hook">Focus on the supplied hook</option>
    <option value="chorus">Focus on the supplied chorus</option>
    <option value="verse">Focus on the supplied verse</option>
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
        onClick={() => router.push('/pricing')}
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
        toast.info('Unlock the full WW system to keep using Idea Factory.')
        router.push('/pricing')
        return
      }

      if (!performanceStyle.trim()) {
        toast.info('Tip: adding how you actually make content usually gives much more targeted ideas.')
      }

      handleGenerateIdeas()
    }}
    disabled={generating}
    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ww-violet px-4 h-10 text-xs font-semibold text-white shadow-[0_0_16px_rgba(186,85,211,0.6)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] active:scale-95 transition disabled:opacity-60"
  >
    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
    {isCalendarLocked
      ? 'Unlock the full WW system'
      : generating
      ? 'Mapping ideas…'
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
        <section
  className={`${mobilePanel === 'results' ? 'block' : 'hidden'} md:block relative self-start overflow-hidden rounded-[28px] border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.05] via-black to-black p-5 md:p-6 xl:p-7 space-y-5 shadow-[0_0_20px_rgba(186,85,211,0.08)]`}
>
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
        disabled={!visibleItems.length || sendingVisible || tier !== 'creator'}
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
          {tier === 'creator' ? 'Send all to Momentum' : 'Creator only'}
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
      <div className="rounded-2xl border border-ww-violet/20 bg-gradient-to-r from-ww-violet/[0.12] via-ww-violet/[0.05] to-transparent p-4">
        <p className="text-sm font-medium text-white">
          Your next ideas will appear here.
        </p>

        <p className="mt-1 text-xs leading-relaxed text-white/60">
          Every generation adds another point to your creative map. Start with your brief, Identity Kit, campaign, or release strategy, and WW will help turn that direction into content you can actually make.
        </p>
      </div>

      <p className="mt-3 text-sm text-white/40">
        Tip: Load your Identity Kit for ideas that stay closer to your world, audience, and long-term direction.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className={outputInnerCardClass}>
          <p className="text-xs uppercase tracking-wide text-white/45">
            Idea Factory helps you discover
          </p>

          <ul className="mt-3 space-y-2 text-sm text-white/78">
            <li>Content ideas shaped around your creative direction</li>
            <li>Hooks that fit your audience and current stage</li>
            <li>Formats that match how you actually create</li>
            <li>New paths into Momentum Board when an idea is ready</li>
          </ul>
        </div>

        <div className={outputInnerCardClass}>
          <p className="text-xs uppercase tracking-wide text-white/45">
            How it fits your journey
          </p>

          <ul className="mt-3 space-y-2 text-sm text-white/78">
            <li>Identity Kit maps your foundations</li>
            <li>Campaigns and Release Strategy give direction</li>
            <li>Idea Factory turns that direction into expression</li>
            <li>Captions sharpen the strongest ideas</li>
            <li>Momentum Board helps you keep moving</li>
          </ul>
        </div>
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