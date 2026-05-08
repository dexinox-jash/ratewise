/**
 * Rate Card Export API Route
 * Handles PDF generation and export for rate cards
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { generateRateCardPDF, validatePDFOptions } from '@/lib/utils/pdf-generator';

/**
 * POST /api/rate-cards/:id/export
 * Generate and export PDF for a rate card
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

      // Free users limited to 3 rate cards
      if (count && count > 3) {
        return NextResponse.json(
          { error: 'Free users are limited to 3 rate cards. Please upgrade to Pro.' },
          { status: 403 }
        );
      }
    }

    // Parse branding from request
    const body = await request.json().catch(() => ({}));
    const branding = body.branding || rateCard.branding || {
      companyName: '',
      tagline: '',
      logoUrl: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      accentColor: '#10B981',
    };

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
      try {
        const storagePath = `${user.id}/${fileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('rate-cards')
          .upload(storagePath, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (uploadError) {
          console.error('Error uploading PDF to storage:', uploadError);
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
            .update({ 
              pdf_url: pdfUrl, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', rateCardId);
        }
      } catch (storageError) {
        console.error('Storage error:', storageError);
        // Continue without storing
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
