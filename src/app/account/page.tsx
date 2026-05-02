'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Loader2, CreditCard, ArrowUpRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useWwProfile } from '@/hooks/useWwProfile'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const planCopy: Record<string, { name: string; description: string; features: string[] }> = {
  free: {
    name: 'Free',
    description: 'A lightweight starting point to explore the workflow and generate your first results.',
    features: [
      'Try the core workflow',
      'Limited generations',
      'Upgrade when you are ready for a fuller system',
    ],
  },
  creator: {
    name: 'Creator',
    description: 'A complete working system for independent artists who want clarity, content direction, and execution support.',
    features: [
      'Identity Kit',
      'Idea Factory',
      'Campaigns',
      'Captions',
      'Momentum Board',
    ],
  },
  pro: {
    name: 'Pro',
    description: 'Expanded strategic depth, premium tools, and future advanced systems as they roll out.',
    features: [
      'Everything in Creator',
      'Premium tools and advanced workflows',
      'Pro features rolling out over time',
    ],
  },
}


export default function AccountPage() {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  const { tier } = useWwProfile()
const [mounted, setMounted] = useState(false)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [loadingUpgrade, setLoadingUpgrade] = useState<'creator' | 'pro' | null>(null)
  const [email, setEmail] = useState('')

  const currentTier = tier || 'free'
  const currentPlan = planCopy[currentTier] || planCopy.free

  
  useEffect(() => {
  setMounted(true)
}, [])

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      setEmail(data.user?.email || '')
    })()
  }, [])

  async function handleManageBilling() {
    try {
      setLoadingPortal(true)

      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      if (!token) {
        toast.error('You need to log in again')
        return
      }

      const res = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || 'Could not open billing portal')
      }

      window.location.href = data.url
    } catch (e: any) {
      toast.error(e?.message || 'Could not open billing portal')
    } finally {
      setLoadingPortal(false)
    }
  }

 async function handleRefreshPlan() {
  try {
    setLoadingPortal(true)

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    if (!token) {
      toast.error('Please log in again')
      return
    }

    const res = await fetch('/api/stripe/sync-plan', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.error || 'Could not refresh plan')
    }

    localStorage.removeItem('ww_profile')
    toast.success(`Plan synced: ${data.tier}`)
    window.location.reload()
  } catch (e: any) {
    toast.error(e?.message || 'Could not refresh plan')
  } finally {
    setLoadingPortal(false)
  }
}

  async function handleUpgrade(targetTier: 'creator' | 'pro') {
  if (loadingUpgrade !== null) return

  try {
    setLoadingUpgrade(targetTier)

    let { data: sessionData } = await supabase.auth.getSession()
    let token = sessionData.session?.access_token

    if (!token) {
      await supabase.auth.refreshSession()
      const refreshed = await supabase.auth.getSession()
      token = refreshed.data.session?.access_token
    }

    if (!token) {
      toast.error('Please log in again')
      router.replace('/login')
      return
    }

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tier: targetTier }),
    })

    const data = await res.json()

    if (!res.ok || !data?.url) {
      throw new Error(data?.error || 'Could not start checkout')
    }

    toast.loading('Redirecting to secure checkout…')
    window.location.href = data.url
  } catch (e: any) {
    toast.error(e?.message || 'Could not start checkout')
    setLoadingUpgrade(null)
  }
}

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-5xl px-4 py-10 md:py-12">
        <div className="rounded-[28px] border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.05] via-black to-black p-6 md:p-8 xl:p-9 space-y-6 shadow-[0_0_24px_rgba(186,85,211,0.10)]">
          <div className="border-b border-white/10 pb-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Account</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Billing & settings
            </h1>
            <p className="mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-white/62">
              Manage your subscription, understand your current plan, and control how you access Wavering Wanderers.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-2xl border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.08] via-black/70 to-black/70 p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Current plan</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{currentPlan.name}</h2>
                </div>

                <span className="inline-flex items-center rounded-full border border-ww-violet/30 bg-ww-violet/10 px-3 py-1 text-xs font-medium text-ww-violet capitalize">
                  {currentTier}
                </span>
              </div>

              <p className="text-sm text-white/68 leading-relaxed">
                {currentPlan.description}
              </p>

              <div className="space-y-2">
                {currentPlan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-sm text-white/78">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ww-violet" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/45 p-5 space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Account info</p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-white/45">Email</p>
                  <p className="mt-1 text-white/88 break-all">{email || '—'}</p>
                </div>

                <div>
                  <p className="text-xs text-white/45">Plan access</p>
                  <p className="mt-1 text-white/88 capitalize">{currentTier}</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleManageBilling}
                  disabled={loadingPortal}
                  className="inline-flex items-center gap-2 px-5 h-11 rounded-full border border-white/15 bg-white/5 text-white/90 hover:border-ww-violet hover:bg-ww-violet/10 transition disabled:opacity-60"
                >
                  {loadingPortal ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  {loadingPortal ? 'Opening…' : 'Manage subscription'}
                  {!loadingPortal && <ArrowUpRight className="w-4 h-4" />}
                </button>
              </div>
              <button
  type="button"
  onClick={handleRefreshPlan}
  disabled={loadingPortal}
  className="inline-flex items-center gap-2 px-5 h-11 rounded-full border border-white/15 bg-white/5 text-white/90 hover:border-ww-violet hover:bg-ww-violet/10 transition disabled:opacity-60"
>
  Refresh Tier Badge
</button>
            </div>
          </div>

          {currentTier !== 'pro' ? (
            <div className="rounded-2xl border border-white/10 bg-black/45 p-5 space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Upgrade</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Choose your next step</h3>
                <p className="mt-2 text-sm text-white/65 max-w-2xl leading-relaxed">
                  Upgrade when you want a fuller workflow, more capability, and access to premium expansion as it rolls out. 
                  Secure checkout powered by Stripe.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {currentTier === 'free' ? (
                  <button
                    type="button"
                    onClick={() => handleUpgrade('creator')}
                    disabled={loadingUpgrade !== null}
className="rounded-2xl border border-ww-violet/25 bg-ww-violet/[0.08] p-4 text-left hover:border-ww-violet/45 hover:bg-ww-violet/[0.12] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-white font-medium">Upgrade to Creator</p>
                        <p className="mt-1 text-sm text-white/60">£19/month</p>
                      </div>
                      {loadingUpgrade === 'creator' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-ww-violet" />
                      )}
                    </div>
                    <p className="mt-3 text-sm text-white/70 leading-relaxed">
                      Unlock the complete working system for artists who want identity, ideas, campaigns, captions, and execution in one flow.
                    </p>
                  </button>
                ) : null}

                <button
  type="button"
  disabled
  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left opacity-75 cursor-not-allowed"
>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white font-medium">Pro</p>
                      <p className="mt-1 text-sm text-white/60">£39/month</p>
                    </div>
                    {loadingUpgrade === 'pro' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <span className="rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/55">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-white/70 leading-relaxed">
                    Premium expansion, advanced workflows, and deeper strategic tooling. Pro is being rolled out gradually.
                  </p>
                </button>
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-white/10 bg-black/45 p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Trust & access</p>
            <p className="mt-2 text-sm text-white/65 leading-relaxed max-w-3xl">
              Your subscription is managed securely through Stripe. You can update payment details, billing information,
              and subscription status through the billing portal.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}