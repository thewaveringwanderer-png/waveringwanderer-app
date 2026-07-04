
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Camera, Music2, Mail } from "lucide-react"
import Link from "next/link"
import { WW_TIER_CARDS } from "@/lib/wwPricing"
import LandingNav from '@/components/LandingNav'

export default function HomePage() {
  const [activeImage, setActiveImage] = useState<string | null>(null)
const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
}

const revealProps = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.7, ease: "easeOut" },
  variants: fadeUp,
}
  return (
    <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <LandingNav />
      {/* Background glows */}
<div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
  <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-ww-violet/20 blur-[120px] animate-ww-float" />
  <div className="absolute bottom-[-220px] right-[-120px] h-[520px] w-[520px] rounded-full bg-ww-emerald/10 blur-[120px]" />
</div>



      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        

                {/* Hero */}
        <section className="pt-28 pb-16 md:pt-40 md:pb-24">
          <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center relative">
  <div className="absolute h-44 w-48 rounded-full bg-ww-violet/20 blur-[50px] animate-ww-pulse" />
  <img
    src="/logo/helm.png"
    alt="Wavering Wandererss"
   className="
relative
w-64 md:w-72
opacity-95
drop-shadow-[0_0_18px_rgba(155,48,255,0.35)]
animate-ww-helm
"
  />
</div>

           <h1 className="mt-6 text-[1.85rem] sm:text-4xl md:text-5xl font-bold leading-[1.06] tracking-tight">
  Every artist has a destination.{" "}
  <span className="block bg-gradient-to-r from-white via-ww-soft-violet to-ww-violet bg-clip-text text-transparent">
    We're here to help you find the path.
  </span>
</h1>

            <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-white/65 md:text-lg">
  Wavering Wanderers helps you{' '}
  <span className="font-semibold text-white">
    discover your identity
  </span>
  ,{' '}
  <span className="font-semibold text-white">
    find creative direction
  </span>{' '}
  and{' '}
  <span className="font-semibold text-white">
    build lasting momentum
  </span>{' '}
  — with AI tools designed to guide your journey as an independent artist.
</p>

            <div className="mt-10 flex flex-row flex-wrap items-center justify-center gap-3">
              <Link
  href="/login"
  className="inline-flex items-center justify-center rounded-full
  border border-white/15 bg-white/5
  px-6 h-11 text-sm font-semibold text-white/90
  hover:bg-ww-violet/15 hover:border-ww-violet/70 hover:text-white
  hover:shadow-[0_0_20px_rgba(155,48,255,0.55)]
  transition active:scale-[0.99]"
>
  Start Your Journey
</Link>

              
            </div>

            
          </div>
        </section>

       <div className="mt-10 flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 text-[13px] sm:text-sm text-white/65">
  {[
    ["500+", "artist conversations"],
    ["60+", "interested artists"],
    ["Built by", "an independent artist"],
  ].map(([number, label]) => (
    <div
      key={label}
      className="group relative overflow-hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-sm transition hover:-translate-y-[1px] hover:border-ww-violet/40 hover:bg-ww-violet/[0.08] hover:shadow-[0_0_18px_rgba(186,85,211,0.25)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      <span className="relative font-semibold text-white">{number}</span>{" "}
      <span className="relative text-white/55">{label}</span>
    </div>
  ))}
</div>

        {/* Value strip */}
<motion.section
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.18 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
  variants={fadeUp}
  className="w-full pt-12 pb-20">
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            <div className="
group
relative
overflow-hidden
shrink-0 w-[82vw] snap-center md:w-full
w-full
min-w-0
rounded-3xl
border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.12] via-white/[0.03] to-black p-7 text-center transition hover:-translate-y-[3px] hover:border-ww-violet/50 hover:shadow-[0_0_30px_rgba(186,85,211,0.22)]">
  <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-ww-violet/30 bg-ww-violet/[0.12] shadow-[0_0_22px_rgba(186,85,211,0.16)]">
                <span className="h-2 w-2 rounded-full bg-ww-violet" />
              </div>
              <div className="mt-4 text-xl font-semibold text-white">Clarity</div>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Understand who you are, where you're going, and the foundations behind your artistry.
              </p>
            </div>

            <div className="
group
relative
overflow-hidden
shrink-0 w-[82vw] snap-center md:w-full
w-full
min-w-0
rounded-3xl
border border-ww-amber/25 bg-gradient-to-br from-ww-amber/[0.12] via-white/[0.03] to-black p-7 text-center transition hover:-translate-y-[3px] hover:border-ww-amber/50 hover:shadow-[0_0_30px_rgba(208,132,112,0.22)]">
  <div className="absolute inset-0 rounded-3xl bg-white/[0.02] opacity-0 transition duration-500 group-hover:opacity-100" />
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-ww-amber/30 bg-ww-amber/[0.12] shadow-[0_0_22px_rgba(208,132,112,0.16)]">
                <span className="h-2 w-2 rounded-full bg-ww-amber" />
              </div>
              <div className="mt-4 text-xl font-semibold text-white">Consistency</div>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Create from a clear direction instead of constantly starting from zero.
              </p>
            </div>

            <div className="
