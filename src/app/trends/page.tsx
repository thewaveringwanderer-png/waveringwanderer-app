'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Toaster, toast } from 'sonner'
import {
  Sparkles,
  Radar,
  Target,
  Activity,
  Film,
  Loader2,
  Instagram,
  Music2,
  Video,
  Radio,
  Save,
  Send,
  FolderOpen,
  Trash2,
} from 'lucide-react'

import { useWwProfile } from '@/hooks/useWwProfile'

// ---------- Supabase ----------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ---------- Types ----------
type TrendIdea = {
  name: string
  type?: string
  fit_score?: number
  description?: string
  why_it_fits?: string
  hook_template?: string
  suggested_visuals?: string
  caption_angle?: string
  hashtags?: {
    core?: string[]
    niche?: string[]
  }
}

type TrendResponse = {
  platform?: string
  summary?: string
  trends: TrendIdea[]
  raw?: string
}

type PeerFocus = {
  pillars: boolean
  hooks: boolean
  visuals: boolean
  cadence: boolean
}

type PeerArtist = {
  name: string
  positioning?: string
  content_pillars?: string[]
  hook_patterns?: string[]
  visual_language?: string
  cadence?: string
  stealable_structures?: string[]
}

type PeerForYou = {
  suggested_pillars?: string[]
  format_starters?: string[]
  warnings?: string[]
}

type PeerRadarResult = {
  platform?: string
  reference_artists_used?: string[]
  summary?: string
  artists: PeerArtist[]
  for_you?: PeerForYou
  raw?: string
}

type SavedTrendSession = {
  id: string
  created_at: string
  input: any
  output: any
}

// ---------- Platform labels/icons ----------
const platformLabels: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube Shorts',
  X: 'X ',
  spotify: 'Spotify Canvas',
}

const platformIcons: Record<string, ReactNode> = {
  instagram: <Instagram className="w-4 h-4" />,
  tiktok: <Music2 className="w-4 h-4" />,
  youtube: <Video className="w-4 h-4" />,
  X: <Radio className="w-4 h-4" />,
  spotify: <Music2 className="w-4 h-4" />,
}

// map UI platform → content_calendar.platform (respecting DB check)
function mapPlatformForCalendar(
  p: 'instagram' | 'tiktok' | 'youtube' | 'x' | 'spotify' | 'facebook' | 'x'
): 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'x' {
  switch (p) {
    case 'instagram':
    case 'tiktok':
    case 'youtube':
    case 'facebook':
    case 'x':
      return p
  
    case 'spotify':
      // Momentum table doesn't allow spotify, so choose a safe default
      
    default:
      return 'instagram'
  }
}


