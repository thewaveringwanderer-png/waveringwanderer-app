'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster, toast } from 'sonner'
import { createClient } from '@supabase/supabase-js'
import { useWwProfile } from '@/hooks/useWwProfile'
import { effectiveTier, getUsage, bumpUsage } from '@/lib/wwProfile'
import { useGeneratingMessages } from '@/hooks/useGeneratingMessages'
import { type PdfLine } from '@/lib/wwPdf'
import {
  CalendarDays,
  Rocket,
  Sparkles,
  Loader2,
  Music2,
  Download,
  ChevronRight,Trash2,
  Save,
  Pencil,
  Expand,
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function normalizePdfText(value: unknown) {
  return String(value || '')
    .replace(/\u00A0/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim()
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : []
}

type StrategySummary = {
  coreIdea?: string
  primaryFocus?: string[]
  whyThisAngleWorksNow?: string
}

type StartHereBlock = {
  today?: string[]
  thisWeek?: string[]
  firstPost?: {
    idea?: string
    hookOptions?: string[]
    captionExample?: string
    cta?: string
  }
}

type StrategyMove = {
  action?: string
  whyThisMatters?: string
  hooks?: string[]
  captionExample?: string
}

type StrategyPhase = {
  label?: string
  timeframe?: string
  focus?: string
  focusPlay?: {
    title?: string
    idea?: string
    whyThisMatters?: string
  }
  primaryMoves?: StrategyMove[]
  secondaryMoves?: StrategyMove[]
}

type PlaylistStrategy = {
  whereToSearch?: string[]
  pitchAngle?: string
  whyItFits?: string
}

export type ReleaseStrategyPlan = {
  summary?: StrategySummary
  startHere?: StartHereBlock
  keyMoments?: string[]
  weeklyCadence?: {
    postsPerWeek?: string
    weeklyBreakdown?: string[]
    outreachPerWeek?: string
    creationRoutine?: string[]
    testingRoutine?: string[]
  }
  phases?: StrategyPhase[]
  playlistStrategy?: PlaylistStrategy
  playlistKeywords?: {
    primary?: string[]
    secondary?: string[]
    avoid?: string[]
  }
  metrics?: string[]
}

type OpenSections = {
  summary: boolean
  startHere: boolean
  keyMoments: boolean
  weeklyCadence: boolean
  phases: boolean
  playlistStrategy: boolean
  playlistKeywords: boolean
  metrics: boolean
}

const RELEASE_STRATEGY_GENERATING_MESSAGES = [
  'Reading your release context...',
  'Planning your rollout phases...',
  'Sequencing your key moments...',
  'Building your release strategy...',
]

function normalizeMoveArray(value: unknown): StrategyMove[] {
  if (!Array.isArray(value)) return []

  const normalized = value
    .map((item): StrategyMove | null => {
      if (typeof item === 'string') {
        const action = item.trim()
        if (!action) return null

        return {
          action,
          whyThisMatters: '',
          hooks: [],
          captionExample: '',
        }
      }

      if (item && typeof item === 'object') {
        const move = item as Record<string, unknown>
        const action = asString(move.action)

        if (!action) return null

        return {
          action,
          whyThisMatters: asString(move.whyThisMatters),
          hooks: asStringArray(move.hooks),
          captionExample: asString(move.captionExample),
        }
      }

      return null
    })
    .filter(Boolean)

  return normalized as StrategyMove[]
}

function normalizeReleaseStrategyPlan(raw: any): ReleaseStrategyPlan {
  return {
    summary: {
      coreIdea: asString(raw?.summary?.coreIdea),
      primaryFocus: asStringArray(raw?.summary?.primaryFocus),
      whyThisAngleWorksNow: asString(raw?.summary?.whyThisAngleWorksNow),
    },

    startHere: {
      today: asStringArray(raw?.startHere?.today),
      thisWeek: asStringArray(raw?.startHere?.thisWeek),
      firstPost: {
        idea: asString(raw?.startHere?.firstPost?.idea),
        hookOptions: asStringArray(raw?.startHere?.firstPost?.hookOptions),
        captionExample: asString(raw?.startHere?.firstPost?.captionExample),
        cta: asString(raw?.startHere?.firstPost?.cta),
      },
    },

    keyMoments: asStringArray(raw?.keyMoments),

    weeklyCadence: {
      postsPerWeek: asString(raw?.weeklyCadence?.postsPerWeek),
      weeklyBreakdown: asStringArray(raw?.weeklyCadence?.weeklyBreakdown),
      outreachPerWeek: asString(raw?.weeklyCadence?.outreachPerWeek),
      creationRoutine: asStringArray(raw?.weeklyCadence?.creationRoutine),
      testingRoutine: asStringArray(raw?.weeklyCadence?.testingRoutine),
    },

    phases: Array.isArray(raw?.phases)
      ? raw.phases.map((phase: any) => ({
          label: asString(phase?.label, 'Phase'),
          timeframe: asString(phase?.timeframe),
          focus: asString(phase?.focus),
          focusPlay: {
            title: asString(phase?.focusPlay?.title),
            idea: asString(phase?.focusPlay?.idea),
            whyThisMatters: asString(phase?.focusPlay?.whyThisMatters),
          },
          primaryMoves: normalizeMoveArray(phase?.primaryMoves),
          secondaryMoves: normalizeMoveArray(phase?.secondaryMoves),
        }))
      : [],

    playlistStrategy: {
      whereToSearch: asStringArray(raw?.playlistStrategy?.whereToSearch),
      pitchAngle: asString(raw?.playlistStrategy?.pitchAngle),
      whyItFits: asString(raw?.playlistStrategy?.whyItFits),
    },

    playlistKeywords: {
      primary: asStringArray(raw?.playlistKeywords?.primary),
      secondary: asStringArray(raw?.playlistKeywords?.secondary),
      avoid: asStringArray(raw?.playlistKeywords?.avoid),
    },

    metrics: asStringArray(raw?.metrics),
  }
}

function buildReleaseStrategyPdfLines(args: {
  artistName: string
  projectTitle: string
  releaseType: 'single' | 'ep' | 'album'
  executionIntensity: 'light' | 'standard' | 'aggressive'
  releaseDate: string
  headlineGoal: string
  secondaryGoals: string
  coreStory: string
  keyTracks: string
  runwayWeeks: number
  platformFocus: string
  budgetNotes: string
  songMood: string
  songEnergy: string
  referenceArtists: string
  targetListener: string
  plan: ReleaseStrategyPlan
}): PdfLine[] {
  const {
    artistName,
    projectTitle,
    releaseType,
    executionIntensity,
    releaseDate,
    headlineGoal,
    secondaryGoals,
    coreStory,
    keyTracks,
    runwayWeeks,
    platformFocus,
    budgetNotes,
    songMood,
    songEnergy,
    referenceArtists,
    targetListener,
    plan,
  } = args

  const lines: PdfLine[] = []

  const title = normalizePdfText(projectTitle || 'Release Strategy')
  lines.push({ kind: 'title', text: `${title} • ${releaseType.toUpperCase()}` })

  const subtitleParts: string[] = []
  if (artistName) subtitleParts.push(normalizePdfText(artistName))
  if (releaseDate) subtitleParts.push(`Target date: ${normalizePdfText(releaseDate)}`)
  if (subtitleParts.length === 0) subtitleParts.push('Release playbook')
  lines.push({ kind: 'subtitle', text: subtitleParts.join(' • ') })

  const metaBullets: string[] = []
  if (headlineGoal) metaBullets.push(`Headline goal: ${normalizePdfText(headlineGoal)}`)
  if (secondaryGoals) metaBullets.push(`Secondary goals: ${normalizePdfText(secondaryGoals)}`)
  if (coreStory) metaBullets.push(`Core story: ${normalizePdfText(coreStory)}`)
  if (keyTracks) metaBullets.push(`Key tracks: ${normalizePdfText(keyTracks)}`)
  if (Number.isFinite(runwayWeeks)) metaBullets.push(`Runway: ${runwayWeeks} weeks`)
  if (platformFocus) metaBullets.push(`Platform focus: ${normalizePdfText(platformFocus)}`)
  if (budgetNotes) metaBullets.push(`Budget/constraints: ${normalizePdfText(budgetNotes)}`)
  if (songMood) metaBullets.push(`Song mood: ${normalizePdfText(songMood)}`)
  if (songEnergy) metaBullets.push(`Song energy: ${normalizePdfText(songEnergy)}`)
  if (referenceArtists) metaBullets.push(`Reference artists: ${normalizePdfText(referenceArtists)}`)
  if (targetListener) metaBullets.push(`Target listener: ${normalizePdfText(targetListener)}`)
  if (executionIntensity) metaBullets.push(`Execution intensity: ${normalizePdfText(executionIntensity)}`)

  if (metaBullets.length) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Inputs' })
    lines.push({
      kind: 'body',
      text: metaBullets.map((b) => `• ${b}`).join('\n'),
    })
  }

  if (plan.summary) {
    const summaryLines: string[] = []

    if (plan.summary.coreIdea) {
      summaryLines.push(`Core idea:\n${normalizePdfText(plan.summary.coreIdea)}`)
    }

    if (Array.isArray(plan.summary.primaryFocus) && plan.summary.primaryFocus.length) {
      summaryLines.push(
        `Primary focus:\n${plan.summary.primaryFocus
          .map((item) => `• ${normalizePdfText(item)}`)
          .join('\n')}`
      )
    }

    if (plan.summary.whyThisAngleWorksNow) {
      summaryLines.push(
        `Why this release angle works now:\n${normalizePdfText(plan.summary.whyThisAngleWorksNow)}`
      )
    }

    if (summaryLines.length) {
      lines.push({ kind: 'divider' })
      lines.push({ kind: 'sectionTitle', text: 'Strategy summary' })
      lines.push({ kind: 'body', text: summaryLines.join('\n\n') })
    }
  }

  if (plan.startHere) {
    const startLines: string[] = []

    if (Array.isArray(plan.startHere.today) && plan.startHere.today.length) {
      startLines.push(
        `Do this today:\n${plan.startHere.today
          .map((item) => `• ${normalizePdfText(item)}`)
          .join('\n')}`
      )
    }

    if (Array.isArray(plan.startHere.thisWeek) && plan.startHere.thisWeek.length) {
      startLines.push(
        `This week:\n${plan.startHere.thisWeek
          .map((item) => `• ${normalizePdfText(item)}`)
          .join('\n')}`
      )
    }

    if (plan.startHere.firstPost) {
      const firstPostLines: string[] = []

      if (plan.startHere.firstPost.idea) {
        firstPostLines.push(`Idea: ${normalizePdfText(plan.startHere.firstPost.idea)}`)
      }

      if (
        Array.isArray(plan.startHere.firstPost.hookOptions) &&
        plan.startHere.firstPost.hookOptions.length
      ) {
        firstPostLines.push(
          `Hook options:\n${plan.startHere.firstPost.hookOptions
            .map((item) => `• ${normalizePdfText(item)}`)
            .join('\n')}`
        )
      }

      if (plan.startHere.firstPost.captionExample) {
        firstPostLines.push(
          `Caption example:\n${normalizePdfText(plan.startHere.firstPost.captionExample)}`
        )
      }

      if (plan.startHere.firstPost.cta) {
        firstPostLines.push(`CTA: ${normalizePdfText(plan.startHere.firstPost.cta)}`)
      }

      if (firstPostLines.length) {
        startLines.push(`First post:\n${firstPostLines.join('\n\n')}`)
      }
    }

    if (startLines.length) {
      lines.push({ kind: 'divider' })
      lines.push({ kind: 'sectionTitle', text: 'Start here' })
      lines.push({ kind: 'body', text: startLines.join('\n\n') })
    }
  }

  if (Array.isArray(plan.keyMoments) && plan.keyMoments.length) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Key moments' })
    lines.push({
      kind: 'body',
      text: plan.keyMoments.map((m) => `• ${normalizePdfText(m)}`).join('\n'),
    })
  }

  if (plan.weeklyCadence) {
    const cadenceLines: string[] = []

    if (plan.weeklyCadence.postsPerWeek) {
      cadenceLines.push(`Posting rhythm:\n${normalizePdfText(plan.weeklyCadence.postsPerWeek)}`)
    }

    if (
      Array.isArray(plan.weeklyCadence.weeklyBreakdown) &&
      plan.weeklyCadence.weeklyBreakdown.length
    ) {
      cadenceLines.push(
        `Weekly breakdown:\n${plan.weeklyCadence.weeklyBreakdown
          .map((item) => `• ${normalizePdfText(item)}`)
          .join('\n')}`
      )
    }

    if (plan.weeklyCadence.outreachPerWeek) {
      cadenceLines.push(`Outreach rhythm:\n${normalizePdfText(plan.weeklyCadence.outreachPerWeek)}`)
    }

    if (
      Array.isArray(plan.weeklyCadence.creationRoutine) &&
      plan.weeklyCadence.creationRoutine.length
    ) {
      cadenceLines.push(
        `Creation routine:\n${plan.weeklyCadence.creationRoutine
          .map((item) => `• ${normalizePdfText(item)}`)
          .join('\n')}`
      )
    }

    if (
      Array.isArray(plan.weeklyCadence.testingRoutine) &&
      plan.weeklyCadence.testingRoutine.length
    ) {
      cadenceLines.push(
        `Testing routine:\n${plan.weeklyCadence.testingRoutine
          .map((item) => `• ${normalizePdfText(item)}`)
          .join('\n')}`
      )
    }

    if (cadenceLines.length) {
      lines.push({ kind: 'divider' })
      lines.push({ kind: 'sectionTitle', text: 'Weekly cadence' })
      lines.push({ kind: 'body', text: cadenceLines.join('\n\n') })
    }
  }

  if (Array.isArray(plan.phases) && plan.phases.length) {
    for (const ph of plan.phases) {
      const label = normalizePdfText(ph.label || 'Phase')
      const timeframe = normalizePdfText(ph.timeframe || '')
      const focus = normalizePdfText(ph.focus || '')

      const focusPlayLines = [
        ph.focusPlay?.title ? `Focus play: ${normalizePdfText(ph.focusPlay.title)}` : '',
        ph.focusPlay?.idea ? normalizePdfText(ph.focusPlay.idea) : '',
        ph.focusPlay?.whyThisMatters
          ? `Why this matters: ${normalizePdfText(ph.focusPlay.whyThisMatters)}`
          : '',
      ].filter(Boolean)

      const primaryMoves = (ph.primaryMoves || [])
        .map((move) => {
          const action = normalizePdfText(move.action || '')
          const why = normalizePdfText(move.whyThisMatters || '')
          const hooks =
            Array.isArray(move.hooks) && move.hooks.length
              ? `\n  Hooks: ${move.hooks.map((hook) => normalizePdfText(hook)).join(' | ')}`
              : ''
          const caption = move.captionExample
            ? `\n  Caption example: ${normalizePdfText(move.captionExample)}`
            : ''

          if (!action) return ''
          return why
            ? `• ${action}\n  Why this matters: ${why}${hooks}${caption}`
            : `• ${action}${hooks}${caption}`
        })
        .filter(Boolean)

      const secondaryMoves = (ph.secondaryMoves || [])
        .map((move) => {
          const action = normalizePdfText(move.action || '')
          const why = normalizePdfText(move.whyThisMatters || '')
          const hooks =
            Array.isArray(move.hooks) && move.hooks.length
              ? `\n  Hooks: ${move.hooks.map((hook) => normalizePdfText(hook)).join(' | ')}`
              : ''
          const caption = move.captionExample
            ? `\n  Caption example: ${normalizePdfText(move.captionExample)}`
            : ''

          if (!action) return ''
          return why
            ? `• ${action}\n  Why this matters: ${why}${hooks}${caption}`
            : `• ${action}${hooks}${caption}`
        })
        .filter(Boolean)

      lines.push({ kind: 'divider' })
      lines.push({
        kind: 'sectionTitle',
        text: timeframe ? `${label} (${timeframe})` : label,
      })

      if (focus) {
        lines.push({ kind: 'body', text: focus })
      }

      if (focusPlayLines.length) {
        lines.push({
          kind: 'body',
          text: focusPlayLines.join('\n'),
        })
      }

      if (primaryMoves.length) {
        lines.push({
          kind: 'body',
          text: `Primary moves\n${primaryMoves.join('\n\n')}`,
        })
      }

      if (secondaryMoves.length) {
        lines.push({
          kind: 'body',
          text: `Secondary moves\n${secondaryMoves.join('\n\n')}`,
        })
      }
    }
  }

  if (plan.playlistStrategy) {
    const strategyLines: string[] = []

    if (
      Array.isArray(plan.playlistStrategy.whereToSearch) &&
      plan.playlistStrategy.whereToSearch.length
    ) {
      strategyLines.push(
        `Where to search:\n${plan.playlistStrategy.whereToSearch
          .map((item) => `• ${normalizePdfText(item)}`)
          .join('\n')}`
      )
    }

    if (plan.playlistStrategy.pitchAngle) {
      strategyLines.push(`Pitch angle:\n${normalizePdfText(plan.playlistStrategy.pitchAngle)}`)
    }

    if (plan.playlistStrategy.whyItFits) {
      strategyLines.push(`Why it fits:\n${normalizePdfText(plan.playlistStrategy.whyItFits)}`)
    }

    if (strategyLines.length) {
      lines.push({ kind: 'divider' })
      lines.push({ kind: 'sectionTitle', text: 'Playlist strategy' })
      lines.push({ kind: 'body', text: strategyLines.join('\n\n') })
    }
  }

  if (plan.playlistKeywords) {
    const keywordLines: string[] = []

    if (Array.isArray(plan.playlistKeywords.primary) && plan.playlistKeywords.primary.length) {
      keywordLines.push(
        `Primary:\n${plan.playlistKeywords.primary
          .map((item) => `• ${normalizePdfText(item)}`)
          .join('\n')}`
      )
    }

    if (
      Array.isArray(plan.playlistKeywords.secondary) &&
      plan.playlistKeywords.secondary.length
    ) {
      keywordLines.push(
        `Secondary:\n${plan.playlistKeywords.secondary
          .map((item) => `• ${normalizePdfText(item)}`)
          .join('\n')}`
      )
    }

    if (Array.isArray(plan.playlistKeywords.avoid) && plan.playlistKeywords.avoid.length) {
      keywordLines.push(
        `Avoid:\n${plan.playlistKeywords.avoid
          .map((item) => `• ${normalizePdfText(item)}`)
          .join('\n')}`
      )
    }

    if (keywordLines.length) {
      lines.push({ kind: 'divider' })
      lines.push({ kind: 'sectionTitle', text: 'Playlist search keywords' })
      lines.push({ kind: 'body', text: keywordLines.join('\n\n') })
    }
  }

  if (Array.isArray(plan.metrics) && plan.metrics.length) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Metrics to watch' })
    lines.push({
      kind: 'body',
      text: plan.metrics.map((m) => `• ${normalizePdfText(m)}`).join('\n'),
    })
  }

  return lines
}

