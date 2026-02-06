import { createClient } from '@supabase/supabase-js'
import { PILOT_EMAILS } from '@/lib/pilotAllowlist'

export type Tier = 'free' | 'creator' | 'pro'

export type Usage = {
  identity_generate_uses?: number
  captions_generate_uses?: number
  calendar_generate_uses?: number
}

export type WwProfile = {
  artistName?: string
  tone?: string
is_pilot?: boolean

  // billing
  tier?: Tier
  tier_override?: Tier | null

  // core fields
  genre?: string
  audience?: string
  goal?: string

  // usage limits
  usage?: Usage

  // misc
  [key: string]: unknown
}

const STORAGE_KEY = 'ww_profile'

// ---------- Tier helpers ----------

const TIER_ORDER: Tier[] = ['free', 'creator', 'pro']

export function effectiveTier(profile?: WwProfile) {
  const override = profile?.tier_override as Tier | null | undefined
  if (override) return override
  return (profile?.tier as Tier) || 'free'
}



export function hasTier(current: Tier, required: Tier): boolean {
  return TIER_ORDER.indexOf(current) >= TIER_ORDER.indexOf(required)
}

// ---------- Local helpers ----------

export function readLocalWwProfile(): WwProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as WwProfile) : null
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
  return { ...base, ...patch }
}

export function getUsage(profile?: WwProfile | null): Usage {
  const u = profile?.usage
  return u && typeof u === 'object' ? (u as Usage) : {}
}

// ---------- Supabase ----------

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return createClient(url, anon)
}

export async function loadWwProfile(): Promise<WwProfile | null> {
  const supabase = getSupabase()
  const local = readLocalWwProfile() || {}

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  // Not logged in yet → just return local
  if (userErr || !user) {
    writeLocalWwProfile(local)
    return local
  }

  // ✅ Fetch THIS user's row only
  const { data, error } = await supabase
    .from('ww_profiles')
    .select('profile')
    .eq('user_id', user.id)
    .maybeSingle()

  const dbProfile = !error && data ? ((data as any).profile || {}) : {}
  let merged = mergeWwProfiles(local, dbProfile)

  // ✅ Pilot allowlist => force Pro override locally
  const email = (user.email || '').trim().toLowerCase()
  const allow = PILOT_EMAILS.map(e => e.trim().toLowerCase())

  if (email && allow.includes(email)) {
    merged = mergeWwProfiles(merged, { tier_override: 'pro' })
  }

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

  // if DB fails, still keep local optimistic state
  if (error) {
    writeLocalWwProfile(next)
    return next
  }

  const finalProfile = ((data as any).profile || next) as WwProfile
  writeLocalWwProfile(finalProfile)
  return finalProfile
}

export async function bumpUsage(key: keyof Usage): Promise<WwProfile | null> {
  const current = readLocalWwProfile() || {}
  const usage = getUsage(current)
  const nextUsage: Usage = {
    ...usage,
    [key]: (usage[key] || 0) + 1,
  }

  return await saveWwProfile({
    ...current,
    usage: nextUsage,
  })
}
