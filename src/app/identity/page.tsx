// src/app/identity/page.tsx
'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Toaster, toast } from 'sonner'
import { useWwProfile } from '@/hooks/useWwProfile'
import { effectiveTier, getUsage, bumpUsage } from '@/lib/wwProfile'
import { useRouter } from 'next/navigation'
import { normalizeText } from '@/lib/wwPdf'
import { useGeneratingMessages } from '@/hooks/useGeneratingMessages'
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
  Trash2,
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type KitRow = {
  id: string
  created_at: string
  inputs: any
  result: any
  title?: string | null
  notes?: string | null
  user_id?: string | null
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
  user_id?: string | null
}

function safeJoin(arr: any, sep = ' · ') {
  if (!Array.isArray(arr)) return ''
  return arr.filter(Boolean).join(sep)
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
              props: Array.isArray(c.visual_direction?.props)
                ? c.visual_direction.props.map((x: any) => String(x))
                : [],
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

const KIT_GENERATING_MESSAGES = [
  'Gathering your artist identity...',
  'Clarifying your positioning...',
  'Shaping your tone and story...',
  'Building your identity kit...',
]

const CAMPAIGN_GENERATING_MESSAGES = [
  'Reading your artist brief...',
  'Finding campaign angles...',
  'Building concept directions...',
  'Shaping rollout ideas...',
]

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
    updateProfile,
  } = useWwProfile()

  useEffect(() => {
  if (profile && !profile.onboarding_started) {
    updateProfile({ onboarding_started: true })
  }
}, [profile])

  const [tab, setTab] = useState<'kit' | 'campaign'>('kit')
  const [libraryTab, setLibraryTab] = useState<'kits' | 'campaigns'>('kits')

  const [artistName, setArtistName] = useState('')
  const [genre, setGenre] = useState('')
  const [audience, setAudience] = useState('')
  const [direction, setDirection] = useState('')
  const [influences, setInfluences] = useState('')
  const [brandWords, setBrandWords] = useState('')

  const [result, setResult] = useState<any | null>(null)
  const [campaigns, setCampaigns] = useState<Campaigns | null>(null)

  const [kits, setKits] = useState<KitRow[]>([])
  const [savedCampaigns, setSavedCampaigns] = useState<CampaignRow[]>([])

  const [selectedKitId, setSelectedKitId] = useState('')
  const [loadedKitId, setLoadedKitId] = useState('')
  const [selectedCampaignId, setSelectedCampaignId] = useState('')
  const [loadedCampaignId, setLoadedCampaignId] = useState('')

  const activeKitId = loadedKitId || selectedKitId
  const activeCampaignId = loadedCampaignId || selectedCampaignId
  const isKitLoaded = !!activeKitId
  const isCampaignLoaded = !!activeCampaignId

  const [editingKitId, setEditingKitId] = useState('')
  const [kitTitleDraft, setKitTitleDraft] = useState('')
  const [kitNotesDraft, setKitNotesDraft] = useState('')

  const [editingCampaignId, setEditingCampaignId] = useState('')
  const [campaignTitleDraft, setCampaignTitleDraft] = useState('')
  const [campaignNotesDraft, setCampaignNotesDraft] = useState('')

  const [authExpired, setAuthExpired] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [savingKit, setSavingKit] = useState(false)
  const [savingCampaigns, setSavingCampaigns] = useState(false)
  const [loadingCampaigns, setLoadingCampaigns] = useState(false)
  
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [downloadingCampaignAllPdf, setDownloadingCampaignAllPdf] = useState(false)
  const [downloadingConceptIndex, setDownloadingConceptIndex] = useState<number | null>(null)

  const [deletingKitId, setDeletingKitId] = useState('')
  const [deletingCampaignId, setDeletingCampaignId] = useState('')
  const [deletingLoadedCampaign, setDeletingLoadedCampaign] = useState(false)

  const [pulseResultGlow, setPulseResultGlow] = useState(false)
  const [pulseCampaignGlow, setPulseCampaignGlow] = useState(false)
  const [autoSavingKit, setAutoSavingKit] = useState(false)
const [kitSavedForCurrentResult, setKitSavedForCurrentResult] = useState(false)

const [showInfluencePicks, setShowInfluencePicks] = useState(false)
const [showBrandWordPicks, setShowBrandWordPicks] = useState(false)
const [showGenrePicks, setShowGenrePicks] = useState(false)
const [showAudiencePicks, setShowAudiencePicks] = useState(false)
const [showWorldPicks, setShowWorldPicks] = useState(false)
const [showBrandPicks, setShowBrandPicks] = useState(false)

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
const [identityFreeLimitReached, setIdentityFreeLimitReached] = useState(false)
const tier = effectiveTier(profile)
const campaignLocked = mounted && tier === 'free'
const usage = useMemo(() => (mounted ? getUsage(profile) : {}), [mounted, profile])
const usedIdentityGenerations = Number((usage as any)?.['identity_generations'] ?? 0)
const identityLocked = mounted && tier === 'free' && usedIdentityGenerations >= 1
const freeLimitReached = Boolean(identityLocked || identityFreeLimitReached)


  const resultRef = useRef<HTMLDivElement | null>(null)
  const identityCardRef = useRef<HTMLDivElement | null>(null)
  const campaignCardRef = useRef<HTMLDivElement | null>(null)
  const savedSectionRef = useRef<HTMLDivElement | null>(null)

  const [collapseIdentityCard, setCollapseIdentityCard] = useState(false)
  const [collapseCampaignCard, setCollapseCampaignCard] = useState(false)
const kitGeneratingMessage = useGeneratingMessages(submitting, KIT_GENERATING_MESSAGES)
const campaignGeneratingMessage = useGeneratingMessages(loadingCampaigns, CAMPAIGN_GENERATING_MESSAGES)
const isFreeIdentityPreview = mounted && tier === 'free'
  const brandWordPresets: string[] = [
  'cinematic',
  'raw',
  'playful',
  'emotional',
  'bold',
  'intimate',
  'dark',
  'dreamy',
  'rebellious',
  'futuristic',
  'spiritual',
  'uplifting',
  'romantic',
  'minimal',
  'chaotic',
  'nostalgic',
]

const influencePresets: string[] = [
  'RAYE',
  'Little Simz',
  'Lianne La Havas',
  'Jorja Smith',
  'SZA',
  'Kendrick',
  'Dave',
  'Frank Ocean',
  'The Weeknd',
  'Loyle Carner',
  'UK rap',
  'alt R&B',
  'neo-soul',
  'anime soundtracks',
  'film scores',
]

const genrePresets = [
  'Pop',
  'Hip hop',
  'R&B',
  'Afrobeats',
  'Alternative',
  'Indie',
  'Electronic',
  'Dance',
  'Rock',
  'Soul',
  'Lo-fi',
  'Neo-soul',
]

const audiencePresets = [
  'Late-night listeners',
  'Deep thinkers',
  'Party crowd',
  'Romantics',
  'Gym / motivation listeners',
  'Creative outsiders',
  'Festival crowd',
  'Heartbroken listeners',
  'Alternative music fans',
  'Melody-first listeners',
  'Story-driven listeners',
  'People navigating change',
]

