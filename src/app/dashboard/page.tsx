'use client'

import Link from 'next/link'
import { useEffect, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { useWwProfile } from '@/hooks/useWwProfile'
import { effectiveTier } from '@/lib/wwProfile'
import { toast } from 'sonner'
import { TowerControl } from 'lucide-react'





import {
  Compass,
  Palette,
  Brain,
  Type,
  TrendingUp,
  ArrowRight,
  Rocket,
  Mail,
  LogOut,
  FileText,          // icon for Press Kit
  Sparkles,
  Lock,
  
  

} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


type CardTone = 'violet' | 'blue' | 'emerald' | 'amber' | 'neutral'

type Card = {
  href: string
  title: string
  desc: string
  icon: React.ReactNode
  badge?: string
  tone: CardTone
  locked?: boolean
}

function DashboardPageInner() {
  async function markOnboardingStarted() {
  localStorage.setItem('ww_identity_banner_dismissed', 'true')
  setDismissedIdentityBanner(true)

  try {
    await updateProfile({ onboarding_started: true })
  } catch {}
}

const [dismissedIdentityBanner, setDismissedIdentityBanner] = useState(false)
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [activatingPlan, setActivatingPlan] = useState(false)
const { profile, tier, updateProfile, loading: profileLoading, refresh } = useWwProfile()
 const showIdentityBanner =
  !profileLoading &&
  !!profile &&
  !profile.onboarding_started


const isPro = tier === 'pro'
const hasTier = (current: 'free' | 'creator' | 'pro', needed: 'free' | 'creator' | 'pro') => {
  const rank = { free: 0, creator: 1, pro: 2 } as const
  return rank[current] >= rank[needed]
}
const searchParams = useSearchParams()

useEffect(() => {
  if (searchParams.get('checkout') !== 'success') return

  refresh?.()
  toast.success('You’ve been upgraded to Creator 🎉')
}, [searchParams, refresh])
const paymentSuccess = searchParams.get('success') === 'true'
const trendsLocked = !hasTier(tier, 'pro')
const pressKitLocked = !hasTier(tier, 'pro')
const newsletterLocked = !hasTier(tier, 'pro')

useEffect(() => {
  if (!paymentSuccess) return

  let cancelled = false

  useEffect(() => {
  setDismissedIdentityBanner(localStorage.getItem('ww_identity_banner_dismissed') === 'true')
}, [])

  async function confirmUpgrade() {
    setActivatingPlan(true)
    toast.success('Payment successful — activating your Creator plan')

    for (let i = 0; i < 8; i++) {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user?.id

      if (!userId) break

      const { data } = await supabase
        .from('ww_profiles')
        .select('tier')
        .eq('user_id', userId)
        .maybeSingle()

      if (data?.tier === 'creator' || data?.tier === 'pro') {
        localStorage.removeItem('ww_profile')
        toast.success(`Your ${data.tier} plan is now active`)
        if (!cancelled) {
          setActivatingPlan(false)
          router.replace('/dashboard')
        }
        return
      }

      await new Promise(resolve => setTimeout(resolve, 1200))
    }

    toast.info('Payment received. Your plan may take a moment to update — use Refresh plan in Account if needed.')
    if (!cancelled) {
      setActivatingPlan(false)
      router.replace('/account')
    }
  }

  confirmUpgrade()

  return () => {
    cancelled = true
  }
}, [paymentSuccess, router])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      if (!data.session) {
        router.replace('/login')
        return
      }
      setChecking(false)
    })()
    return () => {
      mounted = false
    }
  }, [router])  

  useEffect(() => {
  if (!paymentSuccess) return

  toast.success('Upgrade successful — welcome to Creator')

  const timeout = setTimeout(() => {
    router.replace('/dashboard')
  }, 1200)

  return () => clearTimeout(timeout)
}, [paymentSuccess, router])




  if (checking) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/70">Loading…</div>
        
      </main>
    )
  }
  const cards: Card[] = [
    {
      href: '/identity',
      title: 'Identity Kit & Campaigns',
      desc: 'Generate a pro brand kit, save versions, and spin up shootable campaign concepts.',
      icon: <Palette className="w-5 h-5" />,
      badge: 'Beta',
      tone: 'violet',
    },
    {
      href: '/calendar',
      title: 'Idea Factory',
      desc: 'Plan monthly/weekly posts, auto-generate ideas from your kit or an upcoming release.',
      icon: <Brain className="w-5 h-5" />,
      badge: 'Beta',
      tone: 'violet',
    },
    {
      href: '/captions',
      title: 'Captions & Hashtags',
      desc: 'Platform-ready copy in your tone of voice with smart hashtag sets.',
      icon: <Type className="w-5 h-5" />,
      badge: 'Beta',
      tone: 'violet',
    },

  {
      href: '/release-strategy',
      title: 'Release Strategy',
      desc: 'Turn a single, EP, or album into a structured pre-, launch-, and post-campaign plan.',
      icon: <Rocket className="w-5 h-5" />,
      badge: 'Beta',
      tone: 'violet',
    },
    {
      href: '/strategy-board',
      title: 'Momentum Board',
      desc: 'Drag content ideas from every tool into one lane and move them from idea to planned, scheduled, and posted.',
      icon: <Compass className="w-5 h-5" />,
      badge: 'Beta',
      tone: 'blue',
    },
    {
  href: '#',
  title: 'The Lighthouse',
  desc: 'Expand ideas. Clarify direction. Execute with confidence.',
  icon: <TowerControl className="w-5 h-5" />,
  badge: 'Coming soon',
  tone: 'neutral',
  locked: true,
},
    {
  href: '/press-kit',
  title: 'Press Kit Studio',
  desc: 'Draft a clean EPK and release one-sheet with smart-fill from your WW profile or web-style info.',
  icon: <FileText className="w-5 h-5" />,
  badge: 'Coming soon',
  tone: 'amber',
  locked: !isPro,
},
{
  href: '/newsletter',
  title: 'Newsletter Studio',
  desc: 'Map out a fan newsletter, subject lines, and email story arcs in your voice.',
  icon: <Mail className="w-5 h-5" />,
  badge: 'Coming soon',
  tone: 'amber',
  locked: !isPro,
},
{
  href: '/trends',
  title: 'Trend Finder',
  desc: 'Find timely sounds, challenges, and angles aligned with your brand.',
  icon: <TrendingUp className="w-5 h-5" />,
  badge: 'Coming soon',
  tone: 'amber',
  locked: !isPro,
},



  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  function toneBorder(tone: CardTone) {
  if (tone === 'blue') return 'border-ww-blue/20 hover:border-ww-blue/50'
  if (tone === 'emerald') return 'border-ww-emerald/20 hover:border-ww-emerald/50'
  if (tone === 'amber') return 'border-ww-amber/20 hover:border-ww-amber/50'
  if (tone === 'neutral') return 'border-white/15 hover:border-white/25'
  return 'border-ww-violet/20 hover:border-ww-violet/60'
}

function toneIcon(tone: CardTone) {
  if (tone === 'blue') return 'text-ww-blue border-ww-blue/20 bg-ww-blue/10'
  if (tone === 'emerald') return 'text-ww-emerald border-ww-emerald/20 bg-ww-emerald/10'
  if (tone === 'amber') return 'text-ww-amber border-ww-amber/20 bg-ww-amber/10'
  if (tone === 'neutral') return 'text-white/70 border-white/15 bg-white/5'
  return 'text-ww-violet border-ww-violet/20 bg-ww-violet/10'
}

function toneText(tone: CardTone) {
  if (tone === 'blue') return 'text-ww-blue/90'
  if (tone === 'emerald') return 'text-ww-emerald/90'
  if (tone === 'amber') return 'text-ww-amber/90'
  if (tone === 'neutral') return 'text-white/60'
  return 'text-ww-violet/90'
}

function toneBadge(tone: CardTone) {
  if (tone === 'blue') return 'border-ww-blue/30 text-ww-blue/90 bg-ww-blue/10'
  if (tone === 'emerald') return 'border-ww-emerald/30 text-ww-emerald/90 bg-ww-emerald/10'
  if (tone === 'amber') return 'border-ww-amber/30 text-ww-amber/90 bg-ww-amber/10'
  if (tone === 'neutral') return 'border-white/20 text-white/60 bg-white/5'
  return 'border-ww-violet/30 text-ww-violet/90 bg-ww-violet/10'
}

  function getToneClasses(tone: CardTone) {
  switch (tone) {
    case 'blue':
      return {
        card:
          'border-ww-blue/20 bg-gradient-to-br from-ww-blue/[0.08] via-black to-black hover:border-ww-blue/45 hover:shadow-[0_0_24px_rgba(59,130,246,0.18)]',
        icon:
          'bg-ww-blue/[0.10] border-ww-blue/25 text-ww-blue',
        badge:
          'border-ww-blue/35 text-ww-blue/90 bg-ww-blue/[0.06]',
        cta:
          'text-ww-blue/90',
      }
    case 'emerald':
      return {
        card:
          'border-ww-emerald/20 bg-gradient-to-br from-ww-emerald/[0.08] via-black to-black hover:border-ww-emerald/45 hover:shadow-[0_0_24px_rgba(16,185,129,0.18)]',
        icon:
          'bg-ww-emerald/[0.10] border-ww-emerald/25 text-ww-emerald',
        badge:
          'border-ww-emerald/35 text-ww-emerald/90 bg-ww-emerald/[0.06]',
        cta:
          'text-ww-emerald/90',
      }
    case 'amber':
      return {
        card:
          'border-ww-amber/20 bg-gradient-to-br from-ww-amber/[0.07] via-black to-black hover:border-ww-amber/45 hover:shadow-[0_0_24px_rgba(245,158,11,0.18)]',
        icon:
          'bg-ww-amber/[0.10] border-ww-amber/25 text-ww-amber',
        badge:
          'border-ww-amber/35 text-ww-amber/90 bg-ww-amber/[0.06]',
        cta:
          'text-ww-amber/90',
      }
    case 'neutral':
      return {
        card:
          'border-white/15 bg-gradient-to-br from-black via-black to-white/[0.03] hover:border-white/25 hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]',
        icon:
          'bg-white/5 border-white/15 text-white/70',
        badge:
          'border-white/20 text-white/60 bg-white/5',
        cta:
          'text-white/55',
      }
    case 'violet':
    default:
      return {
        card:
          'border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.09] via-black to-black hover:border-ww-violet/45 hover:shadow-[0_0_24px_rgba(186,85,211,0.2)]',
        icon:
          'bg-ww-violet/[0.10] border-ww-violet/25 text-ww-violet',
        badge:
          'border-ww-violet/35 text-ww-violet/90 bg-ww-violet/[0.06]',
        cta:
          'text-ww-violet/90',
      }
  }
}



  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-4 pt-6 pb-2">
  <div>
    <span className="inline-flex items-center gap-3 px-3 h-8 rounded-full border border-white/10 bg-white/5 text-xs text-white/80">
      <span className="h-2 w-2 rounded-full bg-ww-violet" />
      Tier: <span className="font-semibold text-white">{tier}</span>
    </span>
  </div>
  {activatingPlan ? (
  <section className="mx-auto max-w-6xl px-4 pt-4">
    <div className="rounded-2xl border border-ww-violet/30 bg-ww-violet/[0.08] p-4 text-sm text-white/80">
      Payment successful — activating your plan. This usually takes a few seconds.
    </div>
  </section>
) : null}
</section>




{showIdentityBanner && (
  <section className="mb-8">
    <div className="relative overflow-hidden rounded-3xl border border-ww-violet/40 bg-black/60 p-6 md:p-8 shadow-[0_0_40px_rgba(186,85,211,0.18)]">
      {/* glow layer */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[320px] w-[520px] -translate-x-1/2 rounded-full bg-ww-violet/25 blur-[90px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(186,85,211,0.14),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:24px_24px]" />
      </div>


      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-ww-violet/25 bg-ww-violet/10 px-3 py-1 text-xs text-white/80">

            <span className="h-1.5 w-1.5 rounded-full bg-ww-violet" />
            Recommended first step
          </p>

          <h2 className="mt-4 text-xl md:text-2xl font-semibold leading-tight">
            Start with your Artist Identity Kit
          </h2>

          <p className="mt-2 text-sm md:text-base text-white/70 leading-relaxed">
            Define your sound, story, visuals, and audience — then reuse it to generate captions, calendars,
            press kits, and release plans that actually match your brand.
          </p>

          <p className="mt-3 text-xs text-white/50">
            Created by an independent artist, for independent artists.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
  <Link
    href="/identity"
      onClick={() => void markOnboardingStarted()}


    className="relative inline-flex items-center justify-center text-center leading-none rounded-full px-6 h-11 text-sm font-semibold text-white
    bg-ww-violet
    border border-white/20
    shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_18px_rgba(186,85,211,0.45)]
    hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_0_26px_rgba(186,85,211,0.65)]
    transition"
  >
    Generate Identity Kit
  </Link>
  <button
  type="button"
  onClick={() => void markOnboardingStarted()}
  className="inline-flex items-center justify-center rounded-full px-6 h-11 text-sm font-semibold border border-white/15 text-white/80 hover:border-ww-violet hover:bg-ww-violet/10 transition"
>
  Dismiss
</button>
</div>




          
        </div>
      </div>
    </div>
  </section>
)}
 
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-8 pb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Creator Hub
          </h1>
          <p className="mt-3 text-white/70 max-w-2xl">
            Your AI-powered workspace for music marketing. Start with your brand
            identity, then plan, write, and ride the trends — all in one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
  <Link
    href="/account"
    className="inline-flex items-center gap-2 px-4 h-9 rounded-full border border-white/15 bg-white/5 text-white/85 text-sm font-semibold hover:border-ww-violet hover:bg-ww-violet/10 transition"
  >
    <Sparkles className="w-4 h-4" />
    Account
  </Link>

  <button
    onClick={handleLogout}
    className="inline-flex items-center gap-2 px-4 h-9 rounded-full bg-ww-violet text-white text-sm font-semibold shadow-[0_0_16px_rgba(186,85,211,0.7)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] active:scale-95 transition"
  >
    <LogOut className="w-4 h-4" />
    Log out
  </button>
