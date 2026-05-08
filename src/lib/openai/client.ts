/**
 * OpenAI Client for RateWise
 * Provides AI-powered price explanations and market insights
 */

import OpenAI from 'openai';
import { RateCardItem } from '@/types/rate-card';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PriceExplanationRequest {
  serviceName: string;
  description?: string;
  minPrice: number;
  maxPrice: number;
  unit?: string;
  category?: string;
  location?: string;
  marketContext?: {
    averagePrice?: number;
    priceRange?: { min: number; max: number };
    competitorCount?: number;
  };
}

export interface PriceExplanationResponse {
  explanation: string;
  factors: string[];
  marketPosition: 'premium' | 'competitive' | 'budget' | 'market_rate';
  confidence: number;
  recommendations?: string[];
}

export interface MarketInsightsRequest {
  category: string;
  location?: string;
  priceRange: { min: number; max: number };
  services: Array<{
    name: string;
    price: number;
  }>;
}

export interface MarketInsightsResponse {
  overview: string;
  trends: string[];
  opportunities: string[];
  risks: string[];
  recommendations: string[];
}

/**
 * Generate AI-powered price explanation
 */
export async function generatePriceExplanation(
  request: PriceExplanationRequest
): Promise<PriceExplanationResponse> {
  try {
    const prompt = buildPriceExplanationPrompt(request);

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a pricing expert and market analyst for professional services. 
Your task is to provide clear, insightful explanations of pricing based on market data and industry knowledge.
Be concise but informative. Always respond in valid JSON format.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    return validateAndNormalizeExplanation(parsed);
  } catch (error) {
    console.error('Error generating price explanation:', error);
    return getFallbackExplanation(request);
  }
}

/**
 * Generate market insights for a category
 */
export async function generateMarketInsights(
  request: MarketInsightsRequest
): Promise<MarketInsightsResponse> {
  try {
    const prompt = buildMarketInsightsPrompt(request);

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a market research analyst specializing in service industry pricing trends.
Provide actionable insights and strategic recommendations based on pricing data.
Always respond in valid JSON format.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    return validateAndNormalizeInsights(parsed);
  } catch (error) {
    console.error('Error generating market insights:', error);
    return getFallbackInsights(request);
  }
}

/**
 * Generate AI insights for an entire rate card
 */
