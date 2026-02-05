export type Tier = 'free' | 'creator' | 'pro'
const rank: Record<Tier, number> = { free: 0, creator: 1, pro: 2 }

export function hasTier(userTier: Tier, required: Tier) {
  return rank[userTier] >= rank[required]
}
export const TIERS = {
  free: {
    name: 'Free',
    price: 0,
    features: {
      identity: true,
      calendar: false,
      captions: false,
      pressKit: false,
      momentum: false,
      trends: false,
      pdfExport: false,
    },
  },

  creator: {
    name: 'Creator',
    price: 19,
    features: {
      identity: true,
      calendar: true,
      captions: true,
      pressKit: true,
      momentum: true,
      trends: false,
      pdfExport: true,
    },
  },

  pro: {
    name: 'Pro',
    price: 39,
    features: {
      identity: true,
      calendar: true,
      captions: true,
      pressKit: true,
      momentum: true,
      trends: true,
      pdfExport: true,
    },
  },
} as const
