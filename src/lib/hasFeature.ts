import { TIERS } from './tiers'
import type { Tier } from './tiers'

export function hasFeature(
  tier: Tier | undefined,
  feature: keyof typeof TIERS.free.features
) {
  if (!tier) return false
  return TIERS[tier]?.features?.[feature] === true
}
