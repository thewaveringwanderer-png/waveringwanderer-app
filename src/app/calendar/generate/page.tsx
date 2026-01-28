// src/app/calendar/generate/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Toaster, toast } from 'sonner'
import { CalendarDays, Sparkles, Save, UploadCloud, Loader2 } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/* ---------------- Types ---------------- */

type ProjectType = 'single' | 'ep' | 'album' | 'tour' | 'other'

type KitRow = {
  id: string
  created_at: string
  user_id?: string | null
  inputs: unknown
  result: unknown
  title?: string | null
}

type CalendarPost = {
  date: string
  platform: string
  content_type?: string
  theme?: string
  caption?: string
  hashtags?: string[]
  goal?: string
}

type GeneratedCalendar = {
  duration_days: number
  mode: 'identity_kit' | 'project'
  platforms: string[]
  identity_summary?: unknown
  project_summary?: unknown
  posts: CalendarPost[]
}

/* ---------------- Helpers (no any) ---------------- */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function getStringField(obj: unknown, key: string): string | null {
  if (!isRecord(obj)) return null
  const v = obj[key]
  return typeof v === 'string' ? v : null
}

function isProjectType(v: string): v is ProjectType {
  return v === 'single' || v === 'ep' || v === 'album' || v === 'tour' || v === 'other'
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  return 'Unknown error'
}

/* ---------------- Component ---------------- */

