'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { LogOut } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

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
      <nav className="mx-auto max-w-6xl h-14 px-4 flex items-center justify-between">
        {/* Brand – always visible, left side */}
        <Link
          href="/"
          className="font-semibold tracking-tight no-underline text-white"
        >
          Wavering <span className="text-ww-violet">Wanderers</span>
        </Link>

        {/* Right-side controls – hidden on minimal routes */}
        {!isMinimalNav && (
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3 h-9 rounded-full border border-white/10 text-white/90 hover:border-ww-violet hover:shadow-[0_0_14px_rgba(186,85,211,0.45)] transition"
            >
              Dashboard
            </Link>
            <Link
              href="/strategy-board"
              className="inline-flex items-center gap-2 px-3 h-9 rounded-full border border-white/10 text-white/90 hover:border-ww-violet hover:shadow-[0_0_14px_rgba(186,85,211,0.45)] transition"
            >
              Momentum Board
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 px-3 h-9 rounded-full bg-ww-violet text-white font-semibold hover:shadow-[0_0_16px_rgba(186,85,211,0.55)] active:scale-95 transition disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? 'Logging out…' : 'Log out'}
            </button>
          </div>
        )}
      </nav>
    </header>
  )
}
