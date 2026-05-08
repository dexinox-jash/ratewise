// ============================================
// RateWise - Zod Validation Schemas
// ============================================

import { z } from 'zod';

// ============================================
// Enums
// ============================================

export const PlatformTypeSchema = z.enum([
  'instagram',
  'tiktok',
  'youtube',
  'twitter',
  'linkedin',
  'twitch',
  'pinterest',
  'snapchat',
]);

export const ContentTypeSchema = z.enum([
  'feed_post',
  'story',
  'reel',
  'video',
  'live',
  'carousel',
  'long_form',
  'short',
  'tweet',
  'thread',
  'article',
  'pin',
]);

export const DeliverableTypeSchema = z.enum([
  'single_post',
  'story_set',
  'video_content',
  'series',
  'package',
]);

export const CampaignDurationSchema = z.enum([
  'one_time',
  'short_term',
  'long_term',
  'ongoing',
]);

export const UsageRightsSchema = z.enum([
  '30_days',
  '90_days',
  '6_months',
  '1_year',
  'in perpetuity',
]);

export const ExclusivitySchema = z.enum([
  'none',
  'category',
  'brand',
]);

export const IndustryTypeSchema = z.enum([
  'fashion',
  'beauty',
  'tech',
  'food',
  'travel',
  'fitness',
  'gaming',
  'finance',
  'education',
  'entertainment',
  'lifestyle',
  'sports',
  'automotive',
  'health',
  'general',
]);

export const GeographyTypeSchema = z.enum([
  'us',
  'uk',
  'eu',
  'ca',
  'au',
  'asia',
  'latam',
  'mea',
  'global',
]);

export const CurrencyCodeSchema = z.enum([
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
]);

export const SubscriptionTierSchema = z.enum([
  'free',
  'pro',
]);

// ============================================
// Deliverable Schema
// ============================================

export const DeliverableConfigSchema = z.object({
  type: DeliverableTypeSchema,
  quantity: z.number().int().min(1).max(100),
  contentFormat: ContentTypeSchema,
});

// ============================================
// Calculate Request Schema
// ============================================

export const CalculateRequestSchema = z.object({
  platform: PlatformTypeSchema,
  followers: z.number().int().min(0).max(1000000000),
  contentType: ContentTypeSchema,
  deliverables: z.array(DeliverableConfigSchema).min(1).max(10),
  engagementRate: z.number().min(0).max(100).optional(),
  industry: IndustryTypeSchema.optional(),
  geography: GeographyTypeSchema.optional(),
  campaignDuration: CampaignDurationSchema.optional(),
  usageRights: UsageRightsSchema.optional(),
  exclusivity: ExclusivitySchema.optional(),
  rushJob: z.boolean().optional(),
  revisions: z.number().int().min(0).max(10).optional(),
  currency: CurrencyCodeSchema.optional(),
  saveCalculation: z.boolean().optional(),
});

// ============================================
// Calculation History Query Schema
// ============================================

export const GetCalculationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  savedOnly: z.coerce.boolean().default(false),
  platform: PlatformTypeSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'finalPrice', 'platform']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================
// Rate Card Schemas
// ============================================

export const RateCardItemSchema = z.object({
  contentType: ContentTypeSchema,
  price: z.number().positive(),
  description: z.string().max(200).optional(),
});

export const RateCardPackageSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  items: z.array(z.string().min(1).max(200)).min(1).max(10),
  price: z.number().positive(),
});

export const CreateRateCardRequestSchema = z.object({
  creatorName: z.string().min(1).max(100),
  creatorHandle: z.string().min(1).max(100),
  platform: PlatformTypeSchema,
  followers: z.number().int().min(0).max(1000000000),
  engagementRate: z.number().min(0).max(100),
  niche: z.string().min(1).max(100),
  location: z.string().min(1).max(100),
  contactEmail: z.string().email(),
  contactInfo: z.string().max(500).optional(),
  brandGuidelines: z.string().max(2000).optional(),
  customRates: z.array(RateCardItemSchema).max(20).optional(),
  packages: z.array(RateCardPackageSchema).max(10).optional(),
  currency: CurrencyCodeSchema.optional(),
});

export const GetRateCardsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// ============================================
// Subscription Schemas
// ============================================

export const CreateCheckoutRequestSchema = z.object({
  planId: z.string().min(1),
  billingCycle: z.enum(['monthly', 'yearly']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const CancelSubscriptionRequestSchema = z.object({
  immediate: z.boolean().optional(),
});

export const UpdateSubscriptionRequestSchema = z.object({
  planId: z.string().min(1),
  billingCycle: z.enum(['monthly', 'yearly']).optional(),
});

export const GetInvoicesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// ============================================
// User Schemas
// ============================================

export const UserSettingsSchema = z.object({
  defaultCurrency: CurrencyCodeSchema.optional(),
  defaultPlatform: PlatformTypeSchema.optional(),
  emailNotifications: z.boolean().optional(),
  calculationAlerts: z.boolean().optional(),
});

export const UpdateUserRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  settings: UserSettingsSchema.optional(),
});

// ============================================
// AI Explanation Schema
// ============================================

export const GenerateExplanationRequestSchema = z.object({
  calculationId: z.string().uuid(),
  context: z.string().max(1000).optional(),
});

// ============================================
// Save Calculation Schema
// ============================================

export const SaveCalculationRequestSchema = z.object({
  calculationId: z.string().uuid(),
  saved: z.boolean(),
});

// ============================================
// Webhook Schema (Stripe)
// ============================================

export const StripeWebhookBodySchema = z.object({
  id: z.string(),
  object: z.literal('event'),
  type: z.string(),
  data: z.object({
    object: z.record(z.unknown()),
  }),
  created: z.number(),
});

// ============================================
// ID Parameter Schema
// ============================================

export const IdParamSchema = z.object({
  id: z.string().uuid(),
});

// ============================================
// Type Exports
// ============================================

export type CalculateRequestInput = z.infer<typeof CalculateRequestSchema>;
export type GetCalculationsQueryInput = z.infer<typeof GetCalculationsQuerySchema>;
export type CreateRateCardRequestInput = z.infer<typeof CreateRateCardRequestSchema>;
export type GetRateCardsQueryInput = z.infer<typeof GetRateCardsQuerySchema>;
export type CreateCheckoutRequestInput = z.infer<typeof CreateCheckoutRequestSchema>;
export type CancelSubscriptionRequestInput = z.infer<typeof CancelSubscriptionRequestSchema>;
export type UpdateSubscriptionRequestInput = z.infer<typeof UpdateSubscriptionRequestSchema>;
export type GetInvoicesQueryInput = z.infer<typeof GetInvoicesQuerySchema>;
export type UpdateUserRequestInput = z.infer<typeof UpdateUserRequestSchema>;
export type GenerateExplanationRequestInput = z.infer<typeof GenerateExplanationRequestSchema>;
export type SaveCalculationRequestInput = z.infer<typeof SaveCalculationRequestSchema>;
export type StripeWebhookBody = z.infer<typeof StripeWebhookBodySchema>;
