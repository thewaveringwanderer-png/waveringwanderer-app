'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { X, Loader2, Download, Sparkles, Send, Edit3, Check, CalendarDays } from 'lucide-react'
import { type PdfLine, normalizeText } from '@/lib/wwPdf'
import { renderPdfFromLines } from '@/lib/pdf.client'

function formatNumberedSteps(text: string) {
  const t = (text || '').trim()
  if (!t) return ''
  if (t.includes('\n')) return t

  // Turns "1) ... 2) ... 3) ..." or "1. ... 2. ..." into new lines
  return t
    .replace(/\s(?=\d+\)\s)/g, '\n')
    .replace(/\s(?=\d+\.\s)/g, '\n')
}

function parseCaptionSections(caption: string) {
  const raw = (caption || '').trim()
  const up = raw.toUpperCase()

  const keys = [
    'CONTENT ANGLE:',
    'HOOK:',
    'ON-SCREEN TEXT:',
    'HOW TO FILM:',
    'CAPTION:',
    'CTA:',
    'WHY THIS WORKS:',
    'BEST FOR:',
  ]

  const hasAnyKey = keys.some(k => up.includes(k))

  if (!hasAnyKey) {
    return {
      isSectioned: false as const,
      contentAngle: '',
      hook: '',
      onScreenText: '',
      videoExecution: '',
      caption: '',
      cta: '',
      whyThisWorks: '',
      bestFor: '',
      plain: raw,
    }
  }

  const norm = raw
    .replace(/content angle:/gi, 'CONTENT ANGLE:')
    .replace(/hook:/gi, 'HOOK:')
    .replace(/on-screen text:/gi, 'ON-SCREEN TEXT:')
    .replace(/how to film:/gi, 'HOW TO FILM:')
    .replace(/caption:/gi, 'CAPTION:')
    .replace(/cta:/gi, 'CTA:')
    .replace(/why this works:/gi, 'WHY THIS WORKS:')
    .replace(/best for:/gi, 'BEST FOR:')

  const takeBetween = (start: string, end?: string) => {
    const s = norm.indexOf(start)
    if (s === -1) return ''
    const from = s + start.length
    const e = end ? norm.indexOf(end, from) : -1
    return (e === -1 ? norm.slice(from) : norm.slice(from, e)).trim()
  }

  return {
    isSectioned: true as const,
    contentAngle: takeBetween('CONTENT ANGLE:', 'HOOK:'),
    hook: takeBetween('HOOK:', 'ON-SCREEN TEXT:'),
    onScreenText: takeBetween('ON-SCREEN TEXT:', 'HOW TO FILM:'),
    videoExecution: takeBetween('HOW TO FILM:', 'CAPTION:'),
    caption: takeBetween('CAPTION:', 'CTA:'),
    cta: takeBetween('CTA:', 'WHY THIS WORKS:'),
    whyThisWorks: takeBetween('WHY THIS WORKS:', 'BEST FOR:'),
    bestFor: takeBetween('BEST FOR:'),
    plain: '',
  }
}

// ---------- Supabase ----------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ---------- Types ----------
export type CalendarStatus = 'planned' | 'draft' | 'scheduled' | 'posted' | 'idea' | string

export type ContentCard = {
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
}

type Props = {
  open: boolean
  onClose: () => void
  item: ContentCard
  onItemPatched: (patched: Partial<ContentCard>) => void

  showQuickCaptionGen?: boolean
  getQuickGenContext?: () => {
    artistName?: string
    tone?: string
  }

  showSendToMomentum?: boolean
  showPdfExport?: boolean
}

type SlideshowSlide = {
  slide: number
  visual: string
  text: string
  purpose: string
  transition?: string
}