export async function generateRateCardInsights(
  items: RateCardItem[],
  category: string,
  location?: string
): Promise<string> {
  try {
    const avgPrice = items.reduce((sum, item) => sum + (item.minPrice + item.maxPrice) / 2, 0) / items.length;
    const priceRange = {
      min: Math.min(...items.map((i) => i.minPrice)),
      max: Math.max(...items.map((i) => i.maxPrice)),
    };

    const prompt = `Analyze this ${category} rate card with ${items.length} services:

Price Range: $${priceRange.min} - $${priceRange.max}
Average Price: $${avgPrice.toFixed(2)}
${location ? `Location: ${location}` : ''}

Services:
${items.map((item) => `- ${item.serviceName}: $${item.minPrice}-${item.maxPrice}${item.unit ? `/${item.unit}` : ''}`).join('\n')}

Provide a brief 2-3 sentence market analysis covering:
1. How these prices compare to typical market rates
2. Key factors that might influence this pricing
3. A strategic recommendation for positioning

Keep it professional and actionable.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a pricing strategist. Provide concise, professional market analysis.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0]?.message?.content || getFallbackRateCardInsight();
  } catch (error) {
    console.error('Error generating rate card insights:', error);
    return getFallbackRateCardInsight();
  }
}

/**
 * Build prompt for price explanation
 */
function buildPriceExplanationPrompt(request: PriceExplanationRequest): string {
  const { serviceName, description, minPrice, maxPrice, unit, category, location, marketContext } =
    request;

  return `Analyze the pricing for this service and provide a detailed explanation:

Service: ${serviceName}
${description ? `Description: ${description}` : ''}
${category ? `Category: ${category}` : ''}
Price Range: $${minPrice} - $${maxPrice}${unit ? ` per ${unit}` : ''}
${location ? `Location: ${location}` : ''}

${marketContext ? `
Market Context:
- Average market price: $${marketContext.averagePrice || 'N/A'}
- Market price range: $${marketContext.priceRange?.min || 'N/A'} - $${marketContext.priceRange?.max || 'N/A'}
- Number of competitors analyzed: ${marketContext.competitorCount || 'N/A'}
` : ''}

Respond with a JSON object containing:
{
  "explanation": "A 2-3 sentence explanation of why this price range is appropriate",
  "factors": ["List of 3-5 key factors that influence this pricing"],
  "marketPosition": "One of: premium, competitive, budget, market_rate",
  "confidence": A number between 0 and 1 indicating confidence in the analysis,
  "recommendations": ["2-3 actionable recommendations for pricing strategy"]
}`;
}

/**
 * Build prompt for market insights
 */
function buildMarketInsightsPrompt(request: MarketInsightsRequest): string {
  const { category, location, priceRange, services } = request;

  return `Analyze the market for ${category} services and provide strategic insights:

${location ? `Location: ${location}` : ''}
Price Range in Dataset: $${priceRange.min} - $${priceRange.max}
Number of Services: ${services.length}

Services Analyzed:
${services.map((s) => `- ${s.name}: $${s.price}`).join('\n')}

Respond with a JSON object containing:
{
  "overview": "A 2-3 sentence market overview",
  "trends": ["List of 3-5 current market trends"],
  "opportunities": ["List of 2-3 market opportunities"],
  "risks": ["List of 2-3 potential risks or challenges"],
  "recommendations": ["List of 3-5 strategic recommendations"]
}`;
}

/**
 * Validate and normalize price explanation response
 */
function validateAndNormalizeExplanation(
  parsed: Record<string, unknown>
): PriceExplanationResponse {
  return {
    explanation: String(parsed.explanation || 'No explanation available'),
    factors: Array.isArray(parsed.factors) ? parsed.factors.map(String) : ['Market demand', 'Service complexity', 'Competition level'],
    marketPosition: ['premium', 'competitive', 'budget', 'market_rate'].includes(
      String(parsed.marketPosition)
    )
      ? (parsed.marketPosition as PriceExplanationResponse['marketPosition'])
      : 'market_rate',
    confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.7)),
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.map(String)
      : ['Review pricing quarterly', 'Monitor competitor rates'],
  };
}

/**
 * Validate and normalize market insights response
 */
function validateAndNormalizeInsights(
  parsed: Record<string, unknown>
): MarketInsightsResponse {
  return {
    overview: String(parsed.overview || 'Market analysis unavailable'),
    trends: Array.isArray(parsed.trends)
      ? parsed.trends.map(String)
      : ['Increasing demand for specialized services', 'Growing preference for package pricing'],
    opportunities: Array.isArray(parsed.opportunities)
      ? parsed.opportunities.map(String)
      : ['Expand service offerings', 'Target underserved segments'],
    risks: Array.isArray(parsed.risks)
      ? parsed.risks.map(String)
      : ['Price competition', 'Economic uncertainty'],
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.map(String)
      : ['Differentiate on value', 'Build strong client relationships'],
  };
}

/**
 * Get fallback explanation when AI fails
 */
function getFallbackExplanation(request: PriceExplanationRequest): PriceExplanationResponse {
  const { minPrice, maxPrice, marketContext } = request;
  const avgPrice = (minPrice + maxPrice) / 2;
  const marketAvg = marketContext?.averagePrice;

  let position: PriceExplanationResponse['marketPosition'] = 'market_rate';
  if (marketAvg) {
    if (avgPrice > marketAvg * 1.15) position = 'premium';
    else if (avgPrice < marketAvg * 0.85) position = 'budget';
    else position = 'competitive';
  }

  return {
    explanation: `This service is priced at $${minPrice}-$${maxPrice}, which reflects current market conditions and the value delivered to clients.`,
    factors: ['Market demand and supply', 'Service complexity', 'Expertise required', 'Competition level', 'Operating costs'],
    marketPosition: position,
    confidence: 0.6,
    recommendations: ['Regularly review and adjust pricing', 'Monitor competitor rates', 'Collect client feedback on value'],
  };
}

/**
 * Get fallback insights when AI fails
 */
function getFallbackInsights(request: MarketInsightsRequest): MarketInsightsResponse {
  return {
    overview: `The ${request.category} market shows typical pricing patterns with opportunities for strategic positioning.`,
    trends: ['Growing demand for quality services', 'Increased price transparency', 'Shift towards value-based pricing'],
    opportunities: ['Differentiate through specialization', 'Offer tiered pricing options'],
    risks: ['Intense price competition', 'Economic downturns affecting demand'],
    recommendations: ['Focus on value proposition', 'Build long-term client relationships', 'Invest in quality and expertise'],
  };
}

/**
 * Get fallback rate card insight
 */
function getFallbackRateCardInsight(): string {
  return 'This rate card reflects competitive market positioning. Consider reviewing pricing quarterly and monitoring competitor rates to maintain market relevance. Focus on communicating value to justify your pricing structure.';
}

/**
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Get OpenAI client instance
 */
export function getOpenAIClient(): OpenAI {
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI API key is not configured');
  }
  return openai;
}

export default {
  generatePriceExplanation,
  generateMarketInsights,
  generateRateCardInsights,
  isOpenAIConfigured,
  getOpenAIClient,
};
