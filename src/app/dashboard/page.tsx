'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
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
  const router = useRouter()
  const [checking, setChecking] = useState(true)

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
      href: '/press-kit', // ← FIXED: matches folder name src/app/press-kit
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
                key={c.href}
                href={c.href}
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
