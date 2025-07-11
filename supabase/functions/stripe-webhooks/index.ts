import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    if (!signature) {
      return new Response('No signature', { status: 400 })
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      return new Response('No webhook secret', { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Invalid signature', { status: 400 })
    }

    console.log('Processing webhook event:', event.type)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        // Get the price to determine the plan
        const priceId = subscription.items.data[0]?.price.id
        let plan = 'free'
        
        if (priceId === Deno.env.get('STRIPE_PRO_PRICE_ID')) {
          plan = 'pro'
        } else if (priceId === Deno.env.get('STRIPE_BUSINESS_PRICE_ID')) {
          plan = 'business'
        }

        // Update or create stripe customer record
        const { error: stripeError } = await supabase
          .from('stripe_customers')
          .upsert({
            stripe_customer_id: customerId,
            subscription_id: subscription.id,
            subscription_status: subscription.status,
            subscription_plan: plan,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (stripeError) {
          console.error('Error updating stripe_customers:', stripeError)
        }

        // Update user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_plan: plan,
            subscription_status: subscription.status,
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId)

        if (profileError) {
          console.error('Error updating profile:', profileError)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Downgrade to free plan
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_plan: 'free',
            subscription_status: 'inactive',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId)

        if (profileError) {
          console.error('Error updating profile:', profileError)
        }

        // Update stripe customer record
        const { error: stripeError } = await supabase
          .from('stripe_customers')
          .update({
            subscription_status: 'canceled',
            subscription_plan: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId)

        if (stripeError) {
          console.error('Error updating stripe_customers:', stripeError)
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Update payment status if this is for an invoice payment
        if (invoice.metadata?.invoice_id) {
          const { error } = await supabase
            .from('invoices')
            .update({
              status: 'paid',
              paid_date: new Date().toISOString(),
              payment_method: 'stripe',
            })
            .eq('id', invoice.metadata.invoice_id)

          if (error) {
            console.error('Error updating invoice payment status:', error)
          }
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Handle failed payment - could send notification or update status
        console.log('Payment failed for customer:', customerId)
        
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})