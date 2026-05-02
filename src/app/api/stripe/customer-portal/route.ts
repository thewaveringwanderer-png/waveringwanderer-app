import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: userData } = await supabaseAuth.auth.getUser(token)
    const uid = userData?.user?.id

    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Stripe customer ID from DB
    const { data: profile } = await supabase
      .from('ww_profiles')
      .select('stripe_customer_id')
      .eq('user_id', uid)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 400 }
      )
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[customer-portal]', err)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}