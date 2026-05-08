// ============================================
// RateWise - Calculate API Route
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

import { CalculateRequestSchema } from '@/lib/validations/schemas';
import { 
  calculatePrice, 
  generatePricingExplanation,
  getNextResetDate 
} from '@/lib/utils/pricing-calculator';
import { 
  CalculateRequest, 
  CalculateResponse, 
  PricingBreakdown,
  CalculationInput,
  AIExplanationResponse 
} from '@/types';

// ============================================
// Configuration
// ============================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Free tier calculation limit
const FREE_TIER_LIMIT = 5;

// ============================================
// POST /api/calculate
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = CalculateRequestSchema.safeParse(body);
    
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
    
    const input = validationResult.data;
    
    // Check quota for free users
    let userTier = 'free';
    let calculationsUsed = 0;
    let calculationsResetAt = new Date();
    
    if (userId) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('tier, monthly_calculations_used, monthly_calculations_reset_at')
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
      
      if (user) {
        userTier = user.tier;
        calculationsUsed = user.monthly_calculations_used || 0;
        calculationsResetAt = new Date(user.monthly_calculations_reset_at);
        
        // Check if quota should reset
        const now = new Date();
        if (now >= calculationsResetAt) {
          calculationsUsed = 0;
          calculationsResetAt = getNextResetDate();
          
          // Reset quota in database
          await supabase
            .from('users')
            .update({
              monthly_calculations_used: 0,
              monthly_calculations_reset_at: calculationsResetAt.toISOString(),
            })
            .eq('id', userId);
        }
        
        // Check if free user has exceeded limit
        if (userTier === 'free' && calculationsUsed >= FREE_TIER_LIMIT) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'QUOTA_EXCEEDED',
                message: 'Monthly calculation limit reached. Upgrade to Pro for unlimited calculations.',
              },
            },
            { status: 429 }
          );
        }
      }
    }
    
    // Perform pricing calculation
    const calculationInput: CalculationInput = {
      platform: input.platform,
      followers: input.followers,
      contentType: input.contentType,
      deliverables: input.deliverables,
      engagementRate: input.engagementRate,
      industry: input.industry,
      geography: input.geography,
      campaignDuration: input.campaignDuration,
      usageRights: input.usageRights,
      exclusivity: input.exclusivity,
      rushJob: input.rushJob,
      revisions: input.revisions,
    };
    
    const pricingResult = calculatePrice({
      platform: input.platform,
      followers: input.followers,
      contentType: input.contentType,
      deliverables: input.deliverables,
      engagementRate: input.engagementRate,
      industry: input.industry,
      geography: input.geography,
      campaignDuration: input.campaignDuration,
      usageRights: input.usageRights,
      exclusivity: input.exclusivity,
      rushJob: input.rushJob,
      revisions: input.revisions,
      currency: input.currency,
    });
    
    // Generate AI explanation for Pro users
    let aiExplanation: AIExplanationResponse | null = null;
    
    if (userTier === 'pro' && process.env.OPENAI_API_KEY) {
      try {
        aiExplanation = await generateAIExplanation(calculationInput, pricingResult);
      } catch (error) {
        console.error('AI explanation generation failed:', error);
        // Continue without AI explanation - don't fail the request
      }
    }
    
    // Save calculation to database
    const calculationId = crypto.randomUUID();
    const { error: saveError } = await supabase
      .from('calculations')
      .insert({
        id: calculationId,
        user_id: userId || null,
        input_data: calculationInput,
        result_data: pricingResult,
        ai_explanation: aiExplanation?.explanation || null,
        saved: input.saveCalculation || false,
        created_at: new Date().toISOString(),
      });
    
    if (saveError) {
      console.error('Error saving calculation:', saveError);
      // Don't fail the request if saving fails
    }
    
    // Increment calculation count for authenticated users
    if (userId) {
      await supabase
        .from('users')
        .update({
          monthly_calculations_used: calculationsUsed + 1,
        })
        .eq('id', userId);
    }
    
    // Prepare response
    const response: CalculateResponse = {
      calculationId,
      input: calculationInput,
      results: pricingResult,
      aiExplanation,
      quotaInfo: {
        used: calculationsUsed + 1,
        limit: userTier === 'pro' ? Infinity : FREE_TIER_LIMIT,
        remaining: userTier === 'pro' ? Infinity : Math.max(0, FREE_TIER_LIMIT - calculationsUsed - 1),
        resetsAt: calculationsResetAt.toISOString(),
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
    console.error('Calculate API error:', error);
    
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
// AI Explanation Generation
// ============================================

async function generateAIExplanation(
  input: CalculationInput,
  result: PricingBreakdown
): Promise<AIExplanationResponse> {
  const prompt = buildAIPrompt(input, result);
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert influencer pricing analyst. Provide clear, professional explanations for pricing calculations. 
        Be concise but informative. Focus on the key factors that influenced the price.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });
  
  const explanation = completion.choices[0]?.message?.content || 
    generatePricingExplanation({ input, result });
  
  return {
    explanation,
    insights: generateInsights(input, result),
    recommendations: generateRecommendations(input, result),
    marketContext: generateMarketContext(input, result),
  };
}

