import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!

  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
  const session = event.data.object as Stripe.Checkout.Session

  

  const userId = session.metadata?.userId
  const tier = session.metadata?.tier
  const customerId = session.customer as string | null

  if (userId && customerId) {
    const { data, error } = await supabase
      .from('ww_profiles')
      .update({
        tier: tier || 'creator', // fallback just in case
        stripe_customer_id: customerId,
      })
      .eq('user_id', userId)
      .select('user_id, tier, stripe_customer_id')

  
  }
}

  return NextResponse.json({ received: true })
}