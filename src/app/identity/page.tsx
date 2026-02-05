// src/app/identity/page.tsx
'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Toaster, toast } from 'sonner'
import { useWwProfile } from '@/hooks/useWwProfile'
import { getUsage } from '@/lib/wwProfile' // add at top with your imports
import { useRouter } from 'next/navigation'

import * as identityKitPdf from '@/lib/exports/identityKitPdf'
import { buildCampaignPdfLines } from '@/lib/exports/campaignPdf'
import {
  Wand2,
  Save as SaveIcon,
  Loader2,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Sparkles,
  User,
  Target,
  Palette,
  Hash,
  Film,
  Download,
  BookOpen,
  RefreshCw,
  Clipboard,
  Minimize2,
  Maximize2,
  Pencil,
  Check,
  X,
} from 'lucide-react'
import { PdfLine, normalizeText, renderWwPdf } from '@/lib/wwPdf'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

type KitRow = {
  id: string
  created_at: string
  inputs: any
  result: any
  title?: string | null
  notes?: string | null
}

type CampaignVisualDirection = {
  shotlist?: string[]
  palette?: string[]
  props?: string[]
}

type CampaignTimeline = {
  teasers?: string[]
  drop_day?: string[]
  post_drop?: string[]
}

type CampaignConcept = {
  name: string
  hook: string
  synopsis: string
  visual_direction?: CampaignVisualDirection
  deliverables?: string[]
  caption_tones?: string[]
  timeline?: CampaignTimeline
}

type Campaigns = {
  concepts: CampaignConcept[]
  kpis: string[]
  hashtags: string[]
  _fallback?: boolean
}

type CampaignRow = {
  id: string
  created_at: string
  inputs: any
  concepts: any
  title?: string | null
  notes?: string | null
}

function safeJoin(arr: any, sep = ' · ') {
  if (!Array.isArray(arr)) return ''
  return arr.filter(Boolean).join(sep)
}

function pushList(lines: PdfLine[], items: any[], prefix = '• ') {
  if (!Array.isArray(items) || items.length === 0) return
  for (const it of items) {
    const text = normalizeText(String(it ?? ''))
    if (!text) continue
    lines.push({ kind: 'body', text: `${prefix}${text}` })
  }
}

function normalizeCampaignPayload(raw: any): Campaigns {
  const src = raw?.result && typeof raw.result === 'object' ? raw.result : raw

  const conceptsRaw = Array.isArray(src?.concepts) ? src.concepts : []
  const kpisRaw = Array.isArray(src?.kpis) ? src.kpis : []
  const hashtagsRaw = Array.isArray(src?.hashtags) ? src.hashtags : []

  if (conceptsRaw.length || kpisRaw.length || hashtagsRaw.length) {
    return {
      concepts: conceptsRaw.map((c: any, i: number) => ({
        name: String(c?.name ?? `Concept ${i + 1}`),
        hook: String(c?.hook ?? ''),
        synopsis: String(c?.synopsis ?? c?.summary ?? ''),
        visual_direction: c?.visual_direction
          ? {
              shotlist: Array.isArray(c.visual_direction?.shotlist)
                ? c.visual_direction.shotlist.map((x: any) => String(x))
                : [],
              palette: Array.isArray(c.visual_direction?.palette)
                ? c.visual_direction.palette.map((x: any) => String(x))
                : [],
              props: Array.isArray(c.visual_direction?.props) ? c.visual_direction.props.map((x: any) => String(x)) : [],
            }
          : undefined,
        deliverables: Array.isArray(c?.deliverables) ? c.deliverables.map((x: any) => String(x)) : [],
        caption_tones: Array.isArray(c?.caption_tones) ? c.caption_tones.map((x: any) => String(x)) : [],
        timeline: c?.timeline
          ? {
              teasers: Array.isArray(c.timeline?.teasers) ? c.timeline.teasers.map((x: any) => String(x)) : [],
              drop_day: Array.isArray(c.timeline?.drop_day) ? c.timeline.drop_day.map((x: any) => String(x)) : [],
              post_drop: Array.isArray(c.timeline?.post_drop) ? c.timeline.post_drop.map((x: any) => String(x)) : [],
            }
          : undefined,
      })),
      kpis: kpisRaw.map((x: any) => String(x)),
      hashtags: hashtagsRaw.map((x: any) => String(x)),
      _fallback: !!src?._fallback,
    }
  }

  const blob = typeof raw === 'string' ? raw : JSON.stringify(raw ?? {}, null, 2)
  return {
    concepts: [
      {
        name: 'Campaign concept',
        hook: 'A usable campaign draft (fallback)',
        synopsis: blob.slice(0, 2000),
      },
    ],
    kpis: [],
    hashtags: [],
    _fallback: true,
  }
}

function isHexColour(s: string) {
  return typeof s === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s.trim())
}

export default function IdentityKitPage() {
    const router = useRouter()

  const {
  profile,
  hasProfile: hasAnyProfile,
  setLocalOnly: applyTo,
  updateProfile: save,
} = useWwProfile()


  const [tab, setTab] = useState<'kit' | 'campaign'>('kit')

  // Inputs
  const [artistName, setArtistName] = useState('')
  const [genre, setGenre] = useState('')
  const [audience, setAudience] = useState('')
  const [goal, setGoal] = useState('')
  const [influences, setInfluences] = useState('')
  const [brandWords, setBrandWords] = useState('')

  // Data
  const [result, setResult] = useState<any | null>(null)
  const [kits, setKits] = useState<KitRow[]>([])
  const [selectedKitId, setSelectedKitId] = useState<string>('')
  const [loadedKitId, setLoadedKitId] = useState<string>('')
const [loadedCampaignId, setLoadedCampaignId] = useState<string>('')

  const [campaigns, setCampaigns] = useState<Campaigns | null>(null)
const [selectedCampaignId, setSelectedCampaignId] = useState<string>('')

  // Saved campaigns library
  const [savedCampaigns, setSavedCampaigns] = useState<CampaignRow[]>([])
  const [showSavedKits, setShowSavedKits] = useState(true)
  const [showSavedCampaigns, setShowSavedCampaigns] = useState(true)

  // UI state
  const [identityFreeLimitReached, setIdentityFreeLimitReached] = useState(false)

  const [submitting, setSubmitting] = useState(false)
const [authExpired, setAuthExpired] = useState(false)
  const [savingKit, setSavingKit] = useState(false)
  const [loadingCampaigns, setLoadingCampaigns] = useState(false)
  const [savingCampaigns, setSavingCampaigns] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
const [pulseResultGlow, setPulseResultGlow] = useState(false)
const [pulseCampaignGlow, setPulseCampaignGlow] = useState(false)
const [autoSavingKit, setAutoSavingKit] = useState(false)
const [kitSavedForCurrentResult, setKitSavedForCurrentResult] = useState(false)
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])