function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function TrendsPage() {
  const { profile, saveProfile, loading: profileLoading } = useWwProfile() as any
const [currentTrendSessionId, setCurrentTrendSessionId] = useState<string | null>(null)

  // Tabs
  const [activeTab, setActiveTab] = useState<'trends' | 'peers'>('trends')

  // Saved trends (Trend Finder sessions)
  const [savedTrendSessions, setSavedTrendSessions] = useState<SavedTrendSession[]>([])
  const [loadingSavedTrends, setLoadingSavedTrends] = useState(false)
  const [deletingSavedId, setDeletingSavedId] = useState<string | null>(null)

  // Shared-ish state (UI)
  const [artistName, setArtistName] = useState('')
  const [genre, setGenre] = useState('')
  const [platform, setPlatform] = useState<'instagram' | 'tiktok' | 'youtube' | 'x' | 'spotify'>('tiktok')
  const [goal, setGoal] = useState('')
  const [audience, setAudience] = useState('')

  // Trend Finder state
  const [energy, setEnergy] = useState<'low' | 'medium' | 'high'>('medium')
  const [releaseContext, setReleaseContext] = useState('')
  const [trendLoading, setTrendLoading] = useState(false)
  const [trendResult, setTrendResult] = useState<TrendResponse | null>(null)

  // Save session state
  const [sessionName, setSessionName] = useState('')
  const [savingSession, setSavingSession] = useState(false)

  // Momentum Board sending state
  const [sendingOneIndex, setSendingOneIndex] = useState<number | null>(null)
  const [sendingAll, setSendingAll] = useState(false)

  // Peer Radar state
  const [peerSourceMode, setPeerSourceMode] = useState<'manual' | 'ai'>('manual')
  const [peerArtists, setPeerArtists] = useState('')
  const [peerVibe, setPeerVibe] = useState('')
  const [peerFocus, setPeerFocus] = useState<PeerFocus>({
    pillars: true,
    hooks: true,
    visuals: true,
    cadence: false,
  })
  const [peerLoading, setPeerLoading] = useState(false)
  const [peerResult, setPeerResult] = useState<PeerRadarResult | null>(null)
  const [peerRanOnce, setPeerRanOnce] = useState(false)

  const platformLabel = useMemo(() => platformLabels[platform] ?? 'Platform', [platform])

  // ---------- Apply WW profile to inputs (once) ----------
  const [didApplyProfile, setDidApplyProfile] = useState(false)

  useEffect(() => {
    if (didApplyProfile) return
    if (profileLoading) return

    const nothingTyped = !artistName && !genre && !audience && !goal
    if (nothingTyped && profile) {
      if (profile.artistName) setArtistName(profile.artistName)
      if (profile.genre) setGenre(profile.genre)
      if (profile.audience) setAudience(profile.audience)
      if (profile.goal) setGoal(profile.goal)
    }

    setDidApplyProfile(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading, profile, didApplyProfile])

  const hasProfileSuggestion =
    !!profile && (!!profile.artistName || !!profile.genre || !!profile.audience || !!profile.goal)

  function applyProfileFromStore() {
    if (!profile) return
    if (profile.artistName) setArtistName(profile.artistName)
    if (profile.genre) setGenre(profile.genre)
    if (profile.audience) setAudience(profile.audience)
    if (profile.goal) setGoal(profile.goal)
    toast.success('Profile applied ✅')
  }

  // ---------- Persist helper ----------
  async function persistProfileContext() {
    try {
      if (typeof saveProfile === 'function') {
        await saveProfile({
          artistName: artistName || undefined,
          genre: genre || undefined,
          audience: audience || undefined,
          goal: goal || undefined,
        })
      }
    } catch (e: any) {
      console.warn('[ww-profile] save failed', e)
      toast.error(e?.message || 'Could not save profile context')
    }
  }

  // ---------- Saved trend sessions ----------
  async function fetchSavedTrendSessions() {
    setLoadingSavedTrends(true)
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        setSavedTrendSessions([])
        return
      }

      const { data, error } = await supabase
        .from('trend_insights')
        .select('id, created_at, input, output')
        .eq('user_id', userData.user.id)
        .eq('type', 'trends')
        .order('created_at', { ascending: false })
        .limit(25)

      if (error) throw error
      setSavedTrendSessions((data as SavedTrendSession[]) || [])
    } catch (e: any) {
      console.error('[trend-sessions] fetch error', e)
      toast.error(e?.message || 'Could not load saved trends')
    } finally {
      setLoadingSavedTrends(false)
    }
  }

  useEffect(() => {
    void fetchSavedTrendSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleLoadSavedTrend(session: SavedTrendSession) {
    setTrendResult(session.output)
setCurrentTrendSessionId(session.id)

    if (session.input) {
      setArtistName(session.input.artistName ?? '')
      setGenre(session.input.genre ?? '')
      setAudience(session.input.audience ?? '')
      setGoal(session.input.goal ?? '')
      setPlatform(session.input.platform === 'x' ? 'twitter' : session.input.platform ?? 'instagram')
const restoredPlatform = session.input.platform === 'twitter' ? 'x' : session.input.platform
setPlatform(restoredPlatform ?? 'instagram')

      setEnergy(session.input.energy ?? 'medium')
      setReleaseContext(session.input.releaseContext ?? '')
      setSessionName(session.input.sessionName ?? '')
    }

    toast.success('Saved trend session loaded ✅')
  }

  async function handleDeleteSavedTrend(id: string) {
    const ok = window.confirm('Delete this saved trend session? This cannot be undone.')
    if (!ok) return
if (currentTrendSessionId === id) setCurrentTrendSessionId(null)

    setDeletingSavedId(id)

    const prev = savedTrendSessions
    setSavedTrendSessions(sessions => sessions.filter(s => s.id !== id))

    try {
      const { error } = await supabase.from('trend_insights').delete().eq('id', id)
      if (error) throw error
      toast.success('Deleted saved session ✅')
    } catch (e: any) {
      console.error('[trend-sessions] delete error', e)
      toast.error(e?.message || 'Could not delete saved session')
      setSavedTrendSessions(prev)
    } finally {
      setDeletingSavedId(null)
    }
  }

  // ---------- Trend Finder ----------
  async function handleGenerateTrends() {
    setTrendLoading(true)
    setTrendResult(null)
setCurrentTrendSessionId(null)

    await persistProfileContext()

    try {
      const res = await fetch('/api/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistName,
          platform,
          genre,
          goal,
          audience,
          energy,
          releaseContext,
        }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to generate trends')
      }

      const data = (await res.json()) as TrendResponse
      if (!data || !Array.isArray(data.trends)) {
        setTrendResult({ trends: [] })
        toast.error('No trends returned – try adjusting your inputs.')
      } else {
        setTrendResult(data)
      }
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Failed to generate trends')
    } finally {
      setTrendLoading(false)
    }
  }

 // Save Trend Finder session to Supabase
async function handleSaveSession() {
  if (!trendResult?.trends?.length) {
    toast.error('No trend session to save yet')
    return
  }

  setSavingSession(true)
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      toast.error('You must be logged in to save sessions')
      return
    }

    const inputPayload = {
      artistName,
      genre,
      audience,
      goal,
      platform,
      energy,
      releaseContext,
      sessionName: sessionName || null,
    }

    const { data, error } = await supabase
      .from('trend_insights')
      .insert([
        {
          user_id: userData.user.id,
          type: 'trends',
          input: inputPayload,
          output: trendResult,
        },
      ])
      .select('id')
      .single()

    if (error) {
      console.error('[save-session] supabase error', error)
      toast.error(error.message || 'Could not save this session')
      return
    }

    // ✅ store session id for dedupe keys
    setCurrentTrendSessionId(data.id)

    toast.success('Trend session saved to your vault ✅')
    setSessionName('')
    void fetchSavedTrendSessions()
  } catch (e: any) {
    console.error('[save-session] error', e)
    toast.error(e?.message || 'Could not save this session')
  } finally {
    setSavingSession(false)
  }
}


  // ---------- Momentum Board send ----------

