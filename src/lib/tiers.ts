export type Tier = 'free' | 'idea_factory' | 'creator' | 'pro'

const rank: Record<Tier, number> = {
  free: 0,
  idea_factory: 1,
  creator: 2,
  pro: 3,
}

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

  idea_factory: {
  name: 'Idea Factory',
  price: 7,
  features: {
    identity: false,
    calendar: true,
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
