// ============================================
// RateWise - Pricing Calculator Algorithm
// ============================================

import {
  CalculationInput,
  PricingBreakdown,
  CreatorTier,
  PlatformType,
  ContentType,
  IndustryType,
  GeographyType,
  CurrencyCode,
  UsageRights,
  Exclusivity,
  CampaignDuration,
} from '@/types';

// ============================================
// Configuration Constants
// ============================================

// Base rates per tier (in USD)
const BASE_RATES: Record<CreatorTier, number> = {
  nano: 100,
  micro: 500,
  mid: 2000,
  macro: 8000,
  mega: 25000,
};

// Tier follower thresholds
const TIER_THRESHOLDS: Record<CreatorTier, { min: number; max: number }> = {
  nano: { min: 1000, max: 10000 },
  micro: { min: 10000, max: 100000 },
  mid: { min: 100000, max: 500000 },
  macro: { min: 500000, max: 1000000 },
  mega: { min: 1000000, max: Infinity },
};

// Platform multipliers (adjusts base rate)
const PLATFORM_MULTIPLIERS: Record<PlatformType, number> = {
  instagram: 1.0,
  tiktok: 0.9,
  youtube: 1.2,
  twitter: 0.7,
  linkedin: 1.3,
  twitch: 1.1,
  pinterest: 0.8,
  snapchat: 0.75,
};

// Content type multipliers
const CONTENT_TYPE_MULTIPLIERS: Record<ContentType, number> = {
  feed_post: 1.0,
  story: 0.5,
  reel: 1.2,
  video: 1.3,
  live: 1.5,
  carousel: 1.1,
  long_form: 1.4,
  short: 0.8,
  tweet: 0.4,
  thread: 0.7,
  article: 1.0,
  pin: 0.6,
};

// Industry multipliers
const INDUSTRY_MULTIPLIERS: Record<IndustryType, number> = {
  fashion: 1.1,
  beauty: 1.15,
  tech: 1.2,
  food: 0.9,
  travel: 1.0,
  fitness: 1.05,
  gaming: 0.95,
  finance: 1.25,
  education: 0.85,
  entertainment: 1.0,
  lifestyle: 0.95,
  sports: 1.1,
  automotive: 1.15,
  health: 1.1,
  general: 1.0,
};

// Geography multipliers
const GEOGRAPHY_MULTIPLIERS: Record<GeographyType, number> = {
  us: 1.0,
  uk: 0.95,
  eu: 0.9,
  ca: 0.9,
  au: 0.85,
  asia: 0.75,
  latam: 0.6,
  mea: 0.55,
  global: 1.0,
};

// Default geography currencies
const GEOGRAPHY_CURRENCIES: Record<GeographyType, CurrencyCode> = {
  us: 'USD',
  uk: 'GBP',
  eu: 'EUR',
  ca: 'CAD',
  au: 'AUD',
  asia: 'USD',
  latam: 'USD',
  mea: 'USD',
  global: 'USD',
};

// Campaign duration multipliers
const DURATION_MULTIPLIERS: Record<CampaignDuration, number> = {
  one_time: 1.0,
  short_term: 0.9,
  long_term: 0.8,
  ongoing: 0.75,
};

// Usage rights multipliers
const USAGE_RIGHTS_MULTIPLIERS: Record<UsageRights, number> = {
  '30_days': 1.0,
  '90_days': 1.15,
  '6_months': 1.3,
  '1_year': 1.5,
  'in perpetuity': 2.0,
};

// Exclusivity multipliers
const EXCLUSIVITY_MULTIPLIERS: Record<Exclusivity, number> = {
  none: 1.0,
  category: 1.2,
  brand: 1.5,
};

// Rush job multiplier
const RUSH_MULTIPLIER = 1.25;

// Revision pricing (per revision)
const REVISION_COST = 50;

// Deliverable type multipliers
const DELIVERABLE_MULTIPLIERS: Record<string, number> = {
  single_post: 1.0,
  story_set: 0.8,
  video_content: 1.2,
  series: 0.9,
  package: 0.85,
};

// Currency exchange rates (relative to USD)
const CURRENCY_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52,
};

