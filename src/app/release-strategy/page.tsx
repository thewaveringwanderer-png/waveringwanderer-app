// src/app/release-strategy/page.tsx
'use client'

import { useMemo, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { useWwProfile } from '@/hooks/useWwProfile'
import {
  CalendarDays,
  Rocket,
  Sparkles,
  Loader2,
  Target,
  Music2,
  Download,
} from 'lucide-react'

// ✅ Universal PDF engine (shared across WW)
import { type PdfLine, normalizeText, renderPdfFromLines } from '@/lib/wwPdf'

// --------- types ----------

type ReleaseStrategyPhase = {
  label: string
  timeframe: string
  focus: string
  actions: string[]
}

type ReleaseStrategyPlan = {
  summary: string
  positioning: string
  keyMoments: string[]
  phases: ReleaseStrategyPhase[]
  contentThemes: string[]
  metrics: string[]
}

// --------- PDF mapping (Release Strategy → PdfLine[]) ----------

function buildReleaseStrategyPdfLines(args: {
  artistName: string
  projectTitle: string
  releaseType: 'single' | 'ep' | 'album'
  releaseDate: string
  headlineGoal: string
  secondaryGoals: string
  coreStory: string
  keyTracks: string
  runwayWeeks: number
  platformFocus: string
  budgetNotes: string
  plan: ReleaseStrategyPlan
}): PdfLine[] {
  const {
    artistName,
    projectTitle,
    releaseType,
    releaseDate,
    headlineGoal,
    secondaryGoals,
    coreStory,
    keyTracks,
    runwayWeeks,
    platformFocus,
    budgetNotes,
    plan,
  } = args

  const lines: PdfLine[] = []

  const title = normalizeText(projectTitle || 'Release Strategy')
  lines.push({ kind: 'title', text: `${title} • ${releaseType.toUpperCase()}` })

  const subtitleParts: string[] = []
  if (artistName) subtitleParts.push(normalizeText(artistName))
  if (releaseDate) subtitleParts.push(`Target date: ${normalizeText(releaseDate)}`)
  if (subtitleParts.length === 0) subtitleParts.push('Release playbook')
  lines.push({ kind: 'subtitle', text: subtitleParts.join(' • ') })

  // divider immediately after subtitle
  lines.push({ kind: 'divider' })

  // Summary / positioning
  if (plan.summary) {
    lines.push({ kind: 'sectionTitle', text: 'Summary' })
    lines.push({ kind: 'body', text: normalizeText(plan.summary) })
  }

  if (plan.positioning) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Positioning' })
    lines.push({ kind: 'body', text: normalizeText(plan.positioning) })
  }

  // Inputs snapshot (source-of-truth export)
  const metaBullets: string[] = []
  if (headlineGoal) metaBullets.push(`Headline goal: ${normalizeText(headlineGoal)}`)
  if (secondaryGoals) metaBullets.push(`Secondary goals: ${normalizeText(secondaryGoals)}`)
  if (coreStory) metaBullets.push(`Core story: ${normalizeText(coreStory)}`)
  if (keyTracks) metaBullets.push(`Key tracks: ${normalizeText(keyTracks)}`)
  if (Number.isFinite(runwayWeeks)) metaBullets.push(`Runway: ${runwayWeeks} weeks`)
  if (platformFocus) metaBullets.push(`Platform focus: ${normalizeText(platformFocus)}`)
  if (budgetNotes) metaBullets.push(`Budget/constraints: ${normalizeText(budgetNotes)}`)

  if (metaBullets.length) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Inputs' })
    lines.push({
      kind: 'body',
      text: metaBullets.map(b => `• ${b}`).join('\n'),
    })
  }

  // Key moments
  if (Array.isArray(plan.keyMoments) && plan.keyMoments.length) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Key moments' })
    lines.push({
      kind: 'body',
      text: plan.keyMoments.map(m => `• ${normalizeText(m)}`).join('\n'),
    })
  }

  // Phases
  if (Array.isArray(plan.phases) && plan.phases.length) {
    for (const ph of plan.phases) {
      const label = normalizeText(ph.label || 'Phase')
      const timeframe = normalizeText(ph.timeframe || '')
      const focus = normalizeText(ph.focus || '')
      const actions = (ph.actions || []).map(a => normalizeText(a)).filter(Boolean)

      lines.push({ kind: 'divider' })
      lines.push({
        kind: 'sectionTitle',
        text: timeframe ? `${label} (${timeframe})` : label,
      })
      if (focus) lines.push({ kind: 'body', text: focus })
      if (actions.length) {
        lines.push({
          kind: 'body',
          text: actions.map(a => `• ${a}`).join('\n'),
        })
      }
    }
  }

  // Content themes
  if (Array.isArray(plan.contentThemes) && plan.contentThemes.length) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Content themes' })
    lines.push({
      kind: 'body',
      text: plan.contentThemes.map(t => `• ${normalizeText(t)}`).join('\n'),
    })
  }

  // Metrics
  if (Array.isArray(plan.metrics) && plan.metrics.length) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Metrics to watch' })
    lines.push({
      kind: 'body',
      text: plan.metrics.map(m => `• ${normalizeText(m)}`).join('\n'),
    })
  }

  return lines
}

