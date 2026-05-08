/**
 * Rate Card Duplicate API Route
 * Handles duplicating existing rate cards
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * POST /api/rate-cards/:id/duplicate
 * Duplicate an existing rate card
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

    // Fetch original rate card with items
    const { data: originalCard, error: fetchError } = await supabase
      .from('rate_cards')
      .select(`
        *,
        items:rate_card_items(*)
      `)
      .eq('id', rateCardId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !originalCard) {
      return NextResponse.json(
        { error: 'Rate card not found' },
        { status: 404 }
      );
    }

    // Check user's subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type, status')
      .eq('user_id', user.id)
      .single();

    const isPaidUser = subscription?.plan_type !== 'free' && subscription?.status === 'active';

    // Check rate card limit for free users
    if (!isPaidUser) {
      const { count } = await supabase
        .from('rate_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (count && count >= 3) {
        return NextResponse.json(
          { error: 'Free users are limited to 3 rate cards. Please upgrade to Pro.' },
          { status: 403 }
        );
      }
    }

    // Create duplicated rate card
    const { data: newCard, error: createError } = await supabase
      .from('rate_cards')
      .insert({
        user_id: user.id,
        title: `${originalCard.title} (Copy)`,
        description: originalCard.description,
        valid_until: originalCard.valid_until,
        is_public: false,
        ai_insights: originalCard.ai_insights,
        branding: originalCard.branding,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('Error duplicating rate card:', createError);
      return NextResponse.json(
        { error: 'Failed to duplicate rate card' },
        { status: 500 }
      );
    }

    // Duplicate items
    let newItems: Record<string, unknown>[] = [];
    if (originalCard.items && originalCard.items.length > 0) {
      const itemsToInsert = originalCard.items.map((item: Record<string, unknown>) => ({
        rate_card_id: newCard.id,
        service_name: item.service_name,
        description: item.description,
        min_price: item.min_price,
        max_price: item.max_price,
        unit: item.unit,
        category: item.category,
        is_popular: item.is_popular,
        is_premium: item.is_premium,
        market_comparison: item.market_comparison,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data: insertedItems, error: itemsError } = await supabase
        .from('rate_card_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) {
        console.error('Error duplicating items:', itemsError);
        // Rollback: delete the new rate card
        await supabase.from('rate_cards').delete().eq('id', newCard.id);
        return NextResponse.json(
          { error: 'Failed to duplicate rate card items' },
          { status: 500 }
        );
      }

      newItems = insertedItems || [];
    }

    return NextResponse.json(
      { rateCard: { ...newCard, items: newItems } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error duplicating rate card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