// Engagement rate benchmarks by tier (for estimation)
const ENGAGEMENT_BENCHMARKS: Record<CreatorTier, { low: number; avg: number; high: number }> = {
  nano: { low: 5, avg: 8, high: 12 },
  micro: { low: 3, avg: 5, high: 8 },
  mid: { low: 2, avg: 3.5, high: 5 },
  macro: { low: 1.5, avg: 2.5, high: 3.5 },
  mega: { low: 1, avg: 1.5, high: 2.5 },
};

// ============================================
// Core Pricing Functions
// ============================================

/**
 * Determine creator tier based on follower count
 */
export function getTier(followers: number): CreatorTier {
  if (followers >= TIER_THRESHOLDS.mega.min) return 'mega';
  if (followers >= TIER_THRESHOLDS.macro.min) return 'macro';
  if (followers >= TIER_THRESHOLDS.mid.min) return 'mid';
  if (followers >= TIER_THRESHOLDS.micro.min) return 'micro';
  return 'nano';
}

/**
 * Get tier information including range and base rate
 */
export function getTierInfo(tier: CreatorTier) {
  return {
    tier,
    minFollowers: TIER_THRESHOLDS[tier].min,
    maxFollowers: TIER_THRESHOLDS[tier].max,
    baseRate: BASE_RATES[tier],
  };
}

/**
 * Calculate engagement multiplier based on engagement rate vs benchmark
 */
export function getEngagementMultiplier(
  engagementRate: number,
  followers: number
): number {
  const tier = getTier(followers);
  const benchmark = ENGAGEMENT_BENCHMARKS[tier];
  
  // Compare to average benchmark
  const ratio = engagementRate / benchmark.avg;
  
  // Calculate multiplier (0.7x to 1.5x range)
  if (ratio >= 2) return 1.5; // Exceptional engagement
  if (ratio >= 1.5) return 1.3; // High engagement
  if (ratio >= 1.2) return 1.15; // Above average
  if (ratio >= 0.9) return 1.0; // Average
  if (ratio >= 0.7) return 0.9; // Below average
  if (ratio >= 0.5) return 0.8; // Low engagement
  return 0.7; // Very low engagement
}

/**
 * Estimate engagement rate based on tier if not provided
 */
export function estimateEngagement(followers: number): number {
  const tier = getTier(followers);
  return ENGAGEMENT_BENCHMARKS[tier].avg;
}

/**
 * Calculate content type multiplier for deliverables
 */
export function getContentTypeMultiplier(contentTypes: ContentType[]): number {
  if (contentTypes.length === 0) return 1.0;
  
  // Average the multipliers of all content types
  const total = contentTypes.reduce((sum, type) => {
    return sum + (CONTENT_TYPE_MULTIPLIERS[type] || 1.0);
  }, 0);
  
  return total / contentTypes.length;
}

/**
 * Calculate deliverable multiplier based on quantity and type
 */
export function getDeliverableMultiplier(
  deliverables: { type: string; quantity: number }[]
): number {
  if (deliverables.length === 0) return 1.0;
  
  let totalQuantity = 0;
  let weightedMultiplier = 0;
  
  for (const d of deliverables) {
    const typeMultiplier = DELIVERABLE_MULTIPLIERS[d.type] || 1.0;
    // Volume discount: more items = slightly lower per-item cost
    const volumeDiscount = d.quantity >= 10 ? 0.85 : d.quantity >= 5 ? 0.9 : 1.0;
    
    totalQuantity += d.quantity;
    weightedMultiplier += typeMultiplier * volumeDiscount * d.quantity;
  }
  
  // Additional bulk discount
  const bulkDiscount = totalQuantity >= 20 ? 0.9 : totalQuantity >= 10 ? 0.95 : 1.0;
  
  return (weightedMultiplier / totalQuantity) * bulkDiscount;
}

/**
 * Get industry multiplier
 */
export function getIndustryMultiplier(industry?: IndustryType): number {
  if (!industry) return 1.0;
  return INDUSTRY_MULTIPLIERS[industry] || 1.0;
}

/**
 * Get geography multiplier
 */
