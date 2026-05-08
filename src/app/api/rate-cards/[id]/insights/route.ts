/**
 * Rate Card AI Insights API Route
 * Handles AI-powered insights generation for rate cards
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { generateRateCardInsights } from '@/lib/openai/client';

/**
 * POST /api/rate-cards/:id/insights
 * Generate AI insights for a rate card
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateCardId = params.id;

    // Fetch rate card with items
    const { data: rateCard, error: fetchError } = await supabase
      .from('rate_cards')
      .select(`
        *,
        items:rate_card_items(*)
      `)
      .eq('id', rateCardId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !rateCard) {
      return NextResponse.json(
        { error: 'Rate card not found' },
        { status: 404 }
      );
    }

    if (!rateCard.items || rateCard.items.length === 0) {
      return NextResponse.json(
        { error: 'Rate card has no items' },
        { status: 400 }
      );
    }

    // Check if user has AI insights available
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type, status')
      .eq('user_id', user.id)
      .single();

    const canUseAI = subscription?.plan_type === 'pro' || 
                     subscription?.plan_type === 'enterprise' ||
                     (subscription?.plan_type === 'free' && false); // Free users don't get AI

    if (!canUseAI) {
      return NextResponse.json(
        { error: 'AI insights require a Pro or Enterprise plan' },
        { status: 403 }
      );
    }

    // Generate insights
    const category = rateCard.items[0]?.category || 'Services';
    const insights = await generateRateCardInsights(
      rateCard.items.map((item: Record<string, unknown>) => ({
        id: item.id as string,
        rateCardId: item.rate_card_id as string,
        serviceName: item.service_name as string,
        description: item.description as string | null,
        minPrice: item.min_price as number,
        maxPrice: item.max_price as number,
        unit: item.unit as string | null,
        category: item.category as string | null,
        isPopular: item.is_popular as boolean,
        isPremium: item.is_premium as boolean,
        marketComparison: item.market_comparison as string | null,
        createdAt: item.created_at as string,
        updatedAt: item.updated_at as string,
      })),
      category
    );

    // Update rate card with insights
    const { error: updateError } = await supabase
      .from('rate_cards')
      .update({ 
        ai_insights: insights, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', rateCardId);

    if (updateError) {
      console.error('Error saving insights:', updateError);
      // Still return insights even if saving fails
    }

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/rate-cards/:id/insights
 * Get existing AI insights for a rate card
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateCardId = params.id;

    // Fetch rate card
    const { data: rateCard, error: fetchError } = await supabase
      .from('rate_cards')
      .select('id, user_id, ai_insights')
      .eq('id', rateCardId)
      .single();

    if (fetchError || !rateCard) {
      return NextResponse.json(
        { error: 'Rate card not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (rateCard.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    if (!rateCard.ai_insights) {
      return NextResponse.json(
        { error: 'No insights available. Generate insights first.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ insights: rateCard.ai_insights });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
