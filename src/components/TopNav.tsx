'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { LogOut, Menu, X } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
const [mobileOpen, setMobileOpen] = useState(false)

  // Routes where we ONLY want the logo (no Dashboard / Momentum / Logout buttons)
  const isMinimalNav =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/dashboard' ||
    pathname?.startsWith('/update-password')

  async function handleLogout() {
    try {
      setLoggingOut(true)
      await supabase.auth.signOut()
      router.replace('/login')
    } catch (e) {
      console.error(e)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
  <header className="sticky top-0 z-20 border-b border-white/5 bg-black/65 backdrop-blur">
    <nav className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-3 px-3 py-2 sm:px-4">
      <Link
        href="/"
        className="shrink-0 text-base font-semibold leading-tight tracking-tight no-underline text-white sm:text-lg"
      >
        Wavering <span className="text-ww-violet">Wanderers</span>
      </Link>

      {!isMinimalNav && (
        <>
          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full border border-white/10 px-3 py-2 text-[0.78rem] font-medium whitespace-nowrap text-white/85 hover:border-ww-violet hover:bg-ww-violet/10 hover:shadow-[0_0_14px_rgba(186,85,211,0.35)] transition">
              Dashboard
            </Link>

            <Link href="/strategy-board" className="inline-flex items-center justify-center rounded-full border border-white/10 px-3 py-2 text-[0.78rem] font-medium whitespace-nowrap text-white/85 hover:border-ww-violet hover:bg-ww-violet/10 hover:shadow-[0_0_14px_rgba(186,85,211,0.35)] transition">
              Momentum
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ww-violet px-3 py-2 text-[0.78rem] font-semibold whitespace-nowrap text-white hover:shadow-[0_0_16px_rgba(186,85,211,0.55)] active:scale-95 transition disabled:opacity-60"
            >
              <LogOut className="h-3.5 w-3.5" />
              {loggingOut ? 'Logging…' : 'Log out'}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(prev => !prev)}
            className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/85 hover:border-ww-violet hover:bg-ww-violet/10 transition"
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </>
      )}
    </nav>

    {!isMinimalNav && mobileOpen ? (
      <div className="sm:hidden border-t border-white/5 bg-black/90 px-3 pb-3">
        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between rounded-xl px-3 py-3 text-sm text-white/85 hover:bg-ww-violet/10"
          >
            Dashboard
          </Link>

          <Link
            href="/strategy-board"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between rounded-xl px-3 py-3 text-sm text-white/85 hover:bg-ww-violet/10"
          >
            Momentum Board
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-white bg-ww-violet/90 disabled:opacity-60"
          >
            {loggingOut ? 'Logging out…' : 'Log out'}
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    ) : null}
  </header>
)
}