function InputSection({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.05] via-black to-black p-4 md:p-5 space-y-4 transition hover:border-ww-violet/35 hover:shadow-[0_0_18px_rgba(186,85,211,0.12)]">
      <div>
        <div className="h-[2px] w-10 bg-ww-violet/60 rounded-full mb-2" />
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">{title}</p>
        {hint ? (
          <p className="mt-2 text-sm text-white/66 leading-relaxed">{hint}</p>
        ) : null}
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  )
}

function CollapsibleSection({
  title,
  sectionKey,
  openSections,
  toggleSection,
  children,
}: {
  title: string
  sectionKey: keyof OpenSections
  openSections: OpenSections
  toggleSection: (key: keyof OpenSections) => void
  children: React.ReactNode
}) {
  const hints: Partial<Record<keyof OpenSections, string>> = {
    summary: 'The core idea, focus, and why this angle works now',
    startHere: 'Immediate actions, first post, hooks, caption, and CTA',
    keyMoments: 'Important dates, beats, and campaign milestones',
    weeklyCadence: 'What to focus on each week',
    phases: 'Pre-launch, launch, and post-launch structure',
    playlistStrategy: 'How to position the release for discovery',
    playlistKeywords: 'Search terms for playlist pitching and research',
    metrics: 'Signals that show what is working',
  }

  const open = openSections[sectionKey]

  return (
    <div className="rounded-2xl border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.06] via-black/80 to-black overflow-hidden transition hover:border-ww-violet/35">
      <button
        type="button"
        onClick={() => toggleSection(sectionKey)}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">
            {title}
          </p>
          <p className="mt-1 text-sm text-white/42">
            {hints[sectionKey] || 'Open this section for more detail'}
          </p>
        </div>

        <ChevronRight
          className={`h-5 w-5 shrink-0 text-white/45 transition ${
            open ? 'rotate-90 text-ww-violet' : ''
          }`}
        />
      </button>

      {open ? (
        <div className="border-t border-white/10 px-4 pb-4 pt-4">
          {children}
        </div>
      ) : null}
    </div>
  )
}

