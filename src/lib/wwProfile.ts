import { createClient } from '@supabase/supabase-js'

export type WwProfile = {
  artistName?: string
  tone?: string
  genre?: string
  audience?: string
  goal?: string
  [key: string]: unknown
}

const STORAGE_KEY = 'ww_profile'

// ---------- Local helpers ----------

export function readLocalWwProfile(): WwProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeLocalWwProfile(profile: WwProfile) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch {}
}

export function mergeWwProfiles(base: WwProfile, patch: Partial<WwProfile>): WwProfile {
  return {
    ...base,
    ...patch,
  }
}

// ---------- Supabase ----------

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function loadWwProfile(): Promise<WwProfile | null> {
  const supabase = getSupabase()

  const local = readLocalWwProfile() || {}

  const { data, error } = await supabase
    .from('ww_profiles')
    .select('*')
    .single()

  if (error || !data) return local

  const merged = mergeWwProfiles(local, data.profile || {})
  writeLocalWwProfile(merged)

  return merged
}

export async function saveWwProfile(patch: Partial<WwProfile>): Promise<WwProfile | null> {
  const supabase = getSupabase()

  const current = readLocalWwProfile() || {}
  const next = mergeWwProfiles(current, patch)

  const { data, error } = await supabase
    .from('ww_profiles')
    .upsert({ profile: next })
    .select()
    .single()

  if (error) return next

  writeLocalWwProfile(data.profile || next)
  return data.profile || next
}
