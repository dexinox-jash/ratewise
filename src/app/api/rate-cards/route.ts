/**
 * Rate Cards API Route
 * Handles CRUD operations for rate cards with PDF generation and Supabase storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { generateRateCardPDF, validatePDFOptions } from '@/lib/utils/pdf-generator';
import { generateRateCardInsights } from '@/lib/openai/client';
import { z } from 'zod';

// Validation schemas
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

const rateCardSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  validUntil: z.string().datetime().optional(),
  isPublic: z.boolean().optional(),
  items: z.array(rateCardItemSchema).min(1),
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
 * GET /api/rate-cards
 * List all rate cards for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeExpired = searchParams.get('includeExpired') === 'true';

    // Build query
    let query = supabase
      .from('rate_cards')
      .select(`
        *,
        items:rate_card_items(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter out expired cards unless requested
    if (!includeExpired) {
      query = query.or('valid_until.is.null,valid_until.gte.now()');
    }

    const { data: rateCards, error } = await query;

    if (error) {
      console.error('Error fetching rate cards:', error);
      return NextResponse.json(
        { error: 'Failed to fetch rate cards' },
        { status: 500 }
      );
    }

    return NextResponse.json({ rateCards: rateCards || [] });
  } catch (error) {
    console.error('Unexpected error in GET /api/rate-cards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rate-cards
 * Create a new rate card
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user's subscription and rate card limits
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type, status')
      .eq('user_id', user.id)
      .single();

    const isPaidUser = subscription?.plan_type !== 'free' && subscription?.status === 'active';

    // Count existing rate cards for free users
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = rateCardSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, validUntil, isPublic, items, branding } = validationResult.data;

    // Generate AI insights if OpenAI is configured
    let aiInsights: string | null = null;
    try {
      const category = items[0]?.category || 'Services';
      aiInsights = await generateRateCardInsights(
        items.map((item, index) => ({
          id: `temp-${index}`,
          rateCardId: 'temp',
          serviceName: item.serviceName,
          description: item.description || null,
          minPrice: item.minPrice,
          maxPrice: item.maxPrice,
          unit: item.unit || null,
          category: item.category || null,
          isPopular: item.isPopular || false,
          isPremium: item.isPremium || false,
          marketComparison: item.marketComparison || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        category
      );
    } catch (error) {
      console.log('AI insights generation failed, continuing without insights');
    }

    // Create rate card
    const { data: rateCard, error: createError } = await supabase
      .from('rate_cards')
      .insert({
        user_id: user.id,
        title,
        description,
        valid_until: validUntil,
        is_public: isPublic || false,
        ai_insights: aiInsights,
        branding: branding || {},
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating rate card:', createError);
      return NextResponse.json(
        { error: 'Failed to create rate card' },
        { status: 500 }
      );
    }

    // Create rate card items
    const itemsToInsert = items.map((item) => ({
      rate_card_id: rateCard.id,
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

    const { data: createdItems, error: itemsError } = await supabase
      .from('rate_card_items')
      .insert(itemsToInsert)
      .select();

    if (itemsError) {
      console.error('Error creating rate card items:', itemsError);
      // Rollback: delete the rate card
      await supabase.from('rate_cards').delete().eq('id', rateCard.id);
      return NextResponse.json(
        { error: 'Failed to create rate card items' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { rateCard: { ...rateCard, items: createdItems } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/rate-cards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/rate-cards/:id
 * Update an existing rate card
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
    const { data: existingCard } = await supabase
      .from('rate_cards')
      .select('user_id')
      .eq('id', rateCardId)
      .single();

    if (!existingCard || existingCard.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Rate card not found or access denied' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = rateCardSchema.partial().safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, validUntil, isPublic, items, branding } = validationResult.data;

    // Update rate card
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (validUntil !== undefined) updateData.valid_until = validUntil;
    if (isPublic !== undefined) updateData.is_public = isPublic;
    if (branding !== undefined) updateData.branding = branding;
    updateData.updated_at = new Date().toISOString();

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

      const { data: updatedItems, error: itemsError } = await supabase
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

      return NextResponse.json({ rateCard: { ...rateCard, items: updatedItems } });
    }

    // Fetch current items
    const { data: currentItems } = await supabase
      .from('rate_card_items')
      .select('*')
      .eq('rate_card_id', rateCardId);

    return NextResponse.json({ rateCard: { ...rateCard, items: currentItems || [] } });
  } catch (error) {
    console.error('Unexpected error in PUT /api/rate-cards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rate-cards/:id
 * Delete a rate card and its associated files
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
    const { data: existingCard } = await supabase
      .from('rate_cards')
      .select('user_id, pdf_url')
      .eq('id', rateCardId)
      .single();

    if (!existingCard || existingCard.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Rate card not found or access denied' },
        { status: 404 }
      );
    }

    // Delete associated PDF from storage if exists
    if (existingCard.pdf_url) {
      const filePath = existingCard.pdf_url.split('/').pop();
      if (filePath) {
        await supabase.storage.from('rate-cards').remove([`${user.id}/${filePath}`]);
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
    console.error('Unexpected error in DELETE /api/rate-cards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rate-cards/:id/export
 * Generate and export PDF for a rate card
 */