export default function ReleaseStrategyPage() {

const router = useRouter()

  const {
    profile,
    hasProfile: hasAnyProfile,
    updateProfile: save,
    updateProfile,
  } = useWwProfile()

  useEffect(() => {
  if (profile && !profile.onboarding_started) {
    updateProfile({ onboarding_started: true })
  }
}, [profile])

const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

const tier = effectiveTier(profile)
const usage = useMemo(() => (mounted ? getUsage(profile) : {}), [mounted, profile])
const usedReleaseStrategyGenerations = Number((usage as any)?.['release_strategy_generations'] ?? 0)
const [releaseFreeLimitReached, setReleaseFreeLimitReached] = useState(false)

const releaseStrategyLocked =
  mounted &&
  tier === 'free' &&
  (usedReleaseStrategyGenerations >= 1 || releaseFreeLimitReached)

const isFreeReleasePreview = mounted && tier === 'free'
  const [artistName, setArtistName] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [releaseType, setReleaseType] = useState<'single' | 'ep' | 'album'>('single')
  const [releaseDate, setReleaseDate] = useState('')
  const [headlineGoal, setHeadlineGoal] = useState('')
  const [secondaryGoals, setSecondaryGoals] = useState('')
  const [coreStory, setCoreStory] = useState('')
  const [keyTracks, setKeyTracks] = useState('')
  const [songMood, setSongMood] = useState('')
  const [songEnergy, setSongEnergy] = useState('')
  const [referenceArtists, setReferenceArtists] = useState('')
  const [targetListener, setTargetListener] = useState('')
  const [runwayWeeks, setRunwayWeeks] = useState<number>(6)
  const [platformFocus, setPlatformFocus] = useState('TikTok + Instagram Reels')
  const [budgetNotes, setBudgetNotes] = useState('')
  const [savedIdentityKits, setSavedIdentityKits] = useState<any[]>([])
const [loadingIdentityKits, setLoadingIdentityKits] = useState(false)
const [selectedIdentityKitId, setSelectedIdentityKitId] = useState('')
const [selectedIdentityKit, setSelectedIdentityKit] = useState<any | null>(null)
  const [executionIntensity, setExecutionIntensity] = useState<
    'light' | 'standard' | 'aggressive'
  >('standard')
  
  useEffect(() => {
  if (mounted && tier === 'free' && executionIntensity !== 'light') {
    setExecutionIntensity('light')
  }
}, [mounted, tier, executionIntensity])

  const [loadingPlan, setLoadingPlan] = useState(false)
  const [plan, setPlan] = useState<ReleaseStrategyPlan | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [savingStrategy, setSavingStrategy] = useState(false)
  const [savedStrategies, setSavedStrategies] = useState<any[]>([])
  const [loadingSavedStrategies, setLoadingSavedStrategies] = useState(false)
  const [selectedStrategyId, setSelectedStrategyId] = useState('')
  const [deletingStrategyId, setDeletingStrategyId] = useState('')
  const [openSections, setOpenSections] = useState<OpenSections>({
    summary: true,
    startHere: true,
    keyMoments: true,
    weeklyCadence: true,
    phases: true,
    playlistStrategy: true,
    playlistKeywords: true,
    metrics: true,
  })

  const generatingMessage = useGeneratingMessages(
    loadingPlan,
    RELEASE_STRATEGY_GENERATING_MESSAGES
  )

  const primaryBtn =
    'inline-flex items-center gap-2 px-4 h-9 rounded-full bg-ww-violet text-xs md:text-sm font-semibold ' +
    'shadow-[0_0_16px_rgba(186,85,211,0.7)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] ' +
    'active:scale-95 transition disabled:opacity-60'

  const outlineBtn =
    'inline-flex items-center gap-2 px-4 h-9 rounded-full border border-white/20 text-white/85 text-xs md:text-sm ' +
    'hover:border-ww-violet hover:bg-ww-violet/20 hover:text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.7)] ' +
    'active:scale-95 transition disabled:opacity-60'

  const panelClass =
    'relative overflow-hidden rounded-[28px] border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.06] via-black to-black shadow-[0_0_24px_rgba(186,85,211,0.08)]'

  const inputClass =
    'w-full px-3 py-2.5 rounded-xl bg-black/80 border border-white/12 text-sm text-white placeholder-white/35 focus:border-ww-violet focus:outline-none transition'

  const textareaClass =
    'w-full px-3 py-2.5 rounded-xl bg-black/80 border border-white/12 text-sm text-white placeholder-white/35 focus:border-ww-violet focus:outline-none transition'

  const labelClass = 'text-xs text-white/75 flex items-center gap-1'

  function resetReleaseStrategyForm() {
    setSelectedIdentityKitId('')
    setSelectedIdentityKit(null)
    setSelectedStrategyId('')
    setPlan(null)
    setArtistName('')
    setProjectTitle('')
    setReleaseType('single')
    setReleaseDate('')
    setHeadlineGoal('')
    setSecondaryGoals('')
    setCoreStory('')
    setKeyTracks('')
    setSongMood('')
    setSongEnergy('')
    setReferenceArtists('')
    setTargetListener('')
    setRunwayWeeks(6)
    setPlatformFocus('TikTok + Instagram Reels')
    setBudgetNotes('')
    setExecutionIntensity('standard')
  }

  function applyProfile() {
    setArtistName((prev) => prev || (profile?.artistName as string) || '')
    setHeadlineGoal((prev) => prev || (profile?.goal as string) || '')
    toast.success('Profile applied ✅')
  }

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setLoadingSavedStrategies(true)

      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData?.user) {
          if (!cancelled) setSavedStrategies([])
          return
        }

        const { data, error } = await supabase
          .from('release_strategies')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)

        if (!cancelled) {
          setSavedStrategies(data || [])
        }
      } catch (e) {
        console.error('[release-strategy] load saved strategies', e)
        if (!cancelled) setSavedStrategies([])
      } finally {
        if (!cancelled) setLoadingSavedStrategies(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
  let cancelled = false

  ;(async () => {
    setLoadingIdentityKits(true)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData?.user) {
        if (!cancelled) setSavedIdentityKits([])
        return
      }

      const { data, error } = await supabase
        .from('identity_kits')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)

      if (!cancelled) {
        setSavedIdentityKits(data || [])
      }
    } catch (e) {
      console.error('[release-strategy] load identity kits', e)
      if (!cancelled) setSavedIdentityKits([])
    } finally {
      if (!cancelled) setLoadingIdentityKits(false)
    }
  })()

  return () => {
    cancelled = true
  }
}, [])

  async function handleGeneratePlan() {

if (releaseStrategyLocked) {
  toast.info('Upgrade to Creator to keep using Release Strategy.')
  router.push('/pricing')
  return
}

if (tier === 'free' && executionIntensity !== 'light') {
  setExecutionIntensity('light')
  toast.info('Free preview uses Light mode.')
  return
}

    if (!artistName || !projectTitle) {
      toast.error('Add at least an artist name and project title')
      return
    }

    void save({
      artistName,
      genre: profile?.genre,
      audience: profile?.audience,
      goal: profile?.goal,
    })

    setLoadingPlan(true)
    setPlan(null)

    try {
                const identityContext = buildIdentityContext(selectedIdentityKit)

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
          executionIntensity,
          profile,
          songMood,
          songEnergy,
          referenceArtists,
          targetListener,
          identityContext,
        }),
      })

      const rawText = await res.text()
      console.log('[release-strategy raw]', rawText)

      let cleaned = rawText.trim()

      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '')
        cleaned = cleaned.replace(/```$/, '').trim()
      }

      let data: unknown
      try {
        data = JSON.parse(cleaned)
      } catch {
        throw new Error('API returned non-JSON response')
      }

      if (!res.ok) {
        const errObj = data as any
        throw new Error(errObj?.error || 'Failed to generate release strategy')
      }

      const response = data as any
      const raw = response?.plan ?? response?.strategy ?? response
      const finalPlan = normalizeReleaseStrategyPlan(raw)

      setPlan(finalPlan)

if (tier === 'free') {
  await bumpUsage('release_strategy_generations' as any)
  setReleaseFreeLimitReached(true)
}

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
      executionIntensity,
      coreStory,
      keyTracks,
      runwayWeeks,
      platformFocus,
      budgetNotes,
      songMood,
      songEnergy,
      referenceArtists,
      targetListener,
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
    executionIntensity,
    coreStory,
    keyTracks,
    runwayWeeks,
    platformFocus,
    budgetNotes,
    songMood,
    songEnergy,
    referenceArtists,
    targetListener,
  ])

  async function handleSaveStrategy() {
    if (!plan) {
      toast.error('No strategy to save')
      return
    }

    setSavingStrategy(true)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData?.user) {
        toast.error('You must be logged in')
        return
      }

      const payload = {
        user_id: userData.user.id,
        title: projectTitle || 'Untitled strategy',
        inputs: {
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
          executionIntensity,
          songMood,
          songEnergy,
          referenceArtists,
          targetListener,
          selectedIdentityKitId,
          identityContext: buildIdentityContext(selectedIdentityKit),
        },
        result: plan,
      }

      const { data, error } = await supabase
        .from('release_strategies')
        .insert([payload])
        .select('*')
        .single()

      if (error) throw new Error(error.message)

      if (data) {
        setSavedStrategies((prev) => [data, ...prev])
        setSelectedStrategyId(data.id)
      }

      toast.success('Release strategy saved ✅')
    } catch (e: any) {
      console.error('[release-strategy save]', e)
      toast.error(e?.message || 'Could not save strategy')
    } finally {
      setSavingStrategy(false)
    }
  }

  function buildIdentityContext(identity: any | null) {
  if (!identity) return null

  const result = identity?.result || identity?.kit || identity || {}

  return {
    id: identity?.id || '',
    title: identity?.title || result?.artistName || 'Identity Kit',
    artistName: result?.artistName || '',
    brandEssence: result?.brandEssence || '',
    positioning: result?.oneLiner || result?.positioning || '',
    bio: result?.bio || '',
    toneOfVoice: Array.isArray(result?.toneOfVoice)
      ? result.toneOfVoice
      : typeof result?.toneOfVoice === 'string'
      ? [result.toneOfVoice]
      : [],
    audiencePersona: result?.audiencePersona || result?.audience || '',
    contentPillars: Array.isArray(result?.contentPillars)
      ? result.contentPillars.map((pillar: any) =>
          typeof pillar === 'string' ? pillar : pillar?.name || ''
        ).filter(Boolean)
      : [],
    visualAesthetics: result?.visualAesthetics || '',
    keywords: Array.isArray(result?.seoKeywords)
      ? result.seoKeywords
      : Array.isArray(result?.keywords)
      ? result.keywords
      : [],
  }
}

  function toggleSection(key: keyof OpenSections) {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  function handleLoadSavedStrategy(row: any) {
    const inp = row?.inputs || {}
    const result = row?.result || null

    setSelectedIdentityKitId(inp.selectedIdentityKitId || '')

if (inp.selectedIdentityKitId) {
  const matchedKit =
    savedIdentityKits.find((kit) => String(kit.id) === String(inp.selectedIdentityKitId)) || null
  setSelectedIdentityKit(matchedKit)
} else {
  setSelectedIdentityKit(null)
}

    setSelectedStrategyId(row.id || '')
    setArtistName(inp.artistName || '')
    setProjectTitle(inp.projectTitle || '')
    setReleaseType(inp.releaseType || 'single')
    setReleaseDate(inp.releaseDate || '')
    setHeadlineGoal(inp.headlineGoal || '')
    setSecondaryGoals(inp.secondaryGoals || '')
    setCoreStory(inp.coreStory || '')
    setKeyTracks(inp.keyTracks || '')
    setSongMood(inp.songMood || '')
    setSongEnergy(inp.songEnergy || '')
    setReferenceArtists(inp.referenceArtists || '')
    setTargetListener(inp.targetListener || '')
    setRunwayWeeks(Number(inp.runwayWeeks || 6))
    setPlatformFocus(inp.platformFocus || 'TikTok + Instagram Reels')
    setBudgetNotes(inp.budgetNotes || '')
    setExecutionIntensity(inp.executionIntensity || 'standard')
    setPlan(normalizeReleaseStrategyPlan(result))

    toast.success('Saved release strategy loaded ✅')
  }

  function clearLoadedStrategyOutput() {
    setSelectedStrategyId('')
    setPlan(null)
  }

  async function handleDeleteSavedStrategy(id: string) {
    const ok = window.confirm('Delete this saved release strategy?')
    if (!ok) return

    setDeletingStrategyId(id)

    try {
      const { error } = await supabase.from('release_strategies').delete().eq('id', id)
      if (error) throw new Error(error.message)

      setSavedStrategies((prev) => prev.filter((item) => item.id !== id))

      if (selectedStrategyId === id) {
        resetReleaseStrategyForm()
      }

      toast.success('Release strategy deleted ✅')
    } catch (e: any) {
      console.error('[release-strategy delete]', e)
      toast.error(e?.message || 'Could not delete strategy')
    } finally {
      setDeletingStrategyId('')
    }
  }

  async function handleDownloadPdf() {
    if (!plan) return
    setDownloadingPdf(true)

    try {
      const { renderWwPdf } = await import('@/lib/pdf.client')
      const base = projectTitle || 'release-strategy'
      await renderWwPdf(pdfLines, base)
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

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
        <header className="border-b border-white/10 pb-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] text-ww-violet/80 uppercase">
                <Rocket className="w-4 h-4" />
                <span>Release Strategy</span>
              </div>

              <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">
                Plan the release properly
              </h1>

              <p className="mt-3 text-sm md:text-base leading-relaxed text-white/65 max-w-2xl">
                Turn a song, EP, or album into a clear runway with stronger timing,
                sharper rollout phases, and more realistic momentum after release.
              </p>
            </div>
</div>
      
        </header>

        <div className="grid gap-6 xl:gap-7 lg:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.15fr)] lg:items-start">
          <section className={panelClass + ' p-5 md:p-6 xl:p-7 space-y-5'}>
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-20 left-1/2 h-[220px] w-[380px] -translate-x-1/2 rounded-full bg-ww-violet/10 blur-[80px]" />
            </div>

            

            <div className="relative space-y-5">
              <div className="max-w-xl">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Input</p>
                <h2 className="mt-1 text-lg md:text-xl font-semibold text-white">
                  Build the release brief
                </h2>
                <p className="mt-2 text-sm text-white/62 leading-relaxed">
                  This is where strategy gets shaped. A better brief creates a stronger rollout,
                  cleaner timing, and more useful execution decisions later.
                </p>
              </div>

              <div className="relative rounded-2xl border border-ww-violet/20 bg-gradient-to-r from-ww-violet/[0.12] via-ww-violet/[0.05] to-transparent p-4">
                <p className="text-sm font-medium text-white">How this fits the workflow</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  Identity Kit gives you the brand foundation. Release Strategy turns that into a
                  rollout plan. Then Idea Factory can generate content from the strategy, and
                  Momentum Board becomes the execution layer.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
  <div>
    <p className="text-sm text-white/82">Use Identity Kit for this strategy</p>
    <p className="mt-1 text-xs text-white/52">
      This will tailor the rollout to your brand tone, audience, and content pillars.
    </p>
  </div>

  {loadingIdentityKits ? (
    <div className="text-xs text-white/55 flex items-center gap-2">
      <Loader2 className="w-3 h-3 animate-spin" />
      Loading identity kits…
    </div>
  ) : savedIdentityKits.length > 0 ? (
    <div className="space-y-3">
      <select
        value={selectedIdentityKitId}
        onChange={(e) => {
          const nextId = e.target.value
          setSelectedIdentityKitId(nextId)

          const nextKit =
            savedIdentityKits.find((kit) => String(kit.id) === String(nextId)) || null

          setSelectedIdentityKit(nextKit)
        }}
        className={inputClass}
      >
        <option value="">No identity kit selected</option>
        {savedIdentityKits.map((kit) => (
          <option key={kit.id} value={kit.id}>
            {kit.title || kit.result?.artistName || 'Untitled identity kit'}
          </option>
        ))}
      </select>

      {selectedIdentityKit ? (
        <div className="rounded-xl border border-ww-violet/20 bg-ww-violet/[0.06] p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-ww-violet/75">
            Active identity
          </p>
          <p className="mt-2 text-sm text-white/82">
            {selectedIdentityKit.title || selectedIdentityKit.result?.artistName || 'Identity Kit'}
          </p>
        </div>
      ) : null}
    </div>
  ) : (
    <p className="text-xs text-white/50">
      No saved Identity Kits found yet.
    </p>
  )}
</div>

              <InputSection
                title="1. Core release setup"
                hint="Define the project itself before planning the rollout around it."
              >
                <div className="grid gap-3 md:grid-cols-[1.2fr,1fr]">
                  <div className="space-y-1">
                    <p className={labelClass}>
                      <Music2 className="w-3 h-3" />
                      Artist
                    </p>
                    <input
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                      className={inputClass}
                      placeholder="Artist / project name"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className={labelClass}>Release type</p>
                    <div className="inline-flex p-1 rounded-full bg-white/[0.04] border border-white/10 text-xs">
                      {(['single', 'ep', 'album'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setReleaseType(t)}
                          className={`px-3 py-1.5 rounded-full capitalize transition ${
                            releaseType === t
                              ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.55)]'
                              : 'text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[1.4fr,1fr]">
                  <div className="space-y-1">
                    <p className={labelClass}>Project / release title</p>
                    <input
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className={inputClass}
                      placeholder="Song, EP, or album title"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className={labelClass}>
                      <CalendarDays className="w-3 h-3" />
                      Target release date
                    </p>
                    <input
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </InputSection>

              <InputSection
                title="2. Release goal and narrative"
                hint="Clarify what this release needs to achieve and what story should drive the rollout."
              >
                <div className="space-y-1">
                  <p className={labelClass}>Headline goal</p>
                  <input
                    value={headlineGoal}
                    onChange={(e) => setHeadlineGoal(e.target.value)}
                    className={inputClass}
                    placeholder="What is the main outcome you want?"
                  />
                </div>

                <div className="space-y-1">
                  <p className={labelClass}>Secondary goals</p>
                  <input
                    value={secondaryGoals}
                    onChange={(e) => setSecondaryGoals(e.target.value)}
                    className={inputClass}
                    placeholder="Other goals: playlist adds, followers, reactions, saves..."
                  />
                </div>

                <div className="space-y-1">
                  <p className={labelClass}>Core story</p>
                  <textarea
                    value={coreStory}
                    onChange={(e) => setCoreStory(e.target.value)}
                    rows={3}
                    className={textareaClass}
                    placeholder="What is this song/project really about, and why should people care?"
                  />
                </div>

                <div className="space-y-1">
                  <p className={labelClass}>Key tracks / moments</p>
                  <input
                    value={keyTracks}
                    onChange={(e) => setKeyTracks(e.target.value)}
                    className={inputClass}
                    placeholder="Important songs, standout lyrics, or core release moments"
                  />
                </div>
              </InputSection>

              <InputSection
                title="3. Sonic and audience context"
                hint="Make the strategy more specific by describing the sound, energy, references, and listener."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className={labelClass}>Song mood</p>
                    <input
                      value={songMood}
                      onChange={(e) => setSongMood(e.target.value)}
                      className={inputClass}
                      placeholder="e.g. dark, hopeful, confrontational"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className={labelClass}>Energy level</p>
                    <input
                      value={songEnergy}
                      onChange={(e) => setSongEnergy(e.target.value)}
                      className={inputClass}
                      placeholder="low / mid / high"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className={labelClass}>Reference artists</p>
                    <input
                      value={referenceArtists}
                      onChange={(e) => setReferenceArtists(e.target.value)}
                      className={inputClass}
                      placeholder="Artists with similar world / lane"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className={labelClass}>Target listener</p>
                    <input
                      value={targetListener}
                      onChange={(e) => setTargetListener(e.target.value)}
                      className={inputClass}
                      placeholder="Describe the kind of fan this should connect with"
                    />
                  </div>
                </div>
              </InputSection>

              <InputSection
                title="4. Rollout constraints"
                hint="Set the practical limits so the strategy stays realistic."
              >
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className={labelClass}>Runway (weeks)</p>
                    <input
                      type="number"
                      min={2}
                      max={20}
                      value={runwayWeeks}
                      onChange={(e) => setRunwayWeeks(parseInt(e.target.value || '6', 10))}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <p className={labelClass}>Platform focus</p>
                    <input
                      value={platformFocus}
                      onChange={(e) => setPlatformFocus(e.target.value)}
                      className={inputClass}
                      placeholder="TikTok, Reels, Shorts, email list, live shows…"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className={labelClass}>Budget & constraints</p>
                  <textarea
                    value={budgetNotes}
                    onChange={(e) => setBudgetNotes(e.target.value)}
                    rows={2}
                    className={textareaClass}
                    placeholder="Ad spend, time constraints, collaborators, anything that changes what’s realistic."
                  />
                </div>

                <div className="space-y-1">
                  <p className={labelClass}>Execution intensity</p>
                  <div className="inline-flex p-1 rounded-full bg-white/[0.04] border border-white/10 text-xs">
                    {(['light', 'standard', 'aggressive'] as const).map((level) => {
  const disabled =
  level === 'aggressive' || (tier === 'free' && level === 'standard')

  return (
    <button
      key={level}
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        setExecutionIntensity(level)
      }}
      className={`px-3 py-1.5 rounded-full capitalize transition ${
        disabled
          ? 'opacity-40 cursor-not-allowed text-white/35'
          : executionIntensity === level
            ? 'bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.55)]'
            : 'text-white/70 hover:bg-white/10'
      }`}
      title={disabled ? 'Creator Only' : undefined}
    >
      {level}
{level === 'standard' && tier === 'free' ? ' · Creator' : ''}
{level === 'aggressive' ? ' · soon' : ''}
    </button>
  )
})}
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed">
                    Light = realistic minimum. Standard = balanced push. Aggressive = higher
                    output, outreach, and testing.
                  </p>
                </div>
              </InputSection>
{releaseStrategyLocked && (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-ww-violet/20 bg-black/60 px-4 py-3 shadow-[0_0_18px_rgba(186,85,211,0.10)]">
    <p className="text-sm text-white/80">
      You’ve used your free Release Strategy preview.
    </p>

    <button
      type="button"
      onClick={() => router.push('/pricing')}
      className="h-9 px-4 rounded-xl bg-gradient-to-r from-ww-violet/80 to-ww-violet text-white text-sm font-medium shadow-[0_0_12px_rgba(186,85,211,0.25)] hover:shadow-[0_0_18px_rgba(186,85,211,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
    >
      <Sparkles className="w-4 h-4" />
      Upgrade
    </button>
  </div>
)}
              <div className="pt-1 space-y-2">
                <button
                  type="button"
                  onClick={handleGeneratePlan}
                  disabled={loadingPlan}
                  className={primaryBtn + ' w-full justify-center h-10 text-sm'}
                >
                  {releaseStrategyLocked
  ? 'Upgrade to Creator to continue'
  : loadingPlan
  ? 'Generating…'
  : 'Generate Release Strategy'}
                </button>

                <p className="text-[0.75rem] text-white/50 min-h-[20px]">
                  {loadingPlan
                    ? generatingMessage
                    : 'A clearer brief gives you a stronger pre-release, launch week, and post-release plan.'}
                </p>
              </div>
            </div>
          </section>

          <section className={panelClass + ' p-5 md:p-6 xl:p-7 h-full'}>
            {loadingPlan ? (
              <div className="space-y-5 h-full overflow-y-auto pr-1">
                <header className="border-b border-white/10 pb-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="blur-[2px] space-y-2">
                      <div className="h-3 w-24 rounded bg-white/10" />
                      <div className="h-8 w-48 rounded bg-white/8" />
                      <div className="h-3 w-32 rounded bg-white/8" />
                    </div>

                    <div className="h-8 w-16 rounded-full border border-white/10 bg-white/[0.04]" />
                  </div>

                  <div className="blur-[2px] space-y-2">
                    <div className="h-4 w-full rounded bg-white/8" />
                    <div className="h-4 w-5/6 rounded bg-white/8" />
                  </div>
                </header>

                <section className="space-y-2">
                  <div className="h-3 w-24 rounded bg-white/10 blur-[2px]" />
                  <div className="space-y-2 blur-[2px]">
                    <div className="h-4 w-full rounded bg-white/8" />
                    <div className="h-4 w-4/5 rounded bg-white/8" />
                    <div className="h-4 w-3/4 rounded bg-white/8" />
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="h-3 w-16 rounded bg-white/10 blur-[2px]" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-white/10 bg-black/50 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2 blur-[2px]">
                          <div className="h-4 w-24 rounded bg-white/10" />
                          <div className="h-3 w-16 rounded bg-white/8" />
                        </div>

                        <div className="space-y-2 blur-[2px]">
                          <div className="h-3 w-full rounded bg-white/8" />
                          <div className="h-3 w-5/6 rounded bg-white/8" />
                          <div className="h-3 w-4/5 rounded bg-white/8" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : plan ? (
              <div className="space-y-5 h-full overflow-y-auto pr-1 text-sm leading-relaxed text-white/85">
                <header className="border-b border-white/10 pb-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                        Release Playbook
                      </p>
                      <h2 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight text-white">
                        {projectTitle}{' '}
                        <span className="text-white/50 text-sm md:text-base uppercase">
                          • {releaseType}
                        </span>
                      </h2>

                      {releaseDate ? (
                        <p className="mt-1 text-xs text-white/60 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          Target date: {releaseDate}
                        </p>
                      ) : null}

{selectedIdentityKit ? (
  <p className="mt-1 text-xs text-ww-violet/75">
    Using identity: {selectedIdentityKit.title || selectedIdentityKit.result?.artistName || 'Identity Kit'}
  </p>
) : null}

                    </div>



                    <div className="flex items-center gap-3">
  <div className="absolute inset-0 blur-[40px] bg-ww-violet/10 pointer-events-none" />
  {/* Expand */}
  <button
    type="button"
    className="group relative h-11 w-11 rounded-xl border border-white/10 bg-black/50 flex items-center justify-center
    hover:border-ww-violet/60 hover:bg-ww-violet/10
    shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_18px_rgba(186,85,211,0.35)]
    transition"
  >
    <Expand className="w-4 h-4 text-white/70 group-hover:text-white" />
  </button>

  
  <>

  {/* Save */}
  <button
    type="button"
    onClick={handleSaveStrategy}
    disabled={savingStrategy || !plan}
    className={`group relative h-11 w-11 rounded-xl border border-white/10 flex items-center justify-center transition
    ${
      savingStrategy || !plan
        ? 'bg-black/30 text-white/30 cursor-not-allowed'
        : 'bg-black/50 hover:border-ww-violet/60 hover:bg-ww-violet/10 hover:shadow-[0_0_18px_rgba(186,85,211,0.35)]'
    }`}
  >
    {savingStrategy ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <Save className="w-4 h-4 text-white/70 group-hover:text-white" />
    )}
  </button>

  {/* Download */}
  <button
    type="button"
    onClick={handleDownloadPdf}
    disabled={downloadingPdf}
    className={`group relative h-11 w-11 rounded-xl border border-white/10 flex items-center justify-center transition
    ${
      downloadingPdf
        ? 'bg-black/30 text-white/30 cursor-not-allowed'
        : 'bg-black/50 hover:border-ww-violet/60 hover:bg-ww-violet/10 hover:shadow-[0_0_18px_rgba(186,85,211,0.35)]'
    }`}
  >
    {downloadingPdf ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <Download className="w-4 h-4 text-white/70 group-hover:text-white" />
    )}
  </button>

   </>


  {/* Edit */}
  <button
    type="button"
    className="group relative h-11 w-11 rounded-xl border border-white/10 bg-black/50 flex items-center justify-center
    hover:border-ww-violet/60 hover:bg-ww-violet/10
    hover:shadow-[0_0_18px_rgba(186,85,211,0.35)]
    transition"
  >
    <Pencil className="w-4 h-4 text-white/70 group-hover:text-white" />
  </button>

  {/* Delete / Clear */}
  <button
    type="button"
    onClick={clearLoadedStrategyOutput}
    className="group relative h-11 w-11 rounded-xl border border-white/10 bg-black/50 flex items-center justify-center
    hover:border-red-400/60 hover:bg-red-400/10
    hover:shadow-[0_0_18px_rgba(248,113,113,0.35)]
    transition"
  >
    <Trash2 className="w-4 h-4 text-white/70 group-hover:text-white" />
  </button>
