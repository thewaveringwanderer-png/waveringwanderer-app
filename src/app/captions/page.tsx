'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Toaster, toast } from 'sonner'
import { useWwProfile } from '@/hooks/useWwProfile'
import {
  Sparkles,
  Image as ImageIcon,
  Instagram,
  Music2,
  Youtube,
  Facebook,
  Twitter,
  Wand2,
  Loader2,
  Save,
  Clipboard,
  Check,
  Download,
  Send
} from 'lucide-react'
import jsPDF from 'jspdf'

// ---------- Supabase ----------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ---------- Types ----------
type CaptionVariant = {
  text: string
  hashtags?: {
    core?: string[]
    niche?: string[]
  }
}

type GenerateResult = {
  variants: CaptionVariant[]
}

type PolishResult = {
  improved: string
  reasoning?: string
}

// ---------- PDF export (divider spacing pattern you locked in) ----------
const PDF_LAYOUT = {
  page: { unit: 'pt' as const, format: 'a4' as const },
  marginX: 64,
  marginTop: 72,
  marginBottom: 64,

  titleSize: 18,
  subtitleSize: 11,
  sectionTitleSize: 11,
  bodySize: 11,

  titleLeading: 22,
  subtitleLeading: 16,
  sectionTitleLeading: 16,
  bodyLeading: 16,

  titleGapAfter: 6,
  gapAfterSubtitle: 14,

  dividerPadTop: 16,
  dividerPadBottom: 14,
  dividerExtraAfter: 10, // ✅ key: consistent space after divider line

  gapAfterSectionTitle: 8,
  gapAfterParagraph: 10,
}

type PdfLine =
  | { kind: 'title'; text: string }
  | { kind: 'subtitle'; text: string }
  | { kind: 'divider' }
  | { kind: 'sectionTitle'; text: string }
  | { kind: 'body'; text: string }

