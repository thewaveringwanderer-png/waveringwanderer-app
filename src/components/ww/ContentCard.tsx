// src/components/ww/ContentCard.tsx
'use client'

import React from 'react'

type CardVariant = 'mini' | 'pool' | 'full'
function splitIntoLines(text: string) {
  return (text || '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
}

// Turns "1) ... 2) ... 3) ..." into new lines.
// Also supports "1." style.
function formatNumberedSteps(text: string) {
  const t = (text || '').trim()
  if (!t) return ''

  // If it already has line breaks, keep them
  if (t.includes('\n')) return t

  // Insert newlines before numbered patterns
  return t
    .replace(/\s(?=\d+\)\s)/g, '\n')  // " 2) " -> "\n2) "
    .replace(/\s(?=\d+\.\s)/g, '\n')  // " 2. " -> "\n2. "
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
    'IDEA:',
    'FORMAT:',
    'ANGLE:',
    'PILLAR:',
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
      whyThisWorks: '',
      bestFor: '',
      idea: '',
      format: '',
      angle: '',
      cta: '',
      pillar: '',
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
    .replace(/idea:/gi, 'IDEA:')
    .replace(/format:/gi, 'FORMAT:')
    .replace(/angle:/gi, 'ANGLE:')
    .replace(/pillar:/gi, 'PILLAR:')

  const takeBetween = (start: string, end?: string) => {
    const s = norm.indexOf(start)
    if (s === -1) return ''
    const from = s + start.length
    const e = end ? norm.indexOf(end, from) : -1
    return (e === -1 ? norm.slice(from) : norm.slice(from, e)).trim()
  }

  const contentAngle = takeBetween('CONTENT ANGLE:', 'HOOK:')
  const hook = takeBetween('HOOK:', 'ON-SCREEN TEXT:')
  const onScreenText = takeBetween('ON-SCREEN TEXT:', 'HOW TO FILM:')
  const videoExecution = takeBetween('HOW TO FILM:', 'CAPTION:')
  const captionText = takeBetween('CAPTION:', 'CTA:')
  const whyThisWorks = takeBetween('WHY THIS WORKS:', 'BEST FOR:')
  const bestFor = takeBetween('BEST FOR:')

  const idea = takeBetween('IDEA:', 'FORMAT:')
  const format = takeBetween('FORMAT:', 'ANGLE:')
  const angle = takeBetween('ANGLE:', 'CTA:')
  const cta = takeBetween('CTA:', contentAngle ? 'WHY THIS WORKS:' : 'PILLAR:')
  const pillar = takeBetween('PILLAR:')

  return {
    isSectioned: true as const,
    contentAngle,
    hook,
    onScreenText,
    videoExecution,
    caption: captionText,
    whyThisWorks,
    bestFor,
    idea: formatNumberedSteps(idea),
    format,
    angle,
    cta,
    pillar,
    plain: '',
  }
}


export type ContentCardBadge = {
  text: string
  className?: string
}

type Props = {
  // ✅ supports Momentum Board + Calendar mini cards
  variant?: CardVariant
    // ✅ month-view pill style
  centerMini?: boolean


  // ✅ shared fields
  title: string
  subtitle?: string

  // ✅ legacy compatibility (older pages may still pass these)
  caption?: string
  platform?: string | null
  status?: string | null
  feature?: string | null
  hashtags?: string[]

  // ✅ Momentum Board / richer cards
  previewText?: string
  hashtagsPreview?: string
  statusDotClass?: string
  metadata?: any
  badge?: ContentCardBadge
  actions?: React.ReactNode
  onOpen?: () => void

  // ✅ visual states
  highlighted?: boolean
  armed?: boolean

  // ✅ click behavior (kept for backward compatibility)
  onClick?: () => void
}

