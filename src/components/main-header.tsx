'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { useCallback } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MainHeader() {
  const pathname = usePathname()
  const router = useRouter()

  const isDashboard = pathname === '/dashboard'
  const isMomentumBoard = pathname?.startsWith('/strategy-board')

  const baseBtn =
    'inline-flex items-center gap-2 px-3 h-9 rounded-full border border-white/10 text-white/90 hover:border-ww-violet hover:shadow-[0_0_14px_rgba(186,85,211,0.45)] transition'

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      // even if signOut fails, still push them to login
      console.error('Logout error', e)
    } finally {
      router.replace('/login')
    }
  }, [router])

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-black/65 backdrop-blur">
      <nav className="mx-auto max-w-6xl h-14 px-4 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight no-underline text-white">
          Wavering <span className="text-ww-violet">Wanderers</span>
        </Link>

        {/* Right side of nav depends on current page */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Dashboard page: only "Log out" */}
          {isDashboard && (
            <button
              type="button"
              onClick={handleLogout}
              className={baseBtn}
            >
              Log out
            </button>
          )}

          {/* Momentum Board page: only "Dashboard" */}
          {isMomentumBoard && !isDashboard && (
            <Link href="/dashboard" className={baseBtn}>
              Dashboard
            </Link>
          )}

          {/* All other pages: Dashboard + Momentum Board */}
          {!isDashboard && !isMomentumBoard && (
            <>
              <Link href="/dashboard" className={baseBtn}>
                Dashboard
              </Link>
              <Link href="/strategy-board" className={baseBtn}>
                Momentum Board
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
