'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { WwProfile } from '@/lib/wwProfile'
import {
  loadWwProfile,
  saveWwProfile,
  readLocalWwProfile,
  writeLocalWwProfile,
  mergeWwProfiles,
} from '@/lib/wwProfile'

type UseWwProfileResult = {
  profile: WwProfile
  hasProfile: boolean
  loading: boolean
  error: string | null
  refresh: () => Promise<WwProfile | null>
  updateProfile: (patch: Partial<WwProfile>) => Promise<WwProfile | null>
  setLocalOnly: (patch: Partial<WwProfile>) => void
  clearError: () => void
}

/**
 * Central WW profile hook:
 * - shows local cache instantly
 * - merges in DB profile when loaded
 * - updateProfile() saves to DB + local, and updates state
 */
export function useWwProfile(): UseWwProfileResult {
  const [profile, setProfile] = useState<WwProfile>(() => readLocalWwProfile() || {})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const hasProfile = useMemo(() => {
    return !!(
      profile.artistName ||
      profile.genre ||
      profile.audience ||
      profile.goal ||
      profile.tone
    )
  }, [profile])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // local already in state; loadWwProfile will merge DB + local
      const merged = await loadWwProfile()
      if (!isMounted.current) return merged

      setProfile(merged || {})
      return merged
    } catch (e: any) {
      if (!isMounted.current) return null
      setError(e?.message || 'Failed to load WW profile')
      return null
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Hydrate on mount
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setLocalOnly = useCallback((patch: Partial<WwProfile>) => {
    // useful for “draft typing” UIs (no DB writes yet)
    const next = mergeWwProfiles(profile, patch)
    setProfile(next)
    writeLocalWwProfile(next)
  }, [profile])

  const updateProfile = useCallback(async (patch: Partial<WwProfile>) => {
    setError(null)

    // optimistic UI
    const optimistic = mergeWwProfiles(profile, patch)
    setProfile(optimistic)
    writeLocalWwProfile(optimistic)

    try {
      const saved = await saveWwProfile(patch)
      if (!isMounted.current) return saved
      setProfile(saved || optimistic)
      return saved
    } catch (e: any) {
      if (!isMounted.current) return null
      // keep optimistic local state, but surface the error
      setError(e?.message || 'Failed to save WW profile')
      return null
    }
  }, [profile])

  const clearError = useCallback(() => setError(null), [])

  return {
    profile,
    hasProfile,
    loading,
    error,
    refresh,
    updateProfile,
    setLocalOnly,
    clearError,
  }
}
