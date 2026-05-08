// ============================================
// RateWise - Stripe Webhook Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { headers } from 'next/headers';

import { StripeWebhookBodySchema } from '@/lib/validations/schemas';
import { getNextResetDate } from '@/lib/utils/pricing-calculator';

// ============================================
// Configuration
// ============================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// POST /api/webhooks/stripe
// Handle Stripe webhook events
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the raw body
    const payload = await request.text();
    
    // Get Stripe signature header
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');
    
    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_SIGNATURE',
            message: 'Stripe signature is required',
          },
        },
        { status: 400 }
      );
    }
    
    // Verify webhook signature
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'Invalid webhook signature',
          },
        },
        { status: 400 }
      );
    }
    
    console.log(`Processing Stripe webhook: ${event.type}`);
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.paused':
        await handleSubscriptionPaused(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.resumed':
        await handleSubscriptionResumed(event.data.object as Stripe.Subscription);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json(
      {
        success: true,
        received: true,
        eventType: event.type,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Stripe webhook error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

// ============================================
// Event Handlers
// ============================================

/**
 * Handle checkout.session.completed
 * User has completed checkout and subscribed
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log('Handling checkout.session.completed');
  
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;
  
  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }
  
  // Get subscription details
  const subscriptionId = session.subscription as string;
  
  if (!subscriptionId) {
    console.error('No subscription ID in session');
    return;
  }
  
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Update user to Pro
  const { error } = await supabase
    .from('users')
    .update({
      tier: 'pro',
      stripe_subscription_id: subscriptionId,
      subscription_status: subscription.status,
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating user after checkout:', error);
    throw error;
  }
  
  console.log(`User ${userId} upgraded to Pro`);
  
  // Send welcome email (optional)
  await sendProWelcomeEmail(userId);
}

/**
 * Handle invoice.payment_succeeded
 * Recurring payment succeeded
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  console.log('Handling invoice.payment_succeeded');
  
  const subscriptionId = invoice.subscription as string;
  
  if (!subscriptionId) {
    console.log('No subscription ID in invoice');
    return;
  }
  
  // Find user by subscription ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();
  
  if (userError || !user) {
    console.error('User not found for subscription:', subscriptionId);
    return;
  }
  
  // Update subscription status
  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: 'active',
      subscription_current_period_end: invoice.lines.data[0]?.period?.end 
        ? new Date(invoice.lines.data[0].period.end * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);
  
  if (error) {
    console.error('Error updating user after payment:', error);
    throw error;
  }
  
  console.log(`Payment succeeded for user ${user.id}`);
}

/**
 * Handle invoice.payment_failed
 * Recurring payment failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  console.log('Handling invoice.payment_failed');
  
  const subscriptionId = invoice.subscription as string;
  
  if (!subscriptionId) {
    console.log('No subscription ID in invoice');
    return;
  }
  
  // Find user by subscription ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('stripe_subscription_id', subscriptionId)
    .single();
  
  if (userError || !user) {
    console.error('User not found for subscription:', subscriptionId);
    return;
  }
  
  // Update subscription status
  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);
  
  if (error) {
    console.error('Error updating user after failed payment:', error);
    throw error;
  }
  
  console.log(`Payment failed for user ${user.id}`);
  
  // Send payment failure notification
  await sendPaymentFailedEmail(user.id, user.email);
}

/**
 * Handle customer.subscription.created
 * New subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  console.log('Handling customer.subscription.created');
  
  const customerId = subscription.customer as string;
  
  // Find user by customer ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  
  if (userError || !user) {
    console.error('User not found for customer:', customerId);
    return;
  }
  
  // Update subscription info
  const { error } = await supabase
    .from('users')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);
  
  if (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
  
  console.log(`Subscription created for user ${user.id}`);
}

/**
 * Handle customer.subscription.updated
 * Subscription updated (e.g., plan change, cancel_at_period_end)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  console.log('Handling customer.subscription.updated');
  
  const customerId = subscription.customer as string;
  
  // Find user by customer ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  
  if (userError || !user) {
    console.error('User not found for customer:', customerId);
    return;
  }
  
  // Update subscription info
  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: subscription.status,
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);
  
  if (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
  
  console.log(`Subscription updated for user ${user.id}`);
  
  // If cancel_at_period_end changed to true, send notification
  if (subscription.cancel_at_period_end) {
    await sendCancellationScheduledEmail(user.id);
  }
}

/**
 * Handle customer.subscription.deleted
 * Subscription deleted (canceled or expired)
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log('Handling customer.subscription.deleted');
  
  const customerId = subscription.customer as string;
  
  // Find user by customer ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single();
  
  if (userError || !user) {
    console.error('User not found for customer:', customerId);
    return;
  }
  
  // Downgrade user to free
  const { error } = await supabase
    .from('users')
    .update({
      tier: 'free',
      stripe_subscription_id: null,
      subscription_status: null,
      subscription_current_period_end: null,
      cancel_at_period_end: false,
      monthly_calculations_used: 0,
      monthly_calculations_reset_at: getNextResetDate().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);
  
  if (error) {
    console.error('Error downgrading user:', error);
    throw error;
  }
  
  console.log(`User ${user.id} downgraded to free`);
  
  // Send downgrade notification
  await sendDowngradeEmail(user.id, user.email);
}

/**
 * Handle customer.subscription.paused
 * Subscription paused
 */
async function handleSubscriptionPaused(subscription: Stripe.Subscription): Promise<void> {
  console.log('Handling customer.subscription.paused');
  
  const customerId = subscription.customer as string;
  
  // Find user by customer ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  
  if (userError || !user) {
    console.error('User not found for customer:', customerId);
    return;
  }
  
  // Update subscription status
  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: 'paused',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);
  
  if (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
  
  console.log(`Subscription paused for user ${user.id}`);
}

/**
 * Handle customer.subscription.resumed
 * Subscription resumed
 */
async function handleSubscriptionResumed(subscription: Stripe.Subscription): Promise<void> {
  console.log('Handling customer.subscription.resumed');
  
  const customerId = subscription.customer as string;
  
  // Find user by customer ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  
  if (userError || !user) {
    console.error('User not found for customer:', customerId);
    return;
  }
  
  // Update subscription status
  const { error } = await supabase
    .from('users')
    .update({
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);
  
  if (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
  
  console.log(`Subscription resumed for user ${user.id}`);
}

// ============================================
// Email Functions (Placeholders)
// ============================================

async function sendProWelcomeEmail(userId: string): Promise<void> {
  // TODO: Implement email sending
  console.log(`Sending Pro welcome email to user ${userId}`);
}

async function sendPaymentFailedEmail(userId: string, email: string): Promise<void> {
  // TODO: Implement email sending
  console.log(`Sending payment failed email to ${email}`);
}

async function sendCancellationScheduledEmail(userId: string): Promise<void> {
  // TODO: Implement email sending
  console.log(`Sending cancellation scheduled email to user ${userId}`);
}

async function sendDowngradeEmail(userId: string, email: string): Promise<void> {
  // TODO: Implement email sending
  console.log(`Sending downgrade email to ${email}`);
}

// ============================================
// GET /api/webhooks/stripe
// Health check endpoint
// ============================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: true,
      message: 'Stripe webhook endpoint is active',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
