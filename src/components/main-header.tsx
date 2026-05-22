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
    'shrink-0 inline-flex items-center justify-center rounded-full border border-white/10 px-3 py-2 text-[0.78rem] font-medium whitespace-nowrap text-white/85 hover:border-ww-violet hover:bg-ww-violet/10 hover:shadow-[0_0_14px_rgba(186,85,211,0.35)] transition'

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Logout error', e)
    } finally {
      router.replace('/login')
    }
  }, [router])

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-black/65 backdrop-blur">
      <nav className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-3 px-3 py-2 sm:px-4">
        <Link
          href="/"
          className="shrink-0 text-base font-semibold leading-tight tracking-tight no-underline text-white sm:text-lg"
        >
          Wavering <span className="text-ww-violet">Wanderers</span>
        </Link>

        <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1">
          {isDashboard && (
            <button type="button" onClick={handleLogout} className={baseBtn}>
              Log out
            </button>
          )}

          {isMomentumBoard && !isDashboard && (
            <Link href="/dashboard" className={baseBtn}>
              Dashboard
            </Link>
          )}

          {!isDashboard && !isMomentumBoard && (
            <>
              <Link href="/dashboard" className={baseBtn}>
                Dashboard
              </Link>
              <Link href="/strategy-board" className={baseBtn}>
                Momentum
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}