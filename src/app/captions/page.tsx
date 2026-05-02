'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Toaster, toast } from 'sonner'
import { useWwProfile } from '@/hooks/useWwProfile'
import { bumpUsage, getUsage } from '@/lib/wwProfile'
import { useRouter, useSearchParams } from 'next/navigation'
import LimitReachedPill from '@/components/ww/LimitReachedPill'
import { useGeneratingMessages } from '@/hooks/useGeneratingMessages'
import {
  Sparkles,
  Type,
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
  Send,
} from 'lucide-react'

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

const CAPTION_GENERATING_MESSAGES = [
  'Gathering your post context...',
  'Matching your tone and platform...',
  'Writing caption options...',
  'Adding stronger hooks and phrasing...',
]

const CAPTION_POLISHING_MESSAGES = [
  'Reading your caption...',
  'Tightening the phrasing...',
  'Improving clarity and rhythm...',
  'Polishing your final version...',
]


 

// ---------- Component ----------
function CaptionsPageInner() {
 const {
  profile,
  tier,
  refresh,
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

const router = useRouter()
const searchParams = useSearchParams()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  

const usage = useMemo(() => (mounted ? getUsage(profile) : {}), [mounted, profile])
const usedCaptionGenerations = Number((usage as any).captions_generate_uses || 0)
const safeTier = mounted ? tier : 'free'
const freeCaptionLimitReached = safeTier === 'free' && usedCaptionGenerations >= 1
const isCaptionLocked = freeCaptionLimitReached



  // which tab is visible
  const [activeTab, setActiveTab] = useState<'generate' | 'polish'>('generate')

  // generator state
  const [sourceKind, setSourceKind] = useState<'text' | 'image'>('text')
  const [artistName, setArtistName] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<
  Array<'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x'>
>(['instagram'])
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState('')
  const [tone, setTone] = useState('brand-consistent, concise, human, engaging')
  const [imageHint, setImageHint] = useState('')
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [variantCount, setVariantCount] = useState(4)

  const [genResult, setGenResult] = useState<GenerateResult | null>(null)
    const [sourceCardId, setSourceCardId] = useState('')
  const [sourceCardFeature, setSourceCardFeature] = useState('')
  const [loadingGenerate, setLoadingGenerate] = useState(false)
  const [copyIndex, setCopyIndex] = useState<number | null>(null)
const chipBase =
  'px-3 h-9 rounded-full border text-xs transition active:scale-95'

const chipActive =
  'border-ww-violet bg-ww-violet/20 text-white shadow-[0_0_14px_rgba(186,85,211,0.45)]'

const chipInactive =
  'border-white/10 text-white/70 hover:border-ww-violet/70 hover:text-white'

  const [downloadingPdfIdx, setDownloadingPdfIdx] = useState<number | null>(null)
  const [downloadingAllPdf, setDownloadingAllPdf] = useState(false)

  // polish state
  const [polishInput, setPolishInput] = useState('')
  const [polishGoal, setPolishGoal] = useState('Sharpen clarity and rhythm while keeping meaning.')
  const [polishPlatforms, setPolishPlatforms] = useState<
  Array<'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x'>
>(['instagram'])
const activePolishPlatform = polishPlatforms[0] || 'instagram'
  const [polishResult, setPolishResult] = useState<PolishResult | null>(null)
  const [loadingPolish, setLoadingPolish] = useState(false)
  const generatingMessage = useGeneratingMessages(loadingGenerate, CAPTION_GENERATING_MESSAGES)
  const [attachingPolish, setAttachingPolish] = useState(false)
const [showPolishHelp, setShowPolishHelp] = useState(false)
  // ✅ Non-destructive: if local fields are empty, hydrate from central profile
  useEffect(() => {
  if (profile?.artistName && !artistName) setArtistName(profile.artistName)
  if (profile?.tone && tone === 'brand-consistent, concise, human, engaging') setTone(profile.tone)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [profile])
useEffect(() => {
  if (typeof window === 'undefined') return

  const savedSourceCardId = sessionStorage.getItem('ww_caption_source_card_id') || ''
  const savedSourceCardFeature = sessionStorage.getItem('ww_caption_source_feature') || ''
  const savedPolishInput = sessionStorage.getItem('ww_caption_polish_input') || ''

  if (savedSourceCardId) setSourceCardId(savedSourceCardId)
  if (savedSourceCardFeature) setSourceCardFeature(savedSourceCardFeature)
  if (savedPolishInput && !polishInput) setPolishInput(savedPolishInput)

  const url = new URL(window.location.href)
  const tab = url.searchParams.get('tab')
  if (tab === 'polish') setActiveTab('polish')
}, [polishInput])

  useEffect(() => {
    const nextSourceId = searchParams.get('sourceId') || ''
    const nextSourceFeature = searchParams.get('sourceFeature') || ''
    const nextPlatform = searchParams.get('platform') as 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x' | null
    const nextTopic = searchParams.get('topic') || ''
    const nextTone = searchParams.get('tone') || ''
    const nextArtistName = searchParams.get('artistName') || ''
    const nextCaption = searchParams.get('caption') || ''

    if (nextSourceId) setSourceCardId(nextSourceId)
    if (nextSourceFeature) setSourceCardFeature(nextSourceFeature)

    if (nextPlatform) setSelectedPlatforms([nextPlatform])
    if (nextTopic && !topic) setTopic(nextTopic)
    if (nextTone && tone === 'brand-consistent, concise, human, engaging') setTone(nextTone)
    if (nextArtistName && !artistName) setArtistName(nextArtistName)

    if (nextCaption && !polishInput) {
      setPolishInput(nextCaption)
      setActiveTab('polish')
    }
  }, [searchParams, topic, tone, artistName, polishInput])



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

  function togglePlatform(p: 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x') {
  setSelectedPlatforms(prev =>
    prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
  )
}

function togglePolishPlatform(p: 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x') {
  setPolishPlatforms(prev =>
    prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
  )
}
  const platformIcon = {
    instagram: <Instagram className="w-4 h-4" />,
    tiktok: <Music2 className="w-4 h-4" />,
    youtube: <Youtube className="w-4 h-4" />,
    facebook: <Facebook className="w-4 h-4" />,
    x: <Twitter className="w-4 h-4" />,
  } as const

    const openedFromSourceCard = !!sourceCardId

  function currentPlatformTip() {
    switch (selectedPlatforms[0]) {
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
    if (loadingGenerate) return

    if (activeTab === 'generate' && freeCaptionLimitReached) {
  toast.error('Free plan includes 1 caption generation. Upgrade to generate again.')
return

}


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
          platform: selectedPlatforms[0],
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
      if (safeTier === 'free') {
  await bumpUsage('captions_generate_uses')
  await refresh()
}



    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Something went wrong')
    } finally {
      setLoadingGenerate(false)
    }
  }

  function normalizeHashtagList(arr: any): string[] {
  if (!Array.isArray(arr)) return []
  return arr
    .map((t: any) => String(t || '').trim())
    .filter(Boolean)
    .map(t => t.replace(/^#/, ''))
}

    async function handleUseCaption(idx: number) {
  const v = genResult?.variants?.[idx]
  const text = v?.text?.trim()

  if (!text) {
    toast.error('No caption text to attach')
    return
  }

  if (!sourceCardId) {
    toast.info('This caption is ready to copy or save. Open Captions from a content card to attach it directly.')
    return
  }

  try {
    const core = normalizeHashtagList(v?.hashtags?.core)
    const niche = normalizeHashtagList(v?.hashtags?.niche)
    const allTags = [...core, ...niche]

    const { data: existingRow, error: fetchError } = await supabase
      .from('content_calendar')
      .select('metadata')
      .eq('id', sourceCardId)
      .single()

    if (fetchError) {
      throw new Error(fetchError.message || 'Could not load source card')
    }

    const existingMetadata = existingRow?.metadata || {}

    const { error } = await supabase
      .from('content_calendar')
      .update({
        caption: text,
        hashtags: allTags.length ? allTags : null,
        metadata: {
          ...existingMetadata,
          caption_source: 'refined',
          caption_variant_index: idx,
          caption_updated_at: new Date().toISOString(),
          caption_source_feature: sourceCardFeature || null,
        },
      })
      .eq('id', sourceCardId)

    if (error) {
      throw new Error(error.message || 'Could not attach caption')
    }

    toast.success('Caption attached to source card ✅')
    router.back()
  } catch (e: any) {
    console.error('[captions-attach]', e)
    toast.error(e?.message || 'Could not attach caption')
  }
}

async function handleSaveVariant(idx: number) {
  if (!genResult || !genResult.variants[idx]) {
    toast.error('Nothing to save yet')
    return
  }

  const v = genResult.variants[idx]

  try {
    const { error } = await supabase.from('captions').insert([
      {
        artist_name: artistName || null,
        platform: selectedPlatforms[0],
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
    const [{ buildCaptionPdfLines }, { renderWwPdf }] = await Promise.all([
      import('@/lib/exports/captionsPdf'),
      import('@/lib/pdf.client'),
    ])

    const v = genResult.variants[idx]
    const lines = buildCaptionPdfLines({
      artistName,
      platform: platformLabel[selectedPlatforms[0]],
      topic: topic || (sourceKind === 'image' ? imageHint : '') || '',
      tone,
      variantLabel: `Variant ${idx + 1}`,
      captionText: v.text,
      hashtags: v.hashtags,
    })

    const base = `${artistName || 'ww'}-${platformLabel[selectedPlatforms[0]]}-caption-${idx + 1}`
    await renderWwPdf(lines, base)
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
    const [{ buildAllCaptionsPdfLines }, { renderWwPdf }] = await Promise.all([
      import('@/lib/exports/captionsPdf'),
      import('@/lib/pdf.client'),
    ])

    const lines = buildAllCaptionsPdfLines({
      artistName,
      platform: platformLabel[selectedPlatforms[0]],
      topic: topic || (sourceKind === 'image' ? imageHint : '') || '',
      tone,
      variants: genResult.variants,
    })

    const base = `${artistName || 'ww'}-${platformLabel[selectedPlatforms[0]]}-captions`
    await renderWwPdf(lines, base)
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
          platform: activePolishPlatform,
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

  async function handleAttachPolishedToSource() {
  const improved = polishResult?.improved?.trim()
  if (!improved) {
    toast.error('No polished caption to attach')
    return
  }

  const activeSourceCardId =
    sourceCardId ||
    (typeof window !== 'undefined'
      ? sessionStorage.getItem('ww_caption_source_card_id') || ''
      : '')

  if (!activeSourceCardId) {
    toast.info('No source card found. This polished caption is ready to copy or save.')
    return
  }

  setAttachingPolish(true)

  try {
    const { data: existingRow, error: fetchError } = await supabase
      .from('content_calendar')
      .select('caption, metadata')
      .eq('id', activeSourceCardId)
      .single()

    if (fetchError) {
      throw new Error(fetchError.message || 'Could not load source card')
    }

    const existingMetadata = existingRow?.metadata || {}

    const { error: updateError } = await supabase
  .from('content_calendar')
  .update({
    metadata: {
      ...existingMetadata,
      refined_caption_text: improved,
      caption_refined: true,
      caption_refined_at: new Date().toISOString(),
      caption_source: 'captions_polisher',
    },
  })
  .eq('id', activeSourceCardId)

    if (updateError) {
      throw new Error(updateError.message || 'Could not attach polished caption')
    }

    const returnTo =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('ww_caption_return_to') || '/momentum'
        : '/momentum'

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ww_highlight_card_id', activeSourceCardId)
      sessionStorage.removeItem('ww_caption_polish_input')
      sessionStorage.removeItem('ww_caption_source_card_id')
      sessionStorage.removeItem('ww_caption_source_feature')
      sessionStorage.removeItem('ww_caption_return_to')
    }

    toast.success('Polished caption attached to source card ✅')
    window.location.href = returnTo
  } catch (e: any) {
    console.error('[captions-polish-attach]', e)
    toast.error(e?.message || 'Could not attach polished caption')
  } finally {
    setAttachingPolish(false)
  }
}

function toggleKeywordTag(value: string) {
  setKeywords(prev => {
    const parts = prev
      .split(',')
      .map(x => x.trim())
      .filter(Boolean)

    const exists = parts.some(x => x.toLowerCase() === value.toLowerCase())

    return exists
      ? parts.filter(x => x.toLowerCase() !== value.toLowerCase()).join(', ')
      : [...parts, value].join(', ')
  })
}

function hasKeywordTag(value: string) {
  return keywords
    .split(',')
    .map(x => x.trim().toLowerCase())
    .filter(Boolean)
    .includes(value.toLowerCase())
}

function toggleToneTag(value: string) {
  setTone(prev => {
    const parts = prev
      .split(',')
      .map(x => x.trim())
      .filter(Boolean)

    const exists = parts.some(x => x.toLowerCase() === value.toLowerCase())

    return exists
      ? parts.filter(x => x.toLowerCase() !== value.toLowerCase()).join(', ')
      : [...parts, value].join(', ')
  })
}

function hasToneTag(value: string) {
  return tone
    .split(',')
    .map(x => x.trim().toLowerCase())
    .filter(Boolean)
    .includes(value.toLowerCase())
}

  // ---------- JSX ----------
  return (
    <main className="min-h-screen bg-black text-white">
      <Toaster position="top-center" richColors />

      {/* Hero + Tabs */}
      <div className="mx-auto w-full max-w-3xl"></div>
      <section className="mx-auto max-w-6xl px-4 py-8">
  <div className="max-w-[52rem] space-y-4">
    <div className="inline-flex items-center gap-2 text-s tracking-[0.18em] text-ww-violet/80 uppercase">
      <Type className="w-4 h-4 text-ww-violet" />
      <span>Captions & Hashtags</span>
    </div>

    <div className="space-y-3">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
        Turn ideas into captions that hit
      </h1>

      <p className="max-w-2xl text-white/70 text-sm md:text-base leading-relaxed">
        Generate, refine, and attach captions directly to your content so every idea becomes something ready to post.
      </p>
    </div>
  </div>

  <div className="mt-8 h-px bg-white/10" />


        {/* ✅ Central profile banner */}
        {mounted && hasAnyProfile && (

          <div className="p-3 rounded-2xl border border-ww-violet/40 bg-ww-violet/10 text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="text-white/80">Load your saved artist details and tone from your WW profile?</span>
            <button
              type="button"
              onClick={applyProfileFromCentral}
              className="px-3 h-8 rounded-full bg-ww-violet text-white text-xs font-semibold hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] active:scale-95 transition"
            >
            <Sparkles className="w-3 h-3" />
  Use WW profile
</button>
          </div>
        )}

        
      </section>

{/* Tabs */}
<section className="mx-auto max-w-6xl px-4 pb-4">
  <div className="flex justify-start">
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
  </div>
</section>

      {/* ----------- Generate TAB ----------- */}
      {mounted && activeTab === 'generate' && (
  <section className="mx-auto max-w-6xl px-4 pb-10">
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] lg:items-start">
          
 


          {/* Generator Card */}
          <section className="relative overflow-hidden rounded-3xl border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.07] via-black/95 to-black p-5 md:p-7 space-y-5 shadow-[0_0_24px_rgba(186,85,211,0.08)]">
          <div className="pointer-events-none absolute inset-0">
  <div className="absolute -top-20 left-1/2 h-[220px] w-[360px] -translate-x-1/2 rounded-full bg-ww-violet/10 blur-[80px]" />
</div>
          {openedFromSourceCard ? (
            <div className="rounded-2xl border border-ww-violet/30 bg-ww-violet/10 p-4">
              <p className="text-sm text-white font-medium">
                Refining captions for an existing content card
              </p>
              <p className="text-xs text-white/60 mt-1">
                Choose a caption below and it will attach back to the original card.
              </p>
            </div>
          ) : null}
          <div className="rounded-2xl border border-ww-violet/20 bg-ww-violet/5 p-4">
  <p className="text-sm text-white font-medium">
    Describe the post you want captions for
  </p>
  <p className="text-xs text-white/60 mt-1">
    Generate multiple caption styles plus optional hashtag sets tailored to your platform.
  </p>
</div>


{/* SECTION 1: What is this for? */}
<div className="rounded-2xl border border-white/10 bg-black/70 p-4 space-y-4">
  <div>
    <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">1. What are you posting?</p>
    <p className="text-sm text-white/70 mt-1">
      Choose the source type, platform, and what the post is actually about.
    </p>
  </div>

  <div className="space-y-2">
    <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Input type</p>
    <div className="inline-flex p-1 rounded-full bg-black/50 border border-white/10">
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
        disabled
        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm text-white/35 border border-white/10 cursor-not-allowed opacity-60"
        title="Coming soon"
      >
        <ImageIcon className="w-4 h-4" />
        Image (Coming soon)
      </button>
    </div>
  </div>

  <div>
  <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
    {sourceKind === 'text' ? 'Keywords' : 'Visual details'}
  </p>

  {sourceKind === 'text' ? (
    <input
      value={keywords}
      onChange={e => setKeywords(e.target.value)}
      className="mt-2 w-full px-3 py-2.5 rounded-xl bg-black/80 border border-white/12 text-sm text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
      placeholder="Keywords (comma-separated)"
    />
  ) : (
    <input
      value={imageHint}
      onChange={e => setImageHint(e.target.value)}
      className="w-full px-3 py-2.5 rounded-xl bg-black/80 border border-white/12 text-sm text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
      placeholder="Mood, colours, setting, subject..."
    />
  )}

  {sourceKind === 'text' ? (
  <div className="space-y-2 mt-4">
    <p className="text-[11px] uppercase tracking-[0.16em] text-white/42"> Quick Directions</p>
    <div className="flex flex-wrap gap-2">
      {[
        'new release',
        'studio session',
        'live performance',
        'behind the scenes',
        'personal reflection',
        'song meaning',
      ].map(tag => {
        const active = hasKeywordTag(tag)

        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggleKeywordTag(tag)}
            className={`${chipBase} ${active ? chipActive : chipInactive}`}
          >
            {tag}
          </button>
        )
      })}
    </div>
  </div>
) : null}
</div>
</div>

{/* SECTION 2: Tone */}
<div className="rounded-2xl border border-white/10 bg-black/70 p-4 space-y-4">
  <div>
    <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">2. How should it sound?</p>
    <p className="text-sm text-white/70 mt-1">
      Set the tone so the captions feel more like you and less generic.
    </p>
  </div>

  <div className="space-y-2">
    <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Tone</p>
    <input
      value={tone}
      onChange={e => setTone(e.target.value)}
      className="w-full px-3 py-2.5 rounded-xl bg-black/80 border border-white/12 text-sm text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
      placeholder="e.g. introspective, hype, cinematic, raw, playful"
    />
    {profile.tone && tone === 'brand-consistent, concise, human, engaging' && (
      <button
        type="button"
        onClick={() => setTone(profile.tone!)}
        className="text-[0.7rem] text-ww-violet hover:underline"
      >
        Use “{profile.tone}”
      </button>
    )}
  </div>

  <div className="space-y-2">
  <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Suggestions</p>
  <div className="flex flex-wrap gap-2">
    {[
      'introspective',
      'cinematic',
      'raw',
      'playful',
      'confident',
      'mysterious',
      'emotional',
      'conversational',
    ].map(preset => {
      const active = hasToneTag(preset)

      return (
        <button
          key={preset}
          type="button"
          onClick={() => toggleToneTag(preset)}
          className={`${chipBase} ${active ? chipActive : chipInactive}`}
        >
          {preset}
        </button>
      )
    })}
  </div>
</div>
</div>

{/* SECTION 3: Output */}
<div className="rounded-2xl border border-white/10 bg-black/70 p-4 space-y-4">
  <div>
    <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">3. Output settings</p>
    <p className="text-sm text-white/70 mt-1">
      Choose how many versions you want and whether hashtags should be included.
    </p>
  </div>

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
        className="bg-black/80 border border-white/15 rounded-full px-3 py-1.5 text-xs focus:border-ww-violet focus:outline-none"
      >
        {[2, 3, 4, 5].map(n => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  </div>

  <div className="flex flex-wrap items-center gap-3 pt-2">
    

    {isCaptionLocked ? (
      <LimitReachedPill
        message="You've used your 1 free caption generation."
        onUpgrade={() => router.push('/#pricing')}
      />
    ) : null}
  </div>

  <p className="text-xs text-white/50 min-h-[20px]">
  {loadingGenerate ? generatingMessage : currentPlatformTip()}
</p>
</div>
<div className="rounded-2xl border border-white/10 bg-black/70 p-4 space-y-4">
<div className="space-y-2">
  <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">4. Platforms</p>
  <div className="flex flex-wrap gap-2">
    {(['instagram', 'tiktok', 'youtube', 'facebook', 'x'] as const).map(p => {
      const active = selectedPlatforms.includes(p)

      return (
        <button
          key={p}
          type="button"
          onClick={() => togglePlatform(p)}
          className={`${chipBase} ${active ? chipActive : chipInactive}`}
        >
          <span className="inline-flex items-center gap-2">
            {platformIcon[p]}
            {platformLabel[p]}
          </span>
        </button>
      )
    })}
  </div>
</div>
</div>

<button
      type="button"
      onClick={handleGenerate}
      disabled={loadingGenerate || freeCaptionLimitReached}
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

          </section>
        
          {/* RIGHT PANEL */}
<section className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-5 md:p-6 min-h-[540px]">
  {loadingGenerate ? (
    <section className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ww-violet" />
          Generating caption variants
        </h2>
      </div>

      <div className="rounded-2xl border border-dashed border-ww-violet/20 bg-white/[0.02] p-4">
        <p className="text-sm font-medium text-white/80">
          This is what your caption results will look like
        </p>
        <p className="mt-1 text-xs text-white/50">
          We’re building your variants now...
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-white/10 bg-black/70 p-5 space-y-4 opacity-80"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2 blur-[2px]">
                <div className="h-3 w-16 rounded bg-white/10" />
                <div className="h-3 w-24 rounded bg-white/8" />
              </div>

              <div className="h-6 w-20 rounded-full border border-white/10 bg-white/[0.05]" />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/50 p-4 space-y-2 blur-[2px]">
              <div className="h-4 w-full rounded bg-white/10" />
              <div className="h-4 w-5/6 rounded bg-white/8" />
              <div className="h-4 w-4/5 rounded bg-white/8" />
              <div className="h-4 w-2/3 rounded bg-white/8" />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 space-y-2 blur-[2px]">
              <div className="h-3 w-16 rounded bg-white/10" />
              <div className="h-3 w-full rounded bg-white/8" />
              <div className="h-3 w-4/5 rounded bg-white/8" />
            </div>

            <div className="h-px bg-white/10" />

            <div className="flex gap-2 pt-1 flex-wrap">
              <div className="h-8 w-16 rounded-full border border-white/10 bg-white/[0.04]" />
              <div className="h-8 w-16 rounded-full border border-white/10 bg-white/[0.04]" />
              <div className="h-8 w-16 rounded-full border border-white/10 bg-white/[0.04]" />
              <div className="h-8 w-20 rounded-full bg-ww-violet/20 border border-ww-violet/30" />
            </div>
          </div>
        ))}
      </div>
    </section>
  ) : Array.isArray(genResult?.variants) && genResult!.variants.length > 0 ? (
    <section className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ww-violet" />
          Generated variants
        </h2>

        <div className="flex flex-wrap gap-2 items-center">
          

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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {genResult.variants.map((v, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.045] via-white/[0.025] to-transparent p-5 space-y-4 hover:border-ww-violet/30 hover:shadow-[0_0_18px_rgba(186,85,211,0.10)] transition"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/40">
                  Variant {idx + 1}
                </p>
                <p className="text-sm text-white/70">{platformLabel[selectedPlatforms[0]]}</p>
              </div>

              <span
                className={`px-2 py-1 rounded-full border text-[10px] uppercase tracking-wide ${
                  idx === 0
                    ? 'border-ww-violet/40 bg-ww-violet/10 text-ww-violet'
                    : 'border-white/10 bg-white/5 text-white/55'
                }`}
              >
                {idx === 0 ? 'Recommended' : 'Ready to use'}
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-[10px] uppercase tracking-wide text-white/40 mb-2">
                Caption
              </p>
              <p className="text-sm leading-relaxed text-white/90 whitespace-pre-wrap">
                {v.text || '— (no text returned by model)'}
              </p>
            </div>

            {v.hashtags && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
                <p className="text-[10px] uppercase tracking-wide text-white/40">
                  Hashtags
                </p>

                {Array.isArray(v.hashtags.core) && v.hashtags.core.length > 0 && (
                  <p className="text-xs text-white/70 leading-relaxed">
                    <span className="text-white/50">Core: </span>
                    {v.hashtags.core.map(tag => `#${tag}`).join(' ')}
                  </p>
                )}

                {Array.isArray(v.hashtags.niche) && v.hashtags.niche.length > 0 && (
                  <p className="text-xs text-white/70 leading-relaxed">
                    <span className="text-white/50">Niche: </span>
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

  <button
    type="button"
    onClick={() => handleUseCaption(idx)}
    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-ww-violet/20 border border-ww-violet/70 text-xs text-ww-violet hover:bg-ww-violet/30 transition"
  >
    <Check className="w-3 h-3" />
    Use this caption
  </button>
</div>
          </div>
        ))}
      </div>
    </section>
  ) : (
    <div className="h-full min-h-[480px] flex items-center justify-center text-center px-6">
      <div className="space-y-2">
        <p className="text-white/80 font-medium">Your caption variants will appear here</p>
        <p className="text-sm text-white/50 max-w-sm">
          Generate a set on the left to preview, copy, save, send, or export them.
        </p>
      </div>
    </div>
  )}
  </section>
        </div>
      </section>
      )}

            {/* ----------- Polish TAB ----------- */}
      {mounted && activeTab === 'polish' && (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] lg:items-start">
            {/* LEFT PANEL */}
            <section className="relative overflow-hidden rounded-3xl border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.07] via-black/95 to-black p-5 md:p-7 space-y-5 shadow-[0_0_24px_rgba(186,85,211,0.08)]">
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute -top-20 left-1/2 h-[220px] w-[360px] -translate-x-1/2 rounded-full bg-ww-violet/10 blur-[80px]" />
  </div>

  

  <div className="relative space-y-5">
              <div className="rounded-2xl border border-ww-violet/20 bg-ww-violet/5 p-4">
                <p className="text-sm font-medium text-white">
                  Refine a caption you already have
                </p>
                <p className="mt-1 text-xs text-white/60">
                  Paste a caption, tell the AI what to improve, and get a cleaner, sharper version without losing your voice.
                </p>
              </div>

              <div className="rounded-2xl border border-ww-violet/15 bg-gradient-to-br from-white/[0.045] via-white/[0.025] to-transparent p-4 space-y-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">1. Caption input</p>
                  <p className="mt-1 text-sm text-white/70">
                    Paste the caption you want to improve.
                  </p>
                </div>

                <textarea
                  value={polishInput}
                  onChange={e => setPolishInput(e.target.value)}
                  rows={7}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/80 border border-white/12 text-sm text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                  placeholder="Paste your caption here..."
                />
              </div>

              <div className="rounded-2xl border border-ww-violet/15 bg-black/70 p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
  <div>
    <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">2. What should improve?</p>
    <p className="mt-1 text-sm text-white/70">
      Be specific here. Better instructions = better rewrites.
    </p>
  </div>

  <div className="relative shrink-0">
    <button
      type="button"
      onClick={() => setShowPolishHelp(v => !v)}
      className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-xs text-white/70 transition hover:border-ww-violet/60 hover:text-white"
      aria-label="Show polish help"
    >
      ?
    </button>

    {showPolishHelp && (
      <div className="absolute right-0 top-8 z-20 w-[280px] rounded-2xl border border-white/10 bg-black/95 p-3 shadow-[0_0_24px_rgba(0,0,0,0.45)]">
        <p className="text-xs font-medium text-white">How to get better polish results</p>
        <p className="mt-2 text-[11px] leading-relaxed text-white/60">
          Tell the AI exactly what to improve. Examples: make it shorter, sharpen the hook, keep my tone but remove weak phrasing, sound more confident, make it more emotional, or make it feel cleaner for TikTok.
        </p>
      </div>
    )}
  </div>
</div>

                <textarea
                  value={polishGoal}
                  onChange={e => setPolishGoal(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/80 border border-white/12 text-sm text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                  placeholder="e.g. Make this shorter, stronger, and more punchy for TikTok, but keep my tone natural."
                />    

                <div className="space-y-2">
  <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Suggestions</p>

  <div className="relative">
    <div className="flex gap-2 overflow-x-auto pb-2 pr-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {[
        'make it shorter',
        'sharpen the hook',
        'sound more confident',
        'make it cleaner',
        'keep my tone',
        'make it more emotional',
        'better for TikTok',
        'better for Instagram',
      ].map(tag => {
        const active = polishGoal.toLowerCase().includes(tag.toLowerCase())

        return (
          <button
            key={tag}
            type="button"
            onClick={() =>
              setPolishGoal(prev =>
                prev.toLowerCase().includes(tag.toLowerCase())
                  ? prev
                      .split(',')
                      .map(x => x.trim())
                      .filter(x => x.toLowerCase() !== tag.toLowerCase())
                      .join(', ')
                  : prev
                  ? `${prev}, ${tag}`
                  : tag
              )
            }
            className={`${chipBase} whitespace-nowrap ${active ? chipActive : chipInactive}`}
          >
            {tag}
          </button>
        )
      })}
    </div>


    <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-white/35 text-lg">
      &gt;
    </div>
  </div>
</div>            
              </div>

<div className="rounded-2xl border border-ww-violet/15 bg-black/70 p-4 space-y-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">3. Platforms</p>
                  <p className="mt-1 text-sm text-white/70">
                    Shape the rewrite for the platform you’re posting on.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(['instagram', 'tiktok', 'youtube', 'facebook', 'x'] as const).map(p => {
  const active = polishPlatforms.includes(p)

  return (
    <button
      key={p}
      type="button"
      onClick={() => {
        setPolishPlatforms(prev => 
          prev.includes(p) 
            ? prev.filter(platform => platform !== p) 
            : [...prev, p]
        )
      }}
      className={`${chipBase} ${active ? chipActive : chipInactive}`}
    >
      <span className="inline-flex items-center gap-2">
        {platformIcon[p]}
        {platformLabel[p]}
      </span>
    </button>
  )
})}
              

              
                </div>

  

                <p className="text-xs text-white/50 min-h-[20px]">
                  {loadingPolish
                    ? 'Refining your caption, tightening the phrasing, and sharpening the hook...'
                    : 'Use a specific polish focus to get a much better result.'}
                </p>
              </div>

              <button
                  type="button"
                  onClick={handlePolish}
                  disabled={loadingPolish}
                  className="inline-flex items-center justify-center gap-2 px-5 h-10 rounded-full bg-ww-violet text-sm font-semibold text-white shadow-[0_0_16px_rgba(186,85,211,0.6)] hover:shadow-[0_0_22px_rgba(186,85,211,0.88)] active:scale-95 transition disabled:opacity-60"
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
                </div>
            </section>

            {/* RIGHT PANEL */}
            <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-5 md:p-6 min-h-[540px]">
              {loadingPolish ? (
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-ww-violet" />
                    <h2 className="text-lg font-semibold text-white">Polishing caption</h2>
                  </div>

                  <div className="rounded-2xl border border-dashed border-ww-violet/20 bg-white/[0.02] p-4">
                    <p className="text-sm font-medium text-white/80">
                      This is what your refined caption will look like
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      We’re improving the phrasing now...
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/70 p-5 space-y-4 opacity-80">
                    <div className="space-y-2 blur-[2px]">
                      <div className="h-3 w-24 rounded bg-white/10" />
                      <div className="h-4 w-full rounded bg-white/10" />
                      <div className="h-4 w-5/6 rounded bg-white/8" />
                      <div className="h-4 w-4/5 rounded bg-white/8" />
                      <div className="h-4 w-2/3 rounded bg-white/8" />
                    </div>

                    <div className="h-px bg-white/10" />

                    <div className="space-y-2 blur-[2px]">
                      <div className="h-3 w-20 rounded bg-white/10" />
                      <div className="h-3 w-full rounded bg-white/8" />
                      <div className="h-3 w-3/4 rounded bg-white/8" />
                    </div>
                  </div>
                </section>
              ) : polishResult ? (
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-ww-violet" />
                    <h2 className="text-lg font-semibold text-white">Polished Caption</h2>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-5 space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                      <p className="text-[10px] uppercase tracking-wide text-white/40 mb-2">
                        Improved caption
                      </p>
                      <p className="text-sm leading-relaxed text-white/90 whitespace-pre-wrap">
                        {polishResult.improved}
                      </p>
                    </div>

                    {polishResult.reasoning ? (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-[10px] uppercase tracking-wide text-white/40 mb-2">
                          Why this works better
                        </p>
                        <p className="text-xs leading-relaxed text-white/70 whitespace-pre-wrap">
                          {polishResult.reasoning}
                        </p>
                      </div>
                    ) : null}
                    <div className="h-px bg-white/10" />

<div className="flex flex-wrap gap-2">
  <button
    type="button"
    onClick={async () => {
      await navigator.clipboard.writeText(polishResult.improved || '')
      toast.success('Polished caption copied ✅')
    }}
    className="inline-flex items-center gap-2 px-3 h-9 rounded-full border border-white/15 text-xs text-white/80 hover:border-ww-violet hover:text-white transition"
  >
    <Clipboard className="w-3 h-3" />
    Copy
  </button>

  <button
    type="button"
    onClick={handleAttachPolishedToSource}
    disabled={attachingPolish}
    className="inline-flex items-center gap-2 px-3 h-9 rounded-full bg-ww-violet/20 border border-ww-violet/60 text-xs text-ww-violet hover:bg-ww-violet/30 transition disabled:opacity-60"
  >
    {attachingPolish ? (
      <>
        <Loader2 className="w-3 h-3 animate-spin" />
        Attaching…
      </>
    ) : (
      <>
        <Check className="w-3 h-3" />
        Attach to source card
      </>
    )}
  </button>
</div>
                  </div>
                </section>
              ) : (
                <div className="h-full min-h-[480px] flex items-center justify-center text-center px-6">
  <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="space-y-2">
  <p className="text-white/85 font-medium">Your refined caption will appear here</p>
  <p className="text-sm leading-relaxed text-white/50 max-w-sm mx-auto">
    Paste a caption on the left, choose what to improve, and generate a cleaner version here.
  </p>
</div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </section>
      )}
    </main>
  )
}
export default function CaptionsPage() {
  return (
    <Suspense fallback={null}>
      <CaptionsPageInner />
    </Suspense>
  )
}