// --------- component ----------

export default function ReleaseStrategyPage() {
  const {
  profile,
  hasProfile: hasAnyProfile,
  updateProfile: save,
  setLocalOnly: applyTo,
} = useWwProfile()


  const [artistName, setArtistName] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [releaseType, setReleaseType] =
    useState<'single' | 'ep' | 'album'>('single')
  const [releaseDate, setReleaseDate] = useState('')
  const [headlineGoal, setHeadlineGoal] = useState('')
  const [secondaryGoals, setSecondaryGoals] = useState('')
  const [coreStory, setCoreStory] = useState('')
  const [keyTracks, setKeyTracks] = useState('')
  const [runwayWeeks, setRunwayWeeks] = useState<number>(6)
  const [platformFocus, setPlatformFocus] = useState('TikTok + Instagram Reels')
  const [budgetNotes, setBudgetNotes] = useState('')

  const [loadingPlan, setLoadingPlan] = useState(false)
  const [plan, setPlan] = useState<ReleaseStrategyPlan | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const primaryBtn =
    'inline-flex items-center gap-2 px-4 h-9 rounded-full bg-ww-violet text-xs md:text-sm font-semibold ' +
    'shadow-[0_0_16px_rgba(186,85,211,0.7)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] ' +
    'active:scale-95 transition disabled:opacity-60'

  const outlineBtn =
    'inline-flex items-center gap-2 px-4 h-9 rounded-full border border-white/20 text-white/85 text-xs md:text-sm ' +
    'hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] ' +
    'active:scale-95 transition disabled:opacity-60'

  function applyProfile() {
    applyTo({
      setArtistName: (v: string) => setArtistName(prev => prev || v),
      setGoal: (v: string) =>
        setHeadlineGoal(prev =>
          prev || `Turn this ${releaseType} into a clear step towards: ${v}`
        ),
    })
    toast.success('Profile applied ✅')
  }

  async function handleGeneratePlan() {
    if (!artistName || !projectTitle) {
      toast.error('Add at least an artist name and project title')
      return
    }

    // ✅ keep WW profile in sync across tools
    void save({
      artistName,
      genre: profile.genre, // keep whatever is already stored
      audience: profile.audience,
      goal: profile.goal,
    })

    setLoadingPlan(true)
    setPlan(null)

    try {
      const res = await fetch('/api/release-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistName,
          projectTitle,
          releaseType,
          releaseDate,
          headlineGoal,
          secondaryGoals,
          coreStory,
          keyTracks,
          runwayWeeks,
          platformFocus,
          budgetNotes,
          profile,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to generate release strategy')
      }

      const data = (await res.json()) as
        | { plan?: ReleaseStrategyPlan }
        | ReleaseStrategyPlan

      const finalPlan =
        'plan' in data ? (data.plan as ReleaseStrategyPlan) : (data as ReleaseStrategyPlan)

      setPlan(finalPlan)
      toast.success('Release strategy generated ✨')
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Could not generate release strategy')
    } finally {
      setLoadingPlan(false)
    }
  }

  const pdfLines = useMemo(() => {
    if (!plan) return []
    return buildReleaseStrategyPdfLines({
      artistName,
      projectTitle,
      releaseType,
      releaseDate,
      headlineGoal,
      secondaryGoals,
      coreStory,
      keyTracks,
      runwayWeeks,
      platformFocus,
      budgetNotes,
      plan,
    })
  }, [
    plan,
    artistName,
    projectTitle,
    releaseType,
    releaseDate,
    headlineGoal,
    secondaryGoals,
    coreStory,
    keyTracks,
    runwayWeeks,
    platformFocus,
    budgetNotes,
  ])

  async function handleDownloadPdf() {
    if (!plan) return
    setDownloadingPdf(true)
    try {
      const base = projectTitle || 'release-strategy'
      renderPdfFromLines({
        lines: pdfLines,
        filenameBase: base,
      })
      toast.success('Release strategy exported as PDF ✅')
    } catch (e: any) {
      console.error('[release-strategy-pdf]', e)
      toast.error(e?.message || 'Could not generate PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Toaster position="top-center" richColors />

      <section className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
            <Rocket className="w-7 h-7 text-ww-violet" />
            Release Strategy
          </h1>
          <p className="text-white/70 max-w-2xl">
            Turn a song, EP, or album into a clear runway: pre-release warm-up,
            launch week, and post-release momentum — tailored to your lane.
          </p>
        </div>

        {/* profile banner */}
        {hasAnyProfile && (
          <div className="p-3 rounded-2xl border border-ww-violet/40 bg-ww-violet/10 text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="text-white/80">
              We found your WW profile. Want to use it as a starting point?
            </span>
            <button type="button" onClick={applyProfile} className={primaryBtn}>
              <Sparkles className="w-3 h-3" />
              Apply WW profile
            </button>
          </div>
        )}

        {/* layout */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.35fr)]">
          {/* LEFT – inputs */}
          <section className="rounded-3xl border border-white/10 bg-black/75 p-5 md:p-6 space-y-5">
            {/* core row */}
            <div className="grid gap-3 md:grid-cols-[1.2fr,1fr]">
              <div className="space-y-1">
                <p className="text-xs text-white/50 flex items-center gap-1">
                  <Music2 className="w-3 h-3" />
                  Artist
                </p>
                <input
                  value={artistName}
                  onChange={e => setArtistName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                  placeholder="Artist / project name"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-white/50">Release type</p>
                <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/15 text-xs">
                  {(['single', 'ep', 'album'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setReleaseType(t)}
                      className={`px-3 py-1.5 rounded-full capitalize transition ${
                        releaseType === t
                          ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.7)]'
                          : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* title + date */}
            <div className="grid gap-3 md:grid-cols-[1.4fr,1fr]">
              <div className="space-y-1">
                <p className="text-xs text-white/50">Project / release title</p>
                <input
                  value={projectTitle}
                  onChange={e => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                  placeholder="Song, EP, or album title"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-white/50 flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  Target release date
                </p>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={e => setReleaseDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                />
              </div>
            </div>

            {/* goals */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-white/50 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Headline goal
                </p>
                <textarea
                  value={headlineGoal}
                  onChange={e => setHeadlineGoal(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                  placeholder="e.g. Land 1–2 playlist adds and grow core fanbase around this release."
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-white/50">Secondary goals</p>
                <textarea
                  value={secondaryGoals}
                  onChange={e => setSecondaryGoals(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                  placeholder="e.g. grow email list, test a new content format, re-engage old listeners."
                />
              </div>
            </div>

            {/* story + tracks */}
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-white/50">Core story / narrative</p>
                <textarea
                  value={coreStory}
                  onChange={e => setCoreStory(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                  placeholder="Themes, mood, personal angle, why now?"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-white/50">Key tracks / focus songs</p>
                <textarea
                  value={keyTracks}
                  onChange={e => setKeyTracks(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                  placeholder="Priority track(s), versions, highlights."
                />
              </div>
            </div>

            {/* runway, platforms, budget */}
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs text-white/50">Runway (weeks)</p>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={runwayWeeks}
                  onChange={e =>
                    setRunwayWeeks(parseInt(e.target.value || '6', 10))
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-xs text-white/50">Platform focus</p>
                <input
                  value={platformFocus}
                  onChange={e => setPlatformFocus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                  placeholder="TikTok, Reels, Shorts, email list, live shows…"
                />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-white/50">Budget & constraints (optional)</p>
              <textarea
                value={budgetNotes}
                onChange={e => setBudgetNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-white/40 focus:border-ww-violet focus:outline-none"
                placeholder="Ad spend, time constraints, collaborators, anything that changes what’s realistic."
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={loadingPlan}
                className={primaryBtn + ' px-5 h-10 text-sm'}
              >
                {loadingPlan ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Generate release strategy
                  </>
                )}
              </button>
            </div>
          </section>

          {/* RIGHT – plan preview */}
          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-5 md:p-7 shadow-[0_0_26px_rgba(0,0,0,0.7)]">
            {plan ? (
              <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1 text-sm leading-relaxed text-white/85">
                <header className="border-b border-white/10 pb-4 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[0.7rem] uppercase tracking-[0.2em] text-white/40">
                        Release Playbook
                      </p>
                      <h2 className="text-2xl font-semibold">
                        {projectTitle}{' '}
                        <span className="text-white/50 text-base uppercase">
                          • {releaseType}
                        </span>
                      </h2>
                      {releaseDate && (
                        <p className="text-xs text-white/60 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          Target date: {releaseDate}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={downloadingPdf}
                      className={outlineBtn + ' h-8 px-3 text-[0.75rem]'}
                    >
                      {downloadingPdf ? (
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

                  <p className="text-white/80 mt-2">{plan.summary}</p>
                  {plan.positioning && (
                    <p className="text-xs text-white/60 mt-1 italic">
                      {plan.positioning}
                    </p>
                  )}
                </header>

                {plan.keyMoments?.length > 0 && (
                  <section className="space-y-1">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                      Key Moments
                    </h3>
                    <ul className="list-disc list-inside text-white/80">
                      {plan.keyMoments.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {plan.phases?.length > 0 && (
                  <section className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                      Phases
                    </h3>
                    <div className="space-y-3">
                      {plan.phases.map((ph, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-white/10 bg-black/50 p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-white">{ph.label}</p>
                            <p className="text-[0.7rem] text-white/50">
                              {ph.timeframe}
                            </p>
                          </div>
                          <p className="text-xs text-white/70 mt-1">{ph.focus}</p>
                          {ph.actions?.length > 0 && (
                            <ul className="list-disc list-inside text-xs text-white/80 mt-2 space-y-1">
                              {ph.actions.map((a, j) => (
                                <li key={j}>{a}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {plan.contentThemes?.length > 0 && (
                  <section className="space-y-1">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                      Content Themes
                    </h3>
                    <p className="text-xs text-white/80">
                      {plan.contentThemes.join(' · ')}
                    </p>
                  </section>
                )}

                {plan.metrics?.length > 0 && (
                  <section className="space-y-1">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                      Metrics to Watch
                    </h3>
                    <ul className="list-disc list-inside text-xs text-white/80">
                      {plan.metrics.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-white/45 text-center px-4">
                Once you hit <b className="mx-1">Generate release strategy</b>, your
                pre-release, launch week, and post-release plan will appear here.
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}