async function autoSaveKitQuiet(resultToSave: any) {
  try {
    setAutoSavingKit(true)

    const { data: userData } = await supabase.auth.getUser()
    const uid = userData?.user?.id

    const payloadBase: any = {
      inputs: { artistName, genre, influences, brandWords, audience, goal },
      result: resultToSave,
    }

    let insertRes = await supabase
      .from('identity_kits')
      .insert([uid ? { ...payloadBase, user_id: uid } : payloadBase])
      .select()
      .single()

    // fallback for older schema
    if (
      insertRes.error &&
      String(insertRes.error.message || '').toLowerCase().includes('column') &&
      String(insertRes.error.message || '').includes('user_id')
    ) {
      insertRes = await supabase.from('identity_kits').insert([payloadBase]).select().single()
    }

    if (!insertRes.error && insertRes.data) {
      const row = insertRes.data as KitRow
      setKits(prev => [row, ...prev])
      setSelectedKitId(row.id)
      setKitSavedForCurrentResult(true)
    }
  } catch {
    // silent on purpose
  } finally {
    setAutoSavingKit(false)
  }
}


  // ✅ Campaign PDF state (hooks MUST be inside component)
  const [downloadingCampaignPdf, setDownloadingCampaignPdf] = useState(false)
  const [downloadingCampaignAllPdf, setDownloadingCampaignAllPdf] = useState(false)

  const resultRef = useRef<HTMLDivElement | null>(null)
  const identityCardRef = useRef<HTMLDivElement | null>(null)
const campaignCardRef = useRef<HTMLDivElement | null>(null)

  const savedSectionRef = useRef<HTMLDivElement | null>(null)
const [downloadingConceptIndex, setDownloadingConceptIndex] = useState<number | null>(null)

  // Card collapse toggles
  const [collapseIdentityCard, setCollapseIdentityCard] = useState(false)
  const [collapseCampaignCard, setCollapseCampaignCard] = useState(false)

  // Section toggles (identity)
  const [openIdentitySections, setOpenIdentitySections] = useState<Record<string, boolean>>({
    core: true,
    persona: true,
    messaging: true,
    visual: true,
    pillars: true,
    platform: true,
    plan: true,
    seo: false,
  })

  // Editing metadata (title/notes)
  const [editingKitId, setEditingKitId] = useState<string>('')
  const [kitTitleDraft, setKitTitleDraft] = useState('')
  const [kitNotesDraft, setKitNotesDraft] = useState('')

  const [editingCampaignId, setEditingCampaignId] = useState<string>('')
  const [campaignTitleDraft, setCampaignTitleDraft] = useState('')
  const [campaignNotesDraft, setCampaignNotesDraft] = useState('')

  // ---- Prevent scroll jump on collapses
  function preserveScroll(action: () => void) {
    const x = window.scrollX
    const y = window.scrollY
    action()
    requestAnimationFrame(() => {
      window.scrollTo({ left: x, top: y, behavior: 'auto' })
    })
  }

  // ✅ Hydrate from central profile (non-destructive)
  useEffect(() => {
    if (profile.artistName && !artistName) setArtistName(profile.artistName)
    if (profile.genre && !genre) setGenre(profile.genre)
    if (profile.audience && !audience) setAudience(profile.audience)
    if (profile.goal && !goal) setGoal(profile.goal)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  function applyProfileFromCentral() {
    applyTo({ setArtistName, setGenre, setAudience, setGoal })
    toast.success('Profile applied ✅')
  }

  // ---------- Load saved kits ----------
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const uid = userData?.user?.id

        if (uid) {
          const scoped = await supabase
            .from('identity_kits')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false })
          if (!cancelled && !scoped.error && scoped.data) {
            setKits(scoped.data as KitRow[])
            return
          }
        }

        const { data, error } = await supabase.from('identity_kits').select('*').order('created_at', { ascending: false })
        if (!cancelled && !error && data) setKits(data as KitRow[])
      } catch {
        // silent
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // ---------- Load saved campaigns ----------
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const uid = userData?.user?.id
        if (!uid) {
          if (!cancelled) setSavedCampaigns([])
          return
        }

        const scoped = await supabase
          .from('campaign_concepts')
          .select('*')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
        if (!cancelled && !scoped.error && scoped.data) setSavedCampaigns(scoped.data as CampaignRow[])
      } catch {
        // silent
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedKit = useMemo(() => kits.find(k => k.id === selectedKitId) || null, [kits, selectedKitId])

  function copyText(label: string, text: string) {
    if (!text) return toast.info('Nothing to copy')
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${label} copied ✅`))
      .catch(() => toast.error('Copy failed'))
  }

  // ---------- Actions ----------
  async function handleGenerateKit() {
  void save({ artistName, genre, audience, goal })
  setSubmitting(true)
  setLoadedKitId('')

  setResult(null)
  setCampaigns(null)
  setCollapseIdentityCard(false)
  setCollapseCampaignCard(false)

  try {
  // clear previous flags
  setIdentityFreeLimitReached(false)
  setAuthExpired(false)

  // get token
  let sessionRes = await supabase.auth.getSession()
  let token = sessionRes.data.session?.access_token

  // refresh once if missing
  if (!token) {
    await supabase.auth.refreshSession()
    sessionRes = await supabase.auth.getSession()
    token = sessionRes.data.session?.access_token
  }

  let response = await fetch('/api/identity', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ artistName, genre, influences, brandWords, audience, goal }),
})

// If unauthorized, refresh once and retry
if (response.status === 401) {
  await supabase.auth.refreshSession()
  const retrySession = await supabase.auth.getSession()
  const retryToken = retrySession.data.session?.access_token

  if (!retryToken) {
    setAuthExpired(true)
    toast.error('Your session expired — please log in again.')
    return
  }

  response = await fetch('/api/identity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${retryToken}`,
    },
    body: JSON.stringify({ artistName, genre, influences, brandWords, audience, goal }),
  })
}

const data = await response.json().catch(() => ({}))


  // ✅ free limit
  if (response.status === 429 && data?.error === 'FREE_LIMIT') {
  setIdentityFreeLimitReached(true)
  toast.error(data?.message || 'Free plan limit reached')
  return
}


  // ✅ unauthenticated (DON'T redirect)
  if (response.status === 401) {
    setAuthExpired(true)
    toast.error(data?.message || data?.error || 'You need to log in again.')
    return
  }

  if (!response.ok) {
    toast.error(data?.error || 'Failed to generate')
    return
  }

  const next = data.result || data
