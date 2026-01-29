// src/app/newsletter/page.tsx
'use client'

import { useEffect, useMemo, useState, type SVGProps } from 'react'
import { Toaster, toast } from 'sonner'
import { useWwProfile } from '@/hooks/useWwProfile'
import {
  Sparkles,
  Wand2,
  Mail,
  Target,
  Clock,
  Palette,
  Info,
  Loader2,
  Lightbulb,
  ListChecks,
  ArrowRight,
  Check,
  Download,
} from 'lucide-react'

// ✅ Universal PDF engine (shared across WW)
import { type PdfLine, normalizeText, renderPdfFromLines } from '@/lib/wwPdf'

/* ---------- Types for Newsletter outline & full draft ---------- */

type NewsletterIdea = {
  id: number
  title: string
  subjectLine: string
  summary: string
  cadencePlan: string[]
  segments: string[]
  valueSections: {
    heading: string
    bullets: string[]
  }[]
  ctas: string[]
  metrics: string[]
}

type OutlineResult = {
  ideas: NewsletterIdea[]
}

type FullEmailResult = {
  subject: string
  preheader: string
  intro: string
  sections: {
    heading: string
    body: string
  }[]
  closing: string
  ps?: string | null
}

/* ---------- PDF mapping (Newsletter → PdfLine[]) ---------- */

function buildNewsletterPdfLines(
  email: FullEmailResult,
  selectedIdea?: NewsletterIdea | null
): PdfLine[] {
  const lines: PdfLine[] = []

  const subject = normalizeText(email.subject || 'Newsletter')
  lines.push({ kind: 'title', text: subject })

  const subtitleParts: string[] = []
  if (selectedIdea?.title) subtitleParts.push(selectedIdea.title)
  if (email.preheader) subtitleParts.push(normalizeText(email.preheader))

  if (subtitleParts.length) {
    lines.push({
      kind: 'subtitle',
      text: normalizeText(subtitleParts.join(' • ')),
    })
  }

  lines.push({ kind: 'divider' })

  if (email.intro) {
    lines.push({ kind: 'sectionTitle', text: 'Intro' })
    lines.push({ kind: 'body', text: normalizeText(email.intro) })
  }

  if (Array.isArray(email.sections) && email.sections.length) {
    for (const sec of email.sections) {
      const heading = normalizeText(sec.heading || '')
      const body = normalizeText(sec.body || '')
      if (!heading && !body) continue

      lines.push({ kind: 'divider' })
      lines.push({ kind: 'sectionTitle', text: heading || 'Section' })
      if (body) lines.push({ kind: 'body', text: body })
    }
  }

  if (email.closing) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Closing' })
    lines.push({ kind: 'body', text: normalizeText(email.closing) })
  }

  if (email.ps) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'P.S.' })
    lines.push({ kind: 'body', text: normalizeText(email.ps) })
  }

  return lines
}

/* ---------- Main component ---------- */

