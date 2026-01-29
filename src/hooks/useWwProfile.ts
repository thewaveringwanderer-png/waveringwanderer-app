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
      (profile as any).genre ||
      (profile as any).audience ||
      (profile as any).goal ||
      profile.tone
    )
  }, [profile])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const merged = await loadWwProfile()
      if (!isMounted.current) return merged
      setProfile(merged || {})
      return merged
    } catch (e: unknown) {
      if (!isMounted.current) return null
      const msg = e instanceof Error ? e.message : 'Failed to load WW profile'
      setError(msg)
      return null
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setLocalOnly = useCallback(
    (patch: Partial<WwProfile>) => {
      const next = mergeWwProfiles(profile, patch)
      setProfile(next)
      writeLocalWwProfile(next)
    },
    [profile]
  )

  const updateProfile = useCallback(
    async (patch: Partial<WwProfile>) => {
      setError(null)

      const optimistic = mergeWwProfiles(profile, patch)
      setProfile(optimistic)
      writeLocalWwProfile(optimistic)

      try {
        const saved = await saveWwProfile(patch)
        if (!isMounted.current) return saved
        setProfile(saved || optimistic)
        return saved
      } catch (e: unknown) {
        if (!isMounted.current) return null
        const msg = e instanceof Error ? e.message : 'Failed to save WW profile'
        setError(msg)
        return null
      }
    },
    [profile]
  )

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
