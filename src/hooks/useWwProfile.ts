// src/hooks/useWwProfile.ts
'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type WwProfile = {
  artistName?: string
  genre?: string
  audience?: string
  goal?: string
  tone?: string
}

const LS_KEY = 'ww_profile'

function safeParse(raw: string | null): any {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function mergeProfile(a: WwProfile | null, b: WwProfile | null): WwProfile {
  return {
    artistName: b?.artistName ?? a?.artistName,
    genre: b?.genre ?? a?.genre,
    audience: b?.audience ?? a?.audience,
    goal: b?.goal ?? a?.goal,
    tone: b?.tone ?? a?.tone,
  }
}

async function fetchProfileFromDb(): Promise<WwProfile | null> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) return null

    const { data, error } = await supabase
      .from('ww_profiles')
      .select('artist_name, genre, audience, goal, tone')
      .eq('user_id', user.id)
      .limit(1)

    if (error || !data || data.length === 0) return null
    const row = data[0] as any

    return {
      artistName: row.artist_name || undefined,
      genre: row.genre || undefined,
      audience: row.audience || undefined,
      goal: row.goal || undefined,
      tone: row.tone || undefined,
    }
  } catch {
    return null
  }
}

async function upsertProfileToDb(update: WwProfile) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return

  const payload: any = { user_id: user.id }
  if (update.artistName !== undefined) payload.artist_name = update.artistName
  if (update.genre !== undefined) payload.genre = update.genre
  if (update.audience !== undefined) payload.audience = update.audience
  if (update.goal !== undefined) payload.goal = update.goal
  if (update.tone !== undefined) payload.tone = update.tone

  if (Object.keys(payload).length <= 1) return
  await supabase.from('ww_profiles').upsert(payload, { onConflict: 'user_id' })
}

export function useWwProfile() {
  const [profile, setProfile] = useState<WwProfile>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    // local first (fast UI)
    if (typeof window !== 'undefined') {
      const local = safeParse(window.localStorage.getItem(LS_KEY))
      if (local && !cancelled) {
        setProfile({
          artistName: local.artistName,
          genre: local.genre,
          audience: local.audience,
          goal: local.goal,
          tone: local.tone,
        })
      }
    }

    ;(async () => {
      const db = await fetchProfileFromDb()
      if (cancelled) return

      const local = typeof window !== 'undefined'
        ? safeParse(window.localStorage.getItem(LS_KEY))
        : null

      const merged = mergeProfile(
        local
          ? {
              artistName: local.artistName,
              genre: local.genre,
              audience: local.audience,
              goal: local.goal,
              tone: local.tone,
            }
          : null,
        db
      )

      setProfile(merged)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LS_KEY, JSON.stringify(merged))
      }

      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const hasAnyProfile = useMemo(() => {
    return Boolean(profile.artistName || profile.genre || profile.audience || profile.goal || profile.tone)
  }, [profile])

  function applyTo(setters: {
    setArtistName?: (v: string) => void
    setGenre?: (v: string) => void
    setAudience?: (v: string) => void
    setGoal?: (v: string) => void
    setTone?: (v: string) => void
  }) {
    if (profile.artistName && setters.setArtistName) setters.setArtistName(profile.artistName)
    if (profile.genre && setters.setGenre) setters.setGenre(profile.genre)
    if (profile.audience && setters.setAudience) setters.setAudience(profile.audience)
    if (profile.goal && setters.setGoal) setters.setGoal(profile.goal)
    if (profile.tone && setters.setTone) setters.setTone(profile.tone)
  }

  async function save(update: WwProfile) {
    const merged = mergeProfile(profile, update)
    setProfile(merged)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LS_KEY, JSON.stringify(merged))
    }

    try {
      await upsertProfileToDb(update)
    } catch {
      // best-effort; local is still updated
    }
  }

  return { profile, loading, hasAnyProfile, applyTo, save, setProfile }
}
