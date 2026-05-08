import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

// Create a checkout session for subscription
export async function createCheckoutSession({
  priceId,
  userId,
  customerId,
  returnUrl,
}: {
  priceId: string
  userId: string
  customerId?: string
  returnUrl?: string
}) {
  const supabase = createClient()
  
  // Get user details
  const { data: userData } = await supabase
    .from('users')
    .select('email, full_name')
    .eq('id', userId)
    .single()

  if (!userData) {
    throw new Error('User not found')
  }

  // Create or retrieve customer
  let customer = customerId
  if (!customer) {
    const stripeCustomer = await stripe.customers.create({
      email: userData.email!,
      name: userData.full_name || undefined,
      metadata: {
        userId,
      },
    })
    customer = stripeCustomer.id

    // Save customer ID to user record
    await supabase
      .from('users')
      .update({
        billing_address: { stripe_customer_id: customer },
      })
      .eq('id', userId)
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${returnUrl || process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnUrl || process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    subscription_data: {
      metadata: {
        userId,
      },
    },
    metadata: {
      userId,
    },
  })

  return session
}

// Create a customer portal session
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl?: string
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
  })

  return session
}

// Handle Stripe webhook events
export async function handleStripeWebhook(event: Stripe.Event) {
  const supabase = createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      
      if (session.mode === 'subscription') {
        const subscriptionId = session.subscription as string
        const userId = session.metadata?.userId

        if (!userId) {
          console.error('No userId in session metadata')
          return
        }

        // Get subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ['default_payment_method'],
        })

        // Upsert subscription in database
        await supabase.from('subscriptions').upsert({
          id: subscriptionId,
          user_id: userId,
          status: subscription.status,
          metadata: subscription.metadata,
          price_id: subscription.items.data[0].price.id,
          quantity: subscription.items.data[0].quantity,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          ended_at: subscription.ended_at 
            ? new Date(subscription.ended_at * 1000).toISOString() 
            : null,
          cancel_at: subscription.cancel_at 
            ? new Date(subscription.cancel_at * 1000).toISOString() 
            : null,
          canceled_at: subscription.canceled_at 
            ? new Date(subscription.canceled_at * 1000).toISOString() 
            : null,
          trial_start: subscription.trial_start 
            ? new Date(subscription.trial_start * 1000).toISOString() 
            : null,
          trial_end: subscription.trial_end 
            ? new Date(subscription.trial_end * 1000).toISOString() 
            : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        // Update user's payment method if available
        if (subscription.default_payment_method) {
          const paymentMethod = subscription.default_payment_method as Stripe.PaymentMethod
          await supabase
            .from('users')
            .update({
              payment_method: {
                id: paymentMethod.id,
                brand: paymentMethod.card?.brand,
                last4: paymentMethod.card?.last4,
                exp_month: paymentMethod.card?.exp_month,
                exp_year: paymentMethod.card?.exp_year,
              },
            })
            .eq('id', userId)
        }
      }
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      
      if (invoice.subscription) {
        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', invoice.subscription as string)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      
      if (invoice.subscription) {
        // Update subscription status to past_due
        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('id', invoice.subscription as string)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      
      // Update subscription in database
      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          metadata: subscription.metadata,
          price_id: subscription.items.data[0].price.id,
          quantity: subscription.items.data[0].quantity,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          ended_at: subscription.ended_at 
            ? new Date(subscription.ended_at * 1000).toISOString() 
            : null,
          cancel_at: subscription.cancel_at 
            ? new Date(subscription.cancel_at * 1000).toISOString() 
            : null,
          canceled_at: subscription.canceled_at 
            ? new Date(subscription.canceled_at * 1000).toISOString() 
            : null,
          trial_start: subscription.trial_start 
            ? new Date(subscription.trial_start * 1000).toISOString() 
            : null,
          trial_end: subscription.trial_end 
            ? new Date(subscription.trial_end * 1000).toISOString() 
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      
      // Mark subscription as canceled
      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
}

// Get or create customer
export async function getOrCreateCustomer(userId: string, email: string) {
  const supabase = createClient()

  // Check if user already has a Stripe customer ID
  const { data: userData } = await supabase
    .from('users')
    .select('billing_address')
    .eq('id', userId)
    .single()

  const existingCustomerId = userData?.billing_address?.stripe_customer_id

  if (existingCustomerId) {
    try {
      // Verify the customer still exists in Stripe
      const customer = await stripe.customers.retrieve(existingCustomerId)
      if (!customer.deleted) {
        return existingCustomerId
      }
    } catch (error) {
      console.log('Existing customer not found, creating new one')
    }
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  })

  // Save customer ID
  await supabase
    .from('users')
    .update({
      billing_address: {
        ...userData?.billing_address,
        stripe_customer_id: customer.id,
      },
    })
    .eq('id', userId)

  return customer.id
}
