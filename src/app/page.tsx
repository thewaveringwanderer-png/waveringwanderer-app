
"use client"

import { useState } from "react"
import Link from "next/link"
import { WW_TIER_CARDS } from "@/lib/wwPricing"
import LandingNav from '@/components/LandingNav'

export default function HomePage() {
  const [activeImage, setActiveImage] = useState<string | null>(null)

  return (
    <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <LandingNav />
      {/* Background glows */}
<div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
  <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-ww-violet/20 blur-[120px]" />
  <div className="absolute bottom-[-220px] right-[-120px] h-[520px] w-[520px] rounded-full bg-ww-emerald/10 blur-[120px]" />
</div>



      <div className="relative mx-auto w-full max-w-6xl px-6">
        

                {/* Hero */}
        <section className="pt-28 pb-16 md:pt-40 md:pb-24">
          <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center relative">
  <div className="absolute h-44 w-48 rounded-full bg-ww-violet/20 blur-[50px] animate-ww-pulse" />
  <img
    src="/logo/helm.png"
    alt="Wavering Wanderers"
    className="relative w-64 md:w-72 opacity-95 drop-shadow-[0_0_18px_rgba(155,48,255,0.35)]"
  />
</div>

            <h1 className="mt-6 text-3xl md:text-5xl font-bold leading-[1.04] tracking-tight">
  Operate like a{" "}
  <span className="whitespace-nowrap bg-gradient-to-r from-white via-ww-soft-violet to-ww-violet bg-clip-text text-transparent">
    professional artist
  </span>
  
</h1>

            <p className="mt-6 text-base md:text-xl text-white/70 leading-relaxed max-w-3xl mx-auto">
  Wavering Wanderers turns one song into weeks of content with{" "}
  <span className="text-ww-violet/75 font-medium">clarity</span>,{" "}
  <span className="text-ww-amber/75 font-medium">consistency</span> and{" "}
  <span className="text-ww-blue/75 font-medium">momentum</span>
  {" "}— so you spend less time marketing and more time making music.
</p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
  href="/login"
  className="inline-flex items-center justify-center rounded-full
  border border-white/15 bg-white/5
  px-6 h-11 text-sm font-semibold text-white/90
  hover:bg-ww-violet/15 hover:border-ww-violet/70 hover:text-white
  hover:shadow-[0_0_20px_rgba(155,48,255,0.55)]
  transition active:scale-[0.99]"
>
  Get started free
</Link>

              <a
                href="#tools"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 h-11 text-sm font-semibold text-white/90 hover:bg-ww-blue/10 hover:border-ww-blue/50 hover:text-white hover:shadow-[0_0_24px_rgba(59,130,246,0.22)] transition"
              >
                Explore tools
              </a>
            </div>

            
          </div>
        </section>

        {/* Value strip */}
        <section className="w-full pb-20">
          <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3 items-stretch">
            <div className="group relative w-full min-w-0 rounded-3xl border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.12] via-white/[0.03] to-black p-7 text-center transition hover:-translate-y-[3px] hover:border-ww-violet/50 hover:shadow-[0_0_30px_rgba(186,85,211,0.22)]">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-ww-violet/30 bg-ww-violet/[0.12] shadow-[0_0_22px_rgba(186,85,211,0.16)]">
                <span className="h-2 w-2 rounded-full bg-ww-violet" />
              </div>
              <div className="mt-4 text-xl font-semibold text-white">Clarity</div>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Know exactly what you’re building and why.
              </p>
            </div>

            <div className="group relative w-full min-w-0 rounded-3xl border border-ww-amber/25 bg-gradient-to-br from-ww-amber/[0.12] via-white/[0.03] to-black p-7 text-center transition hover:-translate-y-[3px] hover:border-ww-amber/50 hover:shadow-[0_0_30px_rgba(208,132,112,0.22)]">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-ww-amber/30 bg-ww-amber/[0.12] shadow-[0_0_22px_rgba(208,132,112,0.16)]">
                <span className="h-2 w-2 rounded-full bg-ww-amber" />
              </div>
              <div className="mt-4 text-xl font-semibold text-white">Consistency</div>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Turn one song into weeks of content.
              </p>
            </div>

            <div className="group relative w-full min-w-0 rounded-3xl border border-ww-blue/20 bg-gradient-to-br from-ww-blue/[0.10] via-white/[0.03] to-black p-7 text-center transition hover:-translate-y-[3px] hover:border-ww-blue/45 hover:shadow-[0_0_30px_rgba(59,130,246,0.18)]">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-ww-blue/25 bg-ww-blue/[0.12] shadow-[0_0_20px_rgba(59,130,246,0.12)]">
                <span className="h-2 w-2 rounded-full bg-ww-blue" />
              </div>
              <div className="mt-4 text-xl font-semibold text-white">Momentum</div>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Run releases without burning out.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 px-6 py-20 md:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-sm uppercase tracking-[0.22em] text-ww-violet/75">Your workflow</p>
              <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-white">
                A clearer way to move as an independent artist.
              </h2>
              <p className="mt-4 text-white/65 text-lg leading-relaxed">
                Define your identity, generate better ideas, then organise everything in one place.
              </p>
            </div>

            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.11] via-white/[0.03] to-black p-6 md:p-7 transition hover:-translate-y-[3px] hover:border-ww-violet/40 hover:shadow-[0_0_28px_rgba(186,85,211,0.16)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-ww-violet/25 bg-black text-sm font-semibold text-ww-violet">
                    01
                  </div>
                  <p className="text-sm uppercase tracking-[0.2em] text-ww-violet/70">Start here</p>
                </div>

                <h3 className="mt-5 text-2xl font-semibold text-white">🎨 Identity Kit</h3>
                <p className="mt-3 text-white/70 leading-relaxed">
                  Get clear on your sound, story, and direction so your content, visuals, and messaging all come from the same place.
                </p>
              </div>

              <div className="rounded-3xl border border-ww-amber/20 bg-gradient-to-br from-ww-amber/[0.11] via-white/[0.03] to-black p-6 md:p-7 transition hover:-translate-y-[3px] hover:border-ww-amber/45 hover:shadow-[0_0_30px_rgba(245,158,11,0.18)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-ww-amber/25 bg-black text-sm font-semibold text-ww-amber">
                    02
                  </div>
                  <p className="text-sm uppercase tracking-[0.2em] text-ww-amber/70">Create momentum</p>
                </div>

               
                <h3 className="mt-5 text-2xl font-semibold text-white">🧠 Idea Factory</h3>
                <p className="mt-3 text-white/70 leading-relaxed">
                  Turn your music into content people actually want to watch with creative ideas, strong angles, and trend-led concepts that still fit your brand.
                </p>
              </div>

              <div className="rounded-3xl border border-ww-blue/25 bg-gradient-to-br from-ww-blue/[0.12] via-ww-blue/[0.05] to-black p-6 md:p-7 shadow-[0_0_30px_rgba(16,185,129,0.14)] transition hover:-translate-y-[3px] hover:border-ww-blue/45 hover:shadow-[0_0_34px_rgba(16,185,129,0.2)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-ww-blue/30 bg-black text-sm font-semibold text-ww-blue">
                    03
                  </div>
                  <p className="text-sm uppercase tracking-[0.2em] text-ww-blue/70">Command centre</p>
                </div>

                <h3 className="mt-5 text-2xl font-semibold text-white">🧭 Momentum Board</h3>
                <p className="mt-3 text-white/75 leading-relaxed">
                  Pull it all together in one place. Save your best ideas, organise your rollout, and keep track of what’s actually moving.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-white/45">
                Plus press kit tools, captions, campaign support, and more inside.
              </p>
            </div>
          </div>
        </section>

{/* Feature Previews */}
<section className="py-20 border-t border-white/10 bg-ww-dark text-center">
  <div className="mx-auto max-w-5xl">
    <div className="text-center max-w-3xl mx-auto mb-10">
      <p className="text-sm uppercase tracking-[0.22em] text-ww-violet/75">
        Product preview
      </p>
      <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-white">
        See the artist workflow in action.
      </h2>
      <p className="mt-4 text-white/65 text-base leading-relaxed">
        Click a preview to enlarge it.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-8">
      {[
        {
          src: "/images/dashboard.png",
          alt: "Wavering Wanderers dashboard preview",
        },
        {
          src: "/images/idea-factory-preview.png",
          alt: "Idea Factory preview",
        },
      ].map((image) => (
        <button
          key={image.src}
          type="button"
          onClick={() => setActiveImage(image.src)}
          className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-2 shadow-[0_0_30px_rgba(186,85,211,0.12)] transition hover:border-ww-violet/45 hover:shadow-[0_0_36px_rgba(186,85,211,0.24)]"
        >
          <img
            src={image.src}
            alt={image.alt}
            className="block w-full h-auto rounded-2xl object-contain transition duration-300 group-hover:scale-[1.02]"
          />
        </button>
      ))}
    </div>
  </div>
</section>


        {/* How it works */}
        <section id="how" className="py-16 border-t border-white/10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">How it works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3 text-center">
            {[
              ["1", "Tell us about your music", "Your vibe, goals, audience, and direction."],
              ["2", "Generate your toolkit", "Identity, assets, and plans tailored to you."],
              ["3", "Build momentum", "Execute consistently with clarity and confidence."],
            ].map(([num, title, desc]) => (
              <div
  key={num}
  className="
    group
    relative
    rounded-2xl
    border border-white/10
    bg-gradient-to-b from-white/[0.05] to-black
    p-6
    transition
    hover:-translate-y-[2px]
    hover:border-ww-violet/40
    hover:shadow-[0_0_24px_rgba(186,85,211,0.4)]
  "
>

                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full 
  bg-ww-violet/15 text-sm font-semibold text-ww-violet
  shadow-[0_0_12px_rgba(186,85,211,0.4)]">
  {num}
</div>

                <div className="mt-2 font-semibold">{title}</div>
                <div className="mt-2 text-sm text-white/70">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Founder block */}
        <section className="py-16 border-t border-white/10">
  <div className="max-w-3xl mx-auto text-center">

            <h2 className="text-2xl md:text-3xl font-bold">Built by an independent artist.</h2>

            <p className="mt-4 text-white/70 leading-relaxed">
              I’m a single dad with a full-time job, building Wavering Wanderers — and still making music.
            </p>

            <p className="mt-4 text-white/70 leading-relaxed">
              WW exists because I didn’t have hours to plan content. I needed a system that worked inside real life.
            </p>

            <p className="mt-4 text-white/70 leading-relaxed">So I built one.</p>

            <p className="mt-4 text-white/70 leading-relaxed">
              Now I use WW to run my own releases — and I’m opening it up to artists who want the same freedom.
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 border-t border-white/10">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-white">Pricing</h2>
            <p className="mt-2 text-white/70">
              Start free. Upgrade when you’re ready to operate like a professional.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {WW_TIER_CARDS.map(tier => (
              <div
                key={tier.key}
                className={[
                  "rounded-3xl border bg-black/70 p-6",
                  tier.highlight
                    ? "border-ww-violet/50 shadow-[0_0_24px_rgba(186,85,211,0.35)]"
                    : "border-white/10",
                ].join(" ")}
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                  <span className="text-white/80">{tier.priceLabel}</span>
                </div>

                {tier.subLabel && <p className="mt-1 text-sm text-white/60">{tier.subLabel}</p>}

                <ul className="mt-5 space-y-2 text-sm text-white/80">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-ww-violet">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
  <Link
    href="/login?next=/pricing"
    className={[
      "inline-flex items-center justify-center w-full h-10 rounded-full text-sm font-semibold transition",
      tier.highlight
        ? "bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.7)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)]"
        : "border border-white/15 text-white/90 hover:border-ww-violet/70 hover:shadow-[0_0_22px_rgba(186,85,211,0.35)]",
    ].join(" ")}
  >
    {tier.key === "pro" ? "Coming soon" : tier.cta}
  </Link>
</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-16 border-t border-white/10">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <h3 className="text-xl md:text-2xl font-bold">Turn your music into momentum.</h3>
            <p className="mt-3 text-white/70 max-w-2xl mx-auto">
              No gatekeepers. No fluff. Just tools that help independent artists ship consistently.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
  href="/login"
  className="relative inline-flex items-center justify-center rounded-full px-7 h-11 text-sm font-semibold text-white
             bg-ww-violet border border-white/20
             shadow-[0_0_16px_rgba(186,85,211,0.55)]
             hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] transition active:scale-[0.99]"
>
  <span className="absolute inset-0 rounded-full bg-ww-violet/40 blur-[30px] opacity-50 animate-ww-pulse -z-10" />
  Get started free
</Link>

            </div>
          </div>

          <footer className="py-10 text-center text-xs text-white/50">
            © {new Date().getFullYear()} Wavering Wanderers — AI-powered creativity for independent artists.
          </footer>
        </section>
      </div>{activeImage && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 py-8 backdrop-blur-sm"
    onClick={() => setActiveImage(null)}
  >
    <button
      type="button"
      onClick={() => setActiveImage(null)}
      className="absolute right-5 top-5 rounded-full border border-white/15 bg-black/70 px-4 h-10 text-sm text-white/80 hover:border-ww-violet/60 hover:text-white transition"
    >
      Close
    </button>

    <img
      src={activeImage}
      alt="Expanded Wavering Wanderers product preview"
      className="max-h-[85vh] max-w-[95vw] rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(186,85,211,0.25)]"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
)}

    </main>
  )
}
