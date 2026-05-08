// ============================================
// RateWise - Subscription API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

import { 
  CreateCheckoutRequestSchema,
  CancelSubscriptionRequestSchema,
  UpdateSubscriptionRequestSchema,
  GetInvoicesQuerySchema 
} from '@/lib/validations/schemas';
import { 
  GetSubscriptionResponse,
  CreateCheckoutResponse,
  CancelSubscriptionResponse,
  UpdateSubscriptionResponse,
  GetInvoicesResponse,
  SubscriptionPlan,
  SubscriptionStatus,
  Invoice 
} from '@/types';

// ============================================
// Configuration
// ============================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Subscription plans configuration
const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    priceMonthly: 0,
    priceYearly: 0,
    description: 'Perfect for getting started',
    features: [
      '5 calculations per month',
      '1 rate card',
      'Basic pricing algorithm',
      'Email support',
    ],
    limits: {
      calculationsPerMonth: 5,
      rateCards: 1,
      aiExplanations: false,
      exportFormats: ['pdf'],
      apiAccess: false,
      prioritySupport: false,
      customBranding: false,
    },
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    tier: 'pro',
    priceMonthly: 29,
    priceYearly: 290,
    description: 'For serious creators and agencies',
    features: [
      'Unlimited calculations',
      '10 rate cards',
      'AI-powered explanations',
      'All export formats (PDF, CSV, JSON)',
      'API access',
      'Priority support',
      'Custom branding',
    ],
    limits: {
      calculationsPerMonth: Infinity,
      rateCards: 10,
      aiExplanations: true,
      exportFormats: ['pdf', 'csv', 'json'],
      apiAccess: true,
      prioritySupport: true,
      customBranding: true,
    },
    stripePriceIdMonthly: process.env.STRIPE_PRO_PRICE_MONTHLY || '',
    stripePriceIdYearly: process.env.STRIPE_PRO_PRICE_YEARLY || '',
  },
];

