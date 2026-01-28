'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { X, Loader2, Download, Sparkles, Send, Edit3, Check, CalendarDays } from 'lucide-react'
import { type PdfLayout, type PdfLine, normalizeText, renderPdfFromLines } from '@/lib/wwPdf'
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

  const keys = ['IDEA:', 'FORMAT:', 'ANGLE:', 'CTA:', 'PILLAR:']
  const hasAnyKey = keys.some(k => up.includes(k))

  if (!hasAnyKey) {
    return { isSectioned: false as const, idea: '', format: '', angle: '', cta: '', pillar: '', plain: raw }
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
const PDF_LAYOUT: PdfLayout = {
  page: { unit: 'pt', format: 'a4' },
  marginX: 64,
  marginTop: 72,
  marginBottom: 64,
  maxWidthPadding: 0,

  titleSize: 20,
  subtitleSize: 11,
  sectionTitleSize: 11,
  bodySize: 11,

  titleLeading: 24,
  subtitleLeading: 16,
  sectionTitleLeading: 16,
  bodyLeading: 16,

  titleGapAfter: 6,
  gapAfterSubtitle: 14,

  dividerPadTop: 16,
  dividerPadBottom: 14,
  dividerExtraAfter: 10,
  dividerAfterLineGap: 0,

  gapAfterSectionTitle: 8,
  gapAfterParagraph: 10,
}

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
      renderPdfFromLines({ lines, filenameBase: base, layout: PDF_LAYOUT })
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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center px-4"
      onClick={onClose} // ✅ click outside closes
      role="dialog"
      aria-modal="true"
    >
      <div
  className="max-w-lg w-full rounded-2xl border border-white/15 bg-black/95 p-5 flex flex-col max-h-[85vh]"
  onClick={e => e.stopPropagation()}
>

        <div className="flex items-start justify-between gap-3">
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

            <p className="text-xs text-white/55 flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5" />
              {scheduledLabel}
            </p>
          </div>

          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/20 text-white/70 hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
<div className="mt-4 flex-1 overflow-y-auto pr-1">
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
      {item.caption ? (
        (() => {
          const s = parseCaptionSections(item.caption)

          if (!s.isSectioned) {
            return (
              <div className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                {s.plain}
              </div>
            )
          }

          const Section = ({
            label,
            children,
          }: {
            label: string
            children: React.ReactNode
          }) => (
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="text-[0.65rem] uppercase tracking-wide text-white/45 mb-1">
                {label}
              </div>
              <div className="text-sm text-white/85 leading-relaxed">{children}</div>
            </div>
          )

          return (
            <div className="space-y-2">
              {s.idea ? (
                <Section label="Idea">
                  <div className="whitespace-pre-line">{s.idea}</div>
                </Section>
              ) : null}

              {s.format ? <Section label="Format">{s.format}</Section> : null}
              {s.angle ? <Section label="Angle">{s.angle}</Section> : null}
              {s.cta ? <Section label="CTA">{s.cta}</Section> : null}

              {s.pillar ? (
                <div className="pt-1 text-[0.75rem] text-white/65">
                  <span className="text-white/45 uppercase tracking-wide mr-2">
                    Pillar
                  </span>
                  <span>{s.pillar}</span>
                </div>
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
        <div className="mt-4 shrink-0 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">

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
              <button type="button" onClick={handleQuickCaptionGen} disabled={quickGenLoading} className={primaryBtn}>
                {quickGenLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {quickGenLoading ? 'Generating…' : 'Quick caption'}
              </button>
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