setResult(next)
setKitSavedForCurrentResult(false)

// autosave (especially important for free users)
void autoSaveKitQuiet(next)

setKitSavedForCurrentResult(true)

  setSelectedKitId('')
  setPulseResultGlow(true)

  setTimeout(() => identityCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
  setTimeout(() => setPulseResultGlow(false), 2200)
} catch (e: any) {
  toast.error(e?.message || 'Failed to generate')
} finally {
  setSubmitting(false)
}

}



  function handleLoadSavedKit(id: string) {
    const kit = kits.find(k => k.id === id)
    if (!kit) return
    setSelectedKitId(id)
    setLoadedKitId(id)


    const inp = kit.inputs || {}
    setArtistName(inp.artistName || '')
    setGenre(inp.genre || '')
    setAudience(inp.audience || '')
    setGoal(inp.goal || '')
    setInfluences(inp.influences || '')
    setBrandWords(inp.brandWords || '')

    setResult(kit.result || null)
    setCampaigns(null)
    setCollapseIdentityCard(false)

    toast.success('Loaded ✅')
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250)
  }

  async function handleRefreshFromLoadedKit() {
    if (!selectedKit) return toast.info('Pick a saved kit first')
    await handleGenerateKit()
  }

  async function handleGenerateCampaigns() {
    void save({ artistName, genre, audience, goal })
    setLoadingCampaigns(true)
    setLoadedCampaignId('')

    setCampaigns(null)
    setCollapseCampaignCard(false)
    setCollapseIdentityCard(false)

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName, genre, influences, brandWords, audience, goal }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error || 'Failed to generate')
        return
      }

      const normalized = normalizeCampaignPayload(data)
      setCampaigns(normalized)
      setCampaigns(normalized)

// clear “loaded” selection to reduce confusion
setSelectedCampaignId('')
// if you implemented loadedCampaignId earlier, also do: setLoadedCampaignId('')

setPulseCampaignGlow(true)

setTimeout(() => {
  campaignCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}, 150)