function buildMiniPreviewLines(caption: string): string[] {
  const s = parseCaptionSections(caption)

  // If it's not sectioned, just split into lines.
  if (!s.isSectioned) {
    return splitIntoLines(s.plain).slice(0, 4)
  }

  const lines: string[] = []

  if (s.idea) {
    const ideaLines = splitIntoLines(s.idea)
    const ideaShort = ideaLines.slice(0, 2).join(' / ')
    lines.push(`IDEA: ${ideaShort}`)
  }
  if (s.format) lines.push(`FORMAT: ${s.format}`)
  if (s.angle) lines.push(`ANGLE: ${s.angle}`)
  if (s.cta) lines.push(`CTA: ${s.cta}`)
  if (s.pillar) lines.push(`PILLAR: ${s.pillar}`)

  return lines.slice(0, 4)
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

function statusDotColor(status: string | null | undefined) {
  switch (status) {
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

function normalizeHashtags(list?: string[]) {
  if (!list || !list.length) return ''
  return list
    .filter(Boolean)
    .slice(0, 4)
    .map(h => (h.startsWith('#') ? h : `#${h}`))
    .join(' ')
}

export default function ContentCard({
  variant = 'mini',
  centerMini,
  title,
  subtitle,

  // legacy inputs
  caption,
  platform,
  status,
  feature,
  hashtags,

  // richer inputs
  previewText,
  hashtagsPreview,
  statusDotClass,
  metadata,
  badge,
  actions,
  onOpen,

  highlighted,
  armed,

  onClick,
}: Props) {
  const isMini = variant === 'mini'
  const isPool = variant === 'pool'
  const isFull = variant === 'full'

  const isRefinedCaption = !!metadata?.caption_refined

  const structured =
  metadata?.structured &&
  typeof metadata.structured === 'object'
    ? metadata.structured
    : null

  // Prefer Momentum-style props if provided; fall back to legacy ones.
  const finalSubtitle =
    subtitle ??
    (platform !== undefined ? platformLabel(platform) : undefined) ??
    undefined

  const finalPreview = previewText ?? caption ?? ''
  const finalHashtagsPreview =
    hashtagsPreview ?? normalizeHashtags(hashtags)

  const dotClass = statusDotClass ?? statusDotColor(status)

  

  const handleClick = () => {
    if (onOpen) onOpen()
    else if (onClick) onClick()
  }

  const clickable = !!onOpen || !!onClick

  const containerPadding = isMini
  ? 'px-2 py-1.5'
  : isPool
  ? 'p-3 sm:p-4'
  : 'p-3'

  const highlightRing = highlighted
    ? 'ring-2 ring-ww-violet/60 shadow-[0_0_18px_rgba(186,85,211,0.28)]'
    : ''

  const armedRing = armed
    ? 'ring-2 ring-ww-violet shadow-[0_0_18px_rgba(186,85,211,0.35)]'
    : ''

  return (
    <div
      onClick={clickable ? handleClick : undefined}
      className={[
        isPool
  ? 'group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.045] to-black/40 transition'
  : 'group rounded-xl border border-white/10 bg-white/5 transition',
        'hover:border-ww-violet/70 hover:shadow-[0_0_14px_rgba(186,85,211,0.22)]',
        containerPadding,
        clickable ? 'cursor-pointer' : '',
        highlightRing,
        armedRing,
      ].join(' ')}
    >
            {/* ✅ Month-view centered pill */}
      {isMini && centerMini ? (
        <div className="py-1 text-center">
          <div className="text-[0.72rem] text-white/90 font-medium truncate" title={title}>
            {title}
          </div>

          {!!finalSubtitle && (
            <div className="mt-0.5 text-[0.6rem] text-white/55 truncate" title={finalSubtitle}>
              {finalSubtitle}
            </div>
          )}
        </div>
      ) : null}

      {/* Top row */}
      {! (isMini && centerMini) ? (
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div
            className={
              isMini
                ? 'truncate text-[0.7rem] text-white/85'
                : isPool
? 'text-lg font-semibold leading-snug text-white'
: 'truncate text-sm text-white/90 font-medium'
            }
            title={title}
          >
            {title}
          </div>

          {!!finalSubtitle && (
            <div
              className={
                isMini
                  ? 'text-[0.6rem] text-white/50 truncate'
                  : isPool
? 'mt-1 text-[0.7rem] uppercase tracking-wide text-white/40'
: 'text-[0.7rem] text-white/55 truncate'
              }
              title={finalSubtitle}
            >
              {finalSubtitle}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
  {isRefinedCaption ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 text-[0.65rem] leading-none whitespace-nowrap text-emerald-300">
      Refined
    </span>
  ) : null}

  {badge ? (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-full border',
        'text-[0.65rem] leading-none whitespace-nowrap',
        badge.className || '',
      ].join(' ')}
    >
      {badge.text}
    </span>
  ) : null}

  <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
</div>

      </div>
) : null}
      {/* Legacy feature label support (kept) */}
      {!isMini && !badge?.text && feature ? (
        <div className="mt-0.5 text-[0.65rem] text-white/45 truncate">
          {feature}
        </div>
      ) : null}

      {/* Preview */}
{finalPreview ? (() => {
  // ✅ MINI: show clean 1-line-per-bullet preview (max 4)
  if (isMini) {
    const lines = buildMiniPreviewLines(finalPreview)

    if (!lines.length) return null

    return (
      <div className="mt-1.5 space-y-1 text-[0.62rem] text-white/60 leading-tight">
        {lines.map((line, i) => (
          <div key={i} className="truncate">
            {/* bullet */}
            <span className="text-white/35 mr-1">•</span>
            <span>{line}</span>
          </div>
        ))}
      </div>
    )
  }

  // ✅ POOL/FULL: keep your existing rich rendering

if (isPool && structured) {
  return (
   <div className="mt-2.5 space-y-2 sm:mt-4 sm:space-y-3">
      {structured.summary ? (
        <p className="line-clamp-2 text-[0.82rem] leading-relaxed text-white/70 sm:line-clamp-3 sm:text-sm">
          {structured.summary}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {metadata?.difficulty ? (
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.65rem] text-white/60">
            {metadata.difficulty}
          </span>
        ) : null}

        {metadata?.filmingTime ? (
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.65rem] text-white/60">
            {metadata.filmingTime}
          </span>
        ) : null}
      </div>

      {structured.hook ? (
        <div className="rounded-xl border border-white/15 bg-black/35 px-3 py-3">
          <div className="mb-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-white/40">
            Hook
          </div>

          <div className="line-clamp-3 text-sm font-medium leading-relaxed text-white">
            {structured.hook}
          </div>
        </div>
      ) : null}

      {structured.onScreenText ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3">
          <div className="mb-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-white/40">
            On-Screen Text
          </div>

          <div className="line-clamp-2 text-sm italic leading-relaxed text-white/80">
            {structured.onScreenText}
          </div>
        </div>
      ) : null}

      {structured.cta ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3">
          <div className="mb-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-white/40">
            CTA
          </div>

          <div className="line-clamp-2 text-sm leading-relaxed text-white/75">
            {metadata?.refined_caption_text || structured.cta}
          </div>
        </div>
      ) : null}
    </div>
  )
}

  const s = parseCaptionSections(finalPreview)

  if (!s.isSectioned) {
    return (
      <p
        className={[
          'mt-2 text-[0.75rem] text-white/70 whitespace-pre-wrap',
          isPool ? 'line-clamp-3' : 'line-clamp-2',
        ].join(' ')}
      >
        {s.plain}
      </p>
    )
  }

  return (
    <div className="mt-3 space-y-2 text-[0.75rem] leading-snug text-white/70">
      {s.idea ? (
        
        <div className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3">
          <div className="mb-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-white/40">
  Idea
</div>
          <div
  className={[
    'whitespace-pre-line leading-relaxed',
    isPool ? 'line-clamp-3 text-sm text-white/75' : 'line-clamp-4',
  ].join(' ')}
>
            {s.idea}
          </div>
        </div>
      ) : null}

      {s.format ? (
        <div className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-2">
          <div className="text-[0.62rem] uppercase tracking-wide text-white/45 mb-1">Format</div>
          <div className="line-clamp-2">{s.format}</div>
        </div>
      ) : null}

{!isPool && s.contentAngle ? (
  <div className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-2">
    <div className="text-[0.62rem] uppercase tracking-wide text-white/45 mb-1">
      Content Angle
    </div>

    <div className="line-clamp-3">
      {s.contentAngle}
    </div>
  </div>
) : null}

{s.hook ? (
  <div className="rounded-xl border border-white/20 bg-black/35 px-3 py-3">
    <div className="mb-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-white/40">
      Hook
    </div>

    <div className="text-sm font-medium text-white line-clamp-3">
      {s.hook}
    </div>
  </div>
) : null}

{!isPool && s.onScreenText ? (
  <div className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-2">
    <div className="text-[0.62rem] uppercase tracking-wide text-white/45 mb-1">
      On-Screen Text
    </div>

    <div className="italic text-white/80 line-clamp-3">
      {s.onScreenText}
    </div>
  </div>
) : null}

{!isPool && s.videoExecution ? (
  <div className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-2">
    <div className="text-[0.62rem] uppercase tracking-wide text-white/45 mb-1">
      How to Film
    </div>

    <div className="line-clamp-4">
      {s.videoExecution}
    </div>
  </div>
) : null}

{!isPool && s.caption ? (
  <div className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-2">
    <div className="text-[0.62rem] uppercase tracking-wide text-white/45 mb-1">
      Caption
    </div>

    <div className="line-clamp-4">
      {s.caption}
    </div>
  </div>
) : null}

{!isPool && s.whyThisWorks ? (
  <div className="rounded-lg border border-emerald-400/15 bg-emerald-400/[0.04] px-2.5 py-2">
    <div className="text-[0.62rem] uppercase tracking-wide text-emerald-300/70 mb-1">
      Why This Works
    </div>

    <div className="line-clamp-4 text-white/75">
      {s.whyThisWorks}
    </div>
  </div>
) : null}

{!isPool && s.bestFor ? (
  <div className="flex items-center justify-between gap-2 px-1">
    <span className="text-[0.62rem] uppercase tracking-wide text-white/45">
      Best For
    </span>

    <span className="text-[0.7rem] text-white/70 truncate">
      {s.bestFor}
    </span>
  </div>
) : null}

      {!isPool && s.angle ? (
        <div className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-2">
          <div className="text-[0.62rem] uppercase tracking-wide text-white/45 mb-1">Angle</div>
          <div className="line-clamp-2">{s.angle}</div>
        </div>
      ) : null}

      {s.cta ? (
  <div className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3">
    <div className="mb-1 flex items-center justify-between gap-2">
      <div className="text-[0.62rem] uppercase tracking-[0.14em] text-white/40">
  CTA
</div>

      {isRefinedCaption ? (
        <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[0.58rem] uppercase tracking-wide text-emerald-300 whitespace-nowrap">
          Refined
        </span>
      ) : null}
    </div>

    <div className="line-clamp-2 text-sm leading-relaxed text-white/75">
      {metadata?.refined_caption_text || s.cta}
    </div>
  </div>
) : null}

      {!isPool && s.pillar ? (
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-[0.62rem] uppercase tracking-wide text-white/45">Pillar</span>
          <span className="text-[0.7rem] text-white/70 truncate">{s.pillar}</span>
        </div>
      ) : null}
    </div>
  )
})() : null}


      {/* Hashtags preview */}
      {!isMini && finalHashtagsPreview ? (
        <p className="mt-2 text-[0.7rem] text-white/50 truncate">
          {finalHashtagsPreview}
        </p>
      ) : null}

      {/* Actions slot (Momentum Board uses this heavily) */}
      {!isMini && actions ? (
        <div className="mt-2">{actions}</div>
      ) : null}

      {/* Full variant could show extra space if you later want it */}
      {isFull ? null : null}
    </div>
  )
}
