'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { WW_TIER_CARDS } from '@/lib/wwPricing'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type PaidTier = 'idea_factory' | 'creator'

export default function PricingPage() {
  const [loadingCheckout, setLoadingCheckout] = useState<PaidTier | null>(null)
  const secondaryButtonClass =
  'inline-flex appearance-none items-center justify-center w-full h-10 rounded-full text-sm font-semibold bg-white/[0.04] border border-white/15 text-white/90 shadow-[0_0_22px_rgba(186,85,211,0.18)] hover:border-ww-violet/70 hover:bg-ww-violet/[0.08] hover:shadow-[0_0_22px_rgba(186,85,211,0.35)] transition'

  async function handleCheckout(tier: PaidTier) {
    if (loadingCheckout) return
    setLoadingCheckout(tier)

    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token

      if (!token) {
        window.location.href = '/login?next=/pricing'
        return
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      })

      const text = await res.text()

      let json: any = null
      try {
        json = text ? JSON.parse(text) : null
      } catch {
        console.error('Checkout returned non-JSON:', text)
      }

      if (json?.url) {
        window.location.href = json.url
        return
      }

      if (res.redirected && res.url) {
        window.location.href = res.url
        return
      }

      alert(json?.error || text || 'Could not start checkout')
    } finally {
      setLoadingCheckout(null)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold">Pricing</h1>
          <p className="mt-4 text-white/70 max-w-xl mx-auto">
            Start free. Choose the workflow that fits where you are right now.
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-4xl gap-4 overflow-x-auto pb-3 snap-x snap-mandatory md:flex-row md:items-center md:justify-center md:overflow-visible md:pb-0">
          {WW_TIER_CARDS.map((tier) => {
            const isPaidTier = tier.key === 'idea_factory' || tier.key === 'creator'

            return (
              <div
                key={tier.key}
                className={[
                  'w-[82vw] shrink-0 snap-center md:w-full md:max-w-[380px] min-h-[380px] rounded-3xl border bg-black/70 p-6 flex flex-col justify-between',
                  tier.highlight
                    ? 'border-ww-violet/50 shadow-[0_0_24px_rgba(186,85,211,0.35)]'
                    : 'border-white/10',
                ].join(' ')}
              >
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                    <span className="text-white/80 whitespace-nowrap">{tier.priceLabel}</span>
                  </div>

                  {tier.subLabel && (
                    <p className="mt-1 text-sm text-white/60">{tier.subLabel}</p>
                  )}

                  <ul className="mt-5 space-y-2 text-sm text-white/80">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-ww-violet">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
  {tier.key === 'free' ? (
    <Link
      href="/login"
      className={[
        "inline-flex items-center justify-center w-full h-10 rounded-full text-sm font-semibold transition",
        "border border-white/15 text-white/90 hover:border-ww-violet/70 hover:shadow-[0_0_22px_rgba(186,85,211,0.35)]",
      ].join(" ")}
    >
      {tier.cta}
    </Link>
  ) : tier.key === 'idea_factory' ? (
    <Link
  href="#"
  onClick={(e) => {
    e.preventDefault()
    handleCheckout('idea_factory')
  }}
  className={[
    "inline-flex items-center justify-center w-full h-10 rounded-full text-sm font-semibold transition",
    "border border-white/15 text-white/90 hover:border-ww-violet/70 hover:shadow-[0_0_22px_rgba(186,85,211,0.35)]",
  ].join(" ")}
>
  {loadingCheckout === 'idea_factory' ? 'Opening checkout…' : tier.cta}
</Link>
  ) : tier.key === 'creator' ? (
    <button
      type="button"
      onClick={() => handleCheckout('creator')}
      disabled={loadingCheckout !== null}
      className={[
        "inline-flex items-center justify-center w-full h-10 rounded-full text-sm font-semibold transition",
        "bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.7)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)]",
      ].join(" ")}
    >
      {loadingCheckout === 'creator' ? 'Opening checkout…' : tier.cta}
    </button>
  ) : null}
</div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}