// src/app/identity/page.tsx
'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Toaster, toast } from 'sonner'
import { useWwProfile } from '@/hooks/useWwProfile'
import { effectiveTier, getUsage } from '@/lib/wwProfile'
import { useRouter } from 'next/navigation'

import * as identityKitPdf from '@/lib/exports/identityKitPdf'
import { buildCampaignPdfLines } from '@/lib/exports/campaignPdf'
import { normalizeText, renderWwPdf } from '@/lib/wwPdf'

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
  const [libraryTab, setLibraryTab] = useState<'kits' | 'campaigns'>('kits')

  const [artistName, setArtistName] = useState('')
  const [genre, setGenre] = useState('')
  const [audience, setAudience] = useState('')
  const [goal, setGoal] = useState('')
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

  const [identityFreeLimitReached, setIdentityFreeLimitReached] = useState(false)
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

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const tier = effectiveTier(profile)
  const usage = useMemo(() => (mounted ? getUsage(profile) : {}), [mounted, profile])
  const usedIdentityGenerations = Number((usage as any).identity_generate_uses || 0)
  const identityLocked = mounted && tier === 'free' && usedIdentityGenerations >= 1

  const resultRef = useRef<HTMLDivElement | null>(null)
  const identityCardRef = useRef<HTMLDivElement | null>(null)
  const campaignCardRef = useRef<HTMLDivElement | null>(null)
  const savedSectionRef = useRef<HTMLDivElement | null>(null)

  const [collapseIdentityCard, setCollapseIdentityCard] = useState(false)
  const [collapseCampaignCard, setCollapseCampaignCard] = useState(false)

  const brandWordPresets: string[] = [
  'cinematic',
  'honest',
  'raw',
  'reflective',
  'dark',
  'dreamy',
  'hungry',
  'futuristic',
  'emotional',
  'bold',
  'gritty',
  'spiritual',
]