// ---------- UI helpers ----------
function platformLabel(p: string | null | undefined) {
  if (!p) return 'Unspecified'
  switch (p) {
    case 'instagram':
      return 'Instagram'
    case 'tiktok':
      return 'TikTok'
    case 'youtube':
      return 'YouTube'
    case 'facebook':
      return 'Facebook'
    case 'x':
      return 'X / Twitter'
    default:
      return p
  }
}

function statusLabel(status: CalendarStatus | null | undefined) {
  const s = (status || '').toString()
  if (!s) return 'Planned'
  if (s === 'planned') return 'Planned'
  if (s === 'draft') return 'Draft'
  if (s === 'scheduled') return 'Scheduled'
  if (s === 'posted') return 'Posted'
  if (s === 'idea') return 'Idea'
  return s
}

function modalEstimateDifficulty(args: {
  stepCount: number
  isSlideshow: boolean
  editingConfidence?: string
}) {
  const editing = (args.editingConfidence || '').toLowerCase()

  if (
    args.stepCount <= 3 &&
    !args.isSlideshow &&
    !editing.includes('advanced')
  ) {
    return 'Easy'
  }

  if (
    args.stepCount >= 7 ||
    editing.includes('advanced')
  ) {
    return 'Advanced'
  }

  return 'Standard'
}

function modalEstimateTime(stepCount: number) {
  if (stepCount <= 3) return '≈ 10–15 min'
  if (stepCount <= 5) return '≈ 20–30 min'
  if (stepCount <= 7) return '≈ 30–45 min'

  return '≈ 45–60 min'
}

function modalArrayLabel(
  value: unknown,
  singularFallback: string,
) {
  if (!Array.isArray(value) || value.length === 0) return ''

  const cleaned = value
    .map(item => String(item).trim())
    .filter(Boolean)

  if (!cleaned.length) return ''

  if (cleaned.length <= 2) {
    return cleaned.join(' + ')
  }

  return `${cleaned.length} ${singularFallback}`
}

function normalizeTagsToArray(input: any): string[] {
  if (!input) return []
  if (Array.isArray(input)) return input.filter(Boolean).map(String)
  if (typeof input === 'string') {
    const s = input.trim()
    if (!s) return []
    if (s.includes('#')) {
      return s
        .split(/\s+/)
        .map(t => t.trim())
        .filter(Boolean)
        .map(t => (t.startsWith('#') ? t.slice(1) : t))
    }
    return s
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
  }
  return []
}

function tagsToText(tags: string[] | null | undefined) {
  return (tags || []).map(t => (t.startsWith('#') ? t : `#${t}`)).join(' ')
}

/**
 * ✅ Preserve existing calendar-generator notes.
 * If a generated caption block already exists, replace it instead of appending forever.
 */
function mergeGeneratedCaption(existing: string | null | undefined, generated: string) {
  const marker = '\n\n---\n\nCaption:\n'
  const base = (existing || '').trim()
  const gen = (generated || '').trim()
  if (!base) return gen
  if (!gen) return base

  if (base.includes(marker)) {
    const head = base.split(marker)[0].trim()
    return `${head}${marker}${gen}`
  }

  return `${base}${marker}${gen}`
}

// ---------- PDF helpers ----------

function buildCardPdfLines(item: ContentCard): PdfLine[] {
  const lines: PdfLine[] = []
  const title = normalizeText(item.title || 'Content card')
  lines.push({ kind: 'title', text: title })

  const dateStr = item.scheduled_at
    ? new Date(item.scheduled_at).toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Unscheduled'

  const meta = `${dateStr} • ${platformLabel(item.platform)} • ${statusLabel(item.status)}`
  lines.push({ kind: 'subtitle', text: normalizeText(meta) })
  lines.push({ kind: 'divider' })

  lines.push({ kind: 'sectionTitle', text: 'Caption / Notes' })
  lines.push({ kind: 'body', text: normalizeText(item.caption || 'No caption yet.') })

  const tags =
    item.hashtags && item.hashtags.length
      ? item.hashtags.map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ')
      : ''

  if (tags) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Hashtags' })
    lines.push({ kind: 'body', text: normalizeText(tags) })
  }

  return lines
}