const creativeWorldPresets = [
  'Late-night city world',
  'Raw underground realism',
  'Glossy pop futurism',
  'Dreamy romantic world',
  'Dark cinematic world',
  'Soft nostalgic world',
  'Chaotic rebellious world',
  'Minimal monochrome world',
  'Surreal digital dreamscape',
  'Performance-led spotlight world',
  'Spiritual earthy world',
  'Warm everyday realism',
]


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

  const selectedKit = useMemo(() => kits.find(k => k.id === selectedKitId) || null, [kits, selectedKitId])

  useEffect(() => {
    if (profile.artistName && !artistName) setArtistName(profile.artistName)
    if (profile.genre && !genre) setGenre(profile.genre)
    if (profile.audience && !audience) setAudience(profile.audience)
    if (profile.direction && !direction) setDirection(profile.direction)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

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

        const fallback = await supabase.from('identity_kits').select('*').order('created_at', { ascending: false })
        if (!cancelled && !fallback.error && fallback.data) {
          setKits(fallback.data as KitRow[])
        }
      } catch {
        // silent
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

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

        if (!cancelled && !scoped.error && scoped.data) {
          setSavedCampaigns(scoped.data as CampaignRow[])
        }
      } catch {
        // silent
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  function preserveScroll(action: () => void) {
    const x = window.scrollX
    const y = window.scrollY
    action()
    requestAnimationFrame(() => {
      window.scrollTo({ left: x, top: y, behavior: 'auto' })
    })
  }

  function applyProfileFromCentral() {
    applyTo({ setArtistName, setGenre, setAudience, setDirection })
    toast.success('Profile applied ✅')
  }

    function addCommaTag(current: string, value: string) {
    const parts = current
      .split(',')
      .map(x => x.trim())
      .filter(Boolean)

    if (parts.some(x => x.toLowerCase() === value.toLowerCase())) return current

    return parts.length ? `${parts.join(', ')}, ${value}` : value
  }

  function removeCommaTag(current: string, value: string) {
    return current
      .split(',')
      .map(x => x.trim())
      .filter(Boolean)
      .filter(x => x.toLowerCase() !== value.toLowerCase())
      .join(', ')
  }

  function toggleCommaTag(current: string, value: string) {
    const parts = current
      .split(',')
      .map(x => x.trim())
      .filter(Boolean)

    const exists = parts.some(x => x.toLowerCase() === value.toLowerCase())
    return exists ? removeCommaTag(current, value) : addCommaTag(current, value)
  }

  function hasCommaTag(current: string, value: string) {
    return current
      .split(',')
      .map(x => x.trim().toLowerCase())
      .filter(Boolean)
      .includes(value.toLowerCase())
  }

  function copyText(label: string, text: string) {
    if (!text) return toast.info('Nothing to copy')
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${label} copied ✅`))
      .catch(() => toast.error('Copy failed'))
  }

  async function autoSaveKitQuiet(resultToSave: any) {
    try {
      setAutoSavingKit(true)

      const { data: userData } = await supabase.auth.getUser()
      const uid = userData?.user?.id

      const payloadBase: any = {
        inputs: { artistName, genre, influences, brandWords, audience, direction },
        result: resultToSave,
      }

      let insertRes = await supabase
        .from('identity_kits')
        .insert([uid ? { ...payloadBase, user_id: uid } : payloadBase])
        .select()
        .single()

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
      // silent
    } finally {
      setAutoSavingKit(false)
    }
  }

  async function handleGenerateKit() {
    if (freeLimitReached) {
  toast.info('Upgrade to Creator to keep using Identity Kit.')
  router.push('/#pricing')
  return
}
  void save({ artistName, genre, audience, direction })
  setSubmitting(true)
  setLoadedKitId('')
  setResult(null)
  setCampaigns(null)
  setCollapseIdentityCard(false)
  setCollapseCampaignCard(false)

  try {
    setIdentityFreeLimitReached(false)
    setAuthExpired(false)

    let sessionRes = await supabase.auth.getSession()
    let token = sessionRes.data.session?.access_token

    if (!token) {
      await supabase.auth.refreshSession()
      sessionRes = await supabase.auth.getSession()
      token = sessionRes.data.session?.access_token
    }

    if (!token) {
      setAuthExpired(true)
      toast.error('You need to log in again.')
      return
    }

    let response = await fetch('/api/identity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        artistName,
        genre,
        influences,
        brandWords,
        audience,
        direction,
      }),
    })

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
        body: JSON.stringify({
          artistName,
          genre,
          influences,
          brandWords,
          audience,
          direction,
        }),
      })
    }


    const data = await response.json().catch(() => ({}))

    if (response.status === 429 && data?.error === 'FREE_LIMIT') {
  setIdentityFreeLimitReached(true)
  toast.error(data?.message || 'Upgrade to Creator to keep using Identity Kit.')
  return

      toast.warning('Limit was triggered unexpectedly — treating you as Pro.')
    }

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
    if (tier === 'free') {
  await bumpUsage('identity_generate_uses' as any)
  setIdentityFreeLimitReached(true)
}
    setKitSavedForCurrentResult(false)

    void autoSaveKitQuiet(next)
    setKitSavedForCurrentResult(true)

    setSelectedKitId('')
    setPulseResultGlow(true)

    setTimeout(() => {
      identityCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)

    setTimeout(() => setPulseResultGlow(false), 2200)
  } catch (e: any) {
    toast.error(e?.message || 'Failed to generate')
  } finally {
    setSubmitting(false)
  }
}

  async function handleGenerateCampaigns() {

    if (campaignLocked) {
  toast.info('Campaign concepts are available on Creator.')
  router.push('/#pricing')
  return
}

    void save({ artistName, genre, audience, direction })
    setLoadingCampaigns(true)
    setLoadedCampaignId('')
    setCampaigns(null)
    setCollapseCampaignCard(false)
    setCollapseIdentityCard(false)

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistName, genre, influences, brandWords, audience, direction }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error || 'Failed to generate')
        return
      }

      const normalized = normalizeCampaignPayload(data)
      setCampaigns(normalized)
      setSelectedCampaignId('')
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

  function handleLoadSavedKit(id: string) {
    const kit = kits.find(k => k.id === id)
    if (!kit) return

    setSelectedKitId(id)
    setLoadedKitId(id)
    setTab('kit')
    setLibraryTab('kits')

    const inp = kit.inputs || {}
    setArtistName(inp.artistName || '')
    setGenre(inp.genre || '')
    setAudience(inp.audience || '')
    setDirection(inp.direction || '')
    setInfluences(inp.influences || '')
    setBrandWords(inp.brandWords || '')

    setResult(kit.result || null)
    setCampaigns(null)
    setCollapseIdentityCard(false)

    toast.success('Loaded ✅')
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250)
  }

  function handleLoadSavedCampaign(id: string) {
    const row = savedCampaigns.find(c => c.id === id)
    if (!row) return

    setSelectedCampaignId(id)
    setLoadedCampaignId(id)
    setTab('campaign')
    setLibraryTab('campaigns')

    const inp = row.inputs || {}
    setArtistName(inp.artistName || artistName)
    setGenre(inp.genre || genre)
    setAudience(inp.audience || audience)
    setDirection(inp.direction || direction)
    setInfluences(inp.influences || influences)
    setBrandWords(inp.brandWords || brandWords)

    setCampaigns(normalizeCampaignPayload(row.concepts))
    setCollapseCampaignCard(false)

    toast.success('Loaded ✅')
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250)
  }

  async function handleRefreshFromLoadedKit() {
    if (!selectedKit) return toast.info('Pick a saved kit first')
    await handleGenerateKit()
  }

  async function handleSaveKit() {
    if (!result) return toast.error('Generate first!')
    setSavingKit(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData?.user?.id

      const payloadBase: any = {
        inputs: { artistName, genre, influences, brandWords, audience, direction },
        result,
      }

      let insertRes = await supabase
        .from('identity_kits')
        .insert([uid ? { ...payloadBase, user_id: uid } : payloadBase])
        .select()
        .single()

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
      setLoadedKitId(row.id)
      setKitSavedForCurrentResult(true)
      toast.success('Saved ✅')

      setTimeout(() => savedSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250)
    } catch (e: any) {
      toast.error(e?.message || 'Error saving')
    } finally {
      setSavingKit(false)
    }
  }

  async function handleSaveCampaigns() {
    if (!campaigns) return toast.error('Generate first!')
    setSavingCampaigns(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData?.user?.id

      const payloadBase: any = {
        inputs: { artistName, genre, influences, brandWords, audience, direction },
        concepts: campaigns,
      }

      let insertRes = await supabase
        .from('campaign_concepts')
        .insert([uid ? { ...payloadBase, user_id: uid } : payloadBase])
        .select()
        .single()

      if (
        insertRes.error &&
        String(insertRes.error.message || '').toLowerCase().includes('column') &&
        String(insertRes.error.message || '').includes('user_id')
      ) {
        insertRes = await supabase.from('campaign_concepts').insert([payloadBase]).select().single()
      }

      if (insertRes.error) throw insertRes.error

      const row = insertRes.data as CampaignRow
      setSavedCampaigns(prev => [row, ...prev])
      setSelectedCampaignId(row.id)
      setLoadedCampaignId(row.id)
      toast.success('Saved ✅')
    } catch (e: any) {
      toast.error(e?.message || 'Error saving')
    } finally {
      setSavingCampaigns(false)
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

  function clearLoadedKitOutput() {
    setLoadedKitId('')
    setSelectedKitId('')
    setEditingKitId('')
    setKitTitleDraft('')
    setKitNotesDraft('')
    setResult(null)
    setKitSavedForCurrentResult(false)
    toast.info('Cleared kit output')
  }

  function clearLoadedCampaignOutput() {
    setLoadedCampaignId('')
    setSelectedCampaignId('')
    setEditingCampaignId('')
    setCampaignTitleDraft('')
    setCampaignNotesDraft('')
    setCampaigns(null)
    toast.info('Cleared campaign output')
  }

  async function handleDeleteKit() {
    if (!activeKitId) return toast.info('Load a saved kit first.')

    const ok = window.confirm('Delete this saved Identity Kit? This cannot be undone.')
    if (!ok) return

    setDeletingKitId(activeKitId)

    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (userErr || !userData?.user?.id) {
        toast.error('Not logged in — delete blocked')
        return
      }

      const uid = userData.user.id

      const delRes = await supabase
        .from('identity_kits')
        .delete()
        .eq('id', activeKitId)
        .eq('user_id', uid)

      if (delRes.error) {
        console.error('[identity] delete failed', delRes.error)
        toast.error(delRes.error.message || 'Delete failed')
        return
      }

      setKits(prev => prev.filter(k => k.id !== activeKitId))
      setLoadedKitId('')
      setSelectedKitId('')
      setResult(null)
      setKitSavedForCurrentResult(false)

      toast.success('Identity Kit deleted ✅')
    } catch (e: any) {
      console.error('[identity] delete unexpected', e)
      toast.error(e?.message || 'Could not delete Identity Kit')
    } finally {
      setDeletingKitId('')
    }
  }

  async function handleDeleteSavedCampaignRow(rowId: string) {
    const ok = window.confirm('Delete this saved campaign? This cannot be undone.')
    if (!ok) return

    setDeletingCampaignId(rowId)

    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (userErr || !userData?.user?.id) {
        toast.error('Not logged in — delete blocked')
        return
      }

      const uid = userData.user.id

      const delRes = await supabase
        .from('campaign_concepts')
        .delete()
        .eq('id', rowId)
        .eq('user_id', uid)

      if (delRes.error) {
        console.error('[campaign] delete saved row error', delRes.error)
        toast.error(delRes.error.message || 'Delete failed')
        return
      }

      setSavedCampaigns(prev => prev.filter(r => r.id !== rowId))

      if (activeCampaignId === rowId) {
        clearLoadedCampaignOutput()
      }

      toast.success('Saved campaign deleted ✅')
    } catch (e: any) {
      console.error('[campaign] delete saved row exception', e)
      toast.error(e?.message || 'Could not delete campaign')
    } finally {
      setDeletingCampaignId('')
    }
  }

  async function handleDeleteLoadedCampaign() {
    if (!loadedCampaignId) {
      toast.info('Load a saved campaign first.')
      return
    }

    const ok = window.confirm('Delete this loaded campaign? This cannot be undone.')
    if (!ok) return

    const rowId = loadedCampaignId
    setDeletingLoadedCampaign(true)

    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (userErr || !userData?.user?.id) {
        toast.error('Not logged in — delete blocked')
        return
      }

      const uid = userData.user.id

      const delRes = await supabase
        .from('campaign_concepts')
        .delete()
        .eq('id', rowId)
        .eq('user_id', uid)

      if (delRes.error) {
        console.error('[campaign] delete loaded error', delRes.error)
        toast.error(delRes.error.message || 'Delete failed')
        return
      }

      setSavedCampaigns(prev => prev.filter(r => r.id !== rowId))
      clearLoadedCampaignOutput()
      toast.success('Campaign deleted ✅')
    } catch (e: any) {
      console.error('[campaign] delete loaded exception', e)
      toast.error(e?.message || 'Could not delete campaign')
    } finally {
      setDeletingLoadedCampaign(false)
    }
  }

  async function handleDownloadKitPdf() {
  if (!result) return toast.error('Generate first!')
  setDownloadingPdf(true)

  try {
    const [{ buildIdentityKitPdfLines }, { renderWwPdf }] = await Promise.all([
  import('@/lib/exports/identityKitPdf'),
  import('@/lib/pdf.client'),
])

    const pdfLines = buildIdentityKitPdfLines(result, {
      artistName,
      genre,
      audience,
      direction,
      influences,
      brandWords,
    })

    const safeBase = normalizeText(artistName || '').replace(/[^\w\s-]/g, '').trim()
    const base = safeBase ? `${safeBase} identity kit` : 'identity kit'

    await renderWwPdf(pdfLines, base)
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
    const [{ buildCampaignPdfLines }, { renderWwPdf }] = await Promise.all([
      import('@/lib/exports/campaignPdf'),
      import('@/lib/pdf.client'),
    ])

    const lines = buildCampaignPdfLines(
      campaigns,
      { artistName, genre, audience, direction, influences, brandWords },
      { onlyConceptIndex: conceptIndex }
    )

    const conceptName = concept.name || `Concept ${conceptIndex + 1}`
    const base = artistName
      ? `Campaign Concept — ${conceptName} — ${artistName}`
      : `Campaign Concept — ${conceptName}`

    await renderWwPdf(lines, base)
    toast.success('Concept PDF downloaded ✅')
  } catch (e: any) {
    console.error('[campaign-pdf-single]', e)
    toast.error(e?.message || 'Could not generate PDF')
  } finally {
    setDownloadingConceptIndex(null)
  }
}

  async function handleDownloadCampaignPdfAll() {
  if (!campaigns) return toast.error('Generate first!')
  setDownloadingCampaignAllPdf(true)

  try {
    const [{ buildCampaignPdfLines }, { renderWwPdf }] = await Promise.all([
      import('@/lib/exports/campaignPdf'),
      import('@/lib/pdf.client'),
    ])

    const lines = buildCampaignPdfLines(campaigns, {
      artistName,
      genre,
      audience,
      influences,
      brandWords,
    })

    const base = artistName ? `Campaign Pack — ${artistName}` : 'Campaign Pack'

    await renderWwPdf(lines, base, { includeDate: true })
    toast.success('Campaign pack PDF downloaded ✅')
  } catch (e: any) {
    console.error('[campaign-pdf-all]', e)
    toast.error(e?.message || 'Could not generate PDF')
  } finally {
    setDownloadingCampaignAllPdf(false)
  }
}

  const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold ' +
  'h-9 px-4 text-sm md:h-11 md:px-6 ' +
  'bg-ww-violet text-white ' +
  'shadow-[0_0_16px_rgba(186,85,211,0.6)] ' +
  'hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] ' +
  'active:scale-95 transition'

  const outlineBtn =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium ' +
  'h-9 px-4 text-sm md:h-10 md:px-5 ' +
  'border border-white/15 text-white/80 ' +
  'hover:border-ww-violet hover:bg-ww-violet/10 transition'

  const miniOutlineBtn =
  'inline-flex items-center justify-center h-11 w-11 rounded-xl border border-white/10 bg-black/45 text-white/72 hover:text-white hover:border-ww-violet/45 hover:bg-ww-violet/10 transition'
  
const actionIconBtn =
  'group relative inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/55 text-white/70 transition hover:border-ww-violet/60 hover:bg-ww-violet/10 hover:text-white hover:shadow-[0_0_18px_rgba(186,85,211,0.35)] disabled:cursor-not-allowed disabled:opacity-40'

const dangerActionIconBtn =
  'group relative inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black/55 text-white/70 transition hover:border-red-400/60 hover:bg-red-400/10 hover:text-white hover:shadow-[0_0_18px_rgba(248,113,113,0.35)] disabled:cursor-not-allowed disabled:opacity-40'

function ActionTip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute -bottom-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/90 px-3 py-1 text-[11px] text-white/75 opacity-0 shadow-[0_0_16px_rgba(0,0,0,0.45)] transition group-hover:opacity-100">
      {label}
    </span>
  )
}

  const inputClass =
  'w-full rounded-xl bg-black/60 px-3 py-2 text-sm text-white placeholder:text-white/30 ' +
  'border border-white/5 hover:border-white/10 focus:border-ww-violet/40'
  'outline-none transition-all duration-200'

  const labelClass = 'text-xs text-white/55 flex items-center gap-1'

    const panelClass =
    'relative overflow-hidden rounded-[28px] border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.07] via-black/95 to-black shadow-[0_0_24px_rgba(186,85,211,0.10)]'

  const sectionCardClass =
    'rounded-2xl border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.05] via-black to-black p-4 md:p-5 transition hover:border-ww-violet/35 hover:shadow-[0_0_18px_rgba(186,85,211,0.14)]'

  const innerCardClass =
    'rounded-2xl border border-white/10 bg-black/50 backdrop-blur-sm p-4'

  const chipClass = (active: boolean) =>
  `px-3 h-8 rounded-full border text-xs transition active:scale-95 ${
    active
      ? 'border-ww-violet/70 bg-ww-violet/18 text-white shadow-[0_0_10px_rgba(186,85,211,0.28)]'
      : 'border-white/8 bg-black/35 text-white/68 hover:border-ww-violet/40 hover:text-white'
  }`

  const outputInnerCardClass =
  'rounded-2xl border border-white/10 bg-black/45 backdrop-blur-sm p-4'

function isHexColor(value?: string) {
  if (!value) return false
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim())
}

function ColorSwatch({
  value,
  label,
}: {
  value: string
  label?: string
}) {
  const hex = value?.trim?.() || ''
  const isHex = isHexColor(hex)

  return (
    <div className="space-y-2">
      <div
        className="h-14 rounded-xl border border-white/10 shadow-inner"
        style={{
          background: isHex
            ? hex
            : 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
        }}
      />
      <div className="space-y-0.5">
        {label ? (
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">{label}</p>
        ) : null}
        <p className="text-xs text-white/78 break-all">{hex || '—'}</p>
      </div>
    </div>
  )
}

function PaletteGroup({
  title,
  colors,
}: {
  title: string
  colors: string[]
}) {
  if (!colors?.length) return null

  return (
    <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">{title}</p>
      <div className="grid grid-cols-2 gap-3">
        {colors.map((color, i) => (
          <ColorSwatch key={`${title}-${color}-${i}`} value={String(color)} />
        ))}
      </div>
    </div>
  )
}

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
      <div
  className="rounded-2xl border border-ww-violet/15 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent overflow-hidden transition hover:border-ww-violet/30"
  style={{ overflowAnchor: 'none' as any }}
>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            preserveScroll(() => setOpenIdentitySections(prev => ({ ...prev, [id]: !prev[id] })))
          }}
          className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left bg-white/[0.02]"
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

  return (
  <main className="min-h-screen bg-black text-white" style={{ overflowAnchor: 'none' as any }}>
    <Toaster position="top-center" richColors />

    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8" style={{ overflowAnchor: 'none' as any }}>
      <header className="border-b border-white/10 pb-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[13px] tracking-[0.22em] text-ww-violet/80 uppercase">
              <Palette className="w-4 h-4" />
              <span>Identity Kit</span>
            </div>

            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">
              Shape your artist identity
            </h1>

            <p className="mt-3 text-sm md:text-base leading-relaxed text-white/65 max-w-2xl">
              Define your sound, story, audience, and visual direction so every other tool starts
              from the same brand foundation.
            </p>
          </div>

          {mounted && hasAnyProfile ? (
            <button type="button" onClick={applyProfileFromCentral} className={outlineBtn}>
              <Sparkles className="w-4 h-4" />
              Use WW profile
            </button>
          ) : null}
        </div>
      </header>

      <div className="grid gap-6 xl:gap-7 lg:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.15fr)] lg:items-start">
    {/* LEFT PANEL */}
    <section
  className={panelClass + ' p-5 md:p-6 xl:p-7 space-y-5'}
  style={{ overflowAnchor: 'none' as any }}
>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-[220px] w-[380px] -translate-x-1/2 rounded-full bg-ww-violet/10 blur-[80px]" />
      </div>

      <div className="relative flex items-start justify-between gap-4 flex-wrap">
  <div className="max-w-xl">
    <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Input</p>
    <h2 className="mt-1 text-lg md:text-xl font-semibold text-white">Build your brand brief</h2>
    <p className="mt-2 text-sm text-white/62 leading-relaxed">
      Keep this tight and specific. A better brief creates a better identity system, sharper messaging,
      and stronger downstream content.
    </p>
  </div>

        <div className="inline-flex items-center rounded-full border border-white/10 bg-black/60 p-1 shadow-[0_0_16px_rgba(186,85,211,0.10)]">
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

      <div className="relative rounded-2xl border border-ww-violet/20 bg-gradient-to-r from-ww-violet/[0.12] via-ww-violet/[0.05] to-transparent p-4">
  <p className="text-sm font-medium text-white">One connected workflow starts here</p>
  <p className="mt-1 text-xs leading-relaxed text-white/60">
    Identity should feed everything else — ideas, captions, campaigns, and execution. Treat this as the
    source-of-truth layer for the artist.
  </p>
</div>

      <div className="relative rounded-2xl border border-ww-violet/15 bg-black/50 p-4 space-y-3 shadow-[0_0_12px_rgba(186,85,211,0.06)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <BookOpen className="w-4 h-4 text-ww-violet" />
              Reuse a saved kit
            </div>
            <p className="mt-1 text-xs text-white/50">
              Load a previous version and keep refining instead of starting from scratch.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefreshFromLoadedKit}
            disabled={!selectedKitId || submitting}
            className={outlineBtn + ' h-9'}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>
        </div>

        <div className="space-y-1">
          <p className={labelClass}>Load saved kit</p>
          <select
            value={selectedKitId}
            onChange={(e) => {
              const id = e.target.value
              setSelectedKitId(id)
              if (id) handleLoadSavedKit(id)
            }}
            className={inputClass}
          >
            <option value="">Select a saved kit…</option>
            {(selectedKitId
              ? [...kits.filter((k) => k.id === selectedKitId), ...kits.filter((k) => k.id !== selectedKitId)]
              : kits
            ).map((k) => (
              <option key={k.id} value={k.id}>
                {(k.title || k.inputs?.artistName || 'Untitled') + ' — ' + new Date(k.created_at).toLocaleDateString('en-GB')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECTION 1 */}
      <div className={sectionCardClass + ' space-y-4'}>
        <div>
  <div className="h-[2px] w-10 bg-ww-violet/60 rounded-full mb-3" />
  <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">1. Core identity</p>
  <p className="mt-2 text-sm leading-relaxed text-white/66">
    Define who you are, your lane, and the overall feeling of your brand.
  </p>
</div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <p className={labelClass}>
              <User className="w-3 h-3" /> Artist name
            </p>
            <input
              value={artistName}
              onChange={e => setArtistName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-3">
  <div className="space-y-1">
    <p className={labelClass}>Genre</p>
    <input
      value={genre}
      onChange={e => setGenre(e.target.value)}
      className={inputClass}
      placeholder="e.g. UK hip hop, alt R&B, indie pop…"
    />
  </div>

  <div className="space-y-2">
    <button
      type="button"
      onClick={() => setShowGenrePicks(prev => !prev)}
      className="text-xs uppercase tracking-wide text-white/40 hover:text-white transition"
    >
      {showGenrePicks ? 'Hide quick picks' : 'Show quick picks'}
    </button>

    {showGenrePicks && (
      <div className="flex flex-wrap gap-2">
        {genrePresets.map((item: string) => {
          const active = hasCommaTag(genre, item)
          return (
            <button
              key={item}
              type="button"
              onClick={() => setGenre(prev => toggleCommaTag(prev, item))}
              className={chipClass(active)}
            >
              {item}
            </button>
          )
        })}
      </div>
    )}
  </div>
</div>

<div className="space-y-3 md:col-span-2">
  <div className="space-y-1">
    <p className={labelClass}>
      <Sparkles className="w-3 h-3" /> Brand words
    </p>
    <input
      value={brandWords}
      onChange={e => setBrandWords(e.target.value)}
      className={inputClass}
      placeholder="e.g. cinematic, honest, hungry, cosmic…"
    />
  </div>

  <div className="space-y-2">
    <button
      type="button"
      onClick={() => setShowBrandWordPicks(prev => !prev)}
      className="text-xs uppercase tracking-wide text-white/40 hover:text-white transition"
    >
      {showBrandWordPicks ? 'Hide quick picks' : 'Show quick picks'}
    </button>

    {showBrandWordPicks ? (
      <div className="flex flex-wrap gap-2">
        {brandWordPresets.map((word: string) => {
          const active = hasCommaTag(brandWords, word)
          return (
            <button
              key={word}
              type="button"
              onClick={() => setBrandWords(prev => toggleCommaTag(prev, word))}
              className={chipClass(active)}
            >
              {word}
            </button>
          )
        })}
      </div>
    ) : null}
  </div>
</div>
        </div>
      </div>

      {/* SECTION 2 */}
      <div className={sectionCardClass + ' space-y-4'}>
        <div>
          <div className="h-[2px] w-10 bg-ww-violet/60 rounded-full mb-3" />
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">2. Audience and Creative world</p>
          <p className="mt-2 text-sm leading-relaxed text-white/66">
            Clarify who this artist is for and what kind of world the brand should live in.
          </p>
        </div>

        <div className="space-y-3">
  <div className="space-y-1">
    <p className={labelClass}>Audience</p>
    <input
      value={audience}
      onChange={e => setAudience(e.target.value)}
      className={inputClass}
      placeholder="e.g. late-night thinkers, party crowd, emotional listeners…"
    />
  </div>

  <div className="space-y-2">
    <button
      type="button"
      onClick={() => setShowAudiencePicks(prev => !prev)}
      className="text-xs uppercase tracking-wide text-white/40 hover:text-white transition"
    >
      {showAudiencePicks ? 'Hide quick picks' : 'Show quick picks'}
    </button>

    {showAudiencePicks && (
      <div className="flex flex-wrap gap-2">
        {audiencePresets.map((item: string) => {
          const active = hasCommaTag(audience, item)
          return (
            <button
              key={item}
              type="button"
              onClick={() => setAudience(prev => toggleCommaTag(prev, item))}
              className={chipClass(active)}
            >
              {item}
            </button>
          )
        })}
      </div>
    )}
  </div>

  <div className="space-y-3">
  <div className="space-y-1">
    <p className={labelClass}>Creative world</p>
    <input
      value={direction}
      onChange={e => setDirection(e.target.value)}
      className={inputClass}
      placeholder="e.g. late-night city world, surreal dreamscape, raw underground realism…"
    />

<div className="space-y-2">
    <button
      type="button"
      onClick={() => setShowWorldPicks(prev => !prev)}
      className="text-xs uppercase tracking-wide text-white/40 hover:text-white transition"
    >
      {showWorldPicks ? 'Hide quick picks' : 'Show quick picks'}
    </button>

    {showWorldPicks && (
      <div className="flex flex-wrap gap-2">
        {creativeWorldPresets.map((item: string) => {
          const active = hasCommaTag(direction, item)
          return (
            <button
              key={item}
              type="button"
              onClick={() => setDirection(prev => toggleCommaTag(prev, item))}
              className={chipClass(active)}
            >
              {item}
            </button>
          )
        })}
      </div>
    )}
  </div>
</div>
</div>
  </div>
</div>

      {/* SECTION 3 */}
      <div className={sectionCardClass + ' space-y-4'}>
        <div>
          <div className="h-[2px] w-10 bg-ww-violet/60 rounded-full mb-3" />
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">3. Creative references</p>
          <p className="mt-2 text-sm leading-relaxed text-white/66">
            Add influences and reference points so the kit feels more specific and less generic.
          </p>
        </div>

       <div className="space-y-3">
  <div className="space-y-1">
    <p className={labelClass}>
      <Hash className="w-3 h-3" /> Influences
    </p>
    <input
      value={influences}
      onChange={e => setInfluences(e.target.value)}
      className={inputClass}
      placeholder="e.g. Dave, Kendrick, Little Simz…"
    />
  </div>

  <div className="space-y-2">
    <button
      type="button"
      onClick={() => setShowInfluencePicks(prev => !prev)}
      className="text-xs uppercase tracking-wide text-white/40 hover:text-white transition"
    >
      {showInfluencePicks ? 'Hide quick picks' : 'Show quick picks'}
    </button>

    {showInfluencePicks ? (
      <div className="flex flex-wrap gap-2">
        {influencePresets.map((item: string) => {
          const active = hasCommaTag(influences, item)
          return (
            <button
              key={item}
              type="button"
              onClick={() => setInfluences(prev => toggleCommaTag(prev, item))}
              className={chipClass(active)}
            >
              {item}
            </button>
          )
        })}
      </div>
    ) : null}
  </div>
</div>
      </div>

        {freeLimitReached && (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-ww-violet/20 bg-black/60 px-4 py-3 shadow-[0_0_18px_rgba(186,85,211,0.10)]">
    <p className="text-sm text-white/80">
      You’ve used your free Identity Kit preview.
    </p>

    <button
      type="button"
      onClick={() => router.push('/#pricing')}
      className="
        h-9 px-4 rounded-xl
        bg-gradient-to-r from-ww-violet/80 to-ww-violet
        text-white text-sm font-medium
        shadow-[0_0_12px_rgba(186,85,211,0.25)]
        hover:shadow-[0_0_18px_rgba(186,85,211,0.45)]
        hover:scale-[1.02]
        active:scale-[0.98]
        transition-all duration-200
        flex items-center gap-2
      "
    >
      <Sparkles className="w-4 h-4" />
      Upgrade
    </button>
  </div>
)}
      
      
      <div className="pt-1 space-y-2">
        {tab === 'kit' ? (
          <button
  type="button"
  onClick={() => {
  if (freeLimitReached) {
    router.push('/#pricing')
    return
  }

  handleGenerateKit()
}}
  disabled={submitting || freeLimitReached}
  className={primaryBtn + ' w-full justify-center'}
>
  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
  {freeLimitReached
    ? 'Upgrade to Creator to continue'
    : submitting
    ? 'Generating…'
    : 'Generate Identity Kit'}
</button>
        ) : (
          
          <button
  type="button"
  onClick={handleGenerateCampaigns}
  disabled={loadingCampaigns}
  className={primaryBtn + ' w-full justify-center'}
>
  {loadingCampaigns ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
  {campaignLocked
    ? 'Upgrade to Creator for Campaign Concepts'
    : loadingCampaigns
    ? 'Generating…'
    : 'Generate Campaign Concepts'}
</button>
        )}

        <p className="text-[0.75rem] text-white/50 min-h-[20px]">
          {tab === 'kit'
            ? submitting
              ? kitGeneratingMessage
              : 'A clearer brief gives you better brand essence, audience persona, content pillars, and strategy outputs.'
            : loadingCampaigns
            ? campaignGeneratingMessage
            : 'A clearer brief gives you stronger campaign concepts, rollout angles, and creative direction.'}
        </p>
      </div>

      {authExpired && (
        <div className="mt-3 rounded-2xl border border-ww-violet/15 bg-black/55 p-4 shadow-[0_0_12px_rgba(186,85,211,0.06)]">
          <p className="text-xs uppercase tracking-wide text-white/50">Session expired</p>
          <p className="text-sm text-white/80 mt-1">Please log in again to generate.</p>
          <button type="button" onClick={() => window.location.assign('/login')} className={outlineBtn + ' h-9 mt-3'}>
            Go to login
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
{/* RIGHT PANEL */}
<section
  ref={resultRef}
  className="space-y-6 lg:sticky lg:top-6 self-start"
  style={{ overflowAnchor: 'none' as any }}
>
  {tab === 'kit' && submitting ? (
  <div className="rounded-[28px] border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.05] via-black to-black p-5 md:p-6 xl:p-7 space-y-5 shadow-[0_0_20px_rgba(186,85,211,0.10)]">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Output</p>
          <h2 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-white">Identity Kit</h2>
          <p className="mt-1 text-sm text-white/60 max-w-xl">
            Building the system your content, campaigns, and growth will follow.
          </p>
        </div>
      </div>


      <div className="space-y-4">
        {['Core', 'Audience persona', 'Messaging', 'Visual aesthetics'].map((section) => (
          <div
            key={section}
            className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 bg-white/[0.02]">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">{section}</p>
                <p className="text-[0.75rem] text-white/45 mt-1">Generating section...</p>
              </div>
              <ChevronDown className="w-5 h-5 text-white/35" />
            </div>

            <div className="px-4 pb-4 space-y-3 blur-[2px]">
              <div className="h-4 w-1/3 rounded bg-white/10 mt-2" />
              <div className="h-4 w-full rounded bg-white/8" />
              <div className="h-4 w-5/6 rounded bg-white/8" />
              <div className="h-4 w-2/3 rounded bg-white/8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null}

  {!result && !campaigns && !submitting && !loadingCampaigns ? (
  <div className="relative overflow-hidden rounded-[28px] border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.06] via-black to-black p-6 md:p-7 xl:p-8 shadow-[0_0_24px_rgba(186,85,211,0.10)]">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-20 left-1/2 h-[240px] w-[420px] -translate-x-1/2 rounded-full bg-ww-violet/10 blur-[90px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(186,85,211,0.07),transparent_55%)]" />
    </div>

    <div className="relative">
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Output</p>
      <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-white">
  Build your brand foundation here
</h2>
      <p className="mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-white/62">
  Generate an Identity Kit to define your positioning, audience, tone,
visual direction, repeatable content formats, and identity rules from
one consistent artist brief.
</p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
          <p className="text-xs uppercase tracking-wide text-white/45">Identity Kit gives you</p>
          <ul className="mt-3 space-y-2 text-sm text-white/78">
            <li>Brand essence and one-line positioning</li>
            <li>Audience persona and tone of voice</li>
            <li>Visual direction and mood references</li>
            <li>Content pillars and repeatable formats</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
  <p className="text-xs uppercase tracking-wide text-white/45">How it fits the workflow</p>
  <ul className="mt-3 space-y-2 text-sm text-white/78">
    <li>Identity Kit sets the brand foundation</li>
    <li>Idea Factory and Trends turn that into content angles</li>
    <li>Campaigns and Release Strategy can feed Idea Factory for bigger rollout planning</li>
    <li>Captions sharpens messaging from those ideas</li>
    <li>Momentum Board becomes the execution layer</li>
  </ul>
</div>
      </div>

      <div className="mt-6 rounded-2xl border border-ww-violet/15 bg-black/45 p-4">
        <p className="text-xs uppercase tracking-wide text-white/45">Start with the left panel</p>
        <p className="mt-2 text-sm text-white/70 leading-relaxed">
          Fill in your core identity, audience direction, and creative references, then generate
          either a full Identity Kit or campaign concepts from the same brief.
        </p>
      </div>
    </div>
  </div>
) : null}

  {tab === 'campaign' && loadingCampaigns ? (
  <div className="rounded-[28px] border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.05] via-black to-black p-5 md:p-6 xl:p-7 space-y-4 shadow-[0_0_20px_rgba(186,85,211,0.10)]">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wide text-white/50">Output</p>
          <h2 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-white">Campaign Concepts</h2>
          <p className="mt-1 text-sm text-white/60 max-w-xl">
  Campaign directions, rollout hooks, and creative angles shaped from your artist brief.
</p>
          <p className="mt-1 text-sm text-white/60">
            This is what your campaign concepts will look like.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.05] via-black to-black p-4 space-y-3 opacity-90"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="blur-[2px] space-y-2">
                <div className="h-3 w-16 rounded bg-white/10" />
                <div className="h-5 w-32 rounded bg-white/8" />
              </div>
              <div className="h-8 w-14 rounded-full border border-white/10 bg-white/[0.04]" />
            </div>

            <div className="space-y-2 blur-[2px]">
              <div className="h-4 w-full rounded bg-white/8" />
              <div className="h-4 w-5/6 rounded bg-white/8" />
              <div className="h-4 w-3/4 rounded bg-white/8" />
            </div>

            <div className="grid gap-2 md:grid-cols-2 text-[0.75rem]">
              <div className="rounded-xl border border-white/10 bg-black/40 p-3 blur-[2px] space-y-2">
                <div className="h-3 w-20 rounded bg-white/10" />
                <div className="h-3 w-full rounded bg-white/8" />
                <div className="h-3 w-4/5 rounded bg-white/8" />
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-3 blur-[2px] space-y-2">
                <div className="h-3 w-20 rounded bg-white/10" />
                <div className="h-3 w-full rounded bg-white/8" />
                <div className="h-3 w-3/4 rounded bg-white/8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null}

  {result ? (
  <div
    ref={identityCardRef}
    className={
      'relative overflow-hidden rounded-[28px] border bg-gradient-to-br from-ww-violet/[0.08] via-black to-black p-5 md:p-6 xl:p-7 space-y-5 transition-all duration-500 ' +
      (pulseResultGlow || isKitLoaded
        ? 'border-ww-violet/70 shadow-[0_0_36px_rgba(186,85,211,0.30)] -translate-y-[2px]'
        : 'border-ww-violet/20 hover:border-ww-violet/35 hover:shadow-[0_0_24px_rgba(186,85,211,0.14)]')
    }
    style={{ overflowAnchor: 'none' as any }}
  >
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-24 left-1/2 h-[260px] w-[420px] -translate-x-1/2 rounded-full bg-ww-violet/12 blur-[90px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(186,85,211,0.08),transparent_55%)]" />
    </div>

    

    <div className="relative flex flex-col gap-4 border-b border-white/10 pb-5">
  <div className="flex flex-col gap-4">

  {/* Top: title + description */}
  <div>
    <h2 className="text-2xl md:text-3xl font-semibold text-white">
      Identity Kit
    </h2>

    <p className="mt-2 text-sm text-white/70 max-w-xl leading-relaxed">
      Your artist system: positioning, audience psychology, tone, visual world, repeatable formats, and rules.
    </p>
  </div>
{isKitLoaded ? (
  <div className="flex justify-end">
    <div className="flex items-center gap-3">

  {/* Collapse */}
  <button
    type="button"
    className={
      actionIconBtn +
      (!kitSavedForCurrentResult
        ? ' animate-pulse border-ww-violet/60 shadow-[0_0_18px_rgba(186,85,211,0.55)]'
        : '')
    }
    onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      preserveScroll(() => setCollapseIdentityCard((v) => !v))
    }}
  >
    {collapseIdentityCard ? (
      <Maximize2 className="w-4 h-4" />
    ) : (
      <Minimize2 className="w-4 h-4" />
    )}
    <ActionTip label={collapseIdentityCard ? 'Expand' : 'Collapse'} />
  </button>

  {/* Save */}
  <button
    type="button"
    onClick={handleSaveKit}
    disabled={!result || savingKit}
    className={actionIconBtn}
  >
    {savingKit ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <SaveIcon className="w-4 h-4" />
    )}
    <ActionTip label="Save" />
  </button>

  {/* Download */}
  <button
    type="button"
    onClick={handleDownloadKitPdf}
    disabled={!result || downloadingPdf}
    className={actionIconBtn}
  >
    {downloadingPdf ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <Download className="w-4 h-4" />
    )}
    <ActionTip label="Download PDF" />
  </button>

  {/* Edit */}
  {activeKitId && (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        const kit = kits.find((k) => String(k.id) === String(activeKitId))
        if (!kit) return toast.error('Could not find that saved kit.')
        setEditingKitId(String(kit.id))
        setKitTitleDraft(kit.title || '')
        setKitNotesDraft(kit.notes || '')
        setLibraryTab('kits')
        savedSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
      }}
      className={actionIconBtn}
    >
      <Pencil className="w-4 h-4" />
      <ActionTip label="Edit" />
    </button>
  )}

  {/* Delete */}
  <button
    type="button"
    onClick={handleDeleteKit}
    className={dangerActionIconBtn}
  >
    {deletingKitId ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <Trash2 className="w-4 h-4" />
    )}
    <ActionTip label="Delete" />
  </button>
</div>

</div>
) : null}
</div>
</div>

    {!collapseIdentityCard ? (
      <div className="space-y-4">
        <Section id="core" title="Core identity" hint="The internal truth, the external position, and the usable artist summary">
  <div className="space-y-4">
    <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-1">How to use this</p>
      <p className="text-sm text-white/68 leading-relaxed max-w-3xl">
        Brand essence defines the emotional truth of the artist. Positioning explains the lane they occupy.
        The bio translates both into a usable public-facing summary.
      </p>
    </div>

    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-2xl border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.08] via-black/70 to-black/70 p-5 md:col-span-2">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">Brand essence</p>
        <p className="text-white/88 text-base md:text-[1.05rem] leading-relaxed">
          {String(result?.core?.brandEssence || '—')}
        </p>
      </div>

      <div className={outputInnerCardClass}>
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">Positioning</p>
        <p className="text-white/82 text-sm leading-relaxed">
          {String(result?.core?.positioning || '—')}
        </p>
      </div>

      <div className={outputInnerCardClass}>
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">Short bio</p>
        <p className="text-white/78 text-sm whitespace-pre-wrap leading-relaxed">
          {String(result?.core?.bio || '—')}
        </p>
      </div>
    </div>
  </div>
</Section>

        <Section id="audience" title="Audience" hint="Who they are, how they think, and what makes them respond">
  <div className="space-y-4">
    <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-1">How to use this</p>
      <p className="text-sm text-white/68 leading-relaxed max-w-3xl">
        Persona defines who the artist is really speaking to. Psychographics explain how that listener sees the world.
        Emotional triggers show what most reliably creates resonance, reflection, saves, shares, or replies.
      </p>
    </div>

    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-2xl border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.08] via-black/70 to-black/70 p-4 md:col-span-2">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">Persona</p>
        <p className="text-white/86 text-sm md:text-[15px] leading-relaxed">
          {String(result?.audience?.persona || '—')}
        </p>
      </div>

      <div className={outputInnerCardClass}>
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">Psychographics</p>
        <div className="space-y-3">
          {(Array.isArray(result?.audience?.psychographics) ? result.audience.psychographics : []).map(
            (item: any, idx: number) => (
              <div key={idx} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                <p className="text-white/78 text-sm leading-relaxed">{String(item || '—')}</p>
              </div>
            )
          )}
        </div>
      </div>

      <div className={outputInnerCardClass}>
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">Emotional triggers</p>
        <div className="space-y-3">
          {(Array.isArray(result?.audience?.emotionalTriggers) ? result.audience.emotionalTriggers : []).map(
            (item: any, idx: number) => (
              <div key={idx} className="rounded-xl border border-ww-violet/12 bg-ww-violet/[0.04] p-3">
                <p className="text-white/80 text-sm leading-relaxed">{String(item || '—')}</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  </div>
</Section>
{!isFreeIdentityPreview && (
  <>
<Section id="tone" title="Tone of voice" hint="How the brand should sound, what to lean into, and what to avoid">
  <div className="space-y-4">
    <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-1">How to use this</p>
      <p className="text-sm text-white/68 leading-relaxed max-w-3xl">
        Voice description sets the overall character. “Do” defines what the brand should repeatedly sound like.
        “Avoid” protects the artist from drifting into language or energy that breaks the identity.
      </p>
    </div>

    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.08] via-black/70 to-black/70 p-4 md:col-span-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">Voice description</p>
        <p className="text-white/86 text-sm md:text-[15px] leading-relaxed">
          {String(result?.tone?.voiceDescription || '—')}
        </p>
      </div>

      <div className={outputInnerCardClass + ' md:col-span-2'}>
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">Lean into</p>
        <div className="space-y-3">
          {(Array.isArray(result?.tone?.do) ? result.tone.do : []).map((item: any, idx: number) => (
            <div key={idx} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
              <p className="text-white/78 text-sm leading-relaxed">{String(item || '—')}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={outputInnerCardClass}>
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">Avoid</p>
        <div className="space-y-3">
          {(Array.isArray(result?.tone?.dont) ? result.tone.dont : []).map((item: any, idx: number) => (
            <div key={idx} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
              <p className="text-white/72 text-sm leading-relaxed">{String(item || '—')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</Section>

        <Section
  id="visual"
  title="Visual system"
  hint="Palette, lighting, environments, framing, texture, symbolism"
>
  <div className="space-y-4">
    <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-4">Colour palette</p>

      <div className="grid gap-3 md:grid-cols-3">
        <PaletteGroup
          title="Primary"
          colors={Array.isArray(result?.visuals?.colorPalette?.primary) ? result.visuals.colorPalette.primary : []}
        />
        <PaletteGroup
          title="Secondary"
          colors={Array.isArray(result?.visuals?.colorPalette?.secondary) ? result.visuals.colorPalette.secondary : []}
        />
        <PaletteGroup
          title="Accent"
          colors={Array.isArray(result?.visuals?.colorPalette?.accent) ? result.visuals.colorPalette.accent : []}
        />
      </div>
    </div>

    <div className="grid gap-3 md:grid-cols-2">
      <div className={outputInnerCardClass}>
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Lighting</p>
        <p className="text-white/85 mt-3 leading-relaxed">
          {String(result?.visuals?.lighting || '—')}
        </p>
      </div>

      <div className={outputInnerCardClass}>
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Environment</p>
        <BulletList items={Array.isArray(result?.visuals?.environment) ? result.visuals.environment : []} />
      </div>

      <div className={outputInnerCardClass}>
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Framing</p>
        <BulletList items={Array.isArray(result?.visuals?.framing) ? result.visuals.framing : []} />
      </div>

      <div className={outputInnerCardClass}>
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Texture</p>
        <BulletList items={Array.isArray(result?.visuals?.texture) ? result.visuals.texture : []} />
      </div>

      <div className={outputInnerCardClass + ' md:col-span-2'}>
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Symbolism</p>
        <BulletList items={Array.isArray(result?.visuals?.symbolism) ? result.visuals.symbolism : []} />
      </div>
    </div>
  </div>
</Section>

        <Section id="content" title="Content system" hint="Pillars and repeatable containers for showing up consistently">
  <div className="space-y-4">
    <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-1">How to use this</p>
      <p className="text-sm text-white/68 leading-relaxed max-w-3xl">
        Pillars define the recurring themes your brand keeps returning to.
        Formats define the repeatable containers that deliver those themes in a recognisable way.
      </p>
    </div>

    <div className="grid gap-3 xl:grid-cols-[0.95fr,1.05fr]">
      <div className={outputInnerCardClass}>
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">Content pillars</p>

        <div className="space-y-3">
          {(Array.isArray(result?.content?.pillars) ? result.content.pillars : []).map((pillar: any, idx: number) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ww-violet/25 bg-ww-violet/10 text-[11px] font-medium text-ww-violet">
                  {idx + 1}
                </div>

                <div className="min-w-0">
                  <p className="text-white/92 font-medium leading-snug">
                    {String(pillar?.name || `Pillar ${idx + 1}`)}
                  </p>
                  <p className="text-white/65 mt-2 text-sm leading-relaxed">
                    {String(pillar?.purpose || '—')}
                  </p>
                </div>
              
              </div>
            </div>
          ))}
        </div>      
      </div>

      <div className={outputInnerCardClass}>
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">Repeatable formats</p>

        <div className="space-y-3">
          {(Array.isArray(result?.content?.formats) ? result.content.formats : []).map((format: any, idx: number) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white/92 font-medium leading-snug">
                    {String(format?.name || `Format ${idx + 1}`)}
                  </p>

                  {format?.type ? (
                    <p className="text-white/50 mt-1 text-[11px] uppercase tracking-[0.14em]">
                      {String(format.type)}
                    </p>
                  ) : null}
                </div>

                <div className="inline-flex items-center rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/50 shrink-0">
                  Format {idx + 1}
                </div>
              </div>

              {format?.structure ? (
                <div className="rounded-xl border border-white/8 bg-black/35 p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/42 mb-2">Structure</p>
                  <p className="text-white/72 text-sm leading-relaxed">
                    {String(format.structure)}
                  </p>
                </div>
              ) : null}

              {format?.emotionalGoal ? (
                <div className="rounded-xl border border-ww-violet/15 bg-ww-violet/[0.05] p-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/42 mb-2">Emotional goal</p>
                  <p className="text-white/76 text-sm leading-relaxed">
                    {String(format.emotionalGoal)}
                  </p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</Section>

        <Section id="rules" title="Identity rules" hint="Constraints that keep the brand coherent across every output">
  <div className="space-y-4">
    <div className="rounded-2xl border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.08] via-black/70 to-black/70 p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-1">How to use this</p>
      <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
        These are not loose suggestions. They are the rules that should shape visuals, captions,
        videos, creative choices, and downstream tool outputs.
      </p>
    </div>

    <div className="grid gap-3">
      {(Array.isArray(result?.identityRules) ? result.identityRules : []).map((rule: any, idx: number) => (
        <div
          key={idx}
          className="rounded-2xl border border-white/10 bg-black/45 p-4 transition hover:border-ww-violet/30"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ww-violet/25 bg-ww-violet/10 text-[11px] font-semibold text-ww-violet">
              {idx + 1}
            </div>

            <div className="min-w-0">
              <p className="text-white/84 text-sm md:text-[15px] leading-relaxed">
                {String(rule || '—')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</Section>

<div className="mt-6 rounded-2xl border border-ww-violet/20 bg-black/50 p-4 flex items-center justify-between gap-4">
  <div>
    <p className="text-sm text-white/80 font-medium">
      Turn this into content ideas
    </p>
    <p className="text-xs text-white/50 mt-1">
      Use your identity to generate platform-ready content angles
    </p>
  </div>

  <button
    type="button"
    onClick={() => {
      const params = new URLSearchParams({
        from: 'identity',
        brandEssence: String(result?.core?.brandEssence || ''),
        positioning: String(result?.core?.positioning || ''),
        audience: String(result?.audience?.persona || ''),
        tone: String(result?.tone?.voiceDescription || ''),
        creativeWorld: direction || '',
      })

      router.push(`/calendar?${params.toString()}`)
    }}
    className="px-4 py-2 rounded-xl bg-ww-violet text-black text-sm font-medium hover:opacity-90 transition"
  >
    Go to Idea Factory
  </button>
</div>
 </>
)}
      </div>
    ) : null}
  </div>
) : null} 

  {campaigns ? (
    <div
      ref={campaignCardRef}
      className={
        'relative overflow-hidden rounded-[28px] border bg-gradient-to-br from-ww-violet/[0.06] via-black to-black p-5 md:p-6 xl:p-7 space-y-4 transition-all duration-500 ' +
        (pulseCampaignGlow || isCampaignLoaded
          ? 'border-ww-violet/75 shadow-[0_0_32px_rgba(186,85,211,0.28)] -translate-y-[2px]'
          : 'border-ww-violet/20 hover:border-ww-violet/35 hover:shadow-[0_0_22px_rgba(186,85,211,0.12)]')
      }
      style={{ overflowAnchor: 'none' as any }}
    >

      <div className="relative flex flex-col gap-4 border-b border-white/10 pb-5">
  <div className="flex items-start justify-between gap-4">
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Output</p>
      <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-white">
        Campaign Concepts
      </h2>
      <p className="mt-2 max-w-2xl text-sm md:text-base leading-relaxed text-white/62">
        Strategic campaign directions shaped from your artist brief — designed to give you
        clearer rollout angles before turning them into actual content in Idea Factory.
      </p>
    </div>

    {isCampaignLoaded ? (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          clearLoadedCampaignOutput()
        }}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white/60 hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/5 transition shrink-0"
        title="Clear output"
      >
        <X className="w-4 h-4" />
      </button>
    ) : null}
  </div>

  <div className="flex flex-wrap items-center justify-end gap-3">

  {/* Collapse */}
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      preserveScroll(() => setCollapseCampaignCard((v) => !v))
    }}
    className={actionIconBtn}
  >
    {collapseCampaignCard ? (
      <Maximize2 className="w-4 h-4" />
    ) : (
      <Minimize2 className="w-4 h-4" />
    )}
    <ActionTip label={collapseCampaignCard ? 'Expand' : 'Collapse'} />
  </button>

  {/* Save */}
  <button
    type="button"
    onClick={handleSaveCampaigns}
    disabled={!campaigns || savingCampaigns}
    className={actionIconBtn}
  >
    {savingCampaigns ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <SaveIcon className="w-4 h-4" />
    )}
    <ActionTip label="Save" />
  </button>

  {/* Download */}
  <button
    type="button"
    onClick={handleDownloadCampaignPdfAll}
    disabled={!campaigns || downloadingCampaignAllPdf}
    className={actionIconBtn}
  >
    {downloadingCampaignAllPdf ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <Download className="w-4 h-4" />
    )}
    <ActionTip label="Download PDF" />
  </button>

  {/* Edit */}
  {activeCampaignId && (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        const row = savedCampaigns.find((c) => String(c.id) === String(activeCampaignId))
        if (!row) return toast.error('Could not find that saved campaign.')
        setEditingCampaignId(String(row.id))
        setCampaignTitleDraft(row.title || '')
        setCampaignNotesDraft(row.notes || '')
        setLibraryTab('campaigns')
        savedSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
      }}
      className={actionIconBtn}
    >
      <Pencil className="w-4 h-4" />
      <ActionTip label="Edit" />
    </button>
  )}

  {/* Delete */}
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      handleDeleteLoadedCampaign()
    }}
    className={dangerActionIconBtn}
  >
    {deletingLoadedCampaign ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <Trash2 className="w-4 h-4" />
    )}
    <ActionTip label="Delete" />
  </button>
</div>


        <div className="flex-1" />
      </div>

      {!collapseCampaignCard ? (
        <div className="space-y-4">
          <div className="space-y-4">
  {(campaigns.concepts || []).map((c, idx) => (
    <div
      key={idx}
      className="rounded-[24px] border border-ww-violet/18 bg-gradient-to-br from-ww-violet/[0.05] via-black to-black p-4 md:p-5 space-y-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
            Campaign concept {idx + 1}
          </p>
          <h3 className="mt-1 text-lg md:text-xl font-semibold text-white tracking-tight">
            {c.name || `Concept ${idx + 1}`}
          </h3>
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
        <div className="rounded-2xl border border-ww-violet/20 bg-ww-violet/[0.06] p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-2">Hook</p>
          <p className="text-white/84 text-sm md:text-[15px] leading-relaxed">
            {c.hook}
          </p>
        </div>
      ) : null}

      {c.synopsis ? (
        <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-2">Core idea</p>
          <p className="text-white/74 text-sm leading-relaxed whitespace-pre-wrap">
            {c.synopsis}
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">Deliverables</p>
          {Array.isArray(c.deliverables) && c.deliverables.length ? (
            <div className="space-y-2">
              {c.deliverables.slice(0, 8).map((item: string, i: number) => (
                <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2">
                  <p className="text-sm text-white/78 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/45">—</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">Caption tones</p>
          {Array.isArray(c.caption_tones) && c.caption_tones.length ? (
            <div className="flex flex-wrap gap-2">
              {c.caption_tones.slice(0, 8).map((item: string, i: number) => (
                <div
                  key={i}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/72"
                >
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/45">—</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-2">Best next step</p>
        <p className="text-sm text-white/72 leading-relaxed">
          If this is the direction you want to pursue, turn it into concrete post ideas in Idea Factory.
        </p>
      </div>
    </div>
  ))}
</div>

<div className="mt-6 rounded-2xl border border-ww-violet/20 bg-black/50 p-4 flex items-center justify-between gap-4">
  <div>
    <p className="text-sm text-white/80 font-medium">
      Turn this into content ideas
    </p>
    <p className="text-xs text-white/50 mt-1">
      Use this campaign direction to generate platform-ready content angles
    </p>
  </div>

  <button
    type="button"
    onClick={() => {
      const firstConcept = campaigns?.concepts?.[0]

      const params = new URLSearchParams({
        from: 'campaign',
        campaignName: String(firstConcept?.name || ''),
        campaignHook: String(firstConcept?.hook || ''),
        campaignSynopsis: String(firstConcept?.synopsis || ''),
        artistName: artistName || '',
      })

      router.push(`/calendar?${params.toString()}`)
    }}
    className="px-4 py-2 rounded-xl bg-ww-violet text-black text-sm font-medium hover:opacity-90 transition"
  >
    Go to Idea Factory
  </button>
</div>

        </div>
      ) : null}
    </div>
  ) : null}

  {(kits.length > 0 || savedCampaigns.length > 0) && (
    <div
      ref={savedSectionRef}
      className="rounded-[28px] border border-white/10 bg-black/55 p-5 md:p-6 xl:p-7 mt-6"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/50">Library</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Saved Items</h2>
          <p className="text-sm text-white/60 mt-1">
            Load, edit, and manage your saved kits + campaigns.
          </p>
        </div>

        <div className="inline-flex items-center rounded-full border border-white/10 bg-black/60 p-1">
          <button
            type="button"
            onClick={() => setLibraryTab('kits')}
            className={`px-4 h-9 rounded-full text-sm font-medium transition-all ${
              libraryTab === 'kits'
                ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.6)]'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Kits ({kits.length})
          </button>

          <button
            type="button"
            onClick={() => setLibraryTab('campaigns')}
            className={`px-4 h-9 rounded-full text-sm font-medium transition-all ${
              libraryTab === 'campaigns'
                ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.6)]'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Campaigns ({savedCampaigns.length})
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {libraryTab === 'kits' ? (
          kits.length ? (
            kits.map((kit) => {
              const isLoaded = kit.id === loadedKitId
              const isEditing = String(editingKitId) === String(kit.id)
              const displayTitle = kit.title || kit.inputs?.artistName || 'Untitled'
              const dateLabel = new Date(kit.created_at).toLocaleDateString('en-GB')

              return (
                <div
                  key={kit.id}
                  className={
                    'rounded-2xl border bg-black/45 p-4 transition ' +
                    (isLoaded
                      ? 'border-ww-violet/75 shadow-[0_0_18px_rgba(186,85,211,0.24)]'
                      : 'border-white/8 hover:border-ww-violet/25 hover:shadow-[0_0_12px_rgba(186,85,211,0.08)]')
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

                  {kit.notes ? (
                    <p className="text-white/60 text-xs mt-1 line-clamp-2">{kit.notes}</p>
                  ) : null}

                  <p className="text-white/70 text-sm mt-2 line-clamp-2">
                    {kit.result?.brand_essence || '—'}
                  </p>

                  {!isEditing ? (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          handleLoadSavedKit(kit.id)
                          setLoadedCampaignId('')
                          setLibraryTab('kits')
                        }}
                        className={outlineBtn + ' h-9'}
                      >
                        Load <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setEditingKitId(String(kit.id))
                          setKitTitleDraft(kit.title || '')
                          setKitNotesDraft(kit.notes || '')
                        }}
                        className={miniOutlineBtn}
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setLoadedKitId(String(kit.id))
                          setSelectedKitId(String(kit.id))
                          handleDeleteKit()
                        }}
                        className={miniOutlineBtn + ' border-red-500/40 hover:border-red-400 hover:bg-red-500/10'}
                      >
                        {deletingKitId === String(kit.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="w-full space-y-2 mt-3">
                      <input
                        className={inputClass}
                        value={kitTitleDraft}
                        onChange={(e) => setKitTitleDraft(e.target.value)}
                        placeholder="Title..."
                      />
                      <textarea
                        className={inputClass}
                        value={kitNotesDraft}
                        onChange={(e) => setKitNotesDraft(e.target.value)}
                        rows={3}
                        placeholder="Notes..."
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveKitMeta(String(kit.id))}
                          className={miniOutlineBtn}
                        >
                          <Check className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingKitId('')
                            setKitTitleDraft('')
                            setKitNotesDraft('')
                          }}
                          className={miniOutlineBtn}
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
          ) : (
            <div className="text-white/60 text-sm">No saved kits yet.</div>
          )
        ) : savedCampaigns.length ? (
          savedCampaigns.map((row) => {
            const isLoaded = row.id === loadedCampaignId
            const isEditing = String(editingCampaignId) === String(row.id)
            const displayTitle = row.title || row.inputs?.artistName || 'Untitled campaign'
            const dateLabel = new Date(row.created_at).toLocaleDateString('en-GB')

            return (
              <div
                key={row.id}
                className={
                  'rounded-2xl border bg-black/45 p-4 transition ' +
                  (isLoaded
                    ? 'border-ww-violet/75 shadow-[0_0_18px_rgba(186,85,211,0.24)]'
                    :'border-white/8 hover:border-ww-violet/25 hover:shadow-[0_0_12px_rgba(186,85,211,0.08)]')
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

                {row.notes ? (
                  <p className="text-white/60 text-xs mt-1 line-clamp-2">{row.notes}</p>
                ) : null}

                <p className="text-white/70 text-sm mt-2 line-clamp-2">
                  {(() => {
                    const normalized = normalizeCampaignPayload(row.concepts)
                    return normalized.concepts?.[0]?.hook || '—'
                  })()}
                </p>

                {!isEditing ? (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        handleLoadSavedCampaign(row.id)
                        setLoadedKitId('')
                        setLibraryTab('campaigns')
                      }}
                      className={outlineBtn + ' h-9'}
                    >
                      Load <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setEditingCampaignId(String(row.id))
                        setCampaignTitleDraft(row.title || '')
                        setCampaignNotesDraft(row.notes || '')
                      }}
                      className={miniOutlineBtn}
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteSavedCampaignRow(String(row.id))
                      }}
                      className={miniOutlineBtn + ' border-red-500/40 hover:border-red-400 hover:bg-red-500/10'}
                    >
                      {deletingCampaignId === String(row.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="w-full space-y-2 mt-3">
                    <input
                      className={inputClass}
                      value={campaignTitleDraft}
                      onChange={(e) => setCampaignTitleDraft(e.target.value)}
                      placeholder="Campaign title..."
                    />
                    <textarea
                      className={inputClass}
                      value={campaignNotesDraft}
                      onChange={(e) => setCampaignNotesDraft(e.target.value)}
                      rows={3}
                      placeholder="Notes..."
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveCampaignMeta(String(row.id))}
                        className={miniOutlineBtn}
                      >
                        <Check className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCampaignId('')
                          setCampaignTitleDraft('')
                          setCampaignNotesDraft('')
                        }}
                        className={miniOutlineBtn}
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
        ) : (
          <div className="text-white/60 text-sm">No saved campaigns yet.</div>
        )}
      </div>
    </div>
  )}
</section>
)

      </div>
    </section>
  </main>
  )
}