const influencePresets: string[] = [
  'Dave',
  'Kendrick',
  'Drake',
  'The Weeknd',
  'Travis Scott',
  'J. Cole',
  'Frank Ocean',
  'Loyle Carner',
  'anime soundtracks',
  'film scores',
  'UK rap',
  'alt R&B',
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
    if (profile.goal && !goal) setGoal(profile.goal)
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
    applyTo({ setArtistName, setGenre, setAudience, setGoal })
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
        inputs: { artistName, genre, influences, brandWords, audience, goal },
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
    void save({ artistName, genre, audience, goal })
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

      let response = await fetch('/api/identity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ artistName, genre, influences, brandWords, audience, goal }),
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
          body: JSON.stringify({ artistName, genre, influences, brandWords, audience, goal }),
        })
      }

      const data = await response.json().catch(() => ({}))

      if (response.status === 429 && data?.error === 'FREE_LIMIT') {
        if (tier === 'free') {
          setIdentityFreeLimitReached(true)
          toast.error(data?.message || 'Free plan limit reached')
          return
        }
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
      setKitSavedForCurrentResult(false)

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
    setGoal(inp.goal || '')
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
    setGoal(inp.goal || goal)
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
        inputs: { artistName, genre, influences, brandWords, audience, goal },
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
        inputs: { artistName, genre, influences, brandWords, audience, goal },
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
      const base = artistName ? `Campaign Concept — ${conceptName} — ${artistName}` : `Campaign Concept — ${conceptName}`

      renderWwPdf(lines, base)
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

  return (
    <main className="min-h-screen bg-black text-white" style={{ overflowAnchor: 'none' as any }}>
      <Toaster position="top-center" richColors />

      <section className="mx-auto max-w-6xl px-4 py-8 space-y-6" style={{ overflowAnchor: 'none' as any }}>
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

        <div className="mx-auto w-full max-w-[52rem]">
  <section
    className="rounded-3xl border border-white/10 bg-black/80 p-5 md:p-7 space-y-5"
    style={{ overflowAnchor: 'none' as any }}
  >
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <p className="text-xs uppercase tracking-wide text-white/50">Setup</p>
      </div>

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

    <div className="rounded-2xl border border-ww-violet/20 bg-ww-violet/5 p-4">
      <p className="text-sm text-white font-medium">
        Build the foundation of your artist brand
      </p>
      <p className="text-xs text-white/60 mt-1">
        The stronger this brief is, the sharper your identity, messaging, visual direction, and content strategy will be.
      </p>
    </div>

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
              {(k.title || k.inputs?.artistName || 'Untitled') + ' — ' + new Date(k.created_at).toLocaleDateString('en-GB')}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* SECTION 1 */}
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-white/40">1. Core identity</p>
        <p className="text-sm text-white/70 mt-1">
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
    <p className="text-xs uppercase tracking-wide text-white/40">Quick picks</p>
    <div className="flex flex-wrap gap-2">
     {brandWordPresets.map((word: string) => {
        const active = hasCommaTag(brandWords, word)
        return (
          <button
            key={word}
            type="button"
            onClick={() => setBrandWords(prev => toggleCommaTag(prev, word))}
            className={`px-3 h-8 rounded-full border text-xs transition active:scale-95 ${
              active
                ? 'border-ww-violet bg-ww-violet/20 text-white shadow-[0_0_14px_rgba(186,85,211,0.45)]'
                : 'border-white/10 text-white/70 hover:border-ww-violet/70 hover:text-white'
            }`}
          >
            {word}
          </button>
        )
      })}
    </div>
  </div>
</div>
      </div>
    </div>

    {/* SECTION 2 */}
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-white/40">2. Audience and direction</p>
        <p className="text-sm text-white/70 mt-1">
          Clarify who you’re speaking to and what this brand should achieve.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <p className={labelClass}>
            <Target className="w-3 h-3" /> Audience
          </p>
          <textarea
            value={audience}
            onChange={e => setAudience(e.target.value)}
            className={inputClass}
            rows={3}
            placeholder="Who are you really speaking to? What kind of person is most likely to connect with your music?"
          />
        </div>

        <div className="space-y-1">
          <p className={labelClass}>
            <Target className="w-3 h-3" /> Main goal (30–90 days)
          </p>
          <textarea
            value={goal}
            onChange={e => setGoal(e.target.value)}
            className={inputClass}
            rows={3}
            placeholder="What do you want your brand and content to achieve over the next few months?"
          />
        </div>
      </div>
    </div>

    {/* SECTION 3 */}
<div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
  <div>
    <p className="text-xs uppercase tracking-wide text-white/40">3. Creative references</p>
    <p className="text-sm text-white/70 mt-1">
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
        placeholder="e.g. Dave, Kendrick, anime soundtracks…"
      />
    </div>

    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-white/40">Quick picks</p>
      <div className="flex flex-wrap gap-2">
        {influencePresets.map((item: string) => {
          const active = hasCommaTag(influences, item)
          return (
            <button
              key={item}
              type="button"
              onClick={() => setInfluences(prev => toggleCommaTag(prev, item))}
              className={`px-3 h-8 rounded-full border text-xs transition active:scale-95 ${
                active
                  ? 'border-ww-violet bg-ww-violet/20 text-white shadow-[0_0_14px_rgba(186,85,211,0.45)]'
                  : 'border-white/10 text-white/70 hover:border-ww-violet/70 hover:text-white'
              }`}
            >
              {item}
            </button>
          )
        })}
      </div>
    </div>
  </div>
</div>

    {identityFreeLimitReached && (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <p className="text-sm text-white/80">You’ve used your 1 free Identity Kit generation.</p>
        <button type="button" onClick={() => router.push('/pricing')} className={outlineBtn + ' h-9'}>
          Upgrade
        </button>
      </div>
    )}

    <div className="pt-1 space-y-2">
      {tab === 'kit' ? (
        <button
          type="button"
          onClick={handleGenerateKit}
          disabled={submitting || identityLocked}
          className={primaryBtn + ' w-full justify-center'}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {submitting ? 'Generating…' : 'Generate Identity Kit'}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleGenerateCampaigns}
          disabled={loadingCampaigns}
          className={primaryBtn + ' w-full justify-center'}
        >
          {loadingCampaigns ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
          {loadingCampaigns ? 'Generating…' : 'Generate Campaign Concepts'}
        </button>
      )}

      <p className="text-[0.75rem] text-white/50">
        A clearer brief gives you better brand essence, audience persona, content pillars, and strategy outputs.
      </p>
    </div>
  </section>
</div>

        {authExpired && (
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">Session expired</p>
            <p className="text-sm text-white/80 mt-1">Please log in again to generate.</p>
            <button type="button" onClick={() => window.location.assign('/login')} className={outlineBtn + ' h-9 mt-3'}>
              Go to login
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <section ref={resultRef} className="space-y-6 pb-16" style={{ overflowAnchor: 'none' as any }}>
          {result && (
            <div
              ref={identityCardRef}
              className={
  'relative rounded-3xl border bg-black/80 p-5 md:p-6 space-y-4 transition-all duration-500 ' +
  (pulseResultGlow || isKitLoaded
    ? 'border-ww-violet/80 shadow-[0_0_30px_rgba(186,85,211,0.65)] -translate-y-[2px]'
    : 'border-white/10 hover:border-white/20')
}
              style={{ overflowAnchor: 'none' as any }}
            >
              {isKitLoaded ? (
                <button
  type="button"
  onClick={(e) => {
    e.preventDefault()
    e.stopPropagation()
    clearLoadedKitOutput()
  }}
  className="absolute top-2.5 [inset-inline-end:0.6rem] inline-flex items-center justify-center w-5 h-5 rounded-full text-white/60 hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/5 transition z-10"
  title="Clear output"
>
  <X className="w-3 h-3" />
</button>
              ) : null}

              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-white/50">Output</p>
                  <h2 className="text-lg font-semibold mt-1 text-ww-violet">Identity Kit</h2>
                </div>

                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <button
                      type="button"
                      className={
                        miniOutlineBtn +
                        (!kitSavedForCurrentResult ? ' animate-pulse border-ww-violet/60 shadow-[0_0_18px_rgba(186,85,211,0.55)]' : '')
                      }
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        preserveScroll(() => setCollapseIdentityCard(v => !v))
                      }}
                    >
                      {collapseIdentityCard ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>

                    <button type="button" onClick={handleSaveKit} disabled={!result || savingKit} className={miniOutlineBtn}>
                      {savingKit ? <Loader2 className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}
                    </button>

                    <button type="button" onClick={handleDownloadKitPdf} disabled={!result || downloadingPdf} className={miniOutlineBtn}>
                      {downloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    </button>

                    {activeKitId ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const kit = kits.find(k => String(k.id) === String(activeKitId))
                          if (!kit) return toast.error('Could not find that saved kit.')
                          setEditingKitId(String(kit.id))
                          setKitTitleDraft(kit.title || '')
                          setKitNotesDraft(kit.notes || '')
                          setLibraryTab('kits')
                          savedSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }}
                        className={miniOutlineBtn}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleDeleteKit}
                      className={miniOutlineBtn + ' border-red-500/40 hover:border-red-400 hover:bg-red-500/10'}
                    >
                      {deletingKitId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex-1" />
              </div>

              {!collapseIdentityCard ? (
                <div className="space-y-4">
                  <Section id="core" title="Core" hint="Essence, positioning, bio, archetype">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-4 md:col-span-2">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs uppercase tracking-wide text-white/50">Brand essence</p>
                          <button type="button" className={miniOutlineBtn} onClick={() => copyText('Brand essence', String(result?.brand_essence || ''))}>
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
                          <button type="button" className={miniOutlineBtn} onClick={() => copyText('Short bio', String(result?.bio_short || ''))}>
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

          {campaigns && (
            <div
              ref={campaignCardRef}
              className={
  'relative rounded-3xl border bg-black/80 p-5 md:p-6 space-y-4 transition-all duration-500 ' +
  (pulseCampaignGlow || isCampaignLoaded
    ? 'border-ww-violet/80 shadow-[0_0_30px_rgba(186,85,211,0.65)] -translate-y-[2px]'
    : 'border-white/10 hover:border-white/20')
}
              style={{ overflowAnchor: 'none' as any }}
            >
              {isCampaignLoaded ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    clearLoadedCampaignOutput()
                  }}
                  className="absolute top-2.5 [inset-inline-end:0.6rem] inline-flex items-center justify-center w-5 h-5 rounded-full text-white/60 hover:text-white border border-white/10 hover:border-white/30 hover:bg-white/5 transition"
                  title="Clear output"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : null}

              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-white/50">Output</p>
                  <h2 className="text-lg font-semibold mt-1 text-ww-violet">Campaign concepts</h2>
                </div>

                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <button
                      type="button"
                      className={
                        miniOutlineBtn +
                        (isCampaignLoaded ? ' animate-pulse border-ww-violet/60 shadow-[0_0_18px_rgba(186,85,211,0.55)]' : '')
                      }
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        preserveScroll(() => setCollapseCampaignCard(v => !v))
                      }}
                    >
                      {collapseCampaignCard ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>

                    <button type="button" onClick={handleSaveCampaigns} disabled={!campaigns || savingCampaigns} className={miniOutlineBtn}>
                      {savingCampaigns ? <Loader2 className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadCampaignPdfAll}
                      disabled={!campaigns || downloadingCampaignAllPdf}
                      className={miniOutlineBtn}
                    >
                      {downloadingCampaignAllPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    </button>

                    {activeCampaignId ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const row = savedCampaigns.find(c => String(c.id) === String(activeCampaignId))
                          if (!row) return toast.error('Could not find that saved campaign.')
                          setEditingCampaignId(String(row.id))
                          setCampaignTitleDraft(row.title || '')
                          setCampaignNotesDraft(row.notes || '')
                          setLibraryTab('campaigns')
                          savedSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }}
                        className={miniOutlineBtn}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteLoadedCampaign()
                      }}
                      className={miniOutlineBtn + ' border-red-500/40 hover:border-red-400 hover:bg-red-500/10'}
                    >
                      {deletingLoadedCampaign ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex-1" />
              </div>

              {!collapseCampaignCard ? (
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
              ) : null}
            </div>
          )}

          {(kits.length > 0 || savedCampaigns.length > 0) && (
            <div ref={savedSectionRef} className="rounded-3xl border border-white/10 bg-black/80 p-5 md:p-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">Library</p>
                  <h2 className="text-lg font-semibold text-ww-violet mt-1">Saved items</h2>
                  <p className="text-sm text-white/60 mt-1">Load, edit, and manage your saved kits + campaigns.</p>
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
                {libraryTab === 'kits' &&
                  (kits.length ? (
                    kits.map(kit => {
                      const isLoaded = kit.id === loadedKitId
                      const isEditing = String(editingKitId) === String(kit.id)
                      const displayTitle = kit.title || kit.inputs?.artistName || 'Untitled'
                      const dateLabel = new Date(kit.created_at).toLocaleDateString('en-GB')

                      return (
                        <div
                          key={kit.id}
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
                                {deletingKitId === String(kit.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </button>
                            </div>
                          ) : (
                            <div className="w-full space-y-2 mt-3">
                              <input className={inputClass} value={kitTitleDraft} onChange={e => setKitTitleDraft(e.target.value)} placeholder="Title…" />
                              <textarea
                                className={inputClass}
                                value={kitNotesDraft}
                                onChange={e => setKitNotesDraft(e.target.value)}
                                rows={3}
                                placeholder="Notes…"
                              />
                              <div className="flex gap-2">
                                <button type="button" onClick={() => saveKitMeta(String(kit.id))} className={miniOutlineBtn}>
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
                  ))}

                {libraryTab === 'campaigns' &&
                  (savedCampaigns.length ? (
                    savedCampaigns.map(row => {
                      const isLoaded = row.id === loadedCampaignId
                      const isEditing = String(editingCampaignId) === String(row.id)
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
                              {isLoaded ? (
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
                                {deletingCampaignId === String(row.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </button>
                            </div>
                          ) : (
                            <div className="w-full space-y-2 mt-3">
                              <input
                                className={inputClass}
                                value={campaignTitleDraft}
                                onChange={e => setCampaignTitleDraft(e.target.value)}
                                placeholder="Campaign title…"
                              />
                              <textarea
                                className={inputClass}
                                value={campaignNotesDraft}
                                onChange={e => setCampaignNotesDraft(e.target.value)}
                                rows={3}
                                placeholder="Notes…"
                              />
                              <div className="flex gap-2">
                                <button type="button" onClick={() => saveCampaignMeta(String(row.id))} className={miniOutlineBtn}>
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
                  ))}
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}