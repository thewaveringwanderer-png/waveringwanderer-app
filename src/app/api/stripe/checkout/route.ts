import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function getUserWithRetry(supabaseAuth: any, token: string) {
  for (let i = 0; i < 3; i++) {
    const { data, error } = await supabaseAuth.auth.getUser(token)

    if (data?.user && !error) {
      return { data, error: null }
    }

    await new Promise(resolve => setTimeout(resolve, 700))
  }

  return await supabaseAuth.auth.getUser(token)
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: userData, error: userError } = await getUserWithRetry(supabaseAuth, token)
    const uid = userData?.user?.id
    const email = userData?.user?.email

    if (userError || !uid || !email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
const tier = body?.tier as 'idea_factory' | 'creator'

const allowedTiers = ['idea_factory', 'creator'] as const

if (!allowedTiers.includes(tier)) {
  return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
}

const priceMap: Record<(typeof allowedTiers)[number], string | undefined> = {
  idea_factory: process.env.STRIPE_IDEA_FACTORY_PRICE_ID,
  creator: process.env.STRIPE_CREATOR_PRICE_ID,
}

const priceId = priceMap[tier]

    if (!priceId) {
      return NextResponse.json({ error: 'Missing price ID' }, { status: 500 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
     success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      metadata: {
        userId: uid,
        tier,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[stripe-checkout]', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}