</div>
                  </div>
                </header>

  <div className="rounded-2xl border border-ww-violet/20 bg-black/60 p-4 shadow-[0_0_18px_rgba(186,85,211,0.10)]">
    <p className="text-sm text-white/80 leading-relaxed">
      Free plan: you get 1 full Light release strategy. Upgrade to Creator for Standard/Aggressive strategies, saving, PDF export, and more generations.
    </p>
  </div>


                {plan.summary &&
                (plan.summary.coreIdea ||
                  plan.summary.primaryFocus?.length ||
                  plan.summary.whyThisAngleWorksNow) ? (
                  <CollapsibleSection
                    title="Strategy Summary"
                    sectionKey="summary"
                    openSections={openSections}
                    toggleSection={toggleSection}
                  >
                    <div className="rounded-2xl border border-ww-violet/15 bg-gradient-to-br from-ww-violet/[0.05] via-black to-black p-4 md:p-5 space-y-4">
                      {plan.summary.coreIdea ? (
                        <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-2">
                            Core idea
                          </p>
                          <p className="text-sm text-white/82 leading-relaxed">
                            {plan.summary.coreIdea}
                          </p>
                        </div>
                      ) : null}

                      {plan.summary.primaryFocus?.length ? (
                        <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">
                            Primary focus
                          </p>
                          <div className="space-y-2">
                            {plan.summary.primaryFocus.map((item, i) => (
                              <div
                                key={i}
                                className="flex gap-2 text-sm text-white/80 leading-relaxed"
                              >
                                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-ww-violet shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {plan.summary.whyThisAngleWorksNow ? (
                        <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-2">
                            Why this release angle works now
                          </p>
                          <p className="text-sm text-white/74 leading-relaxed">
                            {plan.summary.whyThisAngleWorksNow}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </CollapsibleSection>
                ) : null}

                {plan.startHere &&
                (plan.startHere.today?.length ||
                  plan.startHere.thisWeek?.length ||
                  plan.startHere.firstPost?.idea ||
                  plan.startHere.firstPost?.hookOptions?.length ||
                  plan.startHere.firstPost?.captionExample ||
                  plan.startHere.firstPost?.cta) ? (
                  <CollapsibleSection
                    title="Start Here"
                    sectionKey="startHere"
                    openSections={openSections}
                    toggleSection={toggleSection}
                  >
                    <div className="grid gap-3">
                      {plan.startHere.today?.length ? (
                        <div className="rounded-2xl border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.06] via-black to-black p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-ww-violet/80 mb-3">
                            Do this today
                          </p>
                          <div className="space-y-2">
                            {plan.startHere.today.map((item, i) => (
                              <div
                                key={i}
                                className="flex gap-2 text-sm text-white/84 leading-relaxed"
                              >
                                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-ww-violet shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {plan.startHere.thisWeek?.length ? (
                        <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">
                            This week
                          </p>
                          <div className="space-y-2">
                            {plan.startHere.thisWeek.map((item, i) => (
                              <div
                                key={i}
                                className="flex gap-2 text-sm text-white/80 leading-relaxed"
                              >
                                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-ww-violet shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {plan.startHere.firstPost &&
                      (plan.startHere.firstPost.idea ||
                        plan.startHere.firstPost.hookOptions?.length ||
                        plan.startHere.firstPost.captionExample ||
                        plan.startHere.firstPost.cta) ? (
                        <div className="rounded-2xl border border-white/10 bg-black/45 p-4 space-y-4">
                          {plan.startHere.firstPost.idea ? (
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-2">
                                First post
                              </p>
                              <p className="text-sm text-white/84 leading-relaxed">
                                {plan.startHere.firstPost.idea}
                              </p>
                            </div>
                          ) : null}

                          {plan.startHere.firstPost.hookOptions?.length ? (
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-2">
                                Hook options
                              </p>
                              <div className="space-y-2">
                                {plan.startHere.firstPost.hookOptions.map((hook, i) => (
                                  <div
                                    key={i}
                                    className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80"
                                  >
                                    {hook}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {plan.startHere.firstPost.captionExample ? (
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-2">
                                Caption example
                              </p>
                              <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white/78 leading-relaxed">
                                {plan.startHere.firstPost.captionExample}
                              </div>
                            </div>
                          ) : null}

                          {plan.startHere.firstPost.cta ? (
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-2">
                                CTA
                              </p>
                              <p className="text-sm text-white/72 leading-relaxed">
                                {plan.startHere.firstPost.cta}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </CollapsibleSection>
                ) : null}

                {plan.keyMoments?.length ? (
                  <CollapsibleSection
                    title="Key Moments"
                    sectionKey="keyMoments"
                    openSections={openSections}
                    toggleSection={toggleSection}
                  >
                    <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                      <div className="space-y-2">
                        {plan.keyMoments.map((m, i) => (
                          <div
                            key={i}
                            className="flex gap-2 text-sm text-white/80 leading-relaxed"
                          >
                            <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-ww-violet shrink-0" />
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleSection>
                ) : null}

                {plan.weeklyCadence &&
                (plan.weeklyCadence.postsPerWeek ||
                  plan.weeklyCadence.outreachPerWeek ||
                  plan.weeklyCadence.creationRoutine?.length ||
                  plan.weeklyCadence.testingRoutine?.length ||
                  plan.weeklyCadence.weeklyBreakdown?.length) ? (
                  <CollapsibleSection
                    title="Weekly Cadence"
                    sectionKey="weeklyCadence"
                    openSections={openSections}
                    toggleSection={toggleSection}
                  >
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                          Posting rhythm
                        </p>
                        <p className="mt-2 text-sm text-white/80 leading-relaxed">
                          {plan.weeklyCadence.postsPerWeek || '—'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                          Outreach rhythm
                        </p>
                        <p className="mt-2 text-sm text-white/80 leading-relaxed">
                          {plan.weeklyCadence.outreachPerWeek || '—'}
                        </p>
                      </div>

                      {plan.weeklyCadence.weeklyBreakdown?.length ? (
                        <div className="rounded-2xl border border-white/10 bg-black/45 p-4 md:col-span-2">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">
                            Weekly breakdown
                          </p>
                          <div className="space-y-2">
                            {plan.weeklyCadence.weeklyBreakdown.map((item, i) => (
                              <div
                                key={i}
                                className="flex gap-2 text-sm text-white/78 leading-relaxed"
                              >
                                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-ww-violet shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {plan.weeklyCadence.creationRoutine?.length ? (
                        <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">
                            Creation routine
                          </p>
                          <div className="space-y-2">
                            {plan.weeklyCadence.creationRoutine.map((item, i) => (
                              <div
                                key={i}
                                className="flex gap-2 text-sm text-white/78 leading-relaxed"
                              >
                                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-ww-violet shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {plan.weeklyCadence.testingRoutine?.length ? (
                        <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">
                            Testing routine
                          </p>
                          <div className="space-y-2">
                            {plan.weeklyCadence.testingRoutine.map((item, i) => (
                              <div
                                key={i}
                                className="flex gap-2 text-sm text-white/78 leading-relaxed"
                              >
                                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-ww-violet shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </CollapsibleSection>
                ) : null}

                {plan.phases?.length ? (
                  <CollapsibleSection
                    title="Phases"
                    sectionKey="phases"
                    openSections={openSections}
                    toggleSection={toggleSection}
                  >
                    <div className="space-y-4">
                      {plan.phases.map((ph, i) => (
                        <div
                          key={i}
                          className="rounded-2xl border border-ww-violet/15 bg-gradient-to-br from-ww-violet/[0.05] via-black to-black p-4 md:p-5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-white font-semibold">{ph.label}</p>
                              {ph.focus ? (
                                <p className="mt-1 text-sm text-white/68 leading-relaxed">
                                  {ph.focus}
                                </p>
                              ) : null}
                            </div>

                            {ph.timeframe ? (
                              <span className="inline-flex items-center rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[11px] text-white/58 whitespace-nowrap">
                                {ph.timeframe}
                              </span>
                            ) : null}
                          </div>

                          {ph.focusPlay &&
                          (ph.focusPlay.title ||
                            ph.focusPlay.idea ||
                            ph.focusPlay.whyThisMatters) ? (
                            <div className="mt-4 rounded-2xl border border-ww-violet/20 bg-ww-violet/[0.06] p-4">
                              <p className="text-[11px] uppercase tracking-[0.16em] text-ww-violet/80">
                                Focus play
                              </p>

                              {ph.focusPlay.title ? (
                                <p className="mt-2 text-sm font-semibold text-white">
                                  {ph.focusPlay.title}
                                </p>
                              ) : null}

                              {ph.focusPlay.idea ? (
                                <p className="mt-2 text-sm text-white/80 leading-relaxed">
                                  {ph.focusPlay.idea}
                                </p>
                              ) : null}

                              {ph.focusPlay.whyThisMatters ? (
                                <p className="mt-3 text-xs text-white/62 leading-relaxed">
                                  <span className="text-white/78 font-medium">
                                    Why this matters:
                                  </span>{' '}
                                  {ph.focusPlay.whyThisMatters}
                                </p>
                              ) : null}
                            </div>
                          ) : null}

                          <div className="mt-4 grid gap-3 lg:grid-cols-2">
                            {ph.primaryMoves?.length ? (
                              <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                                <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">
                                  Primary moves
                                </p>

                                <div className="space-y-3">
                                  {ph.primaryMoves.map((move, j) => (
                                    <div
                                      key={j}
                                      className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-3"
                                    >
                                      <div className="flex gap-2 text-sm text-white/82 leading-relaxed">
                                        <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-ww-violet shrink-0" />
                                        <span>{move.action}</span>
                                      </div>

                                      {move.whyThisMatters ? (
                                        <p className="pl-4 text-xs text-white/58 leading-relaxed">
                                          Why this matters: {move.whyThisMatters}
                                        </p>
                                      ) : null}

                                      {move.hooks?.length ? (
                                        <div className="pl-4 space-y-2">
                                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
                                            Hooks
                                          </p>
                                          {move.hooks.map((hook, k) => (
                                            <div
                                              key={k}
                                              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/72"
                                            >
                                              {hook}
                                            </div>
                                          ))}
                                        </div>
                                      ) : null}

                                      {move.captionExample ? (
                                        <div className="pl-4">
                                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/40 mb-2">
                                            Caption example
                                          </p>
                                          <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-white/70 leading-relaxed">
                                            {move.captionExample}
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            {ph.secondaryMoves?.length ? (
                              <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                                <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">
                                  Secondary moves
                                </p>

                                <div className="space-y-3">
                                  {ph.secondaryMoves.map((move, j) => (
                                    <div
                                      key={j}
                                      className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-3"
                                    >
                                      <div className="flex gap-2 text-sm text-white/78 leading-relaxed">
                                        <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-white/35 shrink-0" />
                                        <span>{move.action}</span>
                                      </div>

                                      {move.whyThisMatters ? (
                                        <p className="pl-4 text-xs text-white/55 leading-relaxed">
                                          Why this matters: {move.whyThisMatters}
                                        </p>
                                      ) : null}

                                      {move.hooks?.length ? (
                                        <div className="pl-4 space-y-2">
                                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">
                                            Hooks
                                          </p>
                                          {move.hooks.map((hook, k) => (
                                            <div
                                              key={k}
                                              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/68"
                                            >
                                              {hook}
                                            </div>
                                          ))}
                                        </div>
                                      ) : null}

                                      {move.captionExample ? (
                                        <div className="pl-4">
                                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/38 mb-2">
                                            Caption example
                                          </p>
                                          <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-white/66 leading-relaxed">
                                            {move.captionExample}
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                ) : null}

                {plan.playlistStrategy &&
                (plan.playlistStrategy.whereToSearch?.length ||
                  plan.playlistStrategy.pitchAngle ||
                  plan.playlistStrategy.whyItFits) ? (
                  <CollapsibleSection
                    title="Playlist Strategy"
                    sectionKey="playlistStrategy"
                    openSections={openSections}
                    toggleSection={toggleSection}
                  >
                    <div className="grid gap-3 md:grid-cols-2">
                      {plan.playlistStrategy.whereToSearch?.length ? (
                        <div className="rounded-2xl border border-white/10 bg-black/45 p-4 md:col-span-2">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42 mb-3">
                            Where to search
                          </p>
                          <div className="space-y-2">
                            {plan.playlistStrategy.whereToSearch.map((item, i) => (
                              <div
                                key={i}
                                className="flex gap-2 text-sm text-white/78 leading-relaxed"
                              >
                                <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-ww-violet shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {plan.playlistStrategy.pitchAngle ? (
                        <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                            Pitch angle
                          </p>
                          <p className="mt-2 text-sm text-white/80 leading-relaxed">
                            {plan.playlistStrategy.pitchAngle}
                          </p>
                        </div>
                      ) : null}

                      {plan.playlistStrategy.whyItFits ? (
                        <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                            Why it fits
                          </p>
                          <p className="mt-2 text-sm text-white/72 leading-relaxed">
                            {plan.playlistStrategy.whyItFits}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </CollapsibleSection>
                ) : null}

                {plan.playlistKeywords &&
                (plan.playlistKeywords.primary?.length ||
                  plan.playlistKeywords.secondary?.length ||
                  plan.playlistKeywords.avoid?.length) ? (
                  <CollapsibleSection
                    title="Playlist Search Keywords"
                    sectionKey="playlistKeywords"
                    openSections={openSections}
                    toggleSection={toggleSection}
                  >
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                          Primary
                        </p>
                        <p className="mt-2 text-sm text-white/80 leading-relaxed">
                          {plan.playlistKeywords.primary?.join(' · ') || '—'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                          Secondary
                        </p>
                        <p className="mt-2 text-sm text-white/80 leading-relaxed">
                          {plan.playlistKeywords.secondary?.join(' · ') || '—'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">
                          Avoid
                        </p>
                        <p className="mt-2 text-sm text-white/60 leading-relaxed">
                          {plan.playlistKeywords.avoid?.join(' · ') || '—'}
                        </p>
                      </div>
                    </div>
                  </CollapsibleSection>
                ) : null}

                {plan.metrics?.length ? (
                  <CollapsibleSection
                    title="Metrics to Watch"
                    sectionKey="metrics"
                    openSections={openSections}
                    toggleSection={toggleSection}
                  >
                    <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                      <ul className="list-disc list-inside text-xs text-white/80 space-y-1">
                        {plan.metrics.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  </CollapsibleSection>
                ) : null}
                  
              </div>
            ) : (
              
              <div className="relative overflow-hidden rounded-[28px] border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.06] via-black to-black p-6 md:p-7 xl:p-8 shadow-[0_0_24px_rgba(186,85,211,0.10)]">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -top-20 left-1/2 h-[240px] w-[420px] -translate-x-1/2 rounded-full bg-ww-violet/10 blur-[90px]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(186,85,211,0.07),transparent_55%)]" />
                </div>

                <div className="relative">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Output</p>
                  <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-white">
                    Build your rollout plan here
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-white/62">
                    Generate a release strategy to map your pre-release runway, launch week
                    priorities, and post-release momentum in one connected plan.
                  </p>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/45">
                        Release Strategy gives you
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-white/78">
                        <li>A clearer rollout structure</li>
                        <li>Priority moves across each phase</li>
                        <li>Immediate next steps and first-post guidance</li>
                        <li>Playlist and metrics direction in one place</li>
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/45 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/45">
                        How it fits the workflow
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-white/78">
                        <li>Identity Kit sets the brand foundation</li>
                        <li>Release Strategy turns that into rollout direction</li>
                        <li>Idea Factory can turn that strategy into content ideas</li>
                        <li>Momentum Board becomes the execution layer</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-ww-violet/15 bg-black/45 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/45">
                      Start with the left panel
                    </p>
                    <p className="mt-2 text-sm text-white/70 leading-relaxed">
                      Add the project basics, release goals, narrative, and rollout constraints,
                      then generate a strategy that is realistic for this release.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {savedStrategies.length > 0 || loadingSavedStrategies ? (
          <section className="rounded-[28px] border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.05] via-black to-black p-5 md:p-6 xl:p-7 shadow-[0_0_22px_rgba(186,85,211,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Library</p>
                <h2 className="mt-1 text-xl md:text-2xl font-semibold text-white">
                  Saved strategies
                </h2>
                <p className="mt-1 text-sm text-white/60 max-w-2xl">
                  Reopen previous rollout plans, compare releases, and reuse strategy thinking
                  across projects.
                </p>
              </div>
            </div>

            {loadingSavedStrategies ? (
              <div className="mt-5 text-sm text-white/55 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading saved strategies…
              </div>
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {savedStrategies.map((row) => {
                  const inp = row?.inputs || {}
                  const result = normalizeReleaseStrategyPlan(row?.result || {})
                  const isLoaded = selectedStrategyId === row.id

                  return (
                    <div
                      key={row.id}
                      className={
                        'rounded-2xl border bg-black/50 p-4 transition ' +
                        (isLoaded
                          ? 'border-ww-violet/70 shadow-[0_0_18px_rgba(186,85,211,0.22)]'
                          : 'border-white/10 hover:border-ww-violet/35 hover:shadow-[0_0_14px_rgba(186,85,211,0.10)]')
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-white font-semibold truncate">
                            {row.title || inp.projectTitle || 'Untitled strategy'}
                          </h3>

                          <p className="mt-1 text-xs text-white/50">
                            {[inp.releaseType, inp.releaseDate].filter(Boolean).join(' • ') ||
                              'Release strategy'}
                          </p>
                        </div>

                        {isLoaded ? (
                          <span className="inline-flex items-center rounded-full border border-ww-violet/30 bg-ww-violet/10 px-2 py-1 text-[10px] uppercase tracking-wide text-ww-violet whitespace-nowrap">
                            Loaded
                          </span>
                        ) : null}
                      </div>

                      {result?.summary?.coreIdea ? (
                        <p className="mt-3 text-sm text-white/68 leading-relaxed line-clamp-4">
                          {String(result.summary.coreIdea)}
                        </p>
                      ) : null}

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleLoadSavedStrategy(row)}
                          className={outlineBtn + ' h-9 px-4 text-[0.75rem]'}
                        >
                          Load
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSavedStrategy(row.id)}
                          disabled={deletingStrategyId === row.id}
                          className="inline-flex items-center gap-2 px-3 h-9 rounded-full border border-red-500/25 text-[0.75rem] text-red-300 hover:border-red-400 hover:bg-red-500/10 transition disabled:opacity-60"
                        >
                          {deletingStrategyId === row.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>Delete</>
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        ) : null}
      </section>
    </main>
  )
}