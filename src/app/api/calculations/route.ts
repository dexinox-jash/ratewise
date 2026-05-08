// ============================================
// RateWise - Calculations History API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

import { GetCalculationsQuerySchema, SaveCalculationRequestSchema } from '@/lib/validations/schemas';
import { 
  GetCalculationsResponse, 
  DeleteCalculationResponse,
  SaveCalculationResponse,
  CalculationResult 
} from '@/types';

// ============================================
// Configuration
// ============================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// GET /api/calculations
// Get user's calculation history
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
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      savedOnly: searchParams.get('savedOnly') === 'true',
      platform: searchParams.get('platform') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };
    
    // Validate query parameters
    const validationResult = GetCalculationsQuerySchema.safeParse(queryParams);
    
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
    
    const { page, limit, savedOnly, platform, startDate, endDate, sortBy, sortOrder } = validationResult.data;
    
    // Build query
    let query = supabase
      .from('calculations')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply filters
    if (savedOnly) {
      query = query.eq('saved', true);
    }
    
    if (platform) {
      query = query.contains('input_data', { platform });
    }
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    // Apply sorting
    const sortColumn = sortBy === 'createdAt' ? 'created_at' : 
                       sortBy === 'platform' ? 'input_data->platform' : 
                       'result_data->finalPrice';
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    // Execute query
    const { data: calculations, error, count } = await query;
    
    if (error) {
      console.error('Error fetching calculations:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch calculations',
          },
        },
        { status: 500 }
      );
    }
    
    // Transform database records to API response format
    const transformedCalculations: CalculationResult[] = (calculations || []).map((calc) => ({
      id: calc.id,
      userId: calc.user_id,
      input: calc.input_data as CalculationResult['input'],
      results: calc.result_data as CalculationResult['results'],
      aiExplanation: calc.ai_explanation,
      createdAt: new Date(calc.created_at),
      saved: calc.saved,
    }));
    
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    
    const response: GetCalculationsResponse = {
      data: transformedCalculations,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
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
    console.error('Calculations GET error:', error);
    
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
// DELETE /api/calculations
// Delete multiple calculations
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
    const body = await request.json();
    const { calculationIds } = body;
    
    if (!Array.isArray(calculationIds) || calculationIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'calculationIds array is required',
          },
        },
        { status: 400 }
      );
    }
    
    // Validate UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validIds = calculationIds.filter(id => uuidRegex.test(id));
    
    if (validIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No valid calculation IDs provided',
          },
        },
        { status: 400 }
      );
    }
    
    // Delete calculations (only user's own calculations)
    const { error } = await supabase
      .from('calculations')
      .delete()
      .eq('user_id', userId)
      .in('id', validIds);
    
    if (error) {
      console.error('Error deleting calculations:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to delete calculations',
          },
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        data: {
          deleted: true,
          deletedCount: validIds.length,
          calculationIds: validIds,
        },
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Calculations DELETE error:', error);
    
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
// PATCH /api/calculations
// Update calculation (save/unsave)
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
    const validationResult = SaveCalculationRequestSchema.safeParse(body);
    
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
    
    const { calculationId, saved } = validationResult.data;
    
    // Update calculation
    const { data: updated, error } = await supabase
      .from('calculations')
      .update({ saved })
      .eq('id', calculationId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Calculation not found or access denied',
            },
          },
          { status: 404 }
        );
      }
      
      console.error('Error updating calculation:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to update calculation',
          },
        },
        { status: 500 }
      );
    }
    
    const response: SaveCalculationResponse = {
      calculationId,
      saved: updated.saved,
    };
    
    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Calculations PATCH error:', error);
    
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