export default function CalendarGeneratorPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [kits, setKits] = useState<KitRow[]>([])

  const [mode, setMode] = useState<'identity_kit' | 'project'>('identity_kit')
  const [selectedKitId, setSelectedKitId] = useState<string | null>(null)

  const [projectTitle, setProjectTitle] = useState('')
  const [projectDate, setProjectDate] = useState('') // YYYY-MM-DD
  const [projectTheme, setProjectTheme] = useState('')
  const [projectType, setProjectType] = useState<ProjectType>('single')

  const [durationDays, setDurationDays] = useState(30)
  const [platforms, setPlatforms] = useState<string[]>(['instagram', 'tiktok'])

  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pushing, setPushing] = useState(false)

  const [calendar, setCalendar] = useState<GeneratedCalendar | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      const uid = data?.user?.id ?? null
      setUserId(uid)

      if (!uid) return

      const { data: kitRows, error } = await supabase
        .from('identity_kits')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })

      if (error) {
        console.warn(error.message)
        return
      }

      setKits((kitRows || []) as KitRow[])
    })()
  }, [])

  const selectedKit = useMemo(() => kits.find(k => k.id === selectedKitId) || null, [kits, selectedKitId])

  function togglePlatform(p: string) {
    setPlatforms(prev => (prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]))
  }

  async function handleGenerate() {
    try {
      setGenerating(true)
      setCalendar(null)

      if (mode === 'identity_kit' && !selectedKit) {
        toast.error('Please select an Identity Kit')
        return
      }
      if (mode === 'project' && !projectTitle) {
        toast.error('Please enter a project title')
        return
      }

      const payload =
        mode === 'identity_kit'
          ? {
              mode,
              identityKit: selectedKit?.result ?? null,
              durationDays,
              platforms,
            }
          : {
              mode,
              projectInfo: {
                title: projectTitle,
                releaseDate: projectDate || undefined,
                theme: projectTheme || '',
                type: projectType,
              },
              durationDays,
              platforms,
            }

      const res = await fetch('/api/calendar/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data: unknown = await res.json()

      if (!res.ok) {
        const msg = isRecord(data) ? getStringField(data, 'error') : null
        toast.error(msg || 'Generation failed')
        return
      }

      setCalendar(data as GeneratedCalendar)
      toast.success('Calendar generated')
    } catch (e: unknown) {
      toast.error(getErrorMessage(e) || 'Error generating calendar')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSaveGenerated() {
    if (!calendar) return
    if (!userId) return toast.error('Not signed in')

    try {
      setSaving(true)
      const { error } = await supabase.from('generated_calendars').insert([
        {
          user_id: userId,
          source_type: mode === 'identity_kit' ? 'identity_kit' : 'project',
          source_id: mode === 'identity_kit' ? selectedKit?.id : null,
          title:
            mode === 'identity_kit'
              ? selectedKit?.title || 'Calendar from Identity Kit'
              : `${projectTitle} – ${durationDays} day plan`,
          context: mode === 'identity_kit' ? calendar.identity_summary : calendar.project_summary,
          duration_days: calendar.duration_days,
          platforms: calendar.platforms,
          posts: calendar.posts,
        },
      ])

      if (error) throw error
      toast.success('Saved to Generated Calendars')
    } catch (e: unknown) {
      toast.error(getErrorMessage(e) || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handlePushToCalendar() {
    if (!calendar) return
    if (!userId) return toast.error('Not signed in')

    try {
      setPushing(true)

      const rows = calendar.posts.map(p => ({
        user_id: userId,
        title: `${p.theme || 'Post'} (${p.platform})`,
        platform: p.platform,
        status: 'planned',
        scheduled_at: p.date ? new Date(p.date).toISOString() : null,
        caption: p.caption || '',
        hashtags: p.hashtags || [],
        assets: null,
        metadata: {
          content_type: p.content_type || null,
          goal: p.goal || null,
          source: 'ai_generator',
        },
      }))

      // NOTE: you currently insert into content_calendar.
      // If you want this to go to calendar_items instead, tell me and I’ll adjust rows to match your table.
      const { error } = await supabase.from('content_calendar').insert(rows)

      if (error) throw error
      toast.success('Pushed into Content Calendar')
    } catch (e: unknown) {
      toast.error(getErrorMessage(e) || 'Push failed')
    } finally {
      setPushing(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10 font-sans">
      <Toaster position="top-center" richColors />
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold">
            <span className="text-white">AI Content Calendar </span>
            <span className="text-ww-violet">Generator</span>
          </h1>
          <div className="text-white/60 text-sm inline-flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Plan 30–90 days in one go
          </div>
        </header>

        {/* Controls */}
        <section className="p-6 rounded-2xl bg-black/60 border border-white/10">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mode */}
            <div>
              <label className="block text-sm text-white/60 mb-2">Mode</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setMode('identity_kit')}
                  className={`px-4 h-10 rounded-full border ${
                    mode === 'identity_kit'
                      ? 'border-ww-violet bg-black/40'
                      : 'border-white/10 bg-black/30'
                  } transition`}
                >
                  From Identity Kit
                </button>
                <button
                  type="button"
                  onClick={() => setMode('project')}
                  className={`px-4 h-10 rounded-full border ${
                    mode === 'project'
                      ? 'border-ww-violet bg-black/40'
                      : 'border-white/10 bg-black/30'
                  } transition`}
                >
                  From Project
                </button>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm text-white/60 mb-2">Duration</label>
              <div className="flex gap-3">
                {[30, 60, 90].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(d)}
                    className={`px-4 h-10 rounded-full border ${
                      durationDays === d
                        ? 'border-ww-violet bg-black/40'
                        : 'border-white/10 bg-black/30'
                    } transition`}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div className="md:col-span-2">
              <label className="block text-sm text-white/60 mb-2">Platforms</label>
              <div className="flex flex-wrap gap-3">
                {['instagram', 'tiktok', 'youtube', 'twitter'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`px-4 h-10 rounded-full border ${
                      platforms.includes(p)
                        ? 'border-ww-violet bg-black/40'
                        : 'border-white/10 bg-black/30'
                    } transition capitalize`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Identity mode */}
            {mode === 'identity_kit' && (
              <div className="md:col-span-2">
                <label className="block text-sm text-white/60 mb-2">Choose an Identity Kit</label>
                <select
                  value={selectedKitId || ''}
                  onChange={e => setSelectedKitId(e.target.value || null)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-ww-violet"
                >
                  <option value="">Select…</option>
                  {kits.map(k => {
                    const artistNameFromInputs = getStringField(k.inputs, 'artistName')
                    const label = k.title || artistNameFromInputs || 'Untitled Kit'
                    return (
                      <option key={k.id} value={k.id}>
                        {label} — {new Date(k.created_at).toLocaleString()}
                      </option>
                    )
                  })}
                </select>

                {!kits.length && (
                  <p className="text-white/50 text-sm mt-2">
                    No saved kits found — generate & save an Identity Kit first.
                  </p>
                )}
              </div>
            )}

            {/* Project mode */}
            {mode === 'project' && (
              <>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Project Title</label>
                  <input
                    value={projectTitle}
                    onChange={e => setProjectTitle(e.target.value)}
                    placeholder="e.g., Midnight Drive"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-ww-violet"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Release Date (optional)</label>
                  <input
                    type="date"
                    value={projectDate}
                    onChange={e => setProjectDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-ww-violet"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">Type</label>
                  <select
                    value={projectType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const v = e.target.value
                      if (isProjectType(v)) setProjectType(v)
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-ww-violet"
                  >
                    <option value="single">Single</option>
                    <option value="ep">EP</option>
                    <option value="album">Album</option>
                    <option value="tour">Tour</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm text-white/60 mb-2">Theme / Story (optional)</label>
                  <input
                    value={projectTheme}
                    onChange={e => setProjectTheme(e.target.value)}
                    placeholder="e.g., urban isolation, neon, night energy"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-ww-violet"
                  />
                </div>
              </>
            )}
          </div>

          {/* Generate */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="group px-6 h-11 rounded-full border border-ww-violet/30 bg-black/40 text-white font-semibold inline-flex items-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(186,85,211,0.5)] hover:border-ww-violet"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? 'Generating…' : 'Generate Calendar'}
            </button>

            {calendar && (
              <>
                <button
                  type="button"
                  onClick={handleSaveGenerated}
                  disabled={saving}
                  className="group px-6 h-11 rounded-full border border-ww-violet/30 bg-black/40 text-white font-semibold inline-flex items-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(186,85,211,0.5)] hover:border-ww-violet"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving…' : 'Save Plan'}
                </button>

                <button
                  type="button"
                  onClick={handlePushToCalendar}
                  disabled={pushing}
                  className="group px-6 h-11 rounded-full border border-ww-violet/30 bg-black/40 text-white font-semibold inline-flex items-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(186,85,211,0.5)] hover:border-ww-violet"
                >
                  {pushing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  {pushing ? 'Pushing…' : 'Push to Calendar'}
                </button>
              </>
            )}
          </div>
        </section>

        {/* Preview */}
        {calendar && (
          <section className="p-6 rounded-2xl bg-black/60 border border-white/10">
            <h2 className="text-xl font-semibold mb-3 text-ww-violet">
              Preview — {calendar.duration_days} days · {calendar.platforms.join(', ')}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {calendar.posts.map((p, i) => (
                <article
                  key={i}
                  className="p-4 rounded-xl border border-white/10 bg-black/50 hover:border-ww-violet/70 transition"
                >
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <div>{new Date(p.date).toLocaleDateString()}</div>
                    <div className="capitalize">{p.platform}</div>
                  </div>

                  <h3 className="mt-2 font-semibold text-white">
                    {p.theme || 'Post'} <span className="text-white/50">· {p.content_type || 'Content'}</span>
                  </h3>

                  {p.caption ? <p className="mt-2 text-white/80">{p.caption}</p> : null}

                  {Array.isArray(p.hashtags) && p.hashtags.length > 0 && (
                    <p className="mt-2 text-white/60 text-sm">{p.hashtags.join(' ')}</p>
                  )}

                  {p.goal ? (
                    <p className="mt-2 text-white/50 text-xs">
                      <b>Goal:</b> {p.goal}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