group
relative
overflow-hidden
shrink-0 w-[82vw] snap-center md:w-full
min-w-0
rounded-3xl
border border-ww-blue/20 bg-gradient-to-br from-ww-blue/[0.10] via-white/[0.03] to-black p-7 text-center transition hover:-translate-y-[3px] hover:border-ww-blue/45 hover:shadow-[0_0_30px_rgba(59,130,246,0.18)]">
  <div className="absolute inset-0 rounded-3xl bg-white/[0.02] opacity-0 transition duration-500 group-hover:opacity-100" />
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-ww-blue/25 bg-ww-blue/[0.12] shadow-[0_0_20px_rgba(59,130,246,0.12)]">
                <span className="h-2 w-2 rounded-full bg-ww-blue" />
              </div>
              <div className="mt-4 text-xl font-semibold text-white">Momentum</div>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Keep moving forward with a clearer path and sustainable creative habits.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.18 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
  variants={fadeUp}
  className="border-t border-white/10 px-6 py-20 md:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-sm uppercase tracking-[0.22em] text-ww-violet/75">Your Creative Map</p>
              <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-white">
                Every journey starts with direction.
              </h2>
              <p className="mt-4 text-white/65 text-lg leading-relaxed">
                Discover your foundations, express your identity, and build momentum one step at a time.
              </p>
            </div>

            <div className="mt-14 flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
              <div className="shrink-0 w-[82vw] snap-center lg:w-full rounded-3xl border border-ww-violet/20 bg-gradient-to-br from-ww-violet/[0.11] via-white/[0.03] to-black p-6 md:p-7 transition hover:-translate-y-[3px] hover:border-ww-violet/40 hover:shadow-[0_0_28px_rgba(186,85,211,0.16)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-ww-violet/25 bg-black text-sm font-semibold text-ww-violet">
                    01
                  </div>
                  <p className="text-sm uppercase tracking-[0.2em] text-ww-violet/70">Start here</p>
                </div>

                <h3 className="mt-5 text-2xl font-semibold text-white">🎨 Discover your creative foundations</h3>
                <p className="mt-3 text-white/70 leading-relaxed">
                 Map your story, audience and identity so every creative decision has a clearer direction.
                </p>
              </div>

              <div className="shrink-0 w-[82vw] snap-center lg:w-full rounded-3xl border border-ww-amber/20 bg-gradient-to-br from-ww-amber/[0.11] via-white/[0.03] to-black p-6 md:p-7 transition hover:-translate-y-[3px] hover:border-ww-amber/45 hover:shadow-[0_0_30px_rgba(245,158,11,0.18)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-ww-amber/25 bg-black text-sm font-semibold text-ww-amber">
                    02
                  </div>
                  <p className="text-sm uppercase tracking-[0.2em] text-ww-amber/70">Create momentum</p>
                </div>

               
                <h3 className="mt-5 text-2xl font-semibold text-white">🧠 Turn identity into expression</h3>
                <p className="mt-3 text-white/70 leading-relaxed">
                  Transform your creative foundations into content ideas, campaigns and strategies that feel like you.
                </p>
              </div>

              <div className="shrink-0 w-[82vw] snap-center lg:w-full rounded-3xl border border-ww-blue/25 bg-gradient-to-br from-ww-blue/[0.12] via-ww-blue/[0.05] to-black p-6 md:p-7 shadow-[0_0_30px_rgba(16,185,129,0.14)] transition hover:-translate-y-[3px] hover:border-ww-blue/45 hover:shadow-[0_0_34px_rgba(16,185,129,0.2)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-ww-blue/30 bg-black text-sm font-semibold text-ww-blue">
                    03
                  </div>
                  <p className="text-sm uppercase tracking-[0.2em] text-ww-blue/70">Your Path</p>
                </div>

                <h3 className="mt-5 text-2xl font-semibold text-white">🧭 Stay organised when life gets busy</h3>
                <p className="mt-3 text-white/75 leading-relaxed">
                  Keep your best ideas, releases and content plans in one place so momentum doesn't disappear.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-white/45">
                Plus press kit tools, captions, campaign support, and more inside.
              </p>
            </div>
          </div>
        </motion.section>

{/* Feature Previews */}
<motion.section
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.18 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
  variants={fadeUp}
  className="py-20 border-t border-white/10 bg-ww-dark text-center">
  <div className="mx-auto max-w-5xl">
    <div className="text-center max-w-3xl mx-auto mb-10">
      <p className="text-sm uppercase tracking-[0.22em] text-ww-violet/75">
        Inside WW
      </p>
      <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-white">
        See your creative system come together.
      </h2>
      <p className="mt-4 text-white/65 text-base leading-relaxed">
        Explore the tools designed to guide your next steps.
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
</motion.section>


        {/* Founder block */}
        <motion.section
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.18 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
  variants={fadeUp}
  className="py-16 border-t border-white/10">
  <div className="max-w-3xl mx-auto text-center">

            <h2 className="text-2xl md:text-3xl font-bold">
  Built for artists trying to find their way.
