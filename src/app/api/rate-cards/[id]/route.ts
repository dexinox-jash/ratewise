/**
 * Individual Rate Card API Routes
 * Handles GET, PUT, DELETE for specific rate cards
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Validation schema for rate card items
const rateCardItemSchema = z.object({
  serviceName: z.string().min(1),
  description: z.string().optional(),
  minPrice: z.number().positive(),
  maxPrice: z.number().positive(),
  unit: z.string().optional(),
  category: z.string().optional(),
  isPopular: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  marketComparison: z.enum(['above_market', 'below_market', 'at_market']).optional(),
});

// Validation schema for rate card updates
const updateRateCardSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  validUntil: z.string().datetime().optional().nullable(),
  isPublic: z.boolean().optional(),
  items: z.array(rateCardItemSchema).optional(),
  branding: z.object({
    companyName: z.string().optional(),
    tagline: z.string().optional(),
    logoUrl: z.string().optional(),
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    accentColor: z.string().optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().optional(),
    website: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
});

/**
 * GET /api/rate-cards/:id
 * Get a specific rate card with its items
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

    // Fetch rate card with items
    const { data: rateCard, error } = await supabase
      .from('rate_cards')
      .select(`
        *,
        items:rate_card_items(*)
      `)
      .eq('id', rateCardId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Rate card not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Check ownership or public access
    if (rateCard.user_id !== user.id && !rateCard.is_public) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ rateCard });
  } catch (error) {
    console.error('Error fetching rate card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/rate-cards/:id
 * Update a specific rate card
 */
export async function PUT(
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

    // Verify ownership
    const { data: existingCard, error: fetchError } = await supabase
      .from('rate_cards')
      .select('user_id')
      .eq('id', rateCardId)
      .single();

    if (fetchError || !existingCard) {
      return NextResponse.json(
        { error: 'Rate card not found' },
        { status: 404 }
      );
    }

    if (existingCard.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateRateCardSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, validUntil, isPublic, items, branding } = validationResult.data;

    // Build update data
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (validUntil !== undefined) updateData.valid_until = validUntil;
    if (isPublic !== undefined) updateData.is_public = isPublic;
    if (branding !== undefined) updateData.branding = branding;

    // Update rate card
    const { data: rateCard, error: updateError } = await supabase
      .from('rate_cards')
      .update(updateData)
      .eq('id', rateCardId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating rate card:', updateError);
      return NextResponse.json(
        { error: 'Failed to update rate card' },
        { status: 500 }
      );
    }

    // Update items if provided
    let updatedItems = [];
    if (items && items.length > 0) {
      // Delete existing items
      await supabase.from('rate_card_items').delete().eq('rate_card_id', rateCardId);

      // Insert new items
      const itemsToInsert = items.map((item) => ({
        rate_card_id: rateCardId,
        service_name: item.serviceName,
        description: item.description,
        min_price: item.minPrice,
        max_price: item.maxPrice,
        unit: item.unit,
        category: item.category,
        is_popular: item.isPopular || false,
        is_premium: item.isPremium || false,
        market_comparison: item.marketComparison,
      }));

      const { data: newItems, error: itemsError } = await supabase
        .from('rate_card_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) {
        console.error('Error updating rate card items:', itemsError);
        return NextResponse.json(
          { error: 'Failed to update rate card items' },
          { status: 500 }
        );
      }

      updatedItems = newItems || [];
    } else {
      // Fetch current items
      const { data: currentItems } = await supabase
        .from('rate_card_items')
        .select('*')
        .eq('rate_card_id', rateCardId);
      updatedItems = currentItems || [];
    }

    return NextResponse.json({ rateCard: { ...rateCard, items: updatedItems } });
  } catch (error) {
    console.error('Error updating rate card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rate-cards/:id
 * Delete a specific rate card
 */
export async function DELETE(
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

    // Verify ownership
    const { data: existingCard, error: fetchError } = await supabase
      .from('rate_cards')
      .select('user_id, pdf_url')
      .eq('id', rateCardId)
      .single();

    if (fetchError || !existingCard) {
      return NextResponse.json(
        { error: 'Rate card not found' },
        { status: 404 }
      );
    }

    if (existingCard.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete associated PDF from storage if exists
    if (existingCard.pdf_url) {
      try {
        const filePath = existingCard.pdf_url.split('/').pop();
        if (filePath) {
          await supabase.storage.from('rate-cards').remove([`${user.id}/${filePath}`]);
        }
      } catch (storageError) {
        console.log('Error deleting PDF from storage:', storageError);
        // Continue with deletion even if storage deletion fails
      }
    }

    // Delete rate card (cascade will delete items)
    const { error: deleteError } = await supabase
      .from('rate_cards')
      .delete()
      .eq('id', rateCardId);

    if (deleteError) {
      console.error('Error deleting rate card:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete rate card' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rate card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
