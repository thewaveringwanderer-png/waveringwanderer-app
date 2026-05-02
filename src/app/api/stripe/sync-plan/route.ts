import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
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

    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token)
    const user = userData?.user

    if (userError || !user?.id || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    })

    const customer = customers.data[0]

    if (!customer) {
      return NextResponse.json({ tier: 'free', message: 'No Stripe customer found' })
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 10,
    })

    const hasActiveSubscription = subscriptions.data.length > 0

    const tier = hasActiveSubscription ? 'creator' : 'free'

    const { data, error } = await supabaseAdmin
      .from('ww_profiles')
      .update({
        tier,
        stripe_customer_id: customer.id,
      })
      .eq('user_id', user.id)
      .select('user_id, tier, stripe_customer_id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, tier: data.tier })
  } catch (err: any) {
    console.error('[stripe-sync-plan]', err)
    return NextResponse.json(
      { error: err?.message || 'Could not sync plan' },
      { status: 500 }
    )
  }
}