</div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => {
            const isMomentum = c.href === '/strategy-board'
            const isLighthouse = c.title === 'The Lighthouse'
            

            return (
              <Link
              
                key={`${c.title}:${c.href}`}

                href={c.href}
                  onClick={(e) => {
  if (c.locked) {
    e.preventDefault()
    toast.info(`${c.title} is coming soon 🔒`)
    return
  }

  void markOnboardingStarted()
}}
                className={
  isMomentum
  ? 'group flex flex-col rounded-2xl border border-ww-blue/35 bg-gradient-to-br from-black via-black to-ww-blue/[0.16] p-5 transition shadow-[0_0_24px_rgba(59,130,246,0.18)] hover:border-ww-blue/55 hover:shadow-[0_0_30px_rgba(59,130,246,0.26)]'
    : isLighthouse
    ? 'group relative flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-black via-black to-white/[0.03] p-5 transition hover:border-white/25 hover:shadow-[0_0_24px_rgba(255,255,255,0.06)]'
    : `group flex flex-col rounded-2xl border bg-black/50 p-5 transition ${toneBorder(c.tone)}`
}

              >
                {isLighthouse && (
  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_60%)]" />
  </div>
)}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-white">
                    <span
  className={
    isMomentum
  ? 'inline-flex items-center justify-center w-9 h-9 rounded-full bg-ww-blue/15 border border-ww-blue/30 text-ww-blue'
      : isLighthouse
      ? 'inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/15 text-white/70'
      : `inline-flex items-center justify-center w-9 h-9 rounded-full ${toneIcon(c.tone)}`
  }