async function ensureTrendSessionId(): Promise<string | null> {
  if (currentTrendSessionId) return currentTrendSessionId
  if (!trendResult?.trends?.length) return null

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) return null

    const inputPayload = {
      artistName,
      genre,
      audience,
      goal,
      platform,
      energy,
      releaseContext,
      sessionName: sessionName || null,
    }

    const { data, error } = await supabase
      .from('trend_insights')
      .insert([
        {
          user_id: userData.user.id,
          type: 'trends',
          input: inputPayload,
          output: trendResult,
        },
      ])
      .select('id')
      .single()

    if (error) throw error

    setCurrentTrendSessionId(data.id)
    // Optional: refresh saved list so it appears immediately
    void fetchSavedTrendSessions()

    return data.id
  } catch (e: any) {
    console.error('[ensureTrendSessionId] error', e)
    toast.error(e?.message || 'Could not create session id for dedupe')
    return null
  }
}
async function handleSendIdeaToBoard(idea: TrendIdea, idx: number) {
  setSendingOneIndex(idx)
  try {
    const sessionId = await ensureTrendSessionId()
    if (!sessionId) {
      toast.error('Save session failed — could not identify this trend session')
      return
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      toast.error('You must be logged in to send to Momentum Board')
      return
    }

    const calendarPlatform = mapPlatformForCalendar(platform)

    const captionParts: string[] = []
    if (idea.description) captionParts.push(idea.description)
    if (idea.hook_template) captionParts.push(`Hook: "${idea.hook_template}"`)
    if (idea.caption_angle) captionParts.push(`Caption angle: ${idea.caption_angle}`)
    const caption = captionParts.join('\n\n')

    const allTags: string[] = []
    if (idea.hashtags?.core) allTags.push(...idea.hashtags.core)
    if (idea.hashtags?.niche) allTags.push(...idea.hashtags.niche)

    const { error } = await supabase.from('momentum_items').insert([
      {
        user_id: userData.user.id,
        feature: 'trends',
        title: idea.name || `Trend idea ${idx + 1}`,
        caption: caption || null,
        platform: calendarPlatform,
        status: 'idea',
        scheduled_at: null,
        hashtags: allTags.length ? allTags : null,
        metadata: {
          source: 'trend_finder',
          trend_session_id: sessionId,
          trend_index: idx,
          energy,
          genre,
          goal,
          audience,
          platform_ui: platform,
          batch: false,
        },
      },
    ])
    // ✅ Dedupe: if this idea already exists for this session + index, don’t insert again
const { data: existingOne, error: exErr } = await supabase
  .from('momentum_items')
  .select('id')
  .eq('user_id', userData.user.id)
  .eq('feature', 'trends')
  .eq('metadata->>trend_session_id', sessionId)
  .eq('metadata->>trend_index', String(idx))
  .limit(1)

if (exErr) throw exErr

if (existingOne?.length) {
  toast.info('That idea is already in Momentum ✅')
  return
}


    if (error) throw error
    toast.success('Idea sent to Momentum Board ✅')
  } catch (e: any) {
    console.error('[send-one] error', e)
    toast.error(e?.message || 'Could not send idea')
  } finally {
    setSendingOneIndex(null)
  }
}

  async function handleSendAllToBoard() {
  if (!trendResult?.trends?.length) {
    toast.error('No trend ideas to send yet')
    return
  }

  setSendingAll(true)
  try {
    const sessionId = await ensureTrendSessionId()
    if (!sessionId) {
      toast.error('Save session failed — could not identify this trend session')
      return
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      toast.error('You must be logged in to send to Momentum Board')
      return
    }

    // ✅ fetch existing ids for this session so we can skip duplicates
    const { data: existing, error: existingErr } = await supabase
  .from('momentum_items')
  .select('metadata')
  .eq('user_id', userData.user.id)
  .eq('feature', 'trends')

if (existingErr) throw existingErr

const existingIdx = new Set<number>()
;(existing || []).forEach((row: any) => {
  const meta = row?.metadata || {}
  if (String(meta.trend_session_id) !== String(sessionId)) return
  const n = Number(meta.trend_index)
  if (!Number.isNaN(n)) existingIdx.add(n)
})


    const calendarPlatform = mapPlatformForCalendar(platform as any)

    const rows = trendResult.trends
      .map((idea, idx) => ({ idea, idx }))
      .filter(x => !existingIdx.has(x.idx))
      .map(({ idea, idx }) => {
        const captionParts: string[] = []
        if (idea.description) captionParts.push(idea.description)
        if (idea.hook_template) captionParts.push(`Hook: "${idea.hook_template}"`)
        if (idea.caption_angle) captionParts.push(`Caption angle: ${idea.caption_angle}`)
        const caption = captionParts.join('\n\n')

        const allTags: string[] = []
        if (idea.hashtags?.core) allTags.push(...idea.hashtags.core)
        if (idea.hashtags?.niche) allTags.push(...idea.hashtags.niche)

        return {
          user_id: userData.user.id,
          feature: 'trends',
          title: idea.name || `Trend idea ${idx + 1}`,
          caption: caption || null,
          platform: calendarPlatform,
          status: 'idea',
          scheduled_at: null,
          hashtags: allTags.length ? allTags : null,
          metadata: {
            source: 'trend_finder',
            trend_session_id: sessionId,
            trend_index: idx,
            energy,
            genre,
            goal,
            audience,
            platform_ui: platform,
            batch: true,
          },
        }
      })

    if (!rows.length) {
      toast.info('Everything in this session is already in Momentum ✅')
      return
    }

    const { error } = await supabase.from('momentum_items').insert(rows)
    if (error) throw error

    toast.success(`Sent ${rows.length} new idea(s) ✅`)
  } catch (e: any) {
    console.error('[send-all] error', e)
    toast.error(e?.message || 'Could not send all ideas')
  } finally {
    setSendingAll(false)
  }
}


  // ---------- Peer Radar ----------
  async function handleRunPeerRadar() {
    if (peerSourceMode === 'manual' && !peerArtists.trim()) {
      toast.error('Add at least one reference artist or switch to "Let Peer Radar decide".')
      return
    }

    if (!genre && !audience && !goal) {
      toast.error('Add at least genre, goal or audience so Peer Radar has context.')
      return
    }

    await persistProfileContext()

    setPeerLoading(true)
    setPeerResult(null)
    setPeerRanOnce(false)

    try {
      const res = await fetch('/api/peers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistName,
          platform,
          genre,
          goal,
          audience,
          peerSourceMode,
          peerArtists,
          peerVibe,
          peerFocus,
        }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.error || 'Failed to run Peer Radar')
      }

      const data = (await res.json()) as PeerRadarResult
      if (!data || !Array.isArray(data.artists)) {
        toast.error('Peer Radar returned no artists. Try adjusting lane / focus.')
        setPeerResult(null)
      } else {
        setPeerResult({
          artists: data.artists,
          platform: data.platform,
          reference_artists_used: data.reference_artists_used || [],
          summary: data.summary,
          for_you: data.for_you,
          raw: data.raw,
        })
        toast.success('Peer Radar analysis ready ✅')
      }
    } catch (e: any) {
      console.error('[peers] front-end error', e)
      toast.error(e?.message || 'Failed to run Peer Radar')
      setPeerResult(null)
    } finally {
      setPeerLoading(false)
      setPeerRanOnce(true)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <Toaster position="top-center" richColors />

      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-sm text-ww-violet/90 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Trend Studio</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Discover your next move</h1>
            <p className="mt-2 text-white/70 text-sm md:text-base max-w-xl">
              Use Trend Finder for concrete content ideas, or Peer Radar to analyse artists in your lane and steal the
              structure, not the soul.
            </p>
          </div>
        </header>

        {/* Tabs */}
        <div className="inline-flex items-center rounded-full border border-white/10 bg-black/60 p-1">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 h-9 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
              activeTab === 'trends'
                ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.6)]'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Trend Finder
          </button>
          <button
            onClick={() => setActiveTab('peers')}
            className={`px-4 h-9 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
              activeTab === 'peers'
                ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.6)]'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Radar className="w-4 h-4" />
            Peer Radar
          </button>
        </div>

        {/* Profile banner (shared store) */}
        {hasProfileSuggestion && (
          <div className="p-3 rounded-2xl border border-ww-violet/40 bg-ww-violet/10 text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="text-white/80">Load your saved artist profile (artist, genre, audience, goals)?</span>
            <button
              type="button"
              onClick={applyProfileFromStore}
              className="px-3 h-8 rounded-full bg-ww-violet text-white text-xs font-semibold hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] active:scale-95 transition"
            >
              Apply profile
            </button>
          </div>
        )}

        {/* Shared core inputs */}
        <section className="p-5 md:p-6 rounded-2xl bg-black/60 border border-white/10 shadow-xl space-y-4">
          <h2 className="text-sm font-medium text-white/80 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#BA55D3' }} />
            Core context
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Artist name (optional)"
              className="w-full p-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/35 focus:border-ww-violet focus:outline-none transition"
              value={artistName}
              onChange={e => setArtistName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Genre / lane"
              className="w-full p-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/35 focus:border-ww-violet focus:outline-none transition"
              value={genre}
              onChange={e => setGenre(e.target.value)}
            />
            <input
              type="text"
              placeholder="Audience (who are you really talking to?)"
              className="w-full p-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/35 focus:border-ww-violet focus:outline-none transition md:col-span-2"
              value={audience}
              onChange={e => setAudience(e.target.value)}
            />
            <input
              type="text"
              placeholder="Goal (grow, convert, deepen, test a concept...)"
              className="w-full p-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/35 focus:border-ww-violet focus:outline-none transition md:col-span-2"
              value={goal}
              onChange={e => setGoal(e.target.value)}
            />
          </div>

          {/* Platform selector */}
          <div className="mt-3">
            <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Platform focus</p>
            <div className="flex flex-wrap gap-2">
              {(['instagram', 'tiktok', 'youtube', 'x', 'spotify'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`inline-flex items-center gap-2 px-3 h-9 rounded-full border text-sm transition-all ${
                    platform === p
                      ? 'border-ww-violet bg-ww-violet/20 text-white shadow-[0_0_14px_rgba(186,85,211,0.5)]'
                      : 'border-white/10 text-white/70 hover:border-ww-violet/70 hover:text-white'
                  }`}
                >
                  {platformIcons[p]}
                  <span>{platformLabels[p]}</span>
                </button>
              ))}
            </div>

            {/* Save profile */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={persistProfileContext}
                className="inline-flex items-center gap-2 px-3 h-9 rounded-full border border-white/15 text-xs text-white/80 hover:border-ww-violet hover:text-white transition"
              >
                <Save className="w-3 h-3" />
                Save profile
              </button>
              <span className="text-[0.7rem] text-white/45">Saves artist / genre / audience / goal to your WW profile.</span>
            </div>
          </div>
        </section>

        {/* Tab content */}
        {activeTab === 'trends' ? (
          <>
            {/* Trend Finder */}
            <section className="p-5 md:p-6 rounded-2xl bg-black/60 border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Target className="w-4 h-4 text-ww-violet" />
                <span>Trend Finder</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Energy of content</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'low' as const, label: 'Low-key', desc: 'Soft, intimate, reflective' },
                      { id: 'medium' as const, label: 'Balanced', desc: 'Mix of calm & hype' },
                      { id: 'high' as const, label: 'High-energy', desc: 'Hype, performance, big moments' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setEnergy(opt.id)}
                        className={`flex-1 min-w-[120px] text-left px-3 py-2 rounded-xl border text-xs transition-all ${
                          energy === opt.id
                            ? 'border-ww-violet bg-ww-violet/15 text-white shadow-[0_0_12px_rgba(186,85,211,0.4)]'
                            : 'border-white/10 text-white/70 hover:border-ww-violet/70 hover:text-white'
                        }`}
                      >
                        <div className="font-semibold">{opt.label}</div>
                        <div className="text-[0.7rem] text-white/60">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Release context (optional)</p>
                  <textarea
                    rows={4}
                    placeholder="Upcoming single, recent drop, tour announcement, milestone, etc. The more specific the better."
                    className="w-full p-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/35 focus:border-ww-violet focus:outline-none transition"
                    value={releaseContext}
                    onChange={e => setReleaseContext(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3 items-center">
                <button
                  type="button"
                  onClick={handleGenerateTrends}
                  disabled={trendLoading}
                  className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-ww-violet text-white font-semibold text-sm transition-all hover:shadow-[0_0_20px_rgba(186,85,211,0.7)] active:scale-95 disabled:opacity-60"
                >
                  {trendLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Finding trends…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Find trends for {platformLabel}
                    </>
                  )}
                </button>
                <p className="text-xs text-white/50">
                  The model will return 3–4 concrete, shootable ideas tailored to your lane.
                </p>
              </div>
            </section>

            {/* Trend Finder results */}
            {trendResult && (
              <section className="p-5 md:p-6 rounded-2xl bg-black/60 border border-white/10 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-ww-violet" />
                      Trend ideas for {platformLabel}
                    </h2>
                    {trendResult.summary && <p className="text-sm text-white/70 mt-1">{trendResult.summary}</p>}
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Session name (optional)"
                      className="w-44 md:w-56 px-3 h-9 rounded-full bg-black border border-white/15 text-xs text-white placeholder-white/35 focus:border-ww-violet focus:outline-none"
                      value={sessionName}
                      onChange={e => setSessionName(e.target.value)}
                    />

                    <button
                      type="button"
                      onClick={handleSaveSession}
                      disabled={savingSession}
                      className="inline-flex items-center gap-2 px-3 h-9 rounded-full border border-white/15 text-xs text-white/80 hover:border-ww-violet hover:text-white transition disabled:opacity-60"
                    >
                      {savingSession ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Save className="w-3 h-3" />
                          Save session
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSendAllToBoard}
                      disabled={sendingAll || !trendResult.trends?.length}
                      className="inline-flex items-center gap-2 px-3 h-9 rounded-full bg-ww-violet/20 border border-ww-violet/60 text-xs text-ww-violet hover:bg-ww-violet/30 transition disabled:opacity-60"
                    >
                      {sendingAll ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Sending all…
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          Send all to Momentum Board
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {trendResult.trends?.length ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {trendResult.trends.map((t, idx) => (
                      <article
                        key={idx}
                        className="rounded-2xl border border-white/10 bg-black/70 p-4 flex flex-col gap-3 hover:border-ww-violet/80 hover:shadow-[0_0_18px_rgba(186,85,211,0.4)] transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-white">{t.name || `Idea ${idx + 1}`}</h3>
                            {t.type && <p className="text-xs text-white/50 mt-0.5">{t.type}</p>}
                          </div>
                          {typeof t.fit_score === 'number' && (
                            <span className="text-xs px-2 py-1 rounded-full border border-ww-violet/50 text-ww-violet/90">
                              Fit {Math.round(t.fit_score)}%
                            </span>
                          )}
                        </div>

                        {t.description && <p className="text-sm text-white/80">{t.description}</p>}

                        {t.why_it_fits && (
                          <p className="text-xs text-white/65">
                            <span className="font-semibold text-white">Why it fits:</span> {t.why_it_fits}
                          </p>
                        )}

                        {t.hook_template && (
                          <div className="text-xs text-white/80">
                            <span className="font-semibold text-white">Hook template:</span>{' '}
                            <span className="italic">“{t.hook_template}”</span>
                          </div>
                        )}

                        {t.suggested_visuals && (
                          <div className="text-xs text-white/80 flex items-start gap-2">
                            <Film className="w-3 h-3 mt-0.5 text-ww-violet" />
                            <span>{t.suggested_visuals}</span>
                          </div>
                        )}

                        {t.caption_angle && (
                          <div className="text-xs text-white/80">
                            <span className="font-semibold text-white">Caption angle:</span> {t.caption_angle}
                          </div>
                        )}

                        {t.hashtags && (t.hashtags.core?.length || t.hashtags.niche?.length) && (
                          <div className="border-t border-white/10 pt-2 mt-1 space-y-1">
                            {t.hashtags.core?.length ? (
                              <p className="text-[0.7rem] text-white/75">
                                <span className="font-semibold text-white">Core:</span>{' '}
                                {t.hashtags.core.map(tag => `#${tag.replace(/^#/, '')}`).join(' ')}
                              </p>
                            ) : null}
                            {t.hashtags.niche?.length ? (
                              <p className="text-[0.7rem] text-white/65">
                                <span className="font-semibold text-white">Niche:</span>{' '}
                                {t.hashtags.niche.map(tag => `#${tag.replace(/^#/, '')}`).join(' ')}
                              </p>
                            ) : null}
                          </div>
                        )}

                        <div className="pt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleSendIdeaToBoard(t, idx)}
                            disabled={sendingOneIndex === idx}
                            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-ww-violet/20 border border-ww-violet/70 text-xs text-ww-violet hover:bg-ww-violet/30 transition disabled:opacity-60"
                          >
                            {sendingOneIndex === idx ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Sending…
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3" />
                                Send to Momentum Board
                              </>
                            )}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/60">
                    No trend ideas were returned this time. Try tweaking your goal, platform or release context and run again.
                  </p>
                )}

                {trendResult.raw && (
                  <details className="mt-3 text-xs text-white/50">
                    <summary className="cursor-pointer">Raw model output (debug)</summary>
                    <pre className="mt-2 whitespace-pre-wrap break-words text-[0.7rem]">{trendResult.raw}</pre>
                  </details>
                )}
              </section>
            )}

            {/* ✅ Saved trends */}
            <section className="p-5 md:p-6 rounded-2xl bg-black/60 border border-white/10 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">Saved trends</p>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-ww-violet" />
                    Your saved Trend Finder sessions
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => void fetchSavedTrendSessions()}
                  disabled={loadingSavedTrends}
                  className="inline-flex items-center gap-2 px-3 h-9 rounded-full border border-white/15 text-xs text-white/80 hover:border-ww-violet hover:text-white transition disabled:opacity-60"
                >
                  {loadingSavedTrends ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Refreshing…
                    </>
                  ) : (
                    <>Refresh</>
                  )}
                </button>
              </div>

              {loadingSavedTrends ? (
                <div className="text-sm text-white/60 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading saved sessions…
                </div>
              ) : savedTrendSessions.length ? (
                <div className="grid gap-3">
                  {savedTrendSessions.map(s => (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-white/10 bg-black/70 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs text-white/50">{formatDate(s.created_at)}</div>
                        <div className="text-sm text-white/90 font-semibold truncate">
                          {s.input?.sessionName || 'Saved Trend Session'}
                        </div>
                        <div className="text-xs text-white/60 truncate">
                          {platformLabels[s.input?.platform] ?? s.input?.platform ?? platformLabel}
                          {s.input?.genre ? ` • ${s.input.genre}` : ''}
                          {s.output?.trends?.length ? ` • ${s.output.trends.length} ideas` : ''}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLoadSavedTrend(s)}
                          className="inline-flex items-center gap-2 px-3 h-9 rounded-full bg-ww-violet/20 border border-ww-violet/60 text-xs text-ww-violet hover:bg-ww-violet/30 transition"
                        >
                          <FolderOpen className="w-3 h-3" />
                          Load
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDeleteSavedTrend(s.id)}
                          disabled={deletingSavedId === s.id}
                          className="inline-flex items-center gap-2 px-3 h-9 rounded-full border border-white/15 text-xs text-white/80 hover:border-ww-violet hover:text-white transition disabled:opacity-60"
                        >
                          {deletingSavedId === s.id ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Deleting…
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/60">
                  No saved sessions yet. Run Trend Finder and hit <span className="text-white/80">Save session</span>.
                </p>
              )}
            </section>
          </>
        ) : (
          <>
            {/* Peer Radar UI (same structure you had) */}
            <section className="p-5 md:p-6 rounded-2xl bg-black/60 border border-white/10 space-y-5">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Radar className="w-4 h-4 text-ww-violet" />
                <span>Peer Radar – Study similar artists</span>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Artist source</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPeerSourceMode('manual')}
                    className={`flex-1 min-w-[140px] text-left px-3 py-2 rounded-xl border text-xs transition-all ${
                      peerSourceMode === 'manual'
                        ? 'border-ww-violet bg-ww-violet/15 text-white shadow-[0_0_12px_rgba(186,85,211,0.4)]'
                        : 'border-white/10 text-white/70 hover:border-ww-violet/70 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold">I’ll list artists</div>
                    <div className="text-[0.7rem] text-white/60">Dave, Little Simz, Saba…</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPeerSourceMode('ai')}
                    className={`flex-1 min-w-[140px] text-left px-3 py-2 rounded-xl border text-xs transition-all ${
                      peerSourceMode === 'ai'
                        ? 'border-ww-violet bg-ww-violet/15 text-white shadow-[0_0_12px_rgba(186,85,211,0.4)]'
                        : 'border-white/10 text-white/70 hover:border-ww-violet/70 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold">Let Peer Radar decide</div>
                    <div className="text-[0.7rem] text-white/60">It’ll pick 3–5 based on your lane.</div>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Reference artists</p>
                <input
                  type="text"
                  placeholder={
                    peerSourceMode === 'manual'
                      ? 'Dave, Little Simz, Saba'
                      : 'Peer Radar will suggest artists based on your genre and audience'
                  }
                  className={`w-full p-3 rounded-xl bg-black border text-white placeholder-white/35 focus:border-ww-violet focus:outline-none transition ${
                    peerSourceMode === 'manual'
                      ? 'border-white/10'
                      : 'border-dashed border-white/20 opacity-70 cursor-not-allowed'
                  }`}
                  value={peerArtists}
                  onChange={e => setPeerArtists(e.target.value)}
                  disabled={peerSourceMode === 'ai'}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50 mb-2">What do you want to learn?</p>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2 text-white/80">
                      <input
                        type="checkbox"
                        checked={peerFocus.pillars}
                        onChange={e => setPeerFocus(prev => ({ ...prev, pillars: e.target.checked }))}
                        className="rounded border-white/30 bg-black"
                      />
                      <span>Content pillars & recurring formats</span>
                    </label>
                    <label className="flex items-center gap-2 text-white/80">
                      <input
                        type="checkbox"
                        checked={peerFocus.hooks}
                        onChange={e => setPeerFocus(prev => ({ ...prev, hooks: e.target.checked }))}
                        className="rounded border-white/30 bg-black"
                      />
                      <span>Hooks & caption style</span>
                    </label>
                    <label className="flex items-center gap-2 text-white/80">
                      <input
                        type="checkbox"
                        checked={peerFocus.visuals}
                        onChange={e => setPeerFocus(prev => ({ ...prev, visuals: e.target.checked }))}
                        className="rounded border-white/30 bg-black"
                      />
                      <span>Visual language & framing</span>
                    </label>
                    <label className="flex items-center gap-2 text-white/80">
                      <input
                        type="checkbox"
                        checked={peerFocus.cadence}
                        onChange={e => setPeerFocus(prev => ({ ...prev, cadence: e.target.checked }))}
                        className="rounded border-white/30 bg-black"
                      />
                      <span>Posting rhythm & release cadence</span>
                    </label>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50 mb-2">
                    Your vibe / brand keywords (optional)
                  </p>
                  <textarea
                    rows={4}
                    placeholder="nocturnal, introspective, cinematic, DIY, community-driven..."
                    className="w-full p-3 rounded-xl bg-black border border-white/10 text-white placeholder-white/35 focus:border-ww-violet focus:outline-none transition"
                    value={peerVibe}
                    onChange={e => setPeerVibe(e.target.value)}
                  />
                  <p className="mt-1 text-[0.7rem] text-white/50">
                    Peer Radar will use this to bias which artists and patterns it pays attention to.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3 items-center">
                <button
                  type="button"
                  onClick={handleRunPeerRadar}
                  disabled={peerLoading}
                  className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-ww-violet text-white font-semibold text-sm transition-all hover:shadow-[0_0_20px_rgba(186,85,211,0.7)] active:scale-95 disabled:opacity-60"
                >
                  {peerLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scanning peers…
                    </>
                  ) : (
                    <>
                      <Radar className="w-4 h-4" />
                      Run Peer Radar
                    </>
                  )}
                </button>
                <p className="text-xs text-white/50">
                  Peer Radar will analyse patterns in your lane and suggest structures you can adapt.
                </p>
              </div>
            </section>

            {/* ✅ Keep your existing Peer Radar results rendering below this line */}
            {/* If you paste your current Peer Radar results JSX, I’ll merge it cleanly into this file. */}
          </>
        )}
      </div>
    </main>
  )
}
