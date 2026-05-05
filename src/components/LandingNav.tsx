'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function LandingNav() {
  const [visible, setVisible] = useState(true)
  const [lastY, setLastY] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY

      // Always show near the top
      if (currentY < 40) {
        setVisible(true)
        setLastY(currentY)
        return
      }

      // Show when scrolling up, hide when scrolling down
      if (currentY < lastY) {
        setVisible(true)
      } else if (currentY > lastY) {
        setVisible(false)
      }

      setLastY(currentY)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [lastY])

  return (
    <div
      className={[
        'fixed top-3 left-1/2 z-50 w-[min(1100px,calc(100%-24px))] -translate-x-1/2 transition-all duration-300',
        visible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-6 opacity-0 pointer-events-none',
      ].join(' ')}
    >
      <div className="rounded-full border border-white/10 bg-black/55 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between px-4 md:px-6 h-16">
          {/* Left spacer */}
          <div />

          {/* Center nav */}
          <nav className="hidden md:flex items-center justify-center gap-8 text-sm text-white/70">
            <a href="#tools" className="hover:text-white transition">
              Tools
            </a>
            <a href="#how" className="hover:text-white transition">
              How it works
            </a>
            <a href="#pricing" className="hover:text-white transition">
              Pricing
            </a>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full px-3 h-9 text-xs md:text-sm font-semibold
              border border-white/15 bg-white/5 text-white/85
              hover:bg-ww-deep-violet/15 hover:border-ww-violet/60 hover:text-white
              hover:shadow-[0_0_18px_rgba(186,85,211,0.35)]
              transition active:scale-[0.99]"
            >
              Sign in
            </Link>

            <Link
              href="/login?next=/pricing"
              className="inline-flex items-center justify-center rounded-full
              border border-white/15 bg-white/5
              px-4 h-10 text-sm font-semibold text-white/90
              hover:bg-ww-violet/15 hover:border-ww-violet/70 hover:text-white
              hover:shadow-[0_0_20px_rgba(155,48,255,0.35)]
              transition active:scale-[0.99]"
            >
              Get started free
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}