export default function NewsletterPage() {
  const {
  profile,
  hasProfile: hasAnyProfile,
  setLocalOnly: applyTo,
  updateProfile: save,
} = useWwProfile()


  const [activeTab, setActiveTab] = useState<'outline' | 'draft'>('outline')

  // Inputs for outline generator
  const [targetDescription, setTargetDescription] = useState('')
  const [cadence, setCadence] = useState('')
  const [primaryGoal, setPrimaryGoal] = useState('')
  const [voiceAndVibe, setVoiceAndVibe] = useState('')
  const [mainTheme, setMainTheme] = useState('')
  const [extraContext, setExtraContext] = useState('')

  // AI helper: theme ideas
  const [themeIdeas, setThemeIdeas] = useState<string[]>([])
  const [loadingThemeIdeas, setLoadingThemeIdeas] = useState(false)

  // Outline result
  const [outlineResult, setOutlineResult] = useState<OutlineResult | null>(null)
  const [loadingOutline, setLoadingOutline] = useState(false)

  // Inputs for full email draft
  const [draftSubject, setDraftSubject] = useState('')
  const [draftHook, setDraftHook] = useState('')
  const [draftAudience, setDraftAudience] = useState('')
  const [draftOffer, setDraftOffer] = useState('')
  const [draftAdditionalNotes, setDraftAdditionalNotes] = useState('')
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null)

  // AI helper: subject + hook
  const [loadingSubjectHook, setLoadingSubjectHook] = useState(false)

  // Full email result
  const [fullEmail, setFullEmail] = useState<FullEmailResult | null>(null)
  const [loadingFullEmail, setLoadingFullEmail] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  // Tiny “tour” hint: explain what “Use for draft” does
  const [directionHintDismissed, setDirectionHintDismissed] = useState(false)

  // ✅ Non-destructive hydration from centralized WW profile
  useEffect(() => {
    if (profile.audience && !targetDescription) setTargetDescription(profile.audience)
    if (profile.goal && !primaryGoal) setPrimaryGoal(profile.goal)
    if (profile.genre && !voiceAndVibe) {
      setVoiceAndVibe(`${profile.genre} – artist-centric, practical but encouraging`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem('ww_hint_newsletter_direction')
      if (raw === 'dismissed') setDirectionHintDismissed(true)
    } catch {
      // ignore
    }
  }, [])

  function dismissDirectionHint() {
    setDirectionHintDismissed(true)
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem('ww_hint_newsletter_direction', 'dismissed')
    } catch {
      // ignore
    }
  }

  const primaryButtonClass =
    'inline-flex items-center gap-2 px-4 h-9 rounded-full bg-ww-violet text-xs md:text-sm font-semibold ' +
    'shadow-[0_0_16px_rgba(186,85,211,0.7)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] ' +
    'active:scale-95 transition disabled:opacity-60'

  const subtleChipClass =
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/12 text-[0.7rem] text-white/70 bg-white/5'

  /* ---------- API calls ---------- */

  async function handleGenerateOutline() {
    if (!targetDescription && !primaryGoal && !mainTheme) {
      toast.error('Give me at least a target, a goal, or a theme to build around.')
      return
    }

    // ✅ feed back into WW profile (shared across tools)
    void save({
      audience: targetDescription || undefined,
      goal: primaryGoal || undefined,
      genre: voiceAndVibe || undefined,
    })

    setLoadingOutline(true)
    setOutlineResult(null)

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'outline',
          targetDescription,
          cadence,
          primaryGoal,
          voiceAndVibe,
          mainTheme,
          extraContext,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to process newsletter request')
      }

      const data = (await res.json()) as { outline: OutlineResult }
      if (!data.outline || !Array.isArray(data.outline.ideas)) {
        throw new Error('Unexpected outline format from API')
      }

      setOutlineResult(data.outline)
      toast.success('Newsletter directions generated ✨')
    } catch (e: any) {
      console.error('[newsletter-outline]', e)
      toast.error(e?.message || 'Failed to process newsletter request')
    } finally {
      setLoadingOutline(false)
    }
  }

  async function handleSuggestThemes() {
    if (!targetDescription && !primaryGoal) {
      toast.error('Tell me who this is for or what you want the newsletter to do.')
      return
    }

    setLoadingThemeIdeas(true)
    setThemeIdeas([])

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'themeIdeas',
          targetDescription,
          primaryGoal,
          extraContext,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Could not generate theme ideas')
      }

      const data = (await res.json()) as { themes?: string[] }
      if (!data.themes || !Array.isArray(data.themes)) {
        throw new Error('Unexpected theme format from API')
      }

      setThemeIdeas(data.themes)
      toast.success('Theme ideas generated ✨')
    } catch (e: any) {
      console.error('[newsletter-themeIdeas]', e)
      toast.error(e?.message || 'Could not generate theme ideas')
    } finally {
      setLoadingThemeIdeas(false)
    }
  }

  async function handleSuggestSubjectAndHook() {
    setLoadingSubjectHook(true)

    try {
      const selectedIdea =
        outlineResult?.ideas.find(i => i.id === selectedIdeaId) || null

      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'subjectHook',
          targetDescription: draftAudience || targetDescription,
          primaryGoal: primaryGoal || draftOffer,
          mainTheme: mainTheme,
          extraContext: draftAdditionalNotes || extraContext,
          fromOutline: selectedIdea
            ? {
                title: selectedIdea.title,
                summary: selectedIdea.summary,
              }
            : null,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Could not generate subject & hook')
      }

      const data = (await res.json()) as { subject: string; hook: string }
      if (data.subject) setDraftSubject(data.subject)
      if (data.hook) setDraftHook(data.hook)

      toast.success('Subject & hook suggested ✨')
    } catch (e: any) {
      console.error('[newsletter-subjectHook]', e)
      toast.error(e?.message || 'Could not generate subject & hook')
    } finally {
      setLoadingSubjectHook(false)
    }
  }

  async function handleGenerateFullEmail() {
    if (!draftSubject && !draftHook) {
      toast.error('Add a subject or hook first (or use the AI helper).')
      return
    }

    // ✅ feed back into WW profile (shared across tools)
    void save({
      audience: (draftAudience || targetDescription) || undefined,
      goal: (draftOffer || primaryGoal) || undefined,
    })

    setLoadingFullEmail(true)
    setFullEmail(null)
    setCopiedEmail(false)

    try {
      const selectedIdea =
        outlineResult?.ideas.find(i => i.id === selectedIdeaId) || null

      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'fullEmail',
          subject: draftSubject,
          hook: draftHook,
          audience: draftAudience || targetDescription,
          offer: draftOffer || primaryGoal,
          additionalNotes: draftAdditionalNotes || extraContext,
          fromOutline: selectedIdea,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to draft full email')
      }

      const data = (await res.json()) as { email: FullEmailResult }
      if (!data.email) {
        throw new Error('Unexpected email format from API')
      }

      setFullEmail(data.email)
      toast.success('Newsletter email drafted ✨')
    } catch (e: any) {
      console.error('[newsletter-fullEmail]', e)
      toast.error(e?.message || 'Failed to draft full email')
    } finally {
      setLoadingFullEmail(false)
    }
  }

  async function handleCopyFullEmail() {
    if (!fullEmail) return
    const pieces: string[] = []

    if (fullEmail.subject) pieces.push(`Subject: ${fullEmail.subject}`)
    if (fullEmail.preheader) pieces.push(`Preheader: ${fullEmail.preheader}`)
    if (fullEmail.intro) pieces.push('', fullEmail.intro)

    if (Array.isArray(fullEmail.sections)) {
      for (const section of fullEmail.sections) {
        if (!section.heading && !section.body) continue
        pieces.push('', (section.heading || '').toUpperCase())
        pieces.push(section.body)
      }
    }

    if (fullEmail.closing) pieces.push('', fullEmail.closing)
    if (fullEmail.ps) pieces.push('', `P.S. ${fullEmail.ps}`)

    const text = pieces.join('\n').trim()
    try {
      await navigator.clipboard.writeText(text)
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 1200)
      toast.success('Email copied to clipboard ✅')
    } catch (e: any) {
      console.error('[newsletter-copy]', e)
      toast.error(e?.message || 'Could not copy email')
    }
  }

  // ✅ PDF export using wwPdf (same engine as Calendar + Strategy Board)
  async function handleDownloadEmailPdf() {
    if (!fullEmail) return
    setDownloadingPdf(true)
    try {
      const selectedIdea =
        outlineResult?.ideas.find(i => i.id === selectedIdeaId) || null

      const lines = buildNewsletterPdfLines(fullEmail, selectedIdea)
      const base =
        fullEmail.subject ||
        selectedIdea?.title ||
        `newsletter-${new Date().toISOString().slice(0, 10)}`

      renderPdfFromLines({
        lines,
        filenameBase: base,
      })

      toast.success('Newsletter exported as PDF ✅')
    } catch (e: any) {
      console.error('[newsletter-pdf]', e)
      toast.error(e?.message || 'Could not generate PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const selectedOutlineIdea: NewsletterIdea | null = useMemo(
    () => outlineResult?.ideas.find(i => i.id === selectedIdeaId) || null,
    [outlineResult, selectedIdeaId]
  )

  /* ---------- JSX ---------- */

  return (
    <main className="min-h-screen bg-black text-white">
      <Toaster position="top-center" richColors />

      <section className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="w-7 h-7 text-ww-violet" />
            Newsletter Studio
          </h1>
          <p className="text-white/70 max-w-2xl">
            Turn your lane, goals, and current moment into a clear newsletter plan –
            then let the AI draft the actual email in your voice.
          </p>
        </header>

        {/* ✅ Centralized profile banner */}
        {hasAnyProfile && (
          <div className="p-3 rounded-2xl border border-ww-violet/40 bg-ww-violet/10 text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="text-white/80">
              We found your Wavering Wanderers profile. Want to pull in your lane,
              audience and goal as a starting point?
            </span>
            <button
              type="button"
              onClick={() => {
                // applyTo is the shared WW helper that maps profile fields into local state setters
                applyTo({
                  setAudience: setTargetDescription,
                  setGoal: setPrimaryGoal,
                  setGenre: setVoiceAndVibe,
                })
                toast.success('Loaded details from your WW profile ✅')
              }}
              className={primaryButtonClass}
            >
              <Sparkles className="w-3 h-3" />
              Apply WW profile
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('outline')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition ${
              activeTab === 'outline'
                ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.7)]'
                : 'text-white/70 hover:bg-white/10'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Outline & Ideas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('draft')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm transition ${
              activeTab === 'draft'
                ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.7)]'
                : 'text-white/70 hover:bg-white/10'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            Full Email Draft
          </button>
        </div>

        {/* ---------------- OUTLINE TAB ---------------- */}
        {activeTab === 'outline' && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1.4fr)]">
            {/* LEFT: Inputs */}
            <section className="rounded-3xl border border-white/10 bg-black/80 p-5 md:p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-white/50">
                    Step 1 • Direction
                  </p>
                  <p className="text-sm text-white/65">
                    Answer a few prompts or let the AI suggest themes. You can keep this
                    lightweight or go deep.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className={subtleChipClass}>
                    <Target className="w-3 h-3" />
                    Who&apos;s this really for?
                  </span>
                  <span className={subtleChipClass}>
                    <Clock className="w-3 h-3" />
                    Cadence that fits your bandwidth
                  </span>
                  <span className={subtleChipClass}>
                    <Palette className="w-3 h-3" />
                    Voice that feels like you
                  </span>
                </div>
              </div>

              {/* Core questions */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-white/55 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Who is this newsletter really for?
                  </p>
                  <textarea
                    value={targetDescription}
                    onChange={e => setTargetDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white placeholder-white/35 focus:border-ww-violet focus:outline-none"
                    placeholder="e.g. existing fans on your mailing list, new listeners from TikTok, local supporters, producers/industry, etc."
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs text-white/55 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Ideal cadence & rhythm
                    </p>
                    <textarea
                      value={cadence}
                      onChange={e => setCadence(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-white/35 focus:border-ww-violet focus:outline-none"
                      placeholder="e.g. 1 longer story email per month + 1 short update on key moments."
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-white/55 flex items-center gap-1">
                      <ListChecks className="w-3 h-3" />
                      Primary goal over the next few sends
                    </p>
                    <textarea
                      value={primaryGoal}
                      onChange={e => setPrimaryGoal(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-white/35 focus:border-ww-violet focus:outline-none"
                      placeholder="e.g. warm list for an EP, deepen connection around your story, test new sonic direction, push a live show, etc."
                    />
                  </div>
                </div>

                {/* Voice + Theme with AI helper */}
                <div className="grid gap-3 md:grid-cols-[1.1fr,1fr]">
                  <div className="space-y-1">
                    <p className="text-xs text-white/55 flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      Voice & vibe
                    </p>
                    <textarea
                      value={voiceAndVibe}
                      onChange={e => setVoiceAndVibe(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-white/35 focus:border-ww-violet focus:outline-none"
                      placeholder="e.g. reflective, cinematic, hopeful but honest, “talking to a friend”, practical and step-by-step, etc."
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-white/55 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        Key theme / story idea
                      </p>
                      <button
                        type="button"
                        onClick={handleSuggestThemes}
                        disabled={loadingThemeIdeas}
                        className={primaryButtonClass}
                      >
                        {loadingThemeIdeas ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            AI theme ideas
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            AI theme ideas
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      value={mainTheme}
                      onChange={e => setMainTheme(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-white/35 focus:border-ww-violet focus:outline-none"
                      placeholder="e.g. “swing of the sword” era, making peace with doubt, rebuilding momentum after a break, behind-the-scenes of your next release."
                    />

                    {themeIdeas.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-[0.7rem] text-white/50">
                          Tap a suggestion to drop it into your theme:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {themeIdeas.map((t, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setMainTheme(t)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/12 text-[0.7rem] text-white/80 hover:border-ww-violet hover:text-white transition"
                            >
                              <ArrowRight className="w-3 h-3" />
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-white/55 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Anything else WW should know?
                  </p>
                  <textarea
                    value={extraContext}
                    onChange={e => setExtraContext(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-white/35 focus:border-ww-violet focus:outline-none"
                    placeholder="Upcoming dates, releases, sensitive topics, boundaries around what not to mention, etc."
                  />
                </div>
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerateOutline}
                  disabled={loadingOutline}
                  className={primaryButtonClass}
                >
                  {loadingOutline ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Shaping directions…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate newsletter ideas
                    </>
                  )}
                </button>
                <p className="text-[0.7rem] text-white/55">
                  WW will suggest 2–3 routes you can take – including stories, CTAs and
                  metrics to watch.
                </p>
              </div>
            </section>

            {/* RIGHT: Outline results */}
            <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                    Step 2 • Directions
                  </p>
                  <h2 className="text-lg font-semibold">Suggested newsletter angles</h2>
                </div>
              </div>

              {/* Tiny guided-tour hint about “Use for draft” */}
              {outlineResult &&
                outlineResult.ideas.length > 0 &&
                !directionHintDismissed && (
                  <div className="rounded-2xl border border-ww-violet/40 bg-ww-violet/10 px-3 py-2 text-[0.7rem] text-white/80 flex items-start justify-between gap-2">
                    <p>
                      <span className="font-semibold text-ww-violet">Tip:</span>{' '}
                      Click <span className="font-semibold">“Use for draft”</span> on any
                      direction to pre-fill the{' '}
                      <span className="font-semibold">Full Email Draft</span> tab with that
                      angle’s subject, hook and context.
                    </p>
                    <button
                      type="button"
                      onClick={dismissDirectionHint}
                      className="ml-2 text-white/60 hover:text-white text-[0.7rem] whitespace-nowrap"
                    >
                      Got it
                    </button>
                  </div>
                )}

              {!outlineResult && !loadingOutline && (
                <p className="text-sm text-white/60">
                  Once you hit <span className="text-ww-violet">Generate</span>, your
                  newsletter ideas will appear here as separate, label-ready directions.
                </p>
              )}

              {loadingOutline && (
                <p className="text-sm text-white/60 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gathering story angles, cadences and CTAs…
                </p>
              )}

              {outlineResult && outlineResult.ideas.length > 0 && (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                  {outlineResult.ideas.map(idea => (
                    <article
                      key={idea.id}
                      className={`rounded-2xl border p-4 md:p-5 transition ${
                        selectedIdeaId === idea.id
                          ? 'border-ww-violet bg-white/5 shadow-[0_0_22px_rgba(186,85,211,0.45)]'
                          : 'border-white/12 bg-black/50 hover:border-ww-violet/80 hover:shadow-[0_0_18px_rgba(186,85,211,0.35)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-white/45">
                            Direction {idea.id}
                          </p>
                          <h3 className="text-base md:text-lg font-semibold">
                            {idea.title}
                          </h3>
                          <p className="text-xs text-white/55">
                            Suggested subject:{' '}
                            <span className="text-white/85">{idea.subjectLine}</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedIdeaId(prev => (prev === idea.id ? null : idea.id))
                          }
                          className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-white/15 text-[0.7rem] text-white/80 hover:border-ww-violet hover:text-white transition"
                        >
                          {selectedIdeaId === idea.id ? (
                            <>
                              <Check className="w-3 h-3" />
                              Selected
                            </>
                          ) : (
                            <>
                              <ArrowRight className="w-3 h-3" />
                              Use for draft
                            </>
                          )}
                        </button>
                      </div>

                      <p className="mt-2 text-sm text-white/80">{idea.summary}</p>

                      <div className="mt-3 grid gap-3 md:grid-cols-2 text-xs text-white/75">
                        {/* Cadence */}
                        {idea.cadencePlan.length > 0 && (
                          <div>
                            <p className="font-semibold text-white/70 mb-1">
                              Cadence & rhythm
                            </p>
                            <ul className="space-y-1">
                              {idea.cadencePlan.map((line, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="mt-[0.2rem] h-1.5 w-1.5 rounded-full bg-ww-violet/80" />
                                  <span>{line}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Segments */}
                        {idea.segments.length > 0 && (
                          <div>
                            <p className="font-semibold text-white/70 mb-1">
                              Who you’re really speaking to
                            </p>
                            <ul className="space-y-1">
                              {idea.segments.map((s, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="mt-[0.2rem] h-1.5 w-1.5 rounded-full bg-white/40" />
                                  <span>{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Value sections */}
                      {idea.valueSections.length > 0 && (
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {idea.valueSections.map((sec, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-white/12 bg-black/60 p-3"
                            >
                              <p className="text-[0.75rem] font-semibold text-white/80 mb-1">
                                {sec.heading}
                              </p>
                              {sec.bullets.map((b, bi) => (
                                <p key={bi} className="text-xs text-white/70">
                                  • {b}
                                </p>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* CTAs + metrics */}
                      {(idea.ctas.length > 0 || idea.metrics.length > 0) && (
                        <div className="mt-3 grid gap-3 md:grid-cols-2 text-xs">
                          {idea.ctas.length > 0 && (
                            <div>
                              <p className="font-semibold text-white/70 mb-1">
                                Call-to-actions
                              </p>
                              <ul className="space-y-1 text-white/75">
                                {idea.ctas.map((c, idx) => (
                                  <li key={idx}>• {c}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {idea.metrics.length > 0 && (
                            <div>
                              <p className="font-semibold text-white/70 mb-1">
                                Metrics to watch
                              </p>
                              <ul className="space-y-1 text-white/75">
                                {idea.metrics.map((m, idx) => (
                                  <li key={idx}>• {m}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ---------------- FULL DRAFT TAB ---------------- */}
        {activeTab === 'draft' && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.45fr)]">
            {/* LEFT: Draft controls */}
            <section className="rounded-3xl border border-white/10 bg-black/80 p-5 md:p-6 space-y-5">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-white/50">
                  Step 3 • Email draft
                </p>
                <p className="text-sm text-white/65">
                  Pick one of your directions (optional), then let WW draft the full email
                  ready to paste into your mailing platform.
                </p>
              </div>

              {outlineResult && outlineResult.ideas.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-white/55">
                    Choose a direction to base this email on (optional):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {outlineResult.ideas.map(idea => (
                      <button
                        key={idea.id}
                        type="button"
                        onClick={() =>
                          setSelectedIdeaId(prev => (prev === idea.id ? null : idea.id))
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[0.75rem] transition ${
                          selectedIdeaId === idea.id
                            ? 'border-ww-violet bg-ww-violet/20 text-white shadow-[0_0_16px_rgba(186,85,211,0.7)]'
                            : 'border-white/15 bg-white/5 text-white/80 hover:border-ww-violet/70'
                        }`}
                      >
                        {selectedIdeaId === idea.id ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <ArrowRight className="w-3 h-3" />
                        )}
                        {idea.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject + hook with AI helper */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-white/55 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Subject & hook
                  </p>
                  <button
                    type="button"
                    onClick={handleSuggestSubjectAndHook}
                    disabled={loadingSubjectHook}
                    className={primaryButtonClass}
                  >
                    {loadingSubjectHook ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        AI subject & hook
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        AI subject & hook
                      </>
                    )}
                  </button>
                </div>

                <input
                  value={draftSubject}
                  onChange={e => setDraftSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white placeholder-white/35 focus:border-ww-violet focus:outline-none"
                  placeholder="Subject line (you can edit what the AI suggests)"
                />
                <textarea
                  value={draftHook}
                  onChange={e => setDraftHook(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-white/35 focus:border-ww-violet focus:outline-none"
                  placeholder="One or two sentences that set the scene and pull readers into the main story."
                />
              </div>

              {/* Context for body */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-white/55">
                    Who are you picturing as you write?
                  </p>
                  <textarea
                    value={draftAudience}
                    onChange={e => setDraftAudience(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-white/35 focus:border-ww-violet focus:outline-none"
                    placeholder="e.g. day-one supporters, casual listeners on your list, local scene, producers, etc."
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/55">
                    Main “offer” or action you’d love them to take
                  </p>
                  <textarea
                    value={draftOffer}
                    onChange={e => setDraftOffer(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-white/35 focus:border-ww-violet focus:outline-none"
                    placeholder="Stream a single, pre-save, grab tickets, reply with thoughts, share with a friend, etc."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-white/55">Any guardrails or extra notes?</p>
                <textarea
                  value={draftAdditionalNotes}
                  onChange={e => setDraftAdditionalNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-white/35 focus:border-ww-violet focus:outline-none"
                  placeholder="Words to avoid, things that MUST be mentioned, personal details you do or don’t want to share, etc."
                />
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerateFullEmail}
                  disabled={loadingFullEmail}
                  className={primaryButtonClass}
                >
                  {loadingFullEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Drafting email…
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Draft full email
                    </>
                  )}
                </button>
                <p className="text-[0.7rem] text-white/55">
                  You’ll get a clean, label-ready draft on the right – fully editable before
                  you paste it into your email tool.
                </p>
              </div>
            </section>

            {/* RIGHT: Full email preview */}
            <section className="rounded-3xl border border-white/10 bg-white text-black p-5 md:p-7 flex flex-col gap-4 max-h-[78vh]">
              <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-3">
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.18em] text-black/50">
                    Preview
                  </p>
                  <h2 className="text-base md:text-lg font-semibold">
                    Newsletter draft (reader view)
                  </h2>
                </div>

                {fullEmail && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyFullEmail}
                      className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-black/20 text-[0.75rem] text-black/80 hover:border-black/60 transition"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <ClipboardIcon className="w-3 h-3" />
                          Copy email
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadEmailPdf}
                      disabled={downloadingPdf}
                      className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-black/20 text-[0.75rem] text-black/80 hover:border-black/60 transition disabled:opacity-60"
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
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-1 text-sm leading-relaxed">
                {!fullEmail && (
                  <p className="text-black/60">
                    Once you generate, the full email will render here in a clean,
                    label-ready layout. You can copy it straight into Mailchimp, Substack,
                    ConvertKit, or wherever you send from.
                  </p>
                )}

                {fullEmail && (
                  <div className="space-y-4">
                    {/* Subject + preheader */}
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-black/60">SUBJECT</p>
                      <p className="text-base font-semibold">{fullEmail.subject}</p>
                      {fullEmail.preheader && (
                        <p className="text-xs text-black/60">{fullEmail.preheader}</p>
                      )}
                    </div>

                    {/* Intro */}
                    {fullEmail.intro && <p>{fullEmail.intro}</p>}

                    {/* Sections */}
                    {Array.isArray(fullEmail.sections) &&
                      fullEmail.sections.map((sec, idx) => (
                        <section key={idx} className="space-y-1">
                          {sec.heading && (
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-black/70">
                              {sec.heading}
                            </h3>
                          )}
                          <p>{sec.body}</p>
                        </section>
                      ))}

                    {/* Closing */}
                    {fullEmail.closing && <p>{fullEmail.closing}</p>}

                    {fullEmail.ps && (
                      <p className="text-sm">
                        <span className="font-semibold">P.S.</span> {fullEmail.ps}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  )
}

/* Small local icon so we don't have to import extra */
function ClipboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h1a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1" />
    </svg>
  )
}
