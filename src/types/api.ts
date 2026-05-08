// ============================================
// RateWise - API Request/Response Types
// ============================================

import {
  CalculationInput,
  CalculationResult,
  PricingBreakdown,
  RateCard,
  SubscriptionStatus,
  UserProfile,
  PlatformType,
  ContentType,
  IndustryType,
  GeographyType,
  CreatorTier,
  CurrencyCode,
  DeliverableType,
  CampaignDuration,
  UsageRights,
  Exclusivity,
  PaginatedResponse,
  SubscriptionPlan,
  AIExplanationResponse,
  UserAnalytics,
} from './index';

// ============================================
// Common API Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// ============================================
// Calculate API
// ============================================

export interface CalculateRequest {
  platform: PlatformType;
  followers: number;
  contentType: ContentType;
  deliverables: {
    type: DeliverableType;
    quantity: number;
    contentFormat: ContentType;
  }[];
  engagementRate?: number;
  industry?: IndustryType;
  geography?: GeographyType;
  campaignDuration?: CampaignDuration;
  usageRights?: UsageRights;
  exclusivity?: Exclusivity;
  rushJob?: boolean;
  revisions?: number;
  currency?: CurrencyCode;
  saveCalculation?: boolean;
}

export interface CalculateResponse {
  calculationId: string;
  input: CalculationInput;
  results: PricingBreakdown;
  aiExplanation: AIExplanationResponse | null;
  quotaInfo: {
    used: number;
    limit: number;
    remaining: number;
    resetsAt: string;
  };
}

// ============================================
// Calculations History API
// ============================================

export interface GetCalculationsRequest {
  page?: number;
  limit?: number;
  savedOnly?: boolean;
  platform?: PlatformType;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'finalPrice' | 'platform';
  sortOrder?: 'asc' | 'desc';
}

export interface GetCalculationsResponse extends PaginatedResponse<CalculationResult> {}

export interface DeleteCalculationResponse {
  deleted: boolean;
  calculationId: string;
}

export interface SaveCalculationRequest {
  calculationId: string;
  saved: boolean;
}

export interface SaveCalculationResponse {
  calculationId: string;
  saved: boolean;
}

// ============================================
// Rate Cards API
// ============================================

export interface CreateRateCardRequest {
  creatorName: string;
  creatorHandle: string;
  platform: PlatformType;
  followers: number;
  engagementRate: number;
  niche: string;
  location: string;
  contactEmail: string;
  contactInfo?: string;
  brandGuidelines?: string;
  customRates?: {
    contentType: ContentType;
    price: number;
    description?: string;
  }[];
  packages?: {
    name: string;
    description: string;
    items: string[];
    price: number;
  }[];
  currency?: CurrencyCode;
}

export interface CreateRateCardResponse {
  rateCardId: string;
  pdfUrl: string;
  downloadUrl: string;
  expiresAt: string;
}

export interface GetRateCardsRequest {
  page?: number;
  limit?: number;
}

export interface GetRateCardsResponse extends PaginatedResponse<RateCard> {}

export interface DeleteRateCardResponse {
  deleted: boolean;
  rateCardId: string;
}

// ============================================
// Subscription API
// ============================================

export interface GetSubscriptionResponse {
  subscription: SubscriptionStatus;
  plans: SubscriptionPlan[];
}

export interface CreateCheckoutRequest {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutResponse {
  sessionId: string;
  checkoutUrl: string;
}

export interface CancelSubscriptionRequest {
  immediate?: boolean;
}

export interface CancelSubscriptionResponse {
  canceled: boolean;
  effectiveDate: string;
  message: string;
}

export interface UpdateSubscriptionRequest {
  planId: string;
  billingCycle?: 'monthly' | 'yearly';
}

export interface UpdateSubscriptionResponse {
  updated: boolean;
  subscription: SubscriptionStatus;
}

export interface GetInvoicesRequest {
  page?: number;
  limit?: number;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: CurrencyCode;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  createdAt: string;
  paidAt: string | null;
  pdfUrl: string | null;
  description: string;
}

export interface GetInvoicesResponse extends PaginatedResponse<Invoice> {}

// ============================================
// User API
// ============================================

export interface GetUserResponse {
  user: UserProfile;
  analytics: UserAnalytics;
}

export interface UpdateUserRequest {
  name?: string;
  avatarUrl?: string;
  settings?: {
    defaultCurrency?: CurrencyCode;
    defaultPlatform?: PlatformType;
    emailNotifications?: boolean;
    calculationAlerts?: boolean;
  };
}

export interface UpdateUserResponse {
  user: UserProfile;
}

export interface DeleteUserResponse {
  deleted: boolean;
  message: string;
}

// ============================================
// Platform API
// ============================================

export interface GetPlatformsResponse {
  platforms: {
    id: PlatformType;
    name: string;
    icon: string;
    contentTypes: {
      id: ContentType;
      name: string;
      multiplier: number;
    }[];
  }[];
}

export interface GetPlatformConfigResponse {
  platform: PlatformType;
  tiers: {
    id: CreatorTier;
    name: string;
    minFollowers: number;
    maxFollowers: number;
    baseRate: number;
  }[];
  contentTypes: {
    id: ContentType;
    name: string;
    multiplier: number;
    description: string;
  }[];
  engagementTiers: {
    min: number;
    max: number;
    multiplier: number;
    label: string;
  }[];
}

// ============================================
// Industry & Geography API
// ============================================

export interface GetIndustriesResponse {
  industries: {
    id: IndustryType;
    name: string;
    multiplier: number;
  }[];
}

export interface GetGeographiesResponse {
  geographies: {
    id: GeographyType;
    name: string;
    multiplier: number;
    currency: CurrencyCode;
  }[];
}

// ============================================
// AI API
// ============================================

export interface GenerateExplanationRequest {
  calculationId: string;
  context?: string;
}

export interface GenerateExplanationResponse {
  explanation: AIExplanationResponse;
}

// ============================================
// Analytics API
// ============================================

export interface GetAnalyticsResponse {
  analytics: UserAnalytics;
  trends: {
    platform: PlatformType;
    averagePrice: number;
    changePercent: number;
  }[];
}

// ============================================
// Webhook API (Internal)
// ============================================

export interface StripeWebhookRequest {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

export interface StripeWebhookResponse {
  received: boolean;
  eventType: string;
}

// ============================================
// Health Check API
// ============================================

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  services: {
    database: 'connected' | 'disconnected';
    stripe: 'connected' | 'disconnected';
    ai: 'connected' | 'disconnected';
  };
}