function normalizeText(s: string) {
  return (s || '')
    .replace(/\u00A0/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim()
}

function renderPdf(lines: PdfLine[], filenameBase: string) {
  const doc = new jsPDF({
    unit: PDF_LAYOUT.page.unit,
    format: PDF_LAYOUT.page.format,
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const x = PDF_LAYOUT.marginX
  const maxWidth = pageWidth - PDF_LAYOUT.marginX * 2
  let y = PDF_LAYOUT.marginTop

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - PDF_LAYOUT.marginBottom) {
      doc.addPage()
      y = PDF_LAYOUT.marginTop
    }
  }

  const drawWrapped = (text: string, size: number, leading: number, font: 'normal' | 'bold') => {
    const safe = normalizeText(text)
    if (!safe) return
    doc.setFont('helvetica', font)
    doc.setFontSize(size)
    doc.setTextColor(0, 0, 0)
    const wrapped = doc.splitTextToSize(safe, maxWidth)
    ensureSpace(wrapped.length * leading)
    doc.text(wrapped, x, y)
    y += wrapped.length * leading
  }

  for (const line of lines) {
    if (line.kind === 'divider') {
      ensureSpace(PDF_LAYOUT.dividerPadTop + 2 + PDF_LAYOUT.dividerPadBottom + PDF_LAYOUT.dividerExtraAfter)

      y += PDF_LAYOUT.dividerPadTop
      doc.setDrawColor(225, 225, 225)
      doc.setLineWidth(0.8)
      doc.line(x, y, pageWidth - x, y)
      y += 1
      y += PDF_LAYOUT.dividerPadBottom
      y += PDF_LAYOUT.dividerExtraAfter
      continue
    }

    if (line.kind === 'title') {
      drawWrapped(line.text, PDF_LAYOUT.titleSize, PDF_LAYOUT.titleLeading, 'bold')
      y += PDF_LAYOUT.titleGapAfter
      continue
    }

    if (line.kind === 'subtitle') {
      drawWrapped(line.text, PDF_LAYOUT.subtitleSize, PDF_LAYOUT.subtitleLeading, 'normal')
      y += PDF_LAYOUT.gapAfterSubtitle
      continue
    }

    if (line.kind === 'sectionTitle') {
      ensureSpace(PDF_LAYOUT.sectionTitleLeading + PDF_LAYOUT.gapAfterSectionTitle)
      drawWrapped(line.text.toUpperCase(), PDF_LAYOUT.sectionTitleSize, PDF_LAYOUT.sectionTitleLeading, 'bold')
      y += PDF_LAYOUT.gapAfterSectionTitle
      continue
    }

    drawWrapped(line.text, PDF_LAYOUT.bodySize, PDF_LAYOUT.bodyLeading, 'normal')
    y += PDF_LAYOUT.gapAfterParagraph
  }

  const filename = (filenameBase || 'captions')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .toLowerCase()

  doc.save(`${filename}.pdf`)
}

function buildCaptionPdfLines(args: {
  artistName: string
  platform: string
  topic: string
  tone: string
  variantLabel: string
  captionText: string
  hashtags?: { core?: string[]; niche?: string[] }
}): PdfLine[] {
  const { artistName, platform, topic, tone, variantLabel, captionText, hashtags } = args

  const lines: PdfLine[] = []

  lines.push({ kind: 'title', text: 'Captions & Hashtags' })

  const subtitleParts: string[] = []
  if (artistName) subtitleParts.push(normalizeText(artistName))
  if (platform) subtitleParts.push(`Platform: ${normalizeText(platform)}`)
  if (topic) subtitleParts.push(`Topic: ${normalizeText(topic)}`)
  lines.push({
    kind: 'subtitle',
    text: subtitleParts.length ? subtitleParts.join(' • ') : 'Caption export',
  })

  lines.push({ kind: 'divider' })

  lines.push({ kind: 'sectionTitle', text: variantLabel })
  lines.push({ kind: 'body', text: normalizeText(captionText || '') })

  if (tone) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Tone' })
    lines.push({ kind: 'body', text: normalizeText(tone) })
  }

  const core = (hashtags?.core || []).filter(Boolean)
  const niche = (hashtags?.niche || []).filter(Boolean)

  if (core.length || niche.length) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Hashtags' })

    const chunks: string[] = []
    if (core.length) chunks.push(`Core: ${core.map(t => `#${t}`).join(' ')}`)
    if (niche.length) chunks.push(`Niche: ${niche.map(t => `#${t}`).join(' ')}`)

    lines.push({ kind: 'body', text: chunks.join('\n') })
  }

  return lines
}

function buildAllCaptionsPdfLines(args: {
  artistName: string
  platform: string
  topic: string
  tone: string
  variants: CaptionVariant[]
}): PdfLine[] {
  const { artistName, platform, topic, tone, variants } = args

  const lines: PdfLine[] = []
  lines.push({ kind: 'title', text: 'Captions & Hashtags' })

  const subtitleParts: string[] = []
  if (artistName) subtitleParts.push(normalizeText(artistName))
  if (platform) subtitleParts.push(`Platform: ${normalizeText(platform)}`)
  if (topic) subtitleParts.push(`Topic: ${normalizeText(topic)}`)
  lines.push({
    kind: 'subtitle',
    text: subtitleParts.length ? subtitleParts.join(' • ') : 'Caption export',
  })

  lines.push({ kind: 'divider' })

  if (tone) {
    lines.push({ kind: 'sectionTitle', text: 'Tone' })
    lines.push({ kind: 'body', text: normalizeText(tone) })
    lines.push({ kind: 'divider' })
  }

  variants.forEach((v, idx) => {
    lines.push({ kind: 'sectionTitle', text: `Variant ${idx + 1}` })
    lines.push({ kind: 'body', text: normalizeText(v.text || '') })

    const core = (v.hashtags?.core || []).filter(Boolean)
    const niche = (v.hashtags?.niche || []).filter(Boolean)

    if (core.length || niche.length) {
      lines.push({ kind: 'sectionTitle', text: 'Hashtags' })
      const blocks: string[] = []
      if (core.length) blocks.push(`Core: ${core.map(t => `#${t}`).join(' ')}`)
      if (niche.length) blocks.push(`Niche: ${niche.map(t => `#${t}`).join(' ')}`)
      lines.push({ kind: 'body', text: blocks.join('\n') })
    }

    if (idx !== variants.length - 1) lines.push({ kind: 'divider' })
  })

  return lines
}

// ---------- Component ----------
export default function CaptionsPage() {
  const {
  profile,
  hasProfile: hasAnyProfile,
  setLocalOnly: applyTo,
  updateProfile: save,
} = useWwProfile()


  // which tab is visible
  const [activeTab, setActiveTab] = useState<'generate' | 'polish'>('generate')

  // generator state
  const [sourceKind, setSourceKind] = useState<'text' | 'image'>('text')
  const [artistName, setArtistName] = useState('')
  const [platform, setPlatform] = useState<'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x'>('instagram')
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState('')
  const [tone, setTone] = useState('brand-consistent, concise, human, engaging')
  const [imageHint, setImageHint] = useState('')
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [variantCount, setVariantCount] = useState(4)

  const [genResult, setGenResult] = useState<GenerateResult | null>(null)
  const [loadingGenerate, setLoadingGenerate] = useState(false)
  const [copyIndex, setCopyIndex] = useState<number | null>(null)
  const [downloadingPdfIdx, setDownloadingPdfIdx] = useState<number | null>(null)
  const [downloadingAllPdf, setDownloadingAllPdf] = useState(false)

  // polish state
  const [polishInput, setPolishInput] = useState('')
  const [polishGoal, setPolishGoal] = useState('Sharpen clarity and rhythm while keeping meaning.')
  const [polishPlatform, setPolishPlatform] = useState<'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x'>(
    'instagram'
  )
  const [polishResult, setPolishResult] = useState<PolishResult | null>(null)
  const [loadingPolish, setLoadingPolish] = useState(false)

  // ✅ Non-destructive: if local fields are empty, hydrate from central profile
  useEffect(() => {
    if (profile.artistName && !artistName) setArtistName(profile.artistName)
    if (profile.tone && tone === 'brand-consistent, concise, human, engaging') setTone(profile.tone)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  function applyProfileFromCentral() {
    applyTo({ setArtistName, setTone })
    toast.success('Profile applied ✅')
  }

  // ---- shared platform labels/icons (ONLY declared once) ----
  const platformLabel = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube: 'YouTube Shorts',
    facebook: 'Facebook',
    x: 'X / Twitter',
  } as const

  const platformIcon = {
    instagram: <Instagram className="w-4 h-4" />,
    tiktok: <Music2 className="w-4 h-4" />,
    youtube: <Youtube className="w-4 h-4" />,
    facebook: <Facebook className="w-4 h-4" />,
    x: <Twitter className="w-4 h-4" />,
  } as const

  function currentPlatformTip() {
    switch (platform) {
      case 'instagram':
        return 'Scroll-stopping captions for Reels or feed posts. Space and emojis used for rhythm, not spam.'
      case 'tiktok':
        return 'Short, punchy, conversational lines that support a strong video hook.'
      case 'youtube':
        return 'Captions that also work as Shorts descriptions, with context and a soft CTA.'
      case 'facebook':
        return 'Slightly longer, story-driven captions for feed behaviour.'
      case 'x':
        return 'Tightly-edited posts that can stand alone as X posts. No hashtag overload.'
      default:
        return ''
    }
  }

  // ---------- Actions: Generate ----------
  async function handleGenerate() {
    const effectiveTopic =
      topic || (sourceKind === 'image' ? imageHint || 'Visual-based post' : 'Music / artist post')

    // ✅ Save to central profile (local + DB best-effort)
    void save({
      artistName: artistName || undefined,
      tone: tone || undefined,
    })

    setLoadingGenerate(true)
    setCopyIndex(null)
    setGenResult(null)

    try {
      const res = await fetch('/api/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'generate',
          sourceKind,
          artistName,
          platform,
          topic: effectiveTopic,
          imageHint: sourceKind === 'image' ? imageHint : undefined,
          keywords,
          tone,
          variantCount,
          includeHashtags,
        }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to generate captions')
      }

      const raw = await res.json()

      // Expect API to return: { variants: [ { text, hashtags } ] }
      const variantsSource: any[] = Array.isArray(raw?.variants) ? raw.variants : []

      const normalised: CaptionVariant[] = variantsSource.map((v: any) => {
        const text =
          v?.text ||
          v?.caption ||
          v?.caption_text ||
          (typeof v === 'string' ? v : '') ||
          '(no text returned)'

        return {
          text,
          hashtags: v?.hashtags ?? {
            core: v?.core_hashtags ?? [],
            niche: v?.niche_hashtags ?? [],
          },
        }
      })

      setGenResult({ variants: normalised })
      toast.success('Captions generated ✨')
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Something went wrong')
    } finally {
      setLoadingGenerate(false)
    }
  }

  async function handleSaveVariant(idx: number) {
    if (!genResult || !genResult.variants[idx]) {
      return toast.error('Nothing to save yet')
    }
    const v = genResult.variants[idx]

    try {
      const { error } = await supabase.from('captions').insert([
        {
          artist_name: artistName || null,
          platform,
          topic: topic || null,
          tone,
          text: v.text,
          hashtags: v.hashtags ?? null,
        },
      ])

      if (error) throw error
      toast.success('Caption saved to your vault ✅')
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Error saving caption')
    }
  }
    function normalizeHashtagList(arr: any): string[] {
    if (!Array.isArray(arr)) return []
    return arr
      .map((t: any) => String(t || '').trim())
      .filter(Boolean)
      .map(t => t.replace(/^#/, '')) // store without '#'
  }

  async function _handleSendVariantToMomentum(idx: number) {
    if (!genResult?.variants?.[idx]) return toast.error('Nothing to send yet')

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        toast.error('You must be logged in to send to Momentum Board')
        return
      }

      const v = genResult.variants[idx]
      const effectiveTopic =
        topic || (sourceKind === 'image' ? imageHint || 'Visual-based post' : 'Music / artist post')

      const core = normalizeHashtagList(v.hashtags?.core)
      const niche = normalizeHashtagList(v.hashtags?.niche)
      const allTags = [...core, ...niche]

      const row = {
        user_id: userData.user.id,
        title: `${platformLabel[platform]} caption — Variant ${idx + 1}`,
        caption: v.text || null,
        platform, // matches Momentum Board filters
        status: 'idea',
        scheduled_at: null,
        hashtags: allTags.length ? allTags : null,
        in_momentum: true,
        feature: 'captions',
        metadata: {
          source: 'captions',
          sourceKind,
          artistName,
          platform,
          topic: effectiveTopic,
          keywords,
          tone,
          includeHashtags,
          variantCount,
          variant_index: idx,
          imageHint: sourceKind === 'image' ? imageHint : null,
        },
      }

      const { error } = await supabase.from('content_calendar').insert([row])
      if (error) throw new Error(error.message || 'Could not send to Momentum Board')

      toast.success('Sent to Momentum Board ✅')
    } catch (e: any) {
      console.error('[captions-send-one]', e)
      toast.error(e?.message || 'Could not send to Momentum Board')
    }
  }

  async function handleSendAllToMomentum() {
    if (!genResult?.variants?.length) return toast.error('Nothing to send yet')

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        toast.error('You must be logged in to send to Momentum Board')
        return
      }

      const effectiveTopic =
        topic || (sourceKind === 'image' ? imageHint || 'Visual-based post' : 'Music / artist post')

      const rows = genResult.variants.map((v, idx) => {
        const core = normalizeHashtagList(v.hashtags?.core)
        const niche = normalizeHashtagList(v.hashtags?.niche)
        const allTags = [...core, ...niche]

        return {
          user_id: userData.user.id,
          title: `${platformLabel[platform]} caption — Variant ${idx + 1}`,
          caption: v.text || null,
          platform,
          status: 'idea',
          scheduled_at: null,
          hashtags: allTags.length ? allTags : null,
          in_momentum: true,
          feature: 'captions',
          metadata: {
            source: 'captions',
            sourceKind,
            artistName,
            platform,
            topic: effectiveTopic,
            keywords,
            tone,
            includeHashtags,
            variantCount,
            variant_index: idx,
            batch: true,
            imageHint: sourceKind === 'image' ? imageHint : null,
          },
        }
      })

      const { error } = await supabase.from('content_calendar').insert(rows)
      if (error) throw new Error(error.message || 'Could not send all to Momentum Board')

      toast.success('All captions sent to Momentum Board ✅')
    } catch (e: any) {
      console.error('[captions-send-all]', e)
      toast.error(e?.message || 'Could not send all to Momentum Board')
    }
  }


  async function handleCopyAll() {
    if (!genResult || !Array.isArray(genResult.variants)) return
    const block = genResult.variants.map((v, i) => `${i + 1}. ${v.text}`).join('\n\n')
    await navigator.clipboard.writeText(block)
    toast.success('All variants copied')
  }

  async function handleCopySingle(text: string, idx: number) {
    await navigator.clipboard.writeText(text)
    setCopyIndex(idx)
    setTimeout(() => setCopyIndex(null), 1200)
  }

  async function handleDownloadVariantPdf(idx: number) {
    if (!genResult || !genResult.variants[idx]) return
    setDownloadingPdfIdx(idx)
    try {
      const v = genResult.variants[idx]
      const lines = buildCaptionPdfLines({
        artistName,
        platform: platformLabel[platform],
        topic: topic || (sourceKind === 'image' ? imageHint : '') || '',
        tone,
        variantLabel: `Variant ${idx + 1}`,
        captionText: v.text,
        hashtags: v.hashtags,
      })
      const base = `${artistName || 'ww'}-${platformLabel[platform]}-caption-${idx + 1}`
      renderPdf(lines, base)
      toast.success('Caption downloaded as PDF ✅')
    } catch (e: any) {
      console.error('[captions-pdf]', e)
      toast.error(e?.message || 'Could not generate PDF')
    } finally {
      setDownloadingPdfIdx(null)
    }
  }

  async function handleDownloadAllPdf() {
    if (!genResult || !Array.isArray(genResult.variants) || !genResult.variants.length) return
    setDownloadingAllPdf(true)
    try {
      const lines = buildAllCaptionsPdfLines({
        artistName,
        platform: platformLabel[platform],
        topic: topic || (sourceKind === 'image' ? imageHint : '') || '',
        tone,
        variants: genResult.variants,
      })
      const base = `${artistName || 'ww'}-${platformLabel[platform]}-captions`
      renderPdf(lines, base)
      toast.success('All captions downloaded as PDF ✅')
    } catch (e: any) {
      console.error('[captions-pdf-all]', e)
      toast.error(e?.message || 'Could not generate PDF')
    } finally {
      setDownloadingAllPdf(false)
    }
  }

  // ---------- Actions: Polish ----------
  async function handlePolish() {
    if (!polishInput.trim()) {
      toast.error('Paste a caption to polish')
      return
    }

    setLoadingPolish(true)
    setPolishResult(null)

    try {
      const res = await fetch('/api/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'polish',
          platform: polishPlatform,
          goal: polishGoal,
          text: polishInput,
        }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to polish caption')
      }

      const data = (await res.json()) as PolishResult
      setPolishResult(data)
      toast.success('Caption polished ✨')
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Failed to polish caption')
    } finally {
      setLoadingPolish(false)
    }
  }

  // ---------- JSX ----------
  return (
    <main className="min-h-screen bg-black text-white">
      <Toaster position="top-center" richColors />

      {/* Hero + Tabs */}
      <section className="mx-auto max-w-5xl px-4 py-8 space-y-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Captions & Hashtags</h1>
          <p className="mt-2 text-white/70">
            Generate on-brand captions, refine what you already have, and keep everything consistent across platforms.
          </p>
        </div>

        {/* ✅ Central profile banner */}
        {hasAnyProfile && (
          <div className="p-3 rounded-2xl border border-ww-violet/40 bg-ww-violet/10 text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="text-white/80">Load your saved artist details and tone from your WW profile?</span>
            <button
              type="button"
              onClick={applyProfileFromCentral}
              className="px-3 h-8 rounded-full bg-ww-violet text-white text-xs font-semibold hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] active:scale-95 transition"
            >
              Apply profile
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('generate')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition ${
              activeTab === 'generate'
                ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.7)]'
                : 'text-white/70 hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Generate
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('polish')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition ${
              activeTab === 'polish'
                ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.7)]'
                : 'text-white/70 hover:bg-white/10'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            Polish
          </button>
        </div>
      </section>

      {/* ----------- Generate TAB ----------- */}
      {activeTab === 'generate' && (
        <section className="mx-auto max-w-5xl px-4 pb-10 space-y-8">
          {/* Generator Card */}
          <section className="rounded-3xl border border-white/10 bg-black/70 p-5 md:p-7 space-y-5">
            {/* Source kind + tone */}
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setSourceKind('text')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition ${
                    sourceKind === 'text'
                      ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.7)]'
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => setSourceKind('image')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition ${
                    sourceKind === 'image'
                      ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.7)]'
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Image
                </button>
              </div>

              <input
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="hidden md:block w-72 px-3 py-2 rounded-full bg-black border border-white/15 text-xs text-white/80 placeholder-white/40 focus:border-ww-violet focus:outline-none"
                placeholder="Tone e.g. introspective, hype, conversational"
              />
            </div>

            {/* Artist & tone (mobile) */}
            <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
              <div>
                <input
                  value={artistName}
                  onChange={e => setArtistName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                  placeholder="Artist name"
                />
                {profile.artistName && !artistName && (
                  <button
                    type="button"
                    onClick={() => setArtistName(profile.artistName!)}
                    className="mt-1 text-[0.7rem] text-ww-violet hover:underline"
                  >
                    Use “{profile.artistName}” from profile
                  </button>
                )}
              </div>
              <div>
                <input
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="md:hidden w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                  placeholder="Tone (e.g. cinematic, raw, playful)"
                />
                {profile.tone && tone === 'brand-consistent, concise, human, engaging' && (
                  <button
                    type="button"
                    onClick={() => setTone(profile.tone!)}
                    className="mt-1 text-[0.7rem] text-ww-violet hover:underline"
                  >
                    Use “{profile.tone}”
                  </button>
                )}
              </div>
            </div>

            {/* Platform */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-white/40">Platform</p>
              <div className="flex flex-wrap gap-2">
                {(['instagram', 'tiktok', 'youtube', 'facebook', 'x'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`inline-flex items-center gap-2 px-3.5 h-9 rounded-full text-xs font-medium transition ${
                      platform === p
                        ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.7)]'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {platformIcon[p]}
                    {platformLabel[p]}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic / keywords / image hint */}
            <div className="grid gap-3 md:grid-cols-2">
              {sourceKind === 'text' ? (
                <>
                  <input
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                    placeholder="Topic (what’s this post about?)"
                  />
                  <input
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                    placeholder="Keywords (comma-separated)"
                  />
                </>
              ) : (
                <textarea
                  value={imageHint}
                  onChange={e => setImageHint(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white placeholder-white/40 focus:border-ww-violet focus:outline-none md:col-span-2"
                  placeholder="Describe the image or visual (setting, mood, subject, colours…) "
                />
              )}
            </div>

            {/* Hashtags / count */}
            <div className="flex flex-wrap gap-3 items-center justify-between text-xs text-white/70">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-ww-violet"
                  checked={includeHashtags}
                  onChange={e => setIncludeHashtags(e.target.checked)}
                />
                Include smart hashtag sets
              </label>
              <div className="flex items-center gap-2">
                <span>Variants:</span>
                <select
                  value={variantCount}
                  onChange={e => setVariantCount(parseInt(e.target.value, 10))}
                  className="bg-black border border-white/15 rounded-full px-2 py-1 text-xs focus:border-ww-violet focus:outline-none"
                >
                  {[2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loadingGenerate}
                className="inline-flex items-center gap-2 px-5 h-10 rounded-full bg-ww-violet text-sm font-semibold shadow-[0_0_16px_rgba(186,85,211,0.7)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] active:scale-95 transition disabled:opacity-60"
              >
                {loadingGenerate ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyAll}
                disabled={!genResult}
                className="inline-flex items-center gap-2 px-4 h-10 rounded-full border border-white/15 text-sm text-white/80 hover:border-ww-violet hover:text-white transition disabled:opacity-40"
              >
                <Clipboard className="w-4 h-4" />
                Copy All
              </button>

              <button
                type="button"
                onClick={handleDownloadAllPdf}
                disabled={!genResult || downloadingAllPdf}
                className="inline-flex items-center gap-2 px-4 h-10 rounded-full border border-white/15 text-sm text-white/80 hover:border-ww-violet hover:text-white transition disabled:opacity-40"
              >
                {downloadingAllPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    PDF…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    PDF All
                  </>
                )}
              </button>
            </div>

            {/* Platform tip */}
            <p className="text-xs text-white/50 pt-1">{currentPlatformTip()}</p>
          </section>

          {/* Generate Results */}
          {Array.isArray(genResult?.variants) && genResult!.variants.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-ww-violet" />
                Generated variants
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {genResult!.variants.map((v, idx) => (
                  <div key={idx} className="rounded-2xl border border-white/10 bg-black/70 p-4 flex flex-col gap-3">
                    <p className="text-sm leading-relaxed text-white/90">{v.text || '— (no text returned by model)'}</p>

                    {v.hashtags && (
                      <div className="space-y-1 text-xs text-white/70">
                        {Array.isArray(v.hashtags.core) && v.hashtags.core.length > 0 && (
                          <p>
                            <span className="text-white/60">Core: </span>
                            {v.hashtags.core.map(tag => `#${tag}`).join(' ')}
                          </p>
                        )}
                        {Array.isArray(v.hashtags.niche) && v.hashtags.niche.length > 0 && (
                          <p>
                            <span className="text-white/60">Niche: </span>
                            {v.hashtags.niche.map(tag => `#${tag}`).join(' ')}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleCopySingle(v.text, idx)}
                        className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-white/15 text-xs text-white/80 hover:border-ww-violet hover:text-white transition"
                      >
                        {copyIndex === idx ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Clipboard className="w-3 h-3" />
                            Copy
                          </>
                        )}
                      </button>
                      <button
  type="button"
  onClick={handleSendAllToMomentum}
  disabled={!genResult || loadingGenerate}
  className="inline-flex items-center gap-2 px-4 h-10 rounded-full border border-white/15 text-sm text-white/80 hover:border-ww-violet hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] transition disabled:opacity-40"
>
  <Send className="w-4 h-4" />
  Send All
</button>


                      <button
                        type="button"
                        onClick={() => handleSaveVariant(idx)}
                        className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-white/15 text-xs text-white/80 hover:border-ww-violet hover:text-white transition"
                      >
                        <Save className="w-3 h-3" />
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadVariantPdf(idx)}
                        disabled={downloadingPdfIdx === idx}
                        className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-white/15 text-xs text-white/80 hover:border-ww-violet hover:text-white transition disabled:opacity-60"
                      >
                        {downloadingPdfIdx === idx ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            PDF…
                          </>
                        ) : (
                          <>
                            <Download className="w-3 h-3" />
                            PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>
      )}

      {/* ----------- Polish TAB ----------- */}
      {activeTab === 'polish' && (
        <section className="mx-auto max-w-5xl px-4 pb-12 space-y-6">
          <section className="rounded-3xl border border-white/10 bg-black/70 p-5 md:p-7 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-ww-violet" />
                  Caption Polisher
                </h2>
                <p className="text-xs text-white/60 mt-1">
                  Paste any caption and get a sharper, more engaging version without losing your voice.
                </p>
              </div>

              {/* Desktop platform chips */}
              <div className="hidden md:flex flex-col items-end gap-1 text-xs text-white/50">
                <span>Platform focus</span>
                <div className="inline-flex gap-2">
                  {(['instagram', 'tiktok', 'youtube', 'facebook', 'x'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPolishPlatform(p)}
                      className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[10px] font-medium transition ${
                        polishPlatform === p
                          ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.7)]'
                          : 'border border-white/15 text-white/60 hover:border-ww-violet/60'
                      }`}
                    >
                      {platformIcon[p]}
                      {platformLabel[p]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <textarea
              value={polishInput}
              onChange={e => setPolishInput(e.target.value)}
              rows={5}
              className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
              placeholder="Paste your caption here…"
            />

            <div className="grid gap-3 md:grid-cols-[2fr,1fr] items-start">
              <textarea
                value={polishGoal}
                onChange={e => setPolishGoal(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                placeholder="What should the polisher focus on?"
              />

              {/* Mobile platform chips */}
              <div className="flex md:hidden flex-wrap gap-2 text-xs text-white/60">
                {(['instagram', 'tiktok', 'youtube', 'facebook', 'x'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPolishPlatform(p)}
                    className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[10px] font-medium transition ${
                      polishPlatform === p
                        ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.7)]'
                        : 'border border-white/15 text-white/60 hover:border-ww-violet/60'
                    }`}
                  >
                    {platformIcon[p]}
                    {platformLabel[p]}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handlePolish}
              disabled={loadingPolish}
              className="inline-flex items-center gap-2 px-5 h-10 rounded-full bg-ww-violet text-sm font-semibold shadow-[0_0_16px_rgba(186,85,211,0.7)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] active:scale-95 transition disabled:opacity-60"
            >
              {loadingPolish ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Polishing…
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Polish Caption
                </>
              )}
            </button>
          </section>

          {polishResult && (
            <section className="rounded-3xl border border-white/10 bg-black/80 p-5 md:p-7 space-y-4">
              <h3 className="text-lg font-semibold text-ww-violet flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Polished Caption
              </h3>
              <p className="text-sm text-white/90 leading-relaxed">{polishResult.improved}</p>
              {polishResult.reasoning && (
                <p className="text-xs text-white/60 border-t border-white/10 pt-3">{polishResult.reasoning}</p>
              )}
            </section>
          )}
        </section>
      )}
    </main>
  )
}
