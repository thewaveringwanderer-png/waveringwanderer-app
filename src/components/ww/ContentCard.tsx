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

  const keys = ['IDEA:', 'FORMAT:', 'ANGLE:', 'CTA:', 'PILLAR:']
  const hasAnyKey = keys.some(k => up.includes(k))

  if (!hasAnyKey) {
    return {
      isSectioned: false as const,
      idea: '',
      format: '',
      angle: '',
      cta: '',
      pillar: '',
      plain: raw,
    }
  }

  const norm = raw
    .replace(/idea:/gi, 'IDEA:')
    .replace(/format:/gi, 'FORMAT:')
    .replace(/angle:/gi, 'ANGLE:')
    .replace(/cta:/gi, 'CTA:')
    .replace(/pillar:/gi, 'PILLAR:')

  const takeBetween = (start: string, end?: string) => {
    const s = norm.indexOf(start)
    if (s === -1) return ''
    const from = s + start.length
    const e = end ? norm.indexOf(end, from) : -1
    return (e === -1 ? norm.slice(from) : norm.slice(from, e)).trim()
  }

  const idea = takeBetween('IDEA:', 'FORMAT:')
  const format = takeBetween('FORMAT:', 'ANGLE:')
  const angle = takeBetween('ANGLE:', 'CTA:')
  const cta = takeBetween('CTA:', 'PILLAR:')
  const pillar = takeBetween('PILLAR:')

  return {
    isSectioned: true as const,
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
  badge?: ContentCardBadge
  actions?: React.ReactNode
  onOpen?: () => void

  // ✅ visual states
  highlighted?: boolean
  armed?: boolean

  // ✅ click behavior (kept for backward compatibility)
  onClick?: () => void
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

  const containerPadding = isMini ? 'px-2 py-1.5' : 'p-3'

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
        'group rounded-xl border border-white/10 bg-white/5 transition',
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
                  : 'text-[0.7rem] text-white/55 truncate'
              }
              title={finalSubtitle}
            >
              {finalSubtitle}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
{!isMini && finalPreview ? (() => {
  const s = parseCaptionSections(finalPreview)

  // Old behaviour for non-sectioned captions
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

  // New behaviour for sectioned content (IDEA / FORMAT / ANGLE / CTA / PILLAR)
  return (
  <div className="mt-2 space-y-2 text-[0.75rem] text-white/70 leading-snug">
    {s.idea ? (
      <div className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-2">
        <div className="text-[0.62rem] uppercase tracking-wide text-white/45 mb-1">Idea</div>
        <div className={['whitespace-pre-line', isPool ? 'line-clamp-5' : 'line-clamp-4'].join(' ')}>
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

    {s.angle ? (
      <div className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-2">
        <div className="text-[0.62rem] uppercase tracking-wide text-white/45 mb-1">Angle</div>
        <div className="line-clamp-2">{s.angle}</div>
      </div>
    ) : null}

    {s.cta ? (
      <div className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-2">
        <div className="text-[0.62rem] uppercase tracking-wide text-white/45 mb-1">CTA</div>
        <div className="line-clamp-2">{s.cta}</div>
      </div>
    ) : null}

    {s.pillar ? (
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