export function getGeographyMultiplier(geography?: GeographyType): number {
  if (!geography) return 1.0;
  return GEOGRAPHY_MULTIPLIERS[geography] || 1.0;
}

/**
 * Get default currency for geography
 */
export function getGeographyCurrency(geography?: GeographyType): CurrencyCode {
  if (!geography) return 'USD';
  return GEOGRAPHY_CURRENCIES[geography] || 'USD';
}

/**
 * Get campaign duration multiplier
 */
export function getDurationMultiplier(duration?: CampaignDuration): number {
  if (!duration) return 1.0;
  return DURATION_MULTIPLIERS[duration] || 1.0;
}

/**
 * Get usage rights multiplier
 */
export function getUsageRightsMultiplier(usage?: UsageRights): number {
  if (!usage) return 1.0;
  return USAGE_RIGHTS_MULTIPLIERS[usage] || 1.0;
}

/**
 * Get exclusivity multiplier
 */
export function getExclusivityMultiplier(exclusivity?: Exclusivity): number {
  if (!exclusivity) return 1.0;
  return EXCLUSIVITY_MULTIPLIERS[exclusivity] || 1.0;
}

/**
 * Get rush job multiplier
 */
export function getRushMultiplier(isRush: boolean = false): number {
  return isRush ? RUSH_MULTIPLIER : 1.0;
}

/**
 * Get revision multiplier
 */
export function getRevisionMultiplier(revisions: number = 0): number {
  if (revisions <= 0) return 1.0;
  // Each revision adds a flat fee as a percentage of base
  return 1 + (revisions * 0.05);
}

/**
 * Convert price between currencies
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount;
  
  const fromRate = CURRENCY_RATES[from] || 1;
  const toRate = CURRENCY_RATES[to] || 1;
  
  // Convert to USD first, then to target currency
  const inUSD = amount / fromRate;
  return inUSD * toRate;
}

// ============================================
// Main Pricing Calculation
// ============================================

export interface CalculatePriceOptions {
  platform: PlatformType;
  followers: number;
  contentType: ContentType;
  deliverables: { type: string; quantity: number; contentFormat: ContentType }[];
  engagementRate?: number;
  industry?: IndustryType;
  geography?: GeographyType;
  campaignDuration?: CampaignDuration;
  usageRights?: UsageRights;
  exclusivity?: Exclusivity;
  rushJob?: boolean;
  revisions?: number;
  currency?: CurrencyCode;
}

/**
 * Main pricing calculation function
 */
