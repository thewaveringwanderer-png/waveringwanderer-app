'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Toaster, toast } from 'sonner'
import { Loader2, KeyRound } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function UpdatePasswordInner() {
  const router = useRouter()
  const params = useSearchParams()

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  // When user lands via the email link, Supabase completes the session in the browser.
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setSessionReady(true)
      } else {
        // give it a moment to initialize
        setTimeout(async () => {
          const { data: d2 } = await supabase.auth.getSession()
          setSessionReady(!!d2.session)
        }, 600)
      }
    })()
  }, [params])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!sessionReady) return toast.error('Session not ready. Open the link again from your email.')
    if (!password || password.length < 6) return toast.error('Use at least 6 characters')

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) return toast.error(error.message)

    toast.success('Password updated')
    router.replace('/home')
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <Toaster position="top-center" richColors />
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/60 shadow-xl p-6">
        <h1 className="text-2xl font-bold mb-2">Set a new password</h1>
        <p className="text-white/60 text-sm mb-6">
          Enter your new password below. You’ll be redirected to your Creator Hub.
        </p>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70">New password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 rounded-xl bg-black border border-white/20 text-white placeholder-white/40 focus:border-ww-violet focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !sessionReady}
            className="w-full inline-flex items-center justify-center gap-2 px-5 h-11 rounded-full bg-ww-violet text-white font-semibold transition-all duration-300 hover:shadow-[0_0_16px_rgba(186,85,211,0.55)] active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            {loading ? 'Updating…' : 'Update password'}
          </button>

          {!sessionReady && (
            <div className="text-xs text-amber-300 mt-2">
              Waiting for secure session from your email link…
            </div>
          )}
        </form>
      </div>
    </main>
  )
}

export default function UpdatePasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/60 shadow-xl p-6">
            <div className="text-white/60 text-sm">Loading…</div>
          </div>
        </main>
      }
    >
      <UpdatePasswordInner />
    </Suspense>
  )
}
