'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  LogIn,
  Wand2,
  Github,
  Loader2,
  Shield,
  ArrowLeft,
  Chrome,
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>('signin')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Hard-hide the global nav buttons on the login page
  useEffect(() => {
    if (typeof window === 'undefined') return
    const rightNav = document.getElementById('ww-topnav-right')
    if (!rightNav) return

    const prevDisplay = rightNav.style.display
    rightNav.style.display = 'none'

    return () => {
      rightNav.style.display = prevDisplay
    }
  }, [])

  async function handleEmailPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Check your inbox to confirm your email, then sign in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        window.location.href = '/dashboard'
      }
    } catch (e: any) {
      setError(e?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      })
      if (error) throw error
      setMessage('Magic link sent! Check your inbox.')
    } catch (e: any) {
      setError(e?.message || 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  async function signInWithGoogle() {
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` },
      })
      if (error) throw error
    } catch (e: any) {
      setError(e?.message || 'Google sign-in failed')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Auth Card */}
      <section className="mx-auto max-w-md px-4 py-20">
        <div className="rounded-2xl border border-white/10 bg-black/70 p-6 shadow-[0_0_25px_rgba(186,85,211,0.06)]">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-white/70 mt-1">Sign in to your Creator Hub.</p>

          {/* Mode Switch */}
          <div className="mt-4 inline-flex rounded-full border border-white/10 p-1">
            <button
              onClick={() => setMode('signin')}
              className={`px-4 h-9 rounded-full text-sm transition ${
                mode === 'signin'
                  ? 'bg-ww-violet text-white'
                  : 'hover:text-white/90'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`px-4 h-9 rounded-full text-sm transition ${
                mode === 'signup'
                  ? 'bg-ww-violet text-white'
                  : 'hover:text-white/90'
              }`}
            >
              Create account
            </button>
            <button
              onClick={() => setMode('magic')}
              className={`px-4 h-9 rounded-full text-sm transition ${
                mode === 'magic'
                  ? 'bg-ww-violet text-white'
                  : 'hover:text-white/90'
              }`}
            >
              Magic link
            </button>
          </div>

          {/* Alerts */}
          {message && (
            <div className="mt-4 text-sm rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-200 px-3 py-2">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 text-sm rounded-xl border border-red-400/30 bg-red-500/10 text-red-200 px-3 py-2">
              {error}
            </div>
          )}

          {/* Forms */}
          {mode === 'magic' ? (
            <form onSubmit={handleMagicLink} className="mt-5 space-y-3">
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 h-11 rounded-xl bg-black border border-white/10 text-white placeholder-white/35 focus:border-ww-violet focus:outline-none transition"
                />
              </div>

              <button
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-ww-violet text-white font-semibold hover:shadow-[0_0_16px_rgba(186,85,211,0.55)] active:scale-95 transition"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                Send magic link
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailPassword} className="mt-5 space-y-3">
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 h-11 rounded-xl bg-black border border-white/10 text-white placeholder-white/35 focus:border-ww-violet focus:outline-none transition"
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3 top-3.5" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 h-11 rounded-xl bg-black border border-white/10 text-white placeholder-white/35 focus:border-ww-violet focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-2.5 p-1 rounded-full hover:bg-white/5"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4 text-white/70" />
                  ) : (
                    <Eye className="w-4 h-4 text-white/70" />
                  )}
                </button>
              </div>

              <button
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-ww-violet text-white font-semibold hover:shadow-[0_0_16px_rgba(186,85,211,0.55)] active:scale-95 transition"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {mode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            </form>
          )}

          {/* OAuth */}
          <div className="mt-6">
            <div className="text-white/40 text-xs uppercase tracking-wide mb-2">
              or
            </div>
            <div className="grid gap-2">
              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full border border-white/10 text-white/90 hover:border-ww-violet hover:text-white transition"
              >
                <Chrome className="w-4 h-4" />
                Continue with Google
              </button>
            </div>
            <p className="text-[11px] text-white/40 mt-3 inline-flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> We never share your credentials.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