export function calculatePrice(options: CalculatePriceOptions): PricingBreakdown {
  const {
    platform,
    followers,
    contentType,
    deliverables,
    engagementRate,
    industry,
    geography,
    campaignDuration,
    usageRights,
    exclusivity,
    rushJob,
    revisions,
    currency = 'USD',
  } = options;

  // Determine tier
  const tier = getTier(followers);
  
  // Get base price for tier
  const basePrice = BASE_RATES[tier];
  
  // Calculate all multipliers
  const tierMultiplier = 1.0; // Base tier already factored into basePrice
  
  // Use provided engagement rate or estimate
  const effectiveEngagementRate = engagementRate ?? estimateEngagement(followers);
  const engagementMultiplier = getEngagementMultiplier(effectiveEngagementRate, followers);
  
  // Content type multiplier (primary content type)
  const contentTypeMultiplier = CONTENT_TYPE_MULTIPLIERS[contentType] || 1.0;
  
  // Deliverable multiplier
  const deliverableMultiplier = getDeliverableMultiplier(
    deliverables.map(d => ({ type: d.type, quantity: d.quantity }))
  );
  
  // Other multipliers
  const industryMultiplier = getIndustryMultiplier(industry);
  const geographyMultiplier = getGeographyMultiplier(geography);
  const durationMultiplier = getDurationMultiplier(campaignDuration);
  const usageRightsMultiplier = getUsageRightsMultiplier(usageRights);
  const exclusivityMultiplier = getExclusivityMultiplier(exclusivity);
  const rushMultiplier = getRushMultiplier(rushJob);
  const revisionMultiplier = getRevisionMultiplier(revisions);
  
  // Platform adjustment
  const platformAdjustment = PLATFORM_MULTIPLIERS[platform] || 1.0;
  
  // Calculate subtotal with all multipliers
  const subtotal = basePrice *
    engagementMultiplier *
    contentTypeMultiplier *
    deliverableMultiplier *
    industryMultiplier *
    geographyMultiplier *
    durationMultiplier *
    usageRightsMultiplier *
    exclusivityMultiplier *
    rushMultiplier *
    revisionMultiplier *
    platformAdjustment;
  
  // Final price (rounded to nearest 10)
  const finalPrice = Math.round(subtotal / 10) * 10;
  
  // Calculate price range (±15%)
  const priceRange = {
    min: Math.round(finalPrice * 0.85 / 10) * 10,
    max: Math.round(finalPrice * 1.15 / 10) * 10,
  };
  
  // Convert to target currency if needed
  const targetCurrency = currency || getGeographyCurrency(geography);
  const finalPriceInCurrency = convertCurrency(finalPrice, 'USD', targetCurrency);
  const priceRangeInCurrency = {
    min: convertCurrency(priceRange.min, 'USD', targetCurrency),
    max: convertCurrency(priceRange.max, 'USD', targetCurrency),
  };
  
  return {
    basePrice,
    tierMultiplier,
    engagementMultiplier,
    contentTypeMultiplier,
    deliverableMultiplier,
    industryMultiplier,
    geographyMultiplier,
    durationMultiplier,
    usageRightsMultiplier,
    exclusivityMultiplier,
    rushMultiplier,
    revisionMultiplier,
    platformAdjustment,
    subtotal,
    finalPrice: finalPriceInCurrency,
    priceRange: priceRangeInCurrency,
    currency: targetCurrency,
    tier,
    estimatedEngagement: effectiveEngagementRate,
  };
}

// ============================================
// Rate Card Generation
// ============================================

export interface RateCardItem {
  contentType: ContentType;
  description: string;
  price: number;
  deliveryTime: string;
  includes: string[];
}

export interface RateCardPackage {
  name: string;
  description: string;
  items: string[];
  price: number;
  savingsPercent: number;
}

/**
 * Generate rate card items for a creator
 */
export function generateRateCardItems(
  platform: PlatformType,
  followers: number,
  engagementRate: number,
  currency: CurrencyCode = 'USD'
): RateCardItem[] {
  const tier = getTier(followers);
  const basePrice = BASE_RATES[tier];
  
  // Get available content types for platform
  const platformContentTypes = getPlatformContentTypes(platform);
  
  return platformContentTypes.map((contentType) => {
    const calculation = calculatePrice({
      platform,
      followers,
      contentType,
      deliverables: [{ type: 'single_post', quantity: 1, contentFormat: contentType }],
      engagementRate,
      currency,
    });
    
    return {
      contentType,
      description: getContentTypeDescription(contentType, platform),
      price: calculation.finalPrice,
      deliveryTime: getDeliveryTime(contentType),
      includes: getStandardIncludes(contentType),
    };
  });
}

/**
 * Generate rate card packages
 */
