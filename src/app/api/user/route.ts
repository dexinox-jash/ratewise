// ============================================
// RateWise - User API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

import { UpdateUserRequestSchema } from '@/lib/validations/schemas';
import { 
  GetUserResponse, 
  UpdateUserResponse, 
  DeleteUserResponse,
  UserProfile,
  UserAnalytics 
} from '@/types';

// ============================================
// Configuration
// ============================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// GET /api/user
// Get user profile
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
    
    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        avatar_url,
        tier,
        subscription_status,
        subscription_current_period_end,
        monthly_calculations_used,
        monthly_calculations_reset_at,
        settings,
        created_at
      `)
      .eq('id', userId)
      .single();
    
    if (userError) {
      if (userError.code === 'PGRST116') {
        // User not found, create new user
        return await createNewUser(userId);
      }
      
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
    
    // Get calculation limit based on tier
    const calculationsLimit = user.tier === 'pro' ? Infinity : 5;
    
    // Build user profile
    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
      tier: user.tier,
      subscriptionStatus: user.subscription_status,
      subscriptionCurrentPeriodEnd: user.subscription_current_period_end 
        ? new Date(user.subscription_current_period_end) 
        : null,
      monthlyCalculationsUsed: user.monthly_calculations_used || 0,
      monthlyCalculationsLimit: calculationsLimit,
      settings: user.settings || {
        defaultCurrency: 'USD',
        defaultPlatform: 'instagram',
        emailNotifications: true,
        calculationAlerts: true,
      },
    };
    
    // Calculate analytics
    const analytics = await calculateUserAnalytics(userId);
    
    const response: GetUserResponse = {
      user: userProfile,
      analytics,
    };
    
    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('User GET error:', error);
    
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
// PUT /api/user
// Update user profile
// ============================================

export async function PUT(request: NextRequest): Promise<NextResponse> {
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
    const validationResult = UpdateUserRequestSchema.safeParse(body);
    
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
    
    const updates = validationResult.data;
    
    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    
    if (updates.avatarUrl !== undefined) {
      updateData.avatar_url = updates.avatarUrl;
    }
    
    if (updates.settings) {
      // Fetch current settings
      const { data: currentUser } = await supabase
        .from('users')
        .select('settings')
        .eq('id', userId)
        .single();
      
      updateData.settings = {
        ...currentUser?.settings,
        ...updates.settings,
      };
    }
    
    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select(`
        id,
        email,
        name,
        avatar_url,
        tier,
        subscription_status,
        subscription_current_period_end,
        monthly_calculations_used,
        settings
      `)
      .single();
    
    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to update user',
          },
        },
        { status: 500 }
      );
    }
    
    // Get calculation limit based on tier
    const calculationsLimit = updatedUser.tier === 'pro' ? Infinity : 5;
    
    // Build user profile
    const userProfile: UserProfile = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      avatarUrl: updatedUser.avatar_url,
      tier: updatedUser.tier,
      subscriptionStatus: updatedUser.subscription_status,
      subscriptionCurrentPeriodEnd: updatedUser.subscription_current_period_end 
        ? new Date(updatedUser.subscription_current_period_end) 
        : null,
      monthlyCalculationsUsed: updatedUser.monthly_calculations_used || 0,
      monthlyCalculationsLimit: calculationsLimit,
      settings: updatedUser.settings || {
        defaultCurrency: 'USD',
        defaultPlatform: 'instagram',
        emailNotifications: true,
        calculationAlerts: true,
      },
    };
    
    const response: UpdateUserResponse = {
      user: userProfile,
    };
    
    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('User PUT error:', error);
    
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
// DELETE /api/user
// Delete user account
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
    
    // Get user's Stripe customer ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('id', userId)
      .single();
    
    if (userError && userError.code !== 'PGRST116') {
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
    
    // Cancel Stripe subscription if exists
    if (user?.stripe_subscription_id) {
      try {
        const stripe = await import('stripe').then(m => 
          new m.default(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })
        );
        await stripe.subscriptions.cancel(user.stripe_subscription_id);
      } catch (stripeError) {
        console.error('Error canceling Stripe subscription:', stripeError);
        // Continue with deletion even if Stripe cancellation fails
      }
    }
    
    // Delete user's rate cards from storage
    const { data: rateCards } = await supabase
      .from('rate_cards')
      .select('id')
      .eq('user_id', userId);
    
    if (rateCards && rateCards.length > 0) {
      for (const rc of rateCards) {
        await supabase
          .storage
          .from('ratewise-files')
          .remove([`rate-cards/${userId}/${rc.id}.pdf`]);
      }
    }
    
    // Delete user's data from database
    // Note: Order matters due to foreign key constraints
    
    // Delete calculations
    await supabase
      .from('calculations')
      .delete()
      .eq('user_id', userId);
    
    // Delete rate cards
    await supabase
      .from('rate_cards')
      .delete()
      .eq('user_id', userId);
    
    // Delete user
    await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    const response: DeleteUserResponse = {
      deleted: true,
      message: 'Your account has been permanently deleted.',
    };
    
    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('User DELETE error:', error);
    
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
// Helper Functions
// ============================================

async function createNewUser(userId: string): Promise<NextResponse> {
  try {
    // Get user info from Clerk
    const { clerkClient } = await import('@clerk/nextjs/server');
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    
    // Create user in database
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        avatar_url: clerkUser.imageUrl || null,
        tier: 'free',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        subscription_status: null,
        subscription_current_period_end: null,
        monthly_calculations_used: 0,
        monthly_calculations_reset_at: getNextResetDate().toISOString(),
        settings: {
          defaultCurrency: 'USD',
          defaultPlatform: 'instagram',
          emailNotifications: true,
          calculationAlerts: true,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to create user',
          },
        },
        { status: 500 }
      );
    }
    
    // Build user profile
    const userProfile: UserProfile = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatarUrl: newUser.avatar_url,
      tier: newUser.tier,
      subscriptionStatus: null,
      subscriptionCurrentPeriodEnd: null,
      monthlyCalculationsUsed: 0,
      monthlyCalculationsLimit: 5,
      settings: newUser.settings,
    };
    
    // Calculate analytics (will be empty for new user)
    const analytics: UserAnalytics = {
      totalCalculations: 0,
      calculationsThisMonth: 0,
      savedCalculations: 0,
      rateCardsGenerated: 0,
      favoritePlatforms: [],
      averagePriceCalculated: 0,
      topIndustries: [],
    };
    
    const response: GetUserResponse = {
      user: userProfile,
      analytics,
    };
    
    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Create new user error:', error);
    
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

async function calculateUserAnalytics(userId: string): Promise<UserAnalytics> {
  try {
    // Get total calculations
    const { count: totalCalculations, error: countError } = await supabase
      .from('calculations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (countError) {
      console.error('Error counting calculations:', countError);
    }
    
    // Get calculations this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { count: calculationsThisMonth, error: monthError } = await supabase
      .from('calculations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());
    
    if (monthError) {
      console.error('Error counting monthly calculations:', monthError);
    }
    
    // Get saved calculations count
    const { count: savedCalculations, error: savedError } = await supabase
      .from('calculations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('saved', true);
    
    if (savedError) {
      console.error('Error counting saved calculations:', savedError);
    }
    
    // Get rate cards count
    const { count: rateCardsGenerated, error: rateCardError } = await supabase
      .from('rate_cards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (rateCardError) {
      console.error('Error counting rate cards:', rateCardError);
    }
    
    // Get favorite platforms
    const { data: platformData, error: platformError } = await supabase
      .from('calculations')
      .select('input_data->platform')
      .eq('user_id', userId)
      .limit(100);
    
    const platformCounts: Record<string, number> = {};
    if (platformData && !platformError) {
      platformData.forEach((calc: any) => {
        const platform = calc.platform;
        if (platform) {
          platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        }
      });
    }
    
    const favoritePlatforms = Object.entries(platformCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([platform]) => platform as any);
    
    // Get average price
    const { data: priceData, error: priceError } = await supabase
      .from('calculations')
      .select('result_data->finalPrice')
      .eq('user_id', userId)
      .limit(100);
    
    let averagePriceCalculated = 0;
    if (priceData && !priceError && priceData.length > 0) {
      const total = priceData.reduce((sum: number, calc: any) => sum + (calc.finalPrice || 0), 0);
      averagePriceCalculated = total / priceData.length;
    }
    
    // Get top industries
    const { data: industryData, error: industryError } = await supabase
      .from('calculations')
      .select('input_data->industry')
      .eq('user_id', userId)
      .limit(100);
    
    const industryCounts: Record<string, number> = {};
    if (industryData && !industryError) {
      industryData.forEach((calc: any) => {
        const industry = calc.industry;
        if (industry) {
          industryCounts[industry] = (industryCounts[industry] || 0) + 1;
        }
      });
    }
    
    const topIndustries = Object.entries(industryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([industry]) => industry as any);
    
    return {
      totalCalculations: totalCalculations || 0,
      calculationsThisMonth: calculationsThisMonth || 0,
      savedCalculations: savedCalculations || 0,
      rateCardsGenerated: rateCardsGenerated || 0,
      favoritePlatforms,
      averagePriceCalculated,
      topIndustries,
    };
    
  } catch (error) {
    console.error('Error calculating analytics:', error);
    
    return {
      totalCalculations: 0,
      calculationsThisMonth: 0,
      savedCalculations: 0,
      rateCardsGenerated: 0,
      favoritePlatforms: [],
      averagePriceCalculated: 0,
      topIndustries: [],
    };
  }
}

function getNextResetDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}