function modalRecordString(
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

function normaliseModalSlide(
  value: unknown,
  index: number,
): SlideshowSlide | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>

  const visual = modalRecordString(record, [
    'visual',
    'visualDirection',
    'image',
    'imageDirection',
    'description',
  ])

  const text = modalRecordString(record, [
    'text',
    'exampleText',
    'onScreenText',
    'overlayText',
    'caption',
  ])

  const purpose = modalRecordString(record, [
    'purpose',
    'role',
    'objective',
  ])

  const transition =
    modalRecordString(record, [
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

function parseModalTextSlides(value: string): SlideshowSlide[] {
  const cleaned = value
    .replace(/^SLIDE PLAN\s*:?\s*/i, '')
    .replace(/^HOW TO FILM\s*:?\s*/i, '')
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

function parseModalSlideshowSlides(value: unknown): SlideshowSlide[] {
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
      return parseModalTextSlides(trimmed)
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
    const slide = normaliseModalSlide(item, index)

    if (slide) {
      slides.push(slide)
    }

    return slides
  }, [])
}

function ModalSlideshowPlan({
  slides,
}: {
  slides: SlideshowSlide[]
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[0.65rem] uppercase tracking-wide text-white/45">
          Slide Plan
        </p>

        <p className="text-[0.65rem] text-white/35">
          {slides.length} {slides.length === 1 ? 'slide' : 'slides'} · scroll →
        </p>
      </div>

      <div
  className="
    flex gap-3 overflow-x-auto overflow-y-hidden pb-3
    snap-x snap-mandatory
    scroll-px-1
    touch-pan-x
    [-webkit-overflow-scrolling:touch]
    [scrollbar-width:thin]
    [scrollbar-color:rgba(186,85,211,0.45)_transparent]
  "
>
        {slides.map(slide => (
          <article
            key={slide.slide}
            className="
  w-[94%] min-w-[94%] shrink-0
  snap-center
  rounded-2xl
  border border-white/10
  bg-black/35
  px-3.5 py-2.5
"
          >
            <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ww-violet">
              Slide {slide.slide}
            </p>

            <div className="space-y-2">
              {slide.visual ? (
                <div>
                  <p className="mb-1 text-[0.65rem] uppercase tracking-wide text-white/40">
                    Visual
                  </p>

                  <p className="text-[0.78rem] leading-[1.4] text-white/75">
                    {slide.visual}
                  </p>
                </div>
              ) : null}

              {slide.text ? (
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <p className="mb-1 text-[0.65rem] uppercase tracking-wide text-white/40">
                    Text
                  </p>

                  <p className="text-[0.8rem] italic leading-5 text-white/85">
                    {slide.text}
                  </p>
                </div>
              ) : null}

              {slide.purpose ? (
                <div>
                  <p className="mb-1 text-[0.65rem] uppercase tracking-wide text-white/40">
                    Purpose
                  </p>

                  <p className="text-[0.78rem] leading-[1.4] text-white/65">
                    {slide.purpose}
                  </p>
                </div>
              ) : null}

              {slide.transition ? (
                <div>
                  <p className="mb-1 text-[0.65rem] uppercase tracking-wide text-white/40">
                    Transition
                  </p>

                  <p className="text-[0.78rem] leading-[1.4] text-white/65">
                    {slide.transition}
                  </p>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

// ---------- Component ----------
export default function ContentCardModal({
  open,
  onClose,
  item,
  onItemPatched,
  showQuickCaptionGen = false,
  getQuickGenContext,
  showSendToMomentum = false,
  showPdfExport = true,
}: Props) {



  const outlineBtn =
    'inline-flex items-center gap-2 px-4 h-9 rounded-full border border-white/20 text-white/85 text-xs ' +
    'hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.6)] ' +
    'active:scale-95 transition disabled:opacity-60'

  const primaryBtn =
    'inline-flex items-center gap-2 px-4 h-9 rounded-full bg-ww-violet text-white text-xs font-semibold ' +
    'shadow-[0_0_16px_rgba(186,85,211,0.7)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] ' +
    'active:scale-95 transition disabled:opacity-60'

  const inputClass =
    'w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-sm text-white placeholder-white/35 ' +
    'focus:border-ww-violet focus:outline-none transition'

  const selectClass =
    'px-3 py-2 rounded-xl bg-black border border-white/15 text-sm text-white/85 focus:border-ww-violet focus:outline-none transition'

  const [isEditing, setIsEditing] = useState(false)

  const [editTitle, setEditTitle] = useState('')
  const [editCaption, setEditCaption] = useState('')
  const [editPlatform, setEditPlatform] = useState<string>('instagram')
  const [editStatus, setEditStatus] = useState<string>('planned')
  const [editTags, setEditTags] = useState('')

  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [quickGenLoading, setQuickGenLoading] = useState(false)

  const scheduledLabel = useMemo(() => {
    if (!item.scheduled_at) return 'Unscheduled'
    return new Date(item.scheduled_at).toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }, [item.scheduled_at])

const refinedCaption = item.metadata?.refined_caption_text || ''
const isRefinedCaption = !!item.metadata?.caption_refined

const structured =
  item.metadata?.structured &&
  typeof item.metadata.structured === 'object'
    ? item.metadata.structured
    : null

const productionContext =
  item.metadata?.productionContext &&
  typeof item.metadata.productionContext === 'object'
    ? item.metadata.productionContext
    : {}    

const formatValue =
  String(item.metadata?.api?.content_type || '') ||
  String(item.metadata?.api?.contentType || '') ||
  String(item.metadata?.api?.format || '') ||
  String(structured?.contentType || '') ||
  String(structured?.format || '') ||
  String(item.metadata?.format || '') ||
  String(item.feature || '')

const normalizedFormat = formatValue
  .toLowerCase()
  .replace(/[_–—]/g, '-')
  .replace(/\s+/g, ' ')
  .trim()

const isSlideshow =
  normalizedFormat.includes('slideshow') ||
  normalizedFormat.includes('camera roll') ||
  normalizedFormat.includes('camera-roll') ||
  normalizedFormat.includes('carousel')

const rawExecution =
  structured?.execution ??
  item.metadata?.execution ??
  ''

const modalSlides = isSlideshow
  ? parseModalSlideshowSlides(rawExecution)
  : []

 const executionText =
  typeof rawExecution === 'string'
    ? formatNumberedSteps(rawExecution)
    : ''

const modalExecutionSteps = executionText
  .split('\n')
  .map(step => step.trim())
  .filter(Boolean)

const productionStepCount =
  isSlideshow && modalSlides.length
    ? modalSlides.length
    : modalExecutionSteps.length || 1

const difficulty = modalEstimateDifficulty({
  stepCount: productionStepCount,
  isSlideshow,
  editingConfidence: String(
    productionContext.editingConfidence || ''
  ),
})

const filmingTime = modalEstimateTime(productionStepCount)

const locationLabel = modalArrayLabel(
  productionContext.locations,
  'locations',
)

const equipmentLabel = modalArrayLabel(
  productionContext.equipment,
  'equipment options',
) 

const hasAttachedCaption = !!item.caption?.trim()

  useEffect(() => {
    if (!open) return
    setIsEditing(false)
    setEditTitle(item.title || '')
    setEditCaption(item.caption || '')
    setEditPlatform(item.platform || 'instagram')
    setEditStatus((item.status || 'planned').toString())
    setEditTags(tagsToText(item.hashtags))
  }, [open, item])

  if (!open) return null

  async function patchServer(patch: Partial<ContentCard>) {
    const { error } = await supabase.from('content_calendar').update(patch).eq('id', item.id)
    if (error) throw new Error(error.message || 'Could not update card')
  }

  async function handleSave() {
    setSaving(true)
    try {
      const tags = normalizeTagsToArray(editTags)

      const patch: Partial<ContentCard> = {
        title: editTitle.trim() ? editTitle.trim() : null,
        caption: editCaption.trim() ? editCaption.trim() : null,
        platform: editPlatform || null,
        status: editStatus || null,
        hashtags: tags.length ? tags : null,
      }

      await patchServer(patch)
      onItemPatched(patch)
      setIsEditing(false)
      toast.success('Card updated ✅')
    } catch (e: any) {
      toast.error(e?.message || 'Could not save changes')
    } finally {
      setSaving(false)
    }
  }

  async function handleSendToMomentum() {
    setSending(true)
    try {
      const patch: Partial<ContentCard> = { in_momentum: true }
      await patchServer(patch)
onItemPatched(patch)
onClose()
toast.success('Sent to Momentum Board ✅')
    } catch (e: any) {
      toast.error(e?.message || 'Could not send to Momentum')
    } finally {
      setSending(false)
    }
  }

  async function handleExportPdf() {
    setExporting(true)
    try {
      const lines = buildCardPdfLines(item)
      const base =
        (item.title && item.title.trim()) ||
        (item.scheduled_at ? item.scheduled_at.slice(0, 10) : '') ||
        `content-card-${item.id.slice(0, 8)}`
      await renderPdfFromLines({ lines, filenameBase: base })
      toast.success('Card exported as PDF ✅')
    } catch (e: any) {
      toast.error(e?.message || 'Could not export PDF')
    } finally {
      setExporting(false)
    }
  }

  async function handleQuickCaptionGen() {
    setQuickGenLoading(true)
    try {
      const ctx = getQuickGenContext?.() || {}
      const topic = (item.title || '').trim() || (item.caption || '').trim() || 'Music / artist post'

      const res = await fetch('/api/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'generate',
          sourceKind: 'text',
          artistName: ctx.artistName || '',
          platform: item.platform || 'instagram',
          topic,
          keywords: '',
          tone: ctx.tone || 'brand-consistent, concise, human, engaging',
          variantCount: 1,
          includeHashtags: true,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to generate caption')
      }

      const data = await res.json()
      const v0 = Array.isArray(data?.variants) ? data.variants[0] : null
      const text = (v0?.text || '').toString().trim()
      const core = normalizeTagsToArray(v0?.hashtags?.core)
      const niche = normalizeTagsToArray(v0?.hashtags?.niche)
      const merged = [...core, ...niche].filter(Boolean)

      if (!text) throw new Error('No caption text returned')

      const patch: Partial<ContentCard> = {
        caption: mergeGeneratedCaption(item.caption, text),
        hashtags: merged.length ? merged : null,
      }

      await patchServer(patch)
      onItemPatched(patch)

      toast.success('Caption + hashtags generated ✅')
    } catch (e: any) {
      toast.error(e?.message || 'Could not generate caption')
    } finally {
      setQuickGenLoading(false)
    }
  }

  function extractCaptionOnly(raw: string | null | undefined) {
  const text = (raw || '').trim()
  if (!text) return ''

  const parsed = parseCaptionSections(text)

  // For structured Idea Factory cards, use CTA as the actual caption input.
  if (parsed.isSectioned) {
    return (parsed.cta || '').trim()
  }

  // For older caption-appended cards
  const marker = '\n\n---\n\nCaption:\n'
  if (text.includes(marker)) {
    return text.split(marker)[1]?.trim() || ''
  }

  return text
}

    function handleRefineCaptions() {
  const actualCaptionOnly = extractCaptionOnly(item.caption)

  if (typeof window !== 'undefined') {
    sessionStorage.setItem('ww_caption_source_card_id', item.id)
    sessionStorage.setItem('ww_caption_source_feature', item.feature || '')
    sessionStorage.setItem('ww_caption_polish_input', actualCaptionOnly)
    sessionStorage.setItem('ww_caption_return_to', '/calendar')
  }

  window.location.href = '/captions?tab=polish'
}

  return (
    <div
  className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-black/70 px-3 py-4 backdrop-blur sm:px-4"
  onClick={onClose}
  role="dialog"
  aria-modal="true"
>
      <div
  className={`${
  isSlideshow ? 'max-w-4xl' : 'max-w-lg'
} relative z-[201] flex h-[86dvh] w-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-black/95 p-4 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:p-5`}
  onClick={e => e.stopPropagation()}
  onTouchStart={e => e.stopPropagation()}
>

        <div className="shrink-0 flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-xs uppercase tracking-wide text-white/50">
              {platformLabel(item.platform)} • {statusLabel(item.status)} • {item.feature || 'calendar'}
            </p>

            {isEditing ? (
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className={inputClass}
                placeholder="Title"
              />
            ) : (
              <h3 className="text-lg font-semibold truncate">{item.title || 'Untitled'}</h3>
            )}

                        <div className="flex flex-wrap items-center gap-2 text-xs text-white/55">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5" />
                {scheduledLabel}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/20 text-white/70 hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="shrink-0 flex flex-wrap gap-2 py-3">
  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/65">
    {difficulty}
  </span>

  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/65">
    {filmingTime}
  </span>

  {locationLabel ? (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/65">
      {locationLabel}
    </span>
  ) : null}

  {equipmentLabel ? (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/65">
      {equipmentLabel}
    </span>
  ) : null}
</div>

        {/* Body */}
<div
  className={`mt-4 min-h-0 flex-1 ${
    isSlideshow
      ? 'overflow-y-auto overflow-x-hidden overscroll-contain pr-1 pb-4 touch-pan-y [-webkit-overflow-scrolling:touch]'
      : 'overflow-hidden'
  }`}
>
  {isEditing ? (
    <div className="space-y-4">
      <textarea
        value={editCaption}
        onChange={e => setEditCaption(e.target.value)}
        rows={6}
        className={inputClass}
        placeholder="Caption / notes…"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-[0.7rem] text-white/55">Platform</p>
          <select
            value={editPlatform}
            onChange={e => setEditPlatform(e.target.value)}
            className={selectClass}
          >
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="facebook">Facebook</option>
            <option value="x">X / Twitter</option>
          </select>
        </div>

        <div className="space-y-1">
          <p className="text-[0.7rem] text-white/55">Status</p>
          <select
            value={editStatus}
            onChange={e => setEditStatus(e.target.value)}
            className={selectClass}
          >
            <option value="planned">Planned</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="posted">Posted</option>
            <option value="idea">Idea</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-[0.7rem] text-white/55">Hashtags</p>
        <input
          value={editTags}
          onChange={e => setEditTags(e.target.value)}
          className={inputClass}
          placeholder="#music #hiphop #indie"
        />
      </div>
    </div>
  ) : (
    <div className="border-t border-white/10 pt-3">
      {structured || item.caption ? (
        (() => {

          const HighlightSection = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="w-full rounded-2xl border border-ww-violet/25 bg-ww-violet/[0.06] px-3.5 py-2.5 sm:px-4 sm:py-3">
   <div className="mb-1 text-[0.62rem] uppercase tracking-[0.14em] text-ww-violet sm:mb-1.5 sm:text-[0.65rem]">
      {label}
    </div>

    <div className="text-[0.82rem] leading-[1.55] text-white/90 sm:text-sm sm:leading-relaxed">
      {children}
    </div>
  </div>
)

          const Section = ({
            label,
            children,
          }: {
            label: string
            children: React.ReactNode
          }) => (
            <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-[0.65rem] uppercase tracking-wide text-white/45 mb-1">
                {label}
              </div>
              <div className="text-sm text-white/85 leading-relaxed">{children}</div>
            </div>
          )          

 if (structured && typeof structured === 'object') {
  if (isSlideshow) {
  return (
    <div className="space-y-3 pb-2">
      {structured.summary ? (
        <HighlightSection label="The Idea">
          {structured.summary}
        </HighlightSection>
      ) : null}

      {structured.viewerExperience ? (
        <HighlightSection label="What Viewers Will Experience">
          {structured.viewerExperience}
        </HighlightSection>
      ) : null}

      {structured.hook ? (
        <Section label="Hook">
          {structured.hook}
        </Section>
      ) : null}

      {structured.onScreenText ? (
        <Section label="On-Screen Text">
          {structured.onScreenText}
        </Section>
      ) : null}

      {modalSlides.length > 0 ? (
        <ModalSlideshowPlan slides={modalSlides} />
      ) : null}

      {structured.cta ? (
        <Section label="CTA">
          {refinedCaption || structured.cta}
        </Section>
      ) : null}

      {structured.whyChosenForArtist ? (
        <HighlightSection label="Why WW Chose This">
          {structured.whyChosenForArtist}
        </HighlightSection>
      ) : null}

      {Array.isArray(structured.why) && structured.why.length ? (
        <Section label="Why This Works">
          <ul className="space-y-1">
            {structured.why.map((line: string, index: number) => (
              <li key={index}>• {line}</li>
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  )
}
  return (
    <div className="flex h-full snap-x snap-mandatory touch-pan-x gap-3 overflow-x-auto overflow-y-hidden pb-2 [-webkit-overflow-scrolling:touch]">

      {/* PAGE 1 — IDEA + VIEWER EXPERIENCE */}
      <div className="flex h-full w-[94%] min-w-[94%] snap-center flex-col gap-3">
        {structured.summary ? (
          <HighlightSection label="The Idea">
            {structured.summary}
          </HighlightSection>
        ) : null}

        {structured.viewerExperience ? (
          <HighlightSection label="What Viewers Will Experience">
            {structured.viewerExperience}
          </HighlightSection>
        ) : null}
      </div>

      {/* PAGE 2 — HOOK + ON-SCREEN TEXT */}
      <div className="flex h-full w-[94%] min-w-[94%] snap-center flex-col gap-3">
        {structured.hook ? (
          <Section label="Hook">
            {structured.hook}
          </Section>
        ) : null}

        {structured.onScreenText ? (
          <Section label="On-Screen Text">
            {structured.onScreenText}
          </Section>
        ) : null}
      </div>

      {/* PAGE 3 — CONTENT ANGLE */}
      {structured.concept ? (
        <div className="h-full w-[94%] min-w-[94%] snap-center">
          <Section label="Content Angle">
            {structured.concept}
          </Section>
        </div>
      ) : null}

      {/* PAGE 4 — HOW TO FILM */}
      {isSlideshow && modalSlides.length > 0 ? (
        <div className="flex h-full w-[94%] min-w-[94%] shrink-0 snap-start flex-col overflow-hidden">
  <ModalSlideshowPlan slides={modalSlides} />
</div>
      ) : structured.execution ? (
        <div className="h-full w-[94%] min-w-[94%] snap-center">
          <div className="rounded-2xl border border-white/15 bg-white/[0.035] px-4 py-3">
            <div className="mb-2 text-[0.65rem] uppercase tracking-[0.14em] text-white/50">
              How to Film
            </div>

            <div className="whitespace-pre-wrap text-[0.82rem] leading-6 text-white/85">
              {formatNumberedSteps(
                typeof structured.execution === 'string'
                  ? structured.execution
                  : ''
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* PAGE 5 — CTA + WHY WW CHOSE THIS */}
      <div className="flex h-full w-[94%] min-w-[94%] snap-center flex-col gap-3">
        {structured.cta ? (
          <Section label="CTA">
            {refinedCaption || structured.cta}
          </Section>
        ) : null}

        {structured.whyChosenForArtist ? (
          <HighlightSection label="Why WW Chose This">
            {structured.whyChosenForArtist}
          </HighlightSection>
        ) : null}
      </div>

      {/* PAGE 6 — WHY THIS WORKS */}
      {Array.isArray(structured.why) && structured.why.length ? (
        <div className="h-full w-[94%] min-w-[94%] snap-center">
          <Section label="Why This Works">
            <ul className="space-y-1">
              {structured.why.map((line: string, index: number) => (
                <li key={index}>• {line}</li>
              ))}
            </ul>
          </Section>
        </div>
      ) : null}

    </div>
  )
}



const s = parseCaptionSections(item.caption || '')

if (!s.isSectioned) {
  return (
    <div className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
      {s.plain}
    </div>
  )
}

          return (
            <div className="space-y-2">
              {s.contentAngle ? (
  <Section label="Content Angle">{s.contentAngle}</Section>
) : null}

{s.hook ? (
  <Section label="Hook">{s.hook}</Section>
) : null}

{s.onScreenText ? (
  <Section label="On-Screen Text">{s.onScreenText}</Section>
) : null}

{isSlideshow && modalSlides.length > 0 ? (
  <ModalSlideshowPlan slides={modalSlides} />
) : s.videoExecution ? (
  <Section label="How to Film">
    <div className="whitespace-pre-wrap">
      {formatNumberedSteps(s.videoExecution)}
    </div>
  </Section>
) : null}

{s.caption ? (
  <Section label="Caption">{s.caption}</Section>
) : null}

{s.cta ? (
  <Section label="CTA">{refinedCaption || s.cta}</Section>
) : null}

{s.whyThisWorks ? (
  <Section label="Why This Works">{s.whyThisWorks}</Section>
) : null}

{s.bestFor ? (
  <Section label="Best For">{s.bestFor}</Section>
) : null}
              
            </div>
          )
        })()
      ) : (
        <div className="text-sm text-white/60">No caption yet.</div>
      )}
    </div>
  )}
</div>


        {/* Actions */}
        <div className="relative z-10 mt-4 shrink-0 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-black/95 pt-3">

          <div className="flex flex-wrap gap-2">
            {!isEditing ? (
              <button type="button" onClick={() => setIsEditing(true)} className={outlineBtn}>
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <button type="button" onClick={handleSave} disabled={saving} className={primaryBtn}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Save'}
              </button>
            )}

                        {showQuickCaptionGen && !isEditing && (
              hasAttachedCaption ? (
                <button type="button" onClick={handleRefineCaptions} className={primaryBtn}>
                  <Sparkles className="w-4 h-4" />
                  Refine Captions
                </button>
              ) : (
                <button type="button" onClick={handleQuickCaptionGen} disabled={quickGenLoading} className={primaryBtn}>
                  {quickGenLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {quickGenLoading ? 'Generating…' : 'Quick Captions'}
                </button>
              )
            )}

            

            {showSendToMomentum && !isEditing && (
              <button type="button" onClick={handleSendToMomentum} disabled={sending} className={outlineBtn}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Sending…' : 'Send to Momentum'}
              </button>
            )}

            {showPdfExport && !isEditing && (
              <button type="button" onClick={handleExportPdf} disabled={exporting} className={outlineBtn}>
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {exporting ? 'Exporting…' : 'PDF'}
              </button>
            )}
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false)
                setEditTitle(item.title || '')
                setEditCaption(item.caption || '')
                setEditPlatform(item.platform || 'instagram')
                setEditStatus((item.status || 'planned').toString())
                setEditTags(tagsToText(item.hashtags))
              }}
              className={outlineBtn}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