>
                      {c.icon}
                    </span>
                    <h3 className="font-semibold">{c.title}</h3>
                  </div>
                  {c.badge && (
  <span
  className={
    isMomentum
  ? 'text-xs px-2 py-1 rounded-full border border-ww-violet/35 text-ww-violet/90 bg-ww-violet/[0.08]'
      : isLighthouse
      ? 'text-[10px] px-2 py-1 rounded-full border border-white/20 bg-white/5 text-white/60 uppercase tracking-wide'
      : `text-xs px-2 py-1 rounded-full border ${toneBadge(c.tone)}`
  }
>
    {c.badge}
  </span>
)}

                </div>
                <p className="mt-3 text-white/70 flex-1">{c.desc}</p>
                <div
  className={
    isMomentum
  ? 'mt-4 inline-flex items-center gap-2 text-ww-blue/90'
      : isLighthouse
      ? 'mt-4 inline-flex items-center gap-2 text-white/55'
      : `mt-4 inline-flex items-center gap-2 ${toneText(c.tone)}`
  }
>
  {c.locked ? (
    <>
      <Lock className="w-4 h-4 opacity-70" />
<span className="tracking-wide uppercase text-[11px]">Coming soon</span>

    </>
  ) : (
    <>
      Open
      <ArrowRight className="w-4 h-4 transition -translate-x-0 group-hover:translate-x-0.5" />
    </>
  )}
</div>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardPageInner />
    </Suspense>
  )
}