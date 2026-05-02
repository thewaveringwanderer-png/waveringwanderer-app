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
email?: string | null


  // billing
  tier?: Tier
  tier_override?: Tier | null

  // core fields
  genre?: string
  audience?: string
  goal?: string
   direction?: string

  // usage limits
  usage?: Usage

  // misc
  [key: string]: unknown
}

const STORAGE_KEY = 'ww_profile'

// ---------- Tier helpers ----------

const TIER_ORDER: Tier[] = ['free', 'creator', 'pro']

export function effectiveTier(profile?: WwProfile): Tier {
  const override = profile?.tier_override as Tier | null | undefined
  if (override) return override

  const email = String(profile?.email || '')
    .trim()
    .toLowerCase()

  const allowList = String(process.env.NEXT_PUBLIC_PILOT_PRO_USERS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  // Pilot Pro override disabled for launch testing.
// Re-enable only when you are sure the allow list is correct.
// if (email && allowList.includes(email)) {
//   return 'pro'
// }

  return (profile?.tier as Tier) || 'free'
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
  .select('user_id, tier, usage, onboarding_started, identity_completed')
  .eq('user_id', user.id)
  .maybeSingle()

const row = data as any

const dbProfile = !error && row
  ? {
      tier: row.tier || 'free',
      usage: row.usage || {},
      onboarding_started: !!row.onboarding_started,
      identity_completed: !!row.identity_completed,
      email: user.email || '',
    }
  : {}

let merged = mergeWwProfiles(local, dbProfile)

// Pilot Pro override disabled for launch testing.
// Re-enable only when you are sure the allow list is correct.
// const email = (user.email || '').trim().toLowerCase()
// const allow = PILOT_EMAILS.map(e => e.trim().toLowerCase())

// if (email && allow.includes(email)) {
//   merged = mergeWwProfiles(merged, { tier_override: 'pro' })
// }

  const email = (user.email || '').trim().toLowerCase()
  const allow = PILOT_EMAILS.map(e => e.trim().toLowerCase())

  

  writeLocalWwProfile(merged)
  return merged
}




export async function saveWwProfile(patch: Partial<WwProfile>): Promise<WwProfile | null> {
  const supabase = getSupabase()

  const current = readLocalWwProfile() || {}
  const next = mergeWwProfiles(current, patch)

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  // Not logged in → local only
  if (userErr || !user) {
    writeLocalWwProfile(next)
    return next
  }

  const { data, error } = await supabase
  .from('ww_profiles')
  .upsert(
  {
  user_id: user.id,
  usage: next.usage || current.usage || {},
  onboarding_started: next.onboarding_started ?? current.onboarding_started ?? false,
  identity_completed: next.identity_completed ?? current.identity_completed ?? false,
},
  { onConflict: 'user_id' }
)
  .select('user_id, tier, usage')
  .single()

if (error) {
  writeLocalWwProfile(next)
  return next
}

const finalProfile = {
  ...next,
  tier: (data as any)?.tier || next.tier || 'free',
  usage: (data as any)?.usage || next.usage || {},
}

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