</h2>

<p className="mt-4 text-white/70 leading-relaxed">
  I’m an independent artist, a single dad, and I work full time — so I know what it feels like to love music but struggle to find the time and energy to market it properly.
</p>

<p className="mt-4 text-white/70 leading-relaxed">
  Wavering Wanderers came from that exact tension: wanting to stay consistent, promote releases, and build momentum without spending every spare hour overthinking content.
</p>

<p className="mt-4 text-white/70 leading-relaxed">
  This isn’t built for artists with huge teams behind them. It’s built for artists trying to create something meaningful while real life is still happening.
</p>
          </div>
        </motion.section>

       {/* Pricing */}
<motion.section
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.18 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
  variants={fadeUp}
  id="pricing" className="mx-auto max-w-6xl px-4 py-16 border-t border-white/10">
  <div className="mb-8 text-center">
    <h2 className="text-3xl font-bold text-white">Pricing</h2>
    <p className="mt-2 text-white/70">
      Start with your foundations. Continue your journey when you're ready to explore further.
    </p>
  </div>

  <div className="mx-auto flex w-full max-w-4xl gap-4 overflow-x-auto pb-3 snap-x snap-mandatory md:flex-row md:items-center md:justify-center md:overflow-visible md:pb-0">
    {WW_TIER_CARDS.map(tier => (
      <div
        key={tier.key}
        className={[
          "w-[82vw] shrink-0 snap-center md:w-full md:max-w-[380px] w-full max-w-[380px] min-h-[380px] rounded-3xl border bg-black/70 p-6 flex flex-col justify-between",
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
            {tier.cta}
          </Link>
        </div>
      </div>
    ))}
  </div>
</motion.section>

<motion.section className="mx-auto max-w-6xl px-4 py-16 border-t border-white/10">
  <div className="text-center mb-10">
    <p className="text-sm uppercase tracking-[0.22em] text-ww-violet/75">
      First discoveries
    </p>

    <h2 className="text-3xl font-bold text-white">
      Built with artists, not just for artists
    </h2>

    <p className="mt-3 text-white/70 max-w-2xl mx-auto">
      Early artists are helping shape the journey. Their feedback guides every improvement we make.
    </p>
  </div>

  <div className="grid gap-5 md:grid-cols-2">
    {[
      {
        quote:
          "It gave me one fresh idea... then another one. I spend half my day worrying about promo, so that's crazy. A lot of people could really use this.",
        name: "JustYB",
        role: "Independent Artist · Founding Crew",
      },
      {
        quote:
          "I used the platform and it generated perfect ideas that perfectly aligned with my type of videos. I really think it should get more attention as it could honestly be a useful tool for artists out there.",
        name: "Sophie Maybies",
        role: "Independent Artist · Founding Crew",
      },
    ].map((testimonial) => (
      <div
        key={testimonial.name}
        className="rounded-3xl border border-ww-violet/30 bg-black/70 p-6 md:p-8 shadow-[0_0_24px_rgba(186,85,211,0.2)]"
      >
        <p className="text-base md:text-lg text-white leading-relaxed">
          “{testimonial.quote}”
        </p>

        <div className="mt-6">
          <p className="text-white font-semibold">{testimonial.name}</p>
          <p className="text-white/60 text-sm">{testimonial.role}</p>
        </div>
      </div>
    ))}
  </div>
</motion.section>

        {/* Footer CTA */}
        <motion.section
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.18 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
  variants={fadeUp}
  className="py-16 border-t border-white/10">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <h3 className="text-xl md:text-2xl font-bold">Your next step starts here.</h3>
            <p className="mt-3 text-white/70 max-w-2xl mx-auto">
              A clearer path for independent artists building something meaningful — one step at a time.
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
  <div className="flex flex-col items-center gap-4">
    <p>
      © {new Date().getFullYear()} Wavering Wanderers — Helping independent artists find their way.
    </p>

    <div className="flex flex-wrap items-center justify-center gap-3">
      <a
        href="mailto:support@waveringwanderers.com"
        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 h-9 text-white/65 hover:border-ww-violet/50 hover:text-white transition"
      >
        <Mail className="w-4 h-4" />
        Support
      </a>

      <a
        href="https://www.instagram.com/natestapes/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 h-9 text-white/65 hover:border-ww-violet/50 hover:text-white transition"
      >
        <Camera className="w-4 h-4" />
        Instagram
      </a>

      <a
        href="https://www.tiktok.com/@wavering.wanderer?_r=1&_t=ZN-968TmBxTbhm"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 h-9 text-white/65 hover:border-ww-violet/50 hover:text-white transition"
      >
        <Music2 className="w-4 h-4" />
        TikTok
      </a>
    </div>

    <p className="text-white/40">
      Need help? Email support@waveringwanderers.com
    </p>
  </div>
</footer>
        </motion.section>
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
