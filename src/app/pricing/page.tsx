// src/app/pricing/page.tsx

'use client'

import Link from "next/link"
import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { WW_TIER_CARDS } from "@/lib/wwPricing"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PricingPage() {
  const [loadingCheckout, setLoadingCheckout] = useState(false)

async function handleCreatorCheckout() {
  if (loadingCheckout) return
setLoadingCheckout(true)

  try {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    if (!token) {
  window.location.href = "/login?next=/pricing"
  return
}

    const res = await fetch("/api/stripe/checkout", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    tier: "creator",
  }),
})

    const text = await res.text()

let json: any = null
try {
  json = text ? JSON.parse(text) : null
} catch {
  console.error("Checkout returned non-JSON:", text)
}

if (json?.url) {
  window.location.href = json.url
  return
}

if (res.redirected && res.url) {
  window.location.href = res.url
  return
}

alert(json?.error || text || "Could not start checkout")
  } finally {
    setLoadingCheckout(false)
  }
}
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
      

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold">
            Pricing
          </h1>
          <p className="mt-4 text-white/70 max-w-xl mx-auto">
            Start free. Upgrade when you're ready to operate like a professional artist.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {WW_TIER_CARDS.map((tier) => (
            <div
              key={tier.key}
              className={[
                "rounded-3xl border bg-black/70 p-6 flex flex-col justify-between",
                tier.highlight
                  ? "border-ww-violet/50 shadow-[0_0_24px_rgba(186,85,211,0.35)]"
                  : "border-white/10",
              ].join(" ")}
            >
              {/* Top */}
              <div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    {tier.name}
                  </h3>
                  <span className="text-white/80">
                    {tier.priceLabel}
                  </span>
                </div>

                {tier.subLabel && (
                  <p className="mt-1 text-sm text-white/60">
                    {tier.subLabel}
                  </p>
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

              {/* CTA */}
              <div className="mt-6">
                {tier.key === "free" ? (
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center w-full h-10 rounded-full text-sm font-semibold border border-white/15 text-white/90 hover:border-ww-violet/70 hover:shadow-[0_0_22px_rgba(186,85,211,0.35)] transition"
                  >
                    Get started free
                  </Link>
                ) : tier.key === "creator" ? (
                  <button
  type="button"
  onClick={handleCreatorCheckout}
  disabled={loadingCheckout}
  className="inline-flex items-center justify-center w-full h-10 rounded-full text-sm font-semibold bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.7)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] transition disabled:opacity-60"
>
  {loadingCheckout ? "Opening checkout…" : "Upgrade to Creator"}
</button>
                      
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center justify-center w-full h-10 rounded-full text-sm font-semibold border border-white/10 text-white/40 cursor-not-allowed"
                  >
                    Coming soon
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
