import Link from "next/link"
import { WW_TIER_CARDS } from "@/lib/wwPricing"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-ww-violet/20 blur-[120px]" />
        <div className="absolute bottom-[-220px] right-[-120px] h-[520px] w-[520px] rounded-full bg-ww-violet/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(186,85,211,0.10),transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Nav */}
        <header className="flex items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
              <span className="text-sm font-semibold tracking-wide">W</span>
            </div>
            <span className="text-sm font-semibold tracking-wide">Wavering Wanderers</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <a href="#tools" className="hover:text-white transition">Tools</a>
            <a href="#how" className="hover:text-white transition">How it works</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/70 hover:text-white transition">
              Sign in
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-ww-violet px-4 h-10 text-sm font-semibold text-white transition hover:shadow-[0_0_18px_rgba(186,85,211,0.55)] active:scale-[0.99] hover:shadow-[0_0_18px_rgba(186,85,211,0.55)]
"
            >
              Get started free
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-10 pb-16 md:pt-16 md:pb-20">
  <div className="max-w-3xl mx-auto text-center">

<span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-1.5 text-xs text-white/75">
  <span className="relative h-3 w-5">
    <span className="absolute inset-0 rounded-full bg-ww-violet/25 blur-[6px]" />
    <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded-full bg-ww-violet/80" />
    <span className="absolute left-0 top-[3px] h-[2px] w-full rounded-full bg-white/10" />
  </span>
  Built for busy independent artists
</span>


            <h1 className="mt-5 text-4xl md:text-6xl font-bold leading-[1.06]">
              Operate like a professional artist — without a manager or label.
            </h1>

            <p className="mt-5 text-base md:text-lg text-white/70 leading-relaxed">
              Wavering Wanderers turns one song into weeks of content with{" "}
              <span className="text-white/90 font-semibold">clarity, consistency &amp; momentum</span>
              {" "}— so you spend less time “marketing” and more time making music.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full 
border border-white/15 bg-white/5 
px-6 h-11 text-sm font-semibold 
text-white/90 
hover:bg-ww-violet/20 hover:border-ww-violet 
hover:shadow-[0_0_18px_rgba(186,85,211,0.55)] 
transition"
              >
                Get started free
              </Link>
              <a
                href="#tools"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 h-11 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
              >
                Explore tools
              </a>
            </div>

            <p className="mt-6 text-sm text-white/60 text-center">

              One free generation. Upgrade only when you feel the difference.
            </p>
          </div>
        </section>

        {/* Value strip */}
        <section className="pb-16">
          <div className="grid gap-3 md:grid-cols-3 text-center">

            {[
              ["Clarity", "Know exactly what you’re building and why."],
              ["Consistency", "Turn one song into weeks of content."],
              ["Momentum", "Run releases without burning out."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-black/60 p-5">
                <div className="text-sm font-semibold">{title}</div>
                <div className="mt-2 text-sm text-white/70">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Tools */}
        <section id="tools" className="py-16 border-t border-white/10">
          <div className="flex justify-center text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold">
                Everything you need to operate independently.
              </h2>
              <p className="mt-3 text-white/70">
                Identity, content, strategy and momentum — built so artists don’t need managers to move professionally
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 text-center">

            {[
              [
                "🎤 Artist Identity",
                "Get crystal clear on your sound, story, and direction — so every post and release makes sense.",
              ],
              [
                "📰 Press Kit Builder",
                "Generate professional bios and press assets in minutes, not days.",
              ],
              [
                "📅 Content Calendar",
                "Turn one song into weeks of content — with ready-to-post ideas and angles.",
              ],
              [
                "🔥 Trend Finder",
                "See what’s working right now and translate it into content that fits your brand.",
              ],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
              >
                <div className="text-base font-semibold text-center">{title}</div>

                <div className="mt-2 text-sm text-white/70">{desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-black/60 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Less overwhelm. More output. Same voice.</div>
              <div className="mt-1 text-sm text-white/70">
                Build professional assets faster so you can spend more time creating.
              </div>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-ww-violet px-6 h-11 text-sm font-semibold text-white transition hover:shadow-[0_0_18px_rgba(186,85,211,0.55)] active:scale-[0.99]"
            >
              Start free
            </Link>
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
              <div key={num} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-xs text-white/60">Step {num}</div>
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
                  <a
                    href="/pricing"
                    className={[
                      "inline-flex items-center justify-center w-full h-10 rounded-full text-sm font-semibold transition",
                      tier.highlight
                        ? "bg-ww-violet text-white shadow-[0_0_16px_rgba(186,85,211,0.7)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)]"
                        : "border border-white/15 text-white/90 hover:border-ww-violet",
                    ].join(" ")}
                  >
                    {tier.cta}
                  </a>
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
                className="inline-flex items-center justify-center rounded-full bg-ww-violet px-7 h-11 text-sm font-semibold text-white transition hover:shadow-[0_0_18px_rgba(186,85,211,0.55)] active:scale-[0.99]"
              >
                Get started free
              </Link>
            </div>
          </div>

          <footer className="py-10 text-center text-xs text-white/50">
            © {new Date().getFullYear()} Wavering Wanderers — AI-crafted creativity for independent artists.
          </footer>
        </section>
      </div>
    </main>
  )
}