setTimeout(() => {
  setPulseCampaignGlow(false)
}, 2200)

    } catch {
      toast.error('Failed to generate')
    } finally {
      setLoadingCampaigns(false)
    }
  }

  async function handleSaveCampaigns() {
  if (!campaigns) return toast.error('Generate first!')
  setSavingCampaigns(true)

  try {
    const { data: userData } = await supabase.auth.getUser()
    const uid = userData?.user?.id

    const payloadBase: any = {
      inputs: { artistName, genre, influences, brandWords, audience, goal },
      concepts: campaigns,
    }

    // ✅ Prefer inserting with user_id when available (RLS-safe)
    let insertRes = await supabase
      .from('campaign_concepts')
      .insert([uid ? { ...payloadBase, user_id: uid } : payloadBase])
      .select()
      .single()

    // ✅ Fallback for older schemas that don't have user_id
    if (
      insertRes.error &&
      String(insertRes.error.message || '').toLowerCase().includes('column') &&
      String(insertRes.error.message || '').includes('user_id')
    ) {
      insertRes = await supabase.from('campaign_concepts').insert([payloadBase]).select().single()
    }

    if (insertRes.error) throw insertRes.error

    setSavedCampaigns(prev => [insertRes.data as CampaignRow, ...prev])
    if (!showSavedCampaigns) setShowSavedCampaigns(true)

    toast.success('Saved ✅')
  } catch (e: any) {
    toast.error(e?.message || 'Error saving')
  } finally {
    setSavingCampaigns(false)
  }
}


  function handleLoadSavedCampaign(id: string) {
    const row = savedCampaigns.find(c => c.id === id)
    if (!row) return
setSelectedCampaignId(id)
setLoadedCampaignId(id)

    const inp = row.inputs || {}
    setArtistName(inp.artistName || artistName)
    setGenre(inp.genre || genre)
    setAudience(inp.audience || audience)
    setGoal(inp.goal || goal)
    setInfluences(inp.influences || influences)
    setBrandWords(inp.brandWords || brandWords)

    setCampaigns(normalizeCampaignPayload(row.concepts))
    setTab('campaign')
    setCollapseCampaignCard(false)

    toast.success('Loaded ✅')
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250)
  }

  async function handleDownloadKitPdf() {
  if (!result) return toast.error('Generate first!')
  setDownloadingPdf(true)

  try {
    const pdfLines = identityKitPdf.buildIdentityKitPdfLines(result, {
      artistName,
      genre,
      audience,
      goal,
      influences,
      brandWords,
    })

    const safeBase = normalizeText(artistName || '').replace(/[^\w\s-]/g, '').trim()
const base = safeBase ? `${safeBase} identity kit` : 'identity kit'

    renderWwPdf(pdfLines, base)
    toast.success('PDF exported ✅')

  } catch (e: any) {
    console.error('[identity-kit-pdf]', e)
    toast.error(e?.message || 'Could not generate PDF')
  } finally {
    setDownloadingPdf(false)
  }
}





  async function handleDownloadCampaignPdfSingle(conceptIndex: number) {
  if (!campaigns) return toast.error('Generate first!')
  const concept = campaigns.concepts?.[conceptIndex]
  if (!concept) return toast.error('Concept not found')

  setDownloadingConceptIndex(conceptIndex)

  try {
    const lines = buildCampaignPdfLines(
      campaigns,
      { artistName, genre, audience, goal, influences, brandWords },
      { onlyConceptIndex: conceptIndex }
    )

    const conceptName = concept.name || `Concept ${conceptIndex + 1}`
    const base = artistName
  ? `Campaign Concept — ${conceptName} — ${artistName}`
  : `Campaign Concept — ${conceptName}`


    renderWwPdf(lines, base)
    toast.success('Concept PDF downloaded ✅')
  } catch (e: any) {
    console.error('[campaign-pdf-single]', e)
    toast.error(e?.message || 'Could not generate PDF')
  } finally {
    setDownloadingCampaignPdf(false)
  }
}


  async function handleDownloadCampaignPdfAll() {
    if (!campaigns) return toast.error('Generate first!')
    setDownloadingCampaignAllPdf(true)
    try {
      const lines = buildCampaignPdfLines(campaigns, { artistName, genre, audience, goal, influences, brandWords })
      const base = artistName ? `Campaign Pack — ${artistName}` : 'Campaign Pack'

      renderWwPdf(lines, base, { includeDate: true })

      toast.success('Campaign pack PDF downloaded ✅')
    } catch (e: any) {
      console.error('[campaign-pdf-all]', e)
      toast.error(e?.message || 'Could not generate PDF')
    } finally {
      setDownloadingCampaignAllPdf(false)
    }
  }

  async function saveKitMeta(id: string) {
    const title = kitTitleDraft.trim() || null
    const notes = kitNotesDraft.trim() || null
    try {
      const res = await supabase.from('identity_kits').update({ title, notes }).eq('id', id).select().single()
      if (res.error) throw res.error

      setKits(prev => prev.map(k => (k.id === id ? { ...k, title, notes } : k)))
      toast.success('Updated ✅')
      setEditingKitId('')
      setKitTitleDraft('')
      setKitNotesDraft('')
    } catch (e: any) {
      toast.error(e?.message || 'Could not update')
    }
  }

  async function saveCampaignMeta(id: string) {
    const title = campaignTitleDraft.trim() || null
    const notes = campaignNotesDraft.trim() || null
    try {
      const res = await supabase.from('campaign_concepts').update({ title, notes }).eq('id', id).select().single()
      if (res.error) throw res.error

      setSavedCampaigns(prev => prev.map(c => (c.id === id ? { ...c, title, notes } : c)))
      toast.success('Updated ✅')
      setEditingCampaignId('')
      setCampaignTitleDraft('')
      setCampaignNotesDraft('')
    } catch (e: any) {
      toast.error(e?.message || 'Could not update')
    }
  }

  // ---------- Shared styles ----------
  const primaryBtn =
    'inline-flex items-center gap-2 px-4 h-10 rounded-full bg-ww-violet text-white text-xs md:text-sm font-semibold ' +
    'shadow-[0_0_16px_rgba(186,85,211,0.7)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] ' +
    'active:scale-95 transition disabled:opacity-60'

  const outlineBtn =
    'inline-flex items-center gap-2 px-4 h-10 rounded-full border border-white/20 text-white/85 text-xs md:text-sm ' +
    'hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] ' +
    'active:scale-95 transition disabled:opacity-60'

  const miniOutlineBtn =
    'inline-flex items-center gap-2 px-3 h-9 rounded-full border border-white/15 text-white/80 text-xs ' +
    'hover:border-ww-violet hover:bg-ww-violet/15 hover:text-white transition disabled:opacity-60'

  const inputClass =
    'w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white placeholder-white/35 ' +
    'focus:border-ww-violet focus:outline-none transition'

  const labelClass = 'text-xs text-white/55 flex items-center gap-1'

  function Section({
    id,
    title,
    hint,
    children,
  }: {
    id: string
    title: string
    hint?: string
    children: React.ReactNode
  }) {
    const open = !!openIdentitySections[id]
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden" style={{ overflowAnchor: 'none' as any }}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            preserveScroll(() => setOpenIdentitySections(prev => ({ ...prev, [id]: !prev[id] })))
          }}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <div>
            <p className="text-xs uppercase tracking-wide text-white/50">{title}</p>
            {hint ? <p className="text-[0.75rem] text-white/55 mt-0.5">{hint}</p> : null}
          </div>
          {open ? <ChevronDown className="w-5 h-5 text-white/60" /> : <ChevronRight className="w-5 h-5 text-white/60" />}
        </button>
        {open ? (
          <div className="px-4 pb-4" style={{ overflowAnchor: 'none' as any }}>
            {children}
          </div>
        ) : null}
      </div>
    )
  }

  function BulletList({ items }: { items: any[] }) {
    if (!Array.isArray(items) || !items.length) return null
    return (
      <ul className="mt-2 space-y-2 text-sm text-white/85" style={{ overflowAnchor: 'none' as any }}>
        {items.filter(Boolean).map((x, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-ww-violet/80 shrink-0" />
            <span className="leading-relaxed">{String(x)}</span>
          </li>
        ))}
      </ul>
    )
  }

  function PaletteRow({ colours }: { colours: any[] }) {
    if (!Array.isArray(colours) || !colours.length) return null
    return (
      <div className="mt-2 flex flex-wrap gap-2" style={{ overflowAnchor: 'none' as any }}>
        {colours.slice(0, 8).map((c, i) => {
          const s = String(c || '').trim()
          const ok = isHexColour(s)
          return (
            <div key={i} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5">
              <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={ok ? { backgroundColor: s } : undefined} />
              <span className="text-[0.72rem] text-white/70">{s || '—'}</span>
            </div>
          )
        })}
      </div>
    )
  }