export function generateRateCardPackages(
  platform: PlatformType,
  followers: number,
  engagementRate: number,
  currency: CurrencyCode = 'USD'
): RateCardPackage[] {
  const packages: RateCardPackage[] = [];
  
  // Starter Package
  const starterCalc = calculatePrice({
    platform,
    followers,
    contentType: 'feed_post',
    deliverables: [
      { type: 'single_post', quantity: 3, contentFormat: 'feed_post' },
      { type: 'story_set', quantity: 2, contentFormat: 'story' },
    ],
    engagementRate,
    campaignDuration: 'short_term',
    currency,
  });
  
  const starterIndividual = calculatePrice({
    platform,
    followers,
    contentType: 'feed_post',
    deliverables: [{ type: 'single_post', quantity: 1, contentFormat: 'feed_post' }],
    engagementRate,
    currency,
  });
  
  const starterValue = starterIndividual.finalPrice * 3 + starterIndividual.finalPrice * 0.5 * 2;
  
  packages.push({
    name: 'Starter Package',
    description: 'Perfect for brands testing the waters',
    items: ['3 Feed Posts', '2 Story Sets', 'Basic Analytics'],
    price: starterCalc.finalPrice,
    savingsPercent: Math.round((1 - starterCalc.finalPrice / starterValue) * 100),
  });
  
  // Growth Package
  const growthCalc = calculatePrice({
    platform,
    followers,
    contentType: 'video',
    deliverables: [
      { type: 'video_content', quantity: 2, contentFormat: 'video' },
      { type: 'single_post', quantity: 4, contentFormat: 'feed_post' },
      { type: 'story_set', quantity: 4, contentFormat: 'story' },
    ],
    engagementRate,
    campaignDuration: 'long_term',
    currency,
  });
  
  packages.push({
    name: 'Growth Package',
    description: 'Ideal for sustained brand awareness',
    items: ['2 Videos', '4 Feed Posts', '4 Story Sets', 'Monthly Report'],
    price: growthCalc.finalPrice,
    savingsPercent: 20,
  });
  
  // Premium Package
  const premiumCalc = calculatePrice({
    platform,
    followers,
    contentType: 'live',
    deliverables: [
      { type: 'video_content', quantity: 4, contentFormat: 'video' },
      { type: 'single_post', quantity: 6, contentFormat: 'feed_post' },
      { type: 'story_set', quantity: 8, contentFormat: 'story' },
      { type: 'series', quantity: 1, contentFormat: 'video' },
    ],
    engagementRate,
    campaignDuration: 'ongoing',
    exclusivity: 'category',
    currency,
  });
  
  packages.push({
    name: 'Premium Partnership',
    description: 'Comprehensive brand collaboration',
    items: ['4 Videos', '6 Feed Posts', '8 Story Sets', '1 Series', 'Category Exclusivity'],
    price: premiumCalc.finalPrice,
    savingsPercent: 25,
  });
  
  return packages;
}

// ============================================
// Helper Functions
// ============================================

function getPlatformContentTypes(platform: PlatformType): ContentType[] {
  const contentTypes: Record<PlatformType, ContentType[]> = {
    instagram: ['feed_post', 'story', 'reel', 'carousel', 'live'],
    tiktok: ['video', 'short', 'live'],
    youtube: ['video', 'short', 'live', 'long_form'],
    twitter: ['tweet', 'thread'],
    linkedin: ['article', 'feed_post'],
    twitch: ['live', 'video'],
    pinterest: ['pin'],
    snapchat: ['story', 'short'],
  };
  
  return contentTypes[platform] || ['feed_post'];
}

function getContentTypeDescription(contentType: ContentType, platform: PlatformType): string {
  const descriptions: Record<ContentType, string> = {
    feed_post: 'Standard feed post with caption and hashtags',
    story: '24-hour disappearing content',
    reel: 'Short-form vertical video (15-90 seconds)',
    video: 'Standard video content',
    live: 'Real-time streaming session',
    carousel: 'Multi-image post with swipe functionality',
    long_form: 'Extended video content (10+ minutes)',
    short: 'Quick vertical video (under 60 seconds)',
    tweet: 'Short text post',
    thread: 'Connected series of posts',
    article: 'Long-form written content',
    pin: 'Visual bookmark with description',
  };
  
  return descriptions[contentType] || 'Content post';
}

function getDeliveryTime(contentType: ContentType): string {
  const times: Record<ContentType, string> = {
    feed_post: '3-5 business days',
    story: '1-2 business days',
    reel: '5-7 business days',
    video: '7-10 business days',
    live: 'Schedule in advance',
    carousel: '3-5 business days',
    long_form: '10-14 business days',
    short: '2-3 business days',
    tweet: '1 business day',
    thread: '2-3 business days',
    article: '5-7 business days',
    pin: '2-3 business days',
  };
  
  return times[contentType] || '3-5 business days';
}

