'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { useWwProfile } from '@/hooks/useWwProfile'
import { effectiveTier } from '@/lib/wwProfile'


import {
  Compass,
  Palette,
  CalendarDays,
  Type,
  TrendingUp,
  ArrowRight,
  Rocket,
  Mail,
  LogOut,
  FileText,          // icon for Press Kit
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


type Card = {
  href: string
  title: string
  desc: string
  icon: React.ReactNode
  badge?: string
}

export default function DashboardPage() {
  async function markOnboardingStarted() {
  if (profile?.onboarding_started) return
  await updateProfile({ onboarding_started: true })
}


  const router = useRouter()
  const [checking, setChecking] = useState(true)
const { profile, tier, updateProfile } = useWwProfile()

const hasTier = (current: 'free' | 'creator' | 'pro', needed: 'free' | 'creator' | 'pro') => {
  const rank = { free: 0, creator: 1, pro: 2 } as const
  return rank[current] >= rank[needed]
}
const trendsLocked = !hasTier(tier, 'pro')
const pressKitLocked = !hasTier(tier, 'pro')
const newsletterLocked = !hasTier(tier, 'pro')

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
      badge: 'Live',
    },
    {
      href: '/calendar',
      title: 'Content Calendar',
      desc: 'Plan monthly/weekly posts, auto-generate ideas from your kit or an upcoming release.',
      icon: <CalendarDays className="w-5 h-5" />,
    },
    {
      href: '/captions',
      title: 'Captions & Hashtags',
      desc: 'Platform-ready copy in your tone of voice with smart hashtag sets.',
      icon: <Type className="w-5 h-5" />,
    },
    {
      href: '/trends',


      title: 'Trend Finder',
      desc: 'Find timely sounds, challenges, and angles aligned with your brand.',
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      href: '/strategy-board',
      title: 'Momentum Board',
      desc: 'Drag content ideas from every tool into one lane and move them from idea to planned, scheduled, and posted.',
      icon: <Compass className="w-5 h-5" />,
      badge: 'New',
    },
    {
      href: pressKitLocked ? '/pricing' : '/press-kit',
      title: 'Press Kit Generator',
      desc: 'Draft a clean EPK and release one-sheet with smart-fill from your WW profile or web-style info.',
      icon: <FileText className="w-5 h-5" />,
      badge: 'Pro-ready',
    },
    {
      href: '/release-strategy',
      title: 'Release Strategy',
      desc: 'Turn a single, EP, or album into a structured pre-, launch-, and post-campaign plan.',
      icon: <Rocket className="w-5 h-5" />,
      badge: 'Beta',
    },
    {
      href: '/newsletter',
      title: 'Newsletter Generator',
      desc: 'Map out a fan newsletter, subject lines, and email story arcs in your voice.',
      icon: <Mail className="w-5 h-5" />,
      badge: 'Beta',
    },
    

  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mb-4">
  <span className="inline-flex items-center gap-2 px-3 h-8 rounded-full border border-white/10 bg-white/5 text-xs text-white/80">
    <span className="h-2 w-2 rounded-full bg-ww-violet" />
    Tier: <span className="font-semibold text-white">{tier}</span>
  </span>
</div>



{!profile?.onboarding_started && !profile?.identity_completed && (
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
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 h-9 rounded-full bg-ww-violet text-white text-sm font-semibold shadow-[0_0_16px_rgba(186,85,211,0.7)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] active:scale-95 transition"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => {
            const isMomentum = c.href === '/strategy-board'
            return (
              <Link
                key={`${c.title}:${c.href}`}

                href={c.href}
                  onClick={() => void markOnboardingStarted()}
                className={
                  isMomentum
                    ? 'group rounded-2xl border border-ww-violet/70 bg-gradient-to-br from-black via-black to-ww-violet/25 p-5 transition shadow-[0_0_26px_rgba(186,85,211,0.45)] hover:shadow-[0_0_32px_rgba(186,85,211,0.7)]'
                    : 'group rounded-2xl border border-white/10 bg-black/50 p-5 transition hover:border-ww-violet/80 hover:shadow-[0_0_22px_rgba(186,85,211,0.35)]'
                }
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-white">
                    <span
                      className={
                        isMomentum
                          ? 'inline-flex items-center justify-center w-9 h-9 rounded-full bg-ww-violet/20 border border-ww-violet/60 text-ww-violet'
                          : 'inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-ww-violet'
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
                          ? 'text-xs px-2 py-1 rounded-full border border-white/60 bg-white/10 text-white/90'
                          : 'text-xs px-2 py-1 rounded-full border border-ww-violet/40 text-ww-violet/90'
                      }
                    >
                      {c.badge}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-white/70">{c.desc}</p>
                <div
                  className={
                    isMomentum
                      ? 'mt-4 inline-flex items-center gap-2 text-white/95'
                      : 'mt-4 inline-flex items-center gap-2 text-ww-violet/90'
                  }
                >
                  Open
                  <ArrowRight className="w-4 h-4 transition -translate-x-0 group-hover:translate-x-0.5" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}