async function handleSaveKit() {
  if (!result) return toast.error('Generate first!')
  setSavingKit(true)

  try {
    const { data: userData } = await supabase.auth.getUser()
    const uid = userData?.user?.id

    const payloadBase: any = {
      inputs: { artistName, genre, influences, brandWords, audience, goal },
      result,
    }

    let insertRes = await supabase
      .from('identity_kits')
      .insert([uid ? { ...payloadBase, user_id: uid } : payloadBase])
      .select()
      .single()

    // fallback for older schemas
    if (
      insertRes.error &&
      String(insertRes.error.message || '').toLowerCase().includes('column') &&
      String(insertRes.error.message || '').includes('user_id')
    ) {
      insertRes = await supabase.from('identity_kits').insert([payloadBase]).select().single()
    }

    if (insertRes.error) throw insertRes.error

    const row = insertRes.data as KitRow
    setKits(prev => [row, ...prev])
    setSelectedKitId(row.id)
    toast.success('Saved ✅')

    if (!showSavedKits) setShowSavedKits(true)
    setTimeout(() => savedSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250)
  } catch (e: any) {
    toast.error(e?.message || 'Error saving')
  } finally {
    setSavingKit(false)
  }
}

  return (
    <main className="min-h-screen bg-black text-white" style={{ overflowAnchor: 'none' as any }}>
      <Toaster position="top-center" richColors />

      <section className="mx-auto max-w-6xl px-4 py-8 space-y-6" style={{ overflowAnchor: 'none' as any }}>
        {/* Header */}
        <header className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-ww-violet" />
              Identity Kit
            </h1>
          </div>

          {mounted && hasAnyProfile && (
            <button type="button" onClick={applyProfileFromCentral} className={outlineBtn}>
              <Sparkles className="w-4 h-4" />
              Apply WW profile
            </button>
          )}
        </header>

        {/* Inputs + Tabs */}
        <section className="rounded-3xl border border-white/10 bg-black/80 p-5 md:p-6 space-y-5" style={{ overflowAnchor: 'none' as any }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/50">Setup</p>
            </div>

            {/* ✅ Tabs ONLY — no PDF button here */}
            <div className="inline-flex items-center rounded-full border border-white/10 bg-black/60 p-1">
              <button
                type="button"
                onClick={() => setTab('kit')}
                className={`px-4 h-9 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
                  tab === 'kit'
                    ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.6)]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Wand2 className="w-4 h-4" />
                Kit
              </button>
              <button
                type="button"
                onClick={() => setTab('campaign')}
                className={`px-4 h-9 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
                  tab === 'campaign'
                    ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.6)]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Film className="w-4 h-4" />
                Campaign
              </button>
            </div>
          </div>

          {/* Reuse */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-white/75">
                <BookOpen className="w-4 h-4 text-ww-violet" />
                Reuse a saved kit
              </div>
              <button
                type="button"
                onClick={handleRefreshFromLoadedKit}
                disabled={!selectedKitId || submitting}
                className={outlineBtn + ' h-9'}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Refresh
              </button>
            </div>

            <div className="space-y-1">
              <p className={labelClass}>Load saved kit</p>
<select
  value={selectedKitId}
  onChange={e => {
    const id = e.target.value
    setSelectedKitId(id)
    if (id) handleLoadSavedKit(id)
  }}
  className={inputClass}
>
  <option value="">Select a saved kit…</option>
  {(selectedKitId
  ? [...kits.filter(k => k.id === selectedKitId), ...kits.filter(k => k.id !== selectedKitId)]
  : kits
).map(k => (
  <option key={k.id} value={k.id}>
    {(k.title || k.inputs?.artistName || 'Untitled') +
      ' — ' +
      new Date(k.created_at).toLocaleDateString('en-GB')}
  </option>
))}




              </select>
            </div>
          </div>

          {/* Inputs */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className={labelClass}>
                <User className="w-3 h-3" /> Artist name
              </p>
              <input
                value={artistName}
                onChange={e => setArtistName(e.target.value)}
                className={inputClass}
                placeholder="e.g. natestapes"
              />
            </div>

            <div className="space-y-1">
              <p className={labelClass}>
                <Palette className="w-3 h-3" /> Genre / lane
              </p>
              <input
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className={inputClass}
                placeholder="e.g. introspective UK rap / cinematic storytelling"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <p className={labelClass}>
                <Target className="w-3 h-3" /> Audience
              </p>
              <textarea
                value={audience}
                onChange={e => setAudience(e.target.value)}
                className={inputClass}
                rows={2}
                placeholder="Who are you really speaking to?"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <p className={labelClass}>
                <Target className="w-3 h-3" /> Main goal (30–90 days)
              </p>
              <textarea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                className={inputClass}
                rows={2}
                placeholder="What do you want your content + brand to achieve soon?"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <p className={labelClass}>
                <Hash className="w-3 h-3" /> Influences (comma-separated)
              </p>
              <input
                value={influences}
                onChange={e => setInfluences(e.target.value)}
                className={inputClass}
                placeholder="e.g. Dave, Kendrick, anime soundtracks…"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <p className={labelClass}>
                <Sparkles className="w-3 h-3" /> Brand words (comma-separated)
              </p>
              <input
                value={brandWords}
                onChange={e => setBrandWords(e.target.value)}
                className={inputClass}
                placeholder="e.g. cinematic, honest, hungry, cosmic…"
              />
            </div>
          </div>

          {/* Tab-specific actions */}
          {identityFreeLimitReached && (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
    <p className="text-sm text-white/80">
      You’ve used your 1 free Identity Kit generation.
    </p>
    <button
      type="button"
      onClick={() => router.push('/pricing')}
      className={outlineBtn + ' h-9'}
    >
      Upgrade
    </button>
  </div>
)}

          <div className="flex flex-wrap gap-2 pt-1">
            {tab === 'kit' ? (
              <>
                <button type="button" onClick={handleGenerateKit} disabled={submitting || identityFreeLimitReached}
 className={primaryBtn}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {submitting ? 'Generating…' : 'Generate'}
                </button>
{identityFreeLimitReached && (
  <div className="mt-3 rounded-2xl border border-ww-violet/40 bg-ww-violet/10 p-4 shadow-[0_0_18px_rgba(186,85,211,0.25)]">
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <p className="text-xs uppercase tracking-wide text-white/50">Free limit reached</p>
        <p className="text-sm text-white/80 mt-1">
          You’ve used your 1 free Identity Kit generation.
        </p>
      </div>

      <button
        type="button"
        onClick={() => window.location.assign('/pricing')}
        className="inline-flex items-center gap-2 px-4 h-9 rounded-full bg-ww-violet text-white text-sm font-semibold
          shadow-[0_0_16px_rgba(186,85,211,0.7)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] active:scale-95 transition"
      >
        Upgrade
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
)}

{authExpired && (
  <div className="mt-3 rounded-2xl border border-white/10 bg-black/60 p-4">
    <p className="text-xs uppercase tracking-wide text-white/50">Session expired</p>
    <p className="text-sm text-white/80 mt-1">Please log in again to generate.</p>
    <button
      type="button"
      onClick={() => window.location.assign('/login')}
      className={outlineBtn + ' h-9 mt-3'}
    >
      Go to login
      <ArrowRight className="w-4 h-4" />
    </button>
  </div>
)}


                
              </>
            ) : (
              <>
                <button type="button" onClick={handleGenerateCampaigns} disabled={loadingCampaigns} className={primaryBtn}>
                  {loadingCampaigns ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
                  {loadingCampaigns ? 'Generating…' : 'Generate'}
                </button>

                
              </>
            )}
          </div>
        </section>



{authExpired && (
  <div className="mt-3 rounded-2xl border border-white/10 bg-black/60 p-4">
    <p className="text-xs uppercase tracking-wide text-white/50">Session expired</p>
    <p className="text-sm text-white/80 mt-1">Please log in again to generate.</p>
    <button
      type="button"
      onClick={() => window.location.assign('/login')}
      className={outlineBtn + ' h-9 mt-3'}
    >
      Go to login
      <ArrowRight className="w-4 h-4" />
    </button>
  </div>
)}

        {/* Results */}
        <section ref={resultRef} className="space-y-6 pb-16" style={{ overflowAnchor: 'none' as any }}>
          {/* Identity result */}
          {result && (
            <div
  ref={identityCardRef}
  className={
    "rounded-3xl border bg-black/80 p-5 md:p-6 space-y-4 transition-shadow " +
    (pulseResultGlow
      ? "border-ww-violet/80 shadow-[0_0_26px_rgba(186,85,211,0.65)]"
      : "border-white/10")
  }
  style={{ overflowAnchor: 'none' as any }}
>

              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">Output</p>
                  <h2 className="text-lg font-semibold mt-1 text-ww-violet">Identity Kit</h2>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Collapse / expand this card */}
                  <button
                    type="button"
                    className={
  miniOutlineBtn +
  (!kitSavedForCurrentResult
    ? ' animate-pulse border-ww-violet/60 shadow-[0_0_18px_rgba(186,85,211,0.55)]'
    : '')
}

                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      preserveScroll(() => setCollapseIdentityCard(v => !v))
                    }}
                  >
                    {collapseIdentityCard ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    {collapseIdentityCard ? 'Expand' : 'Collapse'}
                  </button>

                  <button
  type="button"
  onClick={handleSaveKit}
  disabled={!result || savingKit}
  className={miniOutlineBtn}
>
  {savingKit ? <Loader2 className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}
  {autoSavingKit || savingKit ? 'Saving…' : kitSavedForCurrentResult ? 'Saved' : 'Save'}

</button>


                  {/* PDF export for this card */}
                  <button
                    type="button"
                    onClick={handleDownloadKitPdf}
                    disabled={!result || downloadingPdf}
                    className={miniOutlineBtn}
                  >
                    {downloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {downloadingPdf ? 'PDF…' : 'PDF'}
                  </button>
                </div>
              </div>

              {!collapseIdentityCard ? (
                <div className="space-y-4">
                  <Section id="core" title="Core" hint="Essence, positioning, bio, archetype">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-4 md:col-span-2">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs uppercase tracking-wide text-white/50">Brand essence</p>
                          <button
                            type="button"
                            className={miniOutlineBtn}
                            onClick={() => copyText('Brand essence', String(result?.brand_essence || ''))}
                          >
                            <Clipboard className="w-4 h-4" />
                            Copy
                          </button>
                        </div>
                        <p className="text-white/85 mt-2 leading-relaxed">{String(result?.brand_essence || '—')}</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs uppercase tracking-wide text-white/50">One-line positioning</p>
                          <button
                            type="button"
                            className={miniOutlineBtn}
                            onClick={() => copyText('Positioning', String(result?.one_line_positioning || ''))}
                          >
                            <Clipboard className="w-4 h-4" />
                            Copy
                          </button>
                        </div>
                        <p className="text-white/85 mt-2 leading-relaxed">{String(result?.one_line_positioning || '—')}</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                        <p className="text-xs uppercase tracking-wide text-white/50">Archetype</p>
                        <p className="text-white/85 mt-2">
                          <span className="text-white/60">Primary:</span> {String(result?.archetype?.primary || '—')}
                          <br />
                          <span className="text-white/60">Secondary:</span> {String(result?.archetype?.secondary || '—')}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/50 p-4 md:col-span-2">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs uppercase tracking-wide text-white/50">Short bio</p>
                          <button
                            type="button"
                            className={miniOutlineBtn}
                            onClick={() => copyText('Short bio', String(result?.bio_short || ''))}
                          >
                            <Clipboard className="w-4 h-4" />
                            Copy
                          </button>
                        </div>
                        <p className="text-white/85 mt-2 whitespace-pre-wrap leading-relaxed">{String(result?.bio_short || '—')}</p>
                      </div>
                    </div>
                  </Section>

                  <Section id="persona" title="Audience persona" hint="Nickname, demographics, psychographics, adjacent artists">
                    <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-white/50">Nickname</p>
                          <p className="text-white/85 mt-2">{String(result?.audience_persona?.nickname || '—')}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-white/50">Demographics</p>
                          <p className="text-white/85 mt-2">{String(result?.audience_persona?.demographics || '—')}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs uppercase tracking-wide text-white/50">Psychographics</p>
                          <p className="text-white/85 mt-2 leading-relaxed">{String(result?.audience_persona?.psychographics || '—')}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs uppercase tracking-wide text-white/50">Adjacent artists</p>
                          <p className="text-white/85 mt-2">{safeJoin(result?.audience_persona?.adjacent_artists, ' • ') || '—'}</p>
                        </div>
                      </div>
                    </div>
                  </Section>

                  <Section id="messaging" title="Messaging" hint="Value props + tone of voice">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                        <p className="text-xs uppercase tracking-wide text-white/50">Value props</p>
                        <BulletList items={Array.isArray(result?.value_props) ? result.value_props : []} />
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                        <p className="text-xs uppercase tracking-wide text-white/50">Tone of voice</p>
                        <p className="text-white/85 mt-2">{safeJoin(result?.tone_of_voice, ' • ') || '—'}</p>
                      </div>
                    </div>
                  </Section>

                  <Section id="visual" title="Visual aesthetics" hint="Palette, mood words, references">
                    <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/50">Palette</p>
                      <PaletteRow colours={Array.isArray(result?.visual_aesthetics?.palette) ? result.visual_aesthetics.palette : []} />
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-white/50">Mood words</p>
                          <p className="text-white/85 mt-2">{safeJoin(result?.visual_aesthetics?.mood_words, ' • ') || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-white/50">References</p>
                          <p className="text-white/85 mt-2">{safeJoin(result?.visual_aesthetics?.references, ' • ') || '—'}</p>
                        </div>
                      </div>
                    </div>
                  </Section>

                  <Section id="pillars" title="Content pillars" hint="Why it works + formats to post">
                    <div className="grid gap-3 md:grid-cols-2">
                      {(Array.isArray(result?.content_pillars) ? result.content_pillars : []).map((p: any, idx: number) => (
                        <div key={idx} className="rounded-2xl border border-white/10 bg-black/50 p-4">
                          <p className="text-xs uppercase tracking-wide text-white/50">Pillar {idx + 1}</p>
                          <p className="text-white/90 font-semibold mt-2">{String(p?.name || '—')}</p>
                          {p?.why ? <p className="text-white/75 mt-2 leading-relaxed">{String(p.why)}</p> : null}
                          {Array.isArray(p?.formats) && p.formats.length ? (
                            <div className="mt-3">
                              <p className="text-xs uppercase tracking-wide text-white/50">Formats</p>
                              <p className="text-white/85 mt-2">{safeJoin(p.formats, ' • ')}</p>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section id="platform" title="Platform strategy" hint="Primary platforms, cadence, CTA examples">
                    <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-white/50">Primary platforms</p>
                          <p className="text-white/85 mt-2">{safeJoin(result?.platform_strategy?.primary_platforms, ' • ') || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-white/50">Cadence</p>
                          <p className="text-white/85 mt-2">{String(result?.platform_strategy?.cadence || '—')}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs uppercase tracking-wide text-white/50">CTA examples</p>
                          <BulletList items={Array.isArray(result?.platform_strategy?.cta_examples) ? result.platform_strategy.cta_examples : []} />
                        </div>
                      </div>
                    </div>
                  </Section>

                  <Section id="plan" title="90-day plan" hint="Weekly blocks + tasks">
                    <div className="grid gap-3 md:grid-cols-2">
                      {(Array.isArray(result?.release_plan_90d) ? result.release_plan_90d : []).map((w: any, idx: number) => (
                        <div key={idx} className="rounded-2xl border border-white/10 bg-black/50 p-4">
                          <p className="text-xs uppercase tracking-wide text-white/50">{String(w?.week || `Block ${idx + 1}`)}</p>
                          {w?.focus ? <p className="text-white/90 font-semibold mt-2">{String(w.focus)}</p> : null}
                          <BulletList items={Array.isArray(w?.tasks) ? w.tasks : []} />
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section id="seo" title="SEO keywords + taglines" hint="Useful for bios, YouTube, press">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                        <p className="text-xs uppercase tracking-wide text-white/50">SEO keywords</p>
                        <p className="text-white/85 mt-2">{safeJoin(result?.seo_keywords, ' • ') || '—'}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                        <p className="text-xs uppercase tracking-wide text-white/50">Taglines</p>
                        <p className="text-white/85 mt-2">{safeJoin(result?.taglines, ' • ') || '—'}</p>
                      </div>
                    </div>
                  </Section>
                </div>
              ) : null}
            </div>
          )}

          {/* Campaign output */}
          {campaigns && (
            <div
  ref={campaignCardRef}
  className={
    "rounded-3xl border bg-black/80 p-5 md:p-6 space-y-4 transition-shadow " +
    (pulseCampaignGlow
      ? "border-ww-violet/80 shadow-[0_0_26px_rgba(186,85,211,0.65)]"
      : "border-white/10")
  }
  style={{ overflowAnchor: 'none' as any }}
>

              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">Output</p>
                  <h2 className="text-lg font-semibold mt-1 text-ww-violet">Campaign concepts</h2>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
  {/* Collapse / expand this card */}
  <button
    type="button"
    className={miniOutlineBtn}
    onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      preserveScroll(() => setCollapseCampaignCard(v => !v))
    }}
  >
    {collapseCampaignCard ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
    {collapseCampaignCard ? 'Expand' : 'Collapse'}
  </button>

  {/* Save campaigns (moves from input section to output card) */}
  <button
    type="button"
    onClick={handleSaveCampaigns}
    disabled={!campaigns || savingCampaigns}
    className={miniOutlineBtn}
  >
    {savingCampaigns ? <Loader2 className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}
    {savingCampaigns ? 'Saving…' : 'Save'}
  </button>

  {/* Export full pack */}
  <button
    type="button"
    onClick={handleDownloadCampaignPdfAll}
    disabled={!campaigns || downloadingCampaignAllPdf}
    className={miniOutlineBtn}
  >
    {downloadingCampaignAllPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
    {downloadingCampaignAllPdf ? 'PDF…' : 'Pack PDF'}
  </button>
</div>


              </div>

              {!collapseCampaignCard && (
                <div className="space-y-4">
                  

                  <div className="grid gap-3 md:grid-cols-2">
                    {(campaigns.concepts || []).map((c, idx) => (
                      <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-white/50">Concept {idx + 1}</p>
                            <h3 className="text-white/90 font-semibold mt-1">{c.name || `Concept ${idx + 1}`}</h3>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDownloadCampaignPdfSingle(idx)}
                            disabled={downloadingConceptIndex === idx}

                            className={miniOutlineBtn}
                          >
                            {downloadingConceptIndex === idx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}

                            PDF
                          </button>
                        </div>

                        {c.hook ? (
                          <p className="text-white/80">
                            <span className="text-white/50">Hook:</span> {c.hook}
                          </p>
                        ) : null}

                        {c.synopsis ? <p className="text-white/70 whitespace-pre-wrap">{c.synopsis}</p> : null}

                        <div className="grid gap-2 md:grid-cols-2 text-[0.75rem] text-white/65">
                          {Array.isArray(c.deliverables) && c.deliverables.length ? (
                            <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                              <p className="text-white/50 uppercase tracking-wide text-[0.65rem]">Deliverables</p>
                              <p className="mt-1 line-clamp-3">{c.deliverables.slice(0, 6).join(' • ')}</p>
                            </div>
                          ) : null}

                          {Array.isArray(c.caption_tones) && c.caption_tones.length ? (
                            <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                              <p className="text-white/50 uppercase tracking-wide text-[0.65rem]">Caption tones</p>
                              <p className="mt-1 line-clamp-3">{c.caption_tones.slice(0, 6).join(' • ')}</p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Libraries */}
          {(kits.length > 0 || savedCampaigns.length > 0) && (
            <div ref={savedSectionRef} className="space-y-4">
              {/* Saved kits */}
              {kits.length > 0 && (
                <div className="rounded-3xl border border-white/10 bg-black/80 p-5 md:p-6">
                  <div className="w-full flex items-center justify-between gap-2">
  <button
    type="button"
    onClick={() => preserveScroll(() => setShowSavedKits(s => !s))}
    className="flex-1 flex items-center justify-between text-left"
    aria-expanded={showSavedKits}
  >
    <div>
      <p className="text-xs uppercase tracking-wide text-white/50">Library</p>
      <h2 className="text-lg font-semibold text-ww-violet mt-1">Saved kits</h2>
    </div>
    {showSavedKits ? (
      <ChevronDown className="w-5 h-5 text-white/70" />
    ) : (
      <ChevronRight className="w-5 h-5 text-white/70" />
    )}
  </button>

  {selectedKitId ? (
    <button
      type="button"
      className={miniOutlineBtn + " h-9"}
      onClick={() => {
        setSelectedKitId('')
        toast.success('Cleared loaded kit ✅')
      }}
    >
      <X className="w-4 h-4" />
      Clear
    </button>
  ) : null}
</div>


                  {showSavedKits && (
                    <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {(() => {
  const ordered =
    selectedKitId
      ? [
          ...(kits.filter(k => k.id === selectedKitId)),
          ...(kits.filter(k => k.id !== selectedKitId)),
        ]
      : kits

  return ordered.map(kit => {

                        const isEditing = editingKitId === kit.id
const isLoaded = kit.id === selectedKitId

                        const displayTitle = kit.title || kit.inputs?.artistName || 'Untitled'
                        const dateLabel = new Date(kit.created_at).toLocaleDateString('en-GB')

                        return (
                          <div
                            key={kit.id}
                            className={
  'rounded-2xl border bg-black/60 p-4 transition ' +
  (kit.id === selectedKitId
    ? 'border-ww-violet/80 shadow-[0_0_18px_rgba(186,85,211,0.45)]'
    : 'border-white/10 hover:border-ww-violet/70 hover:shadow-[0_0_16px_rgba(186,85,211,0.35)]')
}


                          >
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-white truncate">{displayTitle}</h3>
                              <div className="flex items-center gap-2">
  {isLoaded ? (
    <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full border border-ww-violet/40 bg-ww-violet/10 text-ww-violet">
      Loaded
    </span>
  ) : null}
  <span className="text-xs text-white/50 whitespace-nowrap">{dateLabel}</span>
</div>

                            </div>

                            {kit.notes ? <p className="text-white/60 text-xs mt-1 line-clamp-2">{kit.notes}</p> : null}
                            <p className="text-white/70 text-sm mt-2 line-clamp-2">{kit.result?.brand_essence || '—'}</p>

                            {!isEditing ? (
                              <div className="flex gap-2 mt-3 flex-wrap">
                                <button type="button" onClick={() => handleLoadSavedKit(kit.id)} className={outlineBtn + ' h-9'}>
                                  Load <ArrowRight className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingKitId(kit.id)
                                    setKitTitleDraft(kit.title || '')
                                    setKitNotesDraft(kit.notes || '')
                                  }}
                                  className={miniOutlineBtn}
                                >
                                  <Pencil className="w-4 h-4" />
                                  Edit
                                </button>
                              </div>
                            ) : (
                              <div className="mt-3 space-y-2">
                                <input
                                  className={inputClass}
                                  value={kitTitleDraft}
                                  onChange={e => setKitTitleDraft(e.target.value)}
                                  placeholder="Title (optional)"
                                />
                                <textarea
                                  className={inputClass}
                                  value={kitNotesDraft}
                                  onChange={e => setKitNotesDraft(e.target.value)}
                                  rows={2}
                                  placeholder="Notes (optional)"
                                />
                                <div className="flex gap-2">
                                  <button type="button" className={miniOutlineBtn} onClick={() => saveKitMeta(kit.id)}>
                                    <Check className="w-4 h-4" />
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    className={miniOutlineBtn}
                                    onClick={() => {
                                      setEditingKitId('')
                                      setKitTitleDraft('')
                                      setKitNotesDraft('')
                                    }}
                                  >
                                    <X className="w-4 h-4" />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                        })
})()}

                    </div>
                  )}
                </div>
              )}

              {/* Saved campaigns */}
              {savedCampaigns.length > 0 && (
                <div className="rounded-3xl border border-white/10 bg-black/80 p-5 md:p-6">
                  <button
                    type="button"
                    onClick={() => preserveScroll(() => setShowSavedCampaigns(s => !s))}
                    className="w-full flex items-center justify-between text-left"
                    aria-expanded={showSavedCampaigns}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Library</p>
                      <h2 className="text-lg font-semibold text-ww-violet mt-1">Saved campaigns</h2>
                    </div>
                    {showSavedCampaigns ? <ChevronDown className="w-5 h-5 text-white/70" /> : <ChevronRight className="w-5 h-5 text-white/70" />}
                  </button>

                  {showSavedCampaigns && (
                    <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {(() => {
  const ordered = selectedCampaignId
    ? [
        ...savedCampaigns.filter(r => r.id === selectedCampaignId),
        ...savedCampaigns.filter(r => r.id !== selectedCampaignId),
      ]
    : savedCampaigns

  return ordered.map(row => {
    const isEditing = editingCampaignId === row.id
    const isLoaded = row.id === selectedCampaignId
    const displayTitle = row.title || row.inputs?.artistName || 'Untitled campaign'
    const dateLabel = new Date(row.created_at).toLocaleDateString('en-GB')

    return (
      <div
        key={row.id}
        className={
          'rounded-2xl border bg-black/60 p-4 transition ' +
          (isLoaded
            ? 'border-ww-violet/80 shadow-[0_0_18px_rgba(186,85,211,0.45)]'
            : 'border-white/10 hover:border-ww-violet/70 hover:shadow-[0_0_16px_rgba(186,85,211,0.35)]')
        }
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-white truncate">{displayTitle}</h3>

          <div className="flex items-center gap-2">
  {row.id === selectedCampaignId ? (
    <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full border border-ww-violet/40 bg-ww-violet/10 text-ww-violet">
      Loaded
    </span>
  ) : null}
  <span className="text-xs text-white/50 whitespace-nowrap">{dateLabel}</span>
</div>


        </div>

        {row.notes ? <p className="text-white/60 text-xs mt-1 line-clamp-2">{row.notes}</p> : null}

        <p className="text-white/70 text-sm mt-2 line-clamp-2">
          {(() => {
            const normalized = normalizeCampaignPayload(row.concepts)
            return normalized.concepts?.[0]?.hook || '—'
          })()}
        </p>

        {!isEditing ? (
          <div className="flex gap-2 mt-3 flex-wrap">
            <button type="button" onClick={() => handleLoadSavedCampaign(row.id)} className={outlineBtn + ' h-9'}>
              Load <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingCampaignId(row.id)
                setCampaignTitleDraft(row.title || '')
                setCampaignNotesDraft(row.notes || '')
              }}
              className={miniOutlineBtn}
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <input
              className={inputClass}
              value={campaignTitleDraft}
              onChange={e => setCampaignTitleDraft(e.target.value)}
              placeholder="Title (optional)"
            />
            <textarea
              className={inputClass}
              value={campaignNotesDraft}
              onChange={e => setCampaignNotesDraft(e.target.value)}
              rows={2}
              placeholder="Notes (optional)"
            />
            <div className="flex gap-2">
              <button type="button" className={miniOutlineBtn} onClick={() => saveCampaignMeta(row.id)}>
                <Check className="w-4 h-4" />
                Save
              </button>
              <button
                type="button"
                className={miniOutlineBtn}
                onClick={() => {
                  setEditingCampaignId('')
                  setCampaignTitleDraft('')
                  setCampaignNotesDraft('')
                }}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    )
  })
})()}


                        
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