export async function exportRateCardPDF(
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

    // Check user's subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type, status')
      .eq('user_id', user.id)
      .single();

    const isPaidUser = subscription?.plan_type !== 'free' && subscription?.status === 'active';

    // Parse branding from request
    const body = await request.json().catch(() => ({}));
    const branding = body.branding || rateCard.branding || {};

    // Validate PDF options
    const validationErrors = validatePDFOptions({
      rateCard,
      items: rateCard.items || [],
      branding,
      isPaidUser,
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid PDF options', details: validationErrors },
        { status: 400 }
      );
    }

    // Generate PDF
    const { pdfBuffer, fileName, pageCount } = await generateRateCardPDF({
      rateCard,
      items: rateCard.items || [],
      branding,
      isPaidUser,
      watermark: isPaidUser ? undefined : 'RateWise',
    });

    // Upload to Supabase Storage for paid users
    let pdfUrl: string | null = null;
    if (isPaidUser) {
      const storagePath = `${user.id}/${fileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('rate-cards')
        .upload(storagePath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading PDF:', uploadError);
        // Continue without storing - user still gets the PDF
      } else {
        // Get public URL
        const { data: publicUrl } = supabase.storage
          .from('rate-cards')
          .getPublicUrl(storagePath);
        pdfUrl = publicUrl.publicUrl;

        // Update rate card with PDF URL
        await supabase
          .from('rate_cards')
          .update({ pdf_url: pdfUrl, updated_at: new Date().toISOString() })
          .eq('id', rateCardId);
      }
    }

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'X-Page-Count': String(pageCount),
        ...(pdfUrl && { 'X-PDF-URL': pdfUrl }),
      },
    });
  } catch (error) {
    console.error('Error exporting rate card PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rate-cards/:id/duplicate
 * Duplicate an existing rate card
 */
export async function duplicateRateCard(
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

    // Check rate card limit for free users
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type, status')
      .eq('user_id', user.id)
      .single();

    const isPaidUser = subscription?.plan_type !== 'free' && subscription?.status === 'active';

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
      }));

      const { data: newItems, error: itemsError } = await supabase
        .from('rate_card_items')
        .insert(itemsToInsert)
        .select();

      if (itemsError) {
        console.error('Error duplicating items:', itemsError);
        // Rollback
        await supabase.from('rate_cards').delete().eq('id', newCard.id);
        return NextResponse.json(
          { error: 'Failed to duplicate rate card items' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { rateCard: { ...newCard, items: newItems } },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { rateCard: { ...newCard, items: [] } },
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

/**
 * POST /api/rate-cards/:id/insights
 * Generate AI insights for a rate card
 */
export async function generateInsights(
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

    const canUseAI = subscription?.plan_type === 'pro' || subscription?.plan_type === 'enterprise';

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
    await supabase
      .from('rate_cards')
      .update({ ai_insights: insights, updated_at: new Date().toISOString() })
      .eq('id', rateCardId);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