function buildAIPrompt(input: CalculationInput, result: PricingBreakdown): string {
  return `
Analyze this influencer pricing calculation:

Profile:
- Platform: ${input.platform}
- Followers: ${input.followers.toLocaleString()}
- Tier: ${result.tier}
- Engagement Rate: ${input.engagementRate?.toFixed(2) || 'Estimated'}%
- Content Type: ${input.contentType}
- Deliverables: ${input.deliverables.map(d => `${d.quantity}x ${d.type}`).join(', ')}
${input.industry ? `- Industry: ${input.industry}` : ''}
${input.geography ? `- Geography: ${input.geography}` : ''}
${input.campaignDuration ? `- Duration: ${input.campaignDuration}` : ''}
${input.usageRights ? `- Usage Rights: ${input.usageRights}` : ''}
${input.exclusivity ? `- Exclusivity: ${input.exclusivity}` : ''}
${input.rushJob ? '- Rush Job: Yes' : ''}
${input.revisions ? `- Revisions: ${input.revisions}` : ''}

Pricing Breakdown:
- Base Price: $${result.basePrice.toLocaleString()}
- Final Price: $${result.finalPrice.toLocaleString()}
- Price Range: $${result.priceRange.min.toLocaleString()} - $${result.priceRange.max.toLocaleString()}
- Multipliers Applied:
  - Engagement: ${result.engagementMultiplier.toFixed(2)}x
  - Content Type: ${result.contentTypeMultiplier.toFixed(2)}x
  - Industry: ${result.industryMultiplier.toFixed(2)}x
  - Geography: ${result.geographyMultiplier.toFixed(2)}x
  - Duration: ${result.durationMultiplier.toFixed(2)}x
  - Usage Rights: ${result.usageRightsMultiplier.toFixed(2)}x
  - Exclusivity: ${result.exclusivityMultiplier.toFixed(2)}x

Provide a professional explanation of how this price was calculated and why it's fair for both the creator and brand.
`;
}

function generateInsights(input: CalculationInput, result: PricingBreakdown): string[] {
  const insights: string[] = [];
  
  if (result.engagementMultiplier > 1.2) {
    insights.push('Your engagement rate is above average for your tier, justifying a premium rate.');
  }
  
  if (result.contentTypeMultiplier > 1.2) {
    insights.push(`${input.contentType} content typically commands higher rates due to production requirements.`);
  }
  
  if (result.industryMultiplier > 1.1) {
    insights.push(`${input.industry} is a high-value industry with strong brand budgets.`);
  }
  
  if (input.exclusivity && input.exclusivity !== 'none') {
    insights.push('Exclusivity requirements significantly increase rates due to opportunity cost.');
  }
  
  if (insights.length === 0) {
    insights.push('Your rate is based on standard market pricing for your tier and platform.');
  }
  
  return insights;
}

function generateRecommendations(input: CalculationInput, result: PricingBreakdown): string[] {
  const recommendations: string[] = [];
  
  if (result.engagementMultiplier < 1.0) {
    recommendations.push('Focus on improving engagement rate to increase your earning potential.');
  }
  
  if (input.contentType === 'feed_post' && input.platform === 'instagram') {
    recommendations.push('Consider offering Reels - they often command higher rates and better reach.');
  }
  
  if (!input.campaignDuration || input.campaignDuration === 'one_time') {
    recommendations.push('Long-term partnerships often provide more stable income than one-off posts.');
  }
  
  recommendations.push('Package multiple deliverables together for better client value and higher total earnings.');
  
  return recommendations;
}

function generateMarketContext(input: CalculationInput, result: PricingBreakdown): string {
  const contexts: string[] = [];
  
  contexts.push(`${input.platform} rates for ${result.tier} creators typically range from $${result.priceRange.min.toLocaleString()} to $${result.priceRange.max.toLocaleString()}.`);
  
  if (input.industry) {
    contexts.push(`The ${input.industry} sector has shown ${result.industryMultiplier > 1 ? 'strong' : 'moderate'} demand for influencer partnerships.`);
  }
  
  contexts.push('Rates are influenced by seasonality, with Q4 typically seeing 15-20% increases.');
  
  return contexts.join(' ');
}
