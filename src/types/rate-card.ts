/**
 * Rate Card Type Definitions
 * TypeScript interfaces and types for rate card functionality
 */

// ============================================
// Core Rate Card Types
// ============================================

export interface RateCard {
  id: string;
  userId: string;
  title: string;
  description?: string;
  validUntil?: string;
  isPublic: boolean;
  aiInsights?: string;
  branding?: BrandingSettings;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RateCardItem {
  id: string;
  rateCardId: string;
  serviceName: string;
  description?: string | null;
  minPrice: number;
  maxPrice: number;
  unit?: string | null;
  category?: string | null;
  isPopular: boolean;
  isPremium: boolean;
  marketComparison?: 'above_market' | 'below_market' | 'at_market' | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandingSettings {
  companyName?: string;
  tagline?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
}

// ============================================
// Pricing Benchmark Types
// ============================================

export interface PricingBenchmark {
  id: string;
  category: string;
  serviceName: string;
  description?: string;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  medianPrice: number;
  unit: string;
  location: string;
  region: string;
  source: string;
  dataPoints: number;
  confidence: number;
  lastUpdated: string;
  tags: string[];
}

export interface BenchmarkComparison {
  itemId: string;
  serviceName: string;
  userPrice: number;
  marketAverage: number;
  marketMedian: number;
  marketMin: number;
  marketMax: number;
  percentile: number;
  comparison: 'above_market' | 'below_market' | 'at_market';
  difference: number;
  differencePercent: number;
}

// ============================================
// AI Explanation Types
// ============================================

export interface PriceExplanation {
  itemId: string;
  serviceName: string;
  explanation: string;
  factors: string[];
  marketPosition: 'premium' | 'competitive' | 'budget' | 'market_rate';
  confidence: number;
  recommendations: string[];
}

export interface MarketInsights {
  category: string;
  overview: string;
  trends: string[];
  opportunities: string[];
  risks: string[];
  recommendations: string[];
}

// ============================================
// API Request/Response Types
// ============================================

export interface CreateRateCardRequest {
  title: string;
  description?: string;
  validUntil?: string;
  isPublic?: boolean;
  items: CreateRateCardItemRequest[];
  branding?: BrandingSettings;
}

export interface CreateRateCardItemRequest {
  serviceName: string;
  description?: string;
  minPrice: number;
  maxPrice: number;
  unit?: string;
  category?: string;
  isPopular?: boolean;
  isPremium?: boolean;
  marketComparison?: 'above_market' | 'below_market' | 'at_market';
}

export interface UpdateRateCardRequest {
  title?: string;
  description?: string;
  validUntil?: string;
  isPublic?: boolean;
  items?: CreateRateCardItemRequest[];
  branding?: BrandingSettings;
}

export interface ExportRateCardRequest {
  branding?: BrandingSettings;
  format?: 'pdf' | 'html';
}

export interface RateCardResponse {
  rateCard: RateCard & { items: RateCardItem[] };
}

export interface RateCardsListResponse {
  rateCards: (RateCard & { items: RateCardItem[] })[];
  total: number;
  page: number;
  limit: number;
}

// ============================================
// PDF Generation Types
// ============================================

export interface PDFGenerationOptions {
  rateCard: RateCard;
  items: RateCardItem[];
  branding: BrandingSettings;
  isPaidUser: boolean;
  watermark?: string;
}

export interface PDFGenerationResult {
  pdfBuffer: Buffer;
  fileName: string;
  pageCount: number;
}

export interface PDFTemplateOptions {
  headerEnabled: boolean;
  footerEnabled: boolean;
  showPageNumbers: boolean;
  colorScheme: 'default' | 'custom';
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// ============================================
// Filter and Sort Types
// ============================================

export interface RateCardFilters {
  search?: string;
  category?: string;
  status?: 'draft' | 'public' | 'expired';
  dateFrom?: string;
  dateTo?: string;
}

export type RateCardSortField = 'title' | 'createdAt' | 'updatedAt' | 'validUntil';
export type SortOrder = 'asc' | 'desc';

export interface RateCardSort {
  field: RateCardSortField;
  order: SortOrder;
}

// ============================================
// Subscription and Usage Types
// ============================================

export interface RateCardUsage {
  userId: string;
  totalRateCards: number;
  publicRateCards: number;
  expiredRateCards: number;
  totalServices: number;
  pdfsGenerated: number;
  lastGeneratedAt?: string;
}

export interface RateCardLimits {
  maxRateCards: number;
  maxServicesPerCard: number;
  canRemoveWatermark: boolean;
  canUseCustomBranding: boolean;
  canUseAIInsights: boolean;
  canExportHTML: boolean;
}

// ============================================
// Template Types
// ============================================

export interface RateCardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnailUrl?: string;
  isDefault: boolean;
  layout: 'classic' | 'modern' | 'minimal' | 'professional';
  presetItems?: Partial<RateCardItem>[];
}

// ============================================
// Analytics Types
// ============================================

export interface RateCardAnalytics {
  rateCardId: string;
  views: number;
  downloads: number;
  uniqueVisitors: number;
  averageTimeOnPage: number;
  topServices: Array<{
    serviceName: string;
    views: number;
  }>;
  geographicData: Array<{
    country: string;
    views: number;
  }>;
}

// ============================================
// Form Types
// ============================================

export interface RateCardFormData {
  title: string;
  description: string;
  validUntil: string;
  isPublic: boolean;
  items: RateCardItemFormData[];
}

export interface RateCardItemFormData {
  id?: string;
  serviceName: string;
  description: string;
  minPrice: string;
  maxPrice: string;
  unit: string;
  category: string;
  isPopular: boolean;
  isPremium: boolean;
}

// ============================================
// Utility Types
// ============================================

export type MarketComparisonType = 'above_market' | 'below_market' | 'at_market';

export interface PriceRange {
  min: number;
  max: number;
}

export interface CategorySummary {
  category: string;
  itemCount: number;
  averageMinPrice: number;
  averageMaxPrice: number;
  totalValue: number;
}

export interface RateCardSummary {
  totalItems: number;
  totalCategories: number;
  priceRange: PriceRange;
  averagePrice: number;
  medianPrice: number;
  categorySummaries: CategorySummary[];
}