// ============================================
// GET /api/subscription
// Get subscription status
// ============================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }
    
    // Fetch user subscription data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        tier,
        subscription_status,
        subscription_current_period_end,
        cancel_at_period_end,
        stripe_subscription_id,
        monthly_calculations_used
      `)
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch subscription data',
          },
        },
        { status: 500 }
      );
    }
    
    // Build subscription status
    const currentPlan = SUBSCRIPTION_PLANS.find(p => p.tier === user.tier) || SUBSCRIPTION_PLANS[0];
    
    const subscriptionStatus: SubscriptionStatus = {
      tier: user.tier as 'free' | 'pro',
      status: user.subscription_status,
      currentPeriodEnd: user.subscription_current_period_end 
        ? new Date(user.subscription_current_period_end) 
        : null,
      cancelAtPeriodEnd: user.cancel_at_period_end || false,
      calculationsUsed: user.monthly_calculations_used || 0,
      calculationsLimit: currentPlan.limits.calculationsPerMonth,
      plan: currentPlan,
    };
    
    const response: GetSubscriptionResponse = {
      subscription: subscriptionStatus,
      plans: SUBSCRIPTION_PLANS,
    };
    
    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Subscription GET error:', error);
    
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
// POST /api/subscription
// Create checkout session
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = CreateCheckoutRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }
    
    const { planId, billingCycle, successUrl, cancelUrl } = validationResult.data;
    
    // Validate plan
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    
    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PLAN',
            message: 'Invalid subscription plan',
          },
        },
        { status: 400 }
      );
    }
    
    if (plan.tier === 'free') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PLAN',
            message: 'Cannot create checkout for free plan',
          },
        },
        { status: 400 }
      );
    }
    
    // Get or create Stripe customer
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, stripe_customer_id')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch user data',
          },
        },
        { status: 500 }
      );
    }
    
    let customerId = user.stripe_customer_id;
    
    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId,
        },
      });
      
      customerId = customer.id;
      
      // Save customer ID to database
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }
    
    // Get Stripe price ID
    const priceId = billingCycle === 'yearly' 
      ? plan.stripePriceIdYearly 
      : plan.stripePriceIdMonthly;
    
    if (!priceId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'Stripe price ID not configured',
          },
        },
        { status: 500 }
      );
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          userId,
          planId,
          billingCycle,
        },
      },
      metadata: {
        userId,
        planId,
        billingCycle,
      },
    });
    
    const response: CreateCheckoutResponse = {
      sessionId: session.id,
      checkoutUrl: session.url!,
    };
    
    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Subscription POST error:', error);
    
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
// DELETE /api/subscription
// Cancel subscription
// ============================================

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { immediate } = body;
    
    // Fetch user subscription data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_subscription_id, tier')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch subscription data',
          },
        },
        { status: 500 }
      );
    }
    
    if (!user.stripe_subscription_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_SUBSCRIPTION',
            message: 'No active subscription found',
          },
        },
        { status: 400 }
      );
    }
    
    let effectiveDate: Date;
    
    if (immediate) {
      // Cancel immediately
      await stripe.subscriptions.cancel(user.stripe_subscription_id);
      effectiveDate = new Date();
      
      // Update user immediately
      await supabase
        .from('users')
        .update({
          tier: 'free',
          subscription_status: 'canceled',
          stripe_subscription_id: null,
        })
        .eq('id', userId);
    } else {
      // Cancel at period end
      await stripe.subscriptions.update(user.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
      
      // Get subscription details for effective date
      const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
      effectiveDate = new Date(subscription.current_period_end * 1000);
      
      // Update user
      await supabase
        .from('users')
        .update({
          cancel_at_period_end: true,
        })
        .eq('id', userId);
    }
    
    const response: CancelSubscriptionResponse = {
      canceled: true,
      effectiveDate: effectiveDate.toISOString(),
      message: immediate 
        ? 'Your subscription has been canceled immediately.'
        : 'Your subscription will be canceled at the end of the current billing period.',
    };
    
    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Subscription DELETE error:', error);
    
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
// PATCH /api/subscription
// Update subscription (change plan)
// ============================================

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = UpdateSubscriptionRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }
    
    const { planId, billingCycle } = validationResult.data;
    
    // Validate plan
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    
    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PLAN',
            message: 'Invalid subscription plan',
          },
        },
        { status: 400 }
      );
    }
    
    // Fetch user subscription data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_subscription_id, tier')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch subscription data',
          },
        },
        { status: 500 }
      );
    }
    
    if (!user.stripe_subscription_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_SUBSCRIPTION',
            message: 'No active subscription to update',
          },
        },
        { status: 400 }
      );
    }
    
    // Get new price ID
    const newPriceId = billingCycle === 'yearly' 
      ? plan.stripePriceIdYearly 
      : plan.stripePriceIdMonthly;
    
    if (!newPriceId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'Stripe price ID not configured',
          },
        },
        { status: 500 }
      );
    }
    
    // Update subscription
    const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
    
    await stripe.subscriptions.update(user.stripe_subscription_id, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
    
    // Update user tier
    await supabase
      .from('users')
      .update({
        tier: plan.tier,
      })
      .eq('id', userId);
    
    // Fetch updated subscription status
    const { data: updatedUser } = await supabase
      .from('users')
      .select(`
        tier,
        subscription_status,
        subscription_current_period_end,
        cancel_at_period_end,
        stripe_subscription_id,
        monthly_calculations_used
      `)
      .eq('id', userId)
      .single();
    
    const subscriptionStatus: SubscriptionStatus = {
      tier: updatedUser?.tier as 'free' | 'pro',
      status: updatedUser?.subscription_status,
      currentPeriodEnd: updatedUser?.subscription_current_period_end 
        ? new Date(updatedUser.subscription_current_period_end) 
        : null,
      cancelAtPeriodEnd: updatedUser?.cancel_at_period_end || false,
      calculationsUsed: updatedUser?.monthly_calculations_used || 0,
      calculationsLimit: plan.limits.calculationsPerMonth,
      plan,
    };
    
    const response: UpdateSubscriptionResponse = {
      updated: true,
      subscription: subscriptionStatus,
    };
    
    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Subscription PATCH error:', error);
    
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
// GET /api/subscription/invoices
// Get invoice history
// ============================================

export async function GET_INVOICES(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
    };
    
    // Validate query parameters
    const validationResult = GetInvoicesQuerySchema.safeParse(queryParams);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }
    
    const { page, limit } = validationResult.data;
    
    // Fetch user Stripe customer ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch user data',
          },
        },
        { status: 500 }
      );
    }
    
    if (!user.stripe_customer_id) {
      return NextResponse.json(
        {
          success: true,
          data: {
            data: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
              hasMore: false,
            },
          },
        },
        { status: 200 }
      );
    }
    
    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: user.stripe_customer_id,
      limit,
      starting_after: page > 1 ? ((page - 1) * limit).toString() : undefined,
    });
    
    // Transform to API format
    const transformedInvoices: Invoice[] = invoices.data.map((invoice) => ({
      id: invoice.id,
      amount: invoice.amount_due / 100, // Convert from cents
      currency: invoice.currency.toUpperCase() as any,
      status: invoice.status as any,
      createdAt: new Date(invoice.created * 1000).toISOString(),
      paidAt: invoice.status_transitions?.paid_at 
        ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() 
        : null,
      pdfUrl: invoice.invoice_pdf,
      description: invoice.description || 'Subscription',
    }));
    
    const response: GetInvoicesResponse = {
      data: transformedInvoices,
      pagination: {
        page,
        limit,
        total: invoices.data.length,
        totalPages: Math.ceil(invoices.data.length / limit),
        hasMore: invoices.has_more,
      },
    };
    
    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Invoices GET error:', error);
    
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