function getStandardIncludes(contentType: ContentType): string[] {
  const includes: Record<ContentType, string[]> = {
    feed_post: ['Concept development', 'High-quality imagery', 'Caption writing', 'Hashtag research'],
    story: ['Quick turnaround', 'Interactive elements', 'Swipe-up links'],
    reel: ['Trending audio', 'Editing', 'Caption', 'Hashtags'],
    video: ['Scripting', 'Filming', 'Editing', 'Thumbnail'],
    live: ['Pre-stream prep', 'Real-time engagement', 'Post-stream highlights'],
    carousel: ['Multiple images', 'Swipe-optimized', 'Detailed captions'],
    long_form: ['Full production', 'Script', 'Editing', 'SEO optimization'],
    short: ['Quick concept', 'Trending elements', 'Fast delivery'],
    tweet: ['Copywriting', 'Thread planning', 'Engagement'],
    thread: ['Story arc', 'Multiple tweets', 'Engagement strategy'],
    article: ['Research', 'Writing', 'Editing', 'Publishing'],
    pin: ['Image optimization', 'Description', 'Keyword research'],
  };
  
  return includes[contentType] || ['Content creation'];
}

// ============================================
// AI Explanation Generation
// ============================================

export interface PricingContext {
  input: CalculatePriceOptions;
  result: PricingBreakdown;
}

/**
 * Generate AI explanation for pricing
 */
export function generatePricingExplanation(context: PricingContext): string {
  const { input, result } = context;
  const parts: string[] = [];
  
  // Introduction
  parts.push(`Based on your profile as a ${getTierDisplayName(result.tier)} with ${input.followers.toLocaleString()} followers on ${input.platform}, `);
  parts.push(`we've calculated a rate of ${result.currency} ${result.finalPrice.toLocaleString()}. `);
  
  // Tier explanation
  parts.push(`Your base rate of ${result.currency} ${result.basePrice.toLocaleString()} reflects the ${getTierDisplayName(result.tier)} tier. `);
  
  // Engagement explanation
  if (result.engagementMultiplier !== 1.0) {
    const direction = result.engagementMultiplier > 1 ? 'boosted' : 'adjusted';
    const percent = Math.round((result.engagementMultiplier - 1) * 100);
    parts.push(`Your engagement rate ${direction} the price by ${Math.abs(percent)}%. `);
  }
  
  // Content type explanation
  if (result.contentTypeMultiplier !== 1.0) {
    const typeName = input.contentType.replace('_', ' ');
    parts.push(`${typeName} content typically commands a ${Math.round((result.contentTypeMultiplier - 1) * 100)}% premium. `);
  }
  
  // Industry explanation
  if (result.industryMultiplier !== 1.0 && input.industry) {
    const industryName = input.industry.charAt(0).toUpperCase() + input.industry.slice(1);
    parts.push(`The ${industryName} sector has ${result.industryMultiplier > 1 ? 'higher' : 'lower'} rates. `);
  }
  
  // Geography explanation
  if (result.geographyMultiplier !== 1.0 && input.geography) {
    parts.push(`Rates in your region are adjusted by ${Math.round((result.geographyMultiplier - 1) * 100)}%. `);
  }
  
  // Additional factors
  const additionalFactors: string[] = [];
  
  if (result.usageRightsMultiplier > 1.0 && input.usageRights) {
    additionalFactors.push(`${input.usageRights} usage rights`);
  }
  
  if (result.exclusivityMultiplier > 1.0 && input.exclusivity) {
    additionalFactors.push(`${input.exclusivity} exclusivity`);
  }
  
  if (result.rushMultiplier > 1.0 && input.rushJob) {
    additionalFactors.push('rush delivery');
  }
  
  if (additionalFactors.length > 0) {
    parts.push(`Additional factors: ${additionalFactors.join(', ')}. `);
  }
  
  // Market context
  parts.push(`This rate is competitive for your profile and aligns with current market trends for ${input.platform} creators in the ${getTierDisplayName(result.tier)} range.`);
  
  return parts.join('');
}

function getTierDisplayName(tier: CreatorTier): string {
  const names: Record<CreatorTier, string> = {
    nano: 'Nano Creator',
    micro: 'Micro Creator',
    mid: 'Mid-Tier Creator',
    macro: 'Macro Creator',
    mega: 'Mega Creator',
  };
  return names[tier];
}
