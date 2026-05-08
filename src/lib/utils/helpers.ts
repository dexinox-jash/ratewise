// ============================================
// RateWise - Utility Functions
// ============================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  CurrencyCode, 
  PlatformType, 
  CreatorTier, 
  IndustryType, 
  GeographyType,
  UsageRights,
  Exclusivity,
  CampaignDuration,
  ContentType
} from '@/types';

// ============================================
// Tailwind Utilities
// ============================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// Number Formatting
// ============================================

export function formatNumber(num: number, decimals: number = 0): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(decimals)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(decimals)}K`;
  }
  return num.toFixed(decimals);
}

export function formatCurrency(
  amount: number, 
  currency: CurrencyCode = 'USD',
  options?: Intl.NumberFormatOptions
): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  });
  return formatter.format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatEngagementRate(rate: number): string {
  if (rate < 1) {
    return `${rate.toFixed(2)}%`;
  }
  return `${rate.toFixed(1)}%`;
}

// ============================================
// Follower Count Formatting
// ============================================

export function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export function parseFollowerString(str: string): number {
  const clean = str.toLowerCase().replace(/,/g, '').trim();
  
  if (clean.endsWith('m')) {
    return parseFloat(clean.slice(0, -1)) * 1000000;
  }
  if (clean.endsWith('k')) {
    return parseFloat(clean.slice(0, -1)) * 1000;
  }
  
  return parseInt(clean, 10) || 0;
}

// ============================================
// Date Formatting
// ============================================

export function formatDate(date: Date | string, format: 'short' | 'long' | 'relative' = 'long'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
  
  // Relative time
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getDaysUntilReset(resetDate: Date | string): number {
  const reset = typeof resetDate === 'string' ? new Date(resetDate) : resetDate;
  const now = new Date();
  const diffMs = reset.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// ============================================
// Platform Utilities
// ============================================

export function getPlatformDisplayName(platform: PlatformType): string {
  const names: Record<PlatformType, string> = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    twitter: 'Twitter/X',
    linkedin: 'LinkedIn',
    twitch: 'Twitch',
    pinterest: 'Pinterest',
    snapchat: 'Snapchat',
  };
  return names[platform] || platform;
}

export function getPlatformIcon(platform: PlatformType): string {
  const icons: Record<PlatformType, string> = {
    instagram: 'Instagram',
    tiktok: 'Music2',
    youtube: 'Youtube',
    twitter: 'Twitter',
    linkedin: 'Linkedin',
    twitch: 'Gamepad2',
    pinterest: 'Pin',
    snapchat: 'Ghost',
  };
  return icons[platform] || 'Globe';
}

export function getPlatformBaseUrl(platform: PlatformType): string {
  const urls: Record<PlatformType, string> = {
    instagram: 'https://instagram.com',
    tiktok: 'https://tiktok.com/@',
    youtube: 'https://youtube.com/@',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com/in',
    twitch: 'https://twitch.tv',
    pinterest: 'https://pinterest.com',
    snapchat: 'https://snapchat.com/add',
  };
  return urls[platform];
}

// ============================================
// Content Type Utilities
// ============================================

export function getContentTypeDisplayName(contentType: ContentType): string {
  const names: Record<ContentType, string> = {
    feed_post: 'Feed Post',
    story: 'Story',
    reel: 'Reel',
    video: 'Video',
    live: 'Live Stream',
    carousel: 'Carousel',
    long_form: 'Long Form Video',
    short: 'Short',
    tweet: 'Tweet',
    thread: 'Thread',
    article: 'Article',
    pin: 'Pin',
  };
  return names[contentType] || contentType;
}

// ============================================
// Tier Utilities
// ============================================

export function getTierDisplayName(tier: CreatorTier): string {
  const names: Record<CreatorTier, string> = {
    nano: 'Nano Influencer',
    micro: 'Micro Influencer',
    mid: 'Mid-Tier Influencer',
    macro: 'Macro Influencer',
    mega: 'Mega Influencer',
  };
  return names[tier] || tier;
}

export function getTierDescription(tier: CreatorTier): string {
  const descriptions: Record<CreatorTier, string> = {
    nano: '1K - 10K followers. High engagement, authentic connections.',
    micro: '10K - 100K followers. Strong niche authority.',
    mid: '100K - 500K followers. Professional content creators.',
    macro: '500K - 1M followers. Wide reach, established presence.',
    mega: '1M+ followers. Celebrity-level influence.',
  };
  return descriptions[tier] || '';
}

// ============================================
// Industry Utilities
// ============================================

export function getIndustryDisplayName(industry: IndustryType): string {
  const names: Record<IndustryType, string> = {
    fashion: 'Fashion & Style',
    beauty: 'Beauty & Cosmetics',
    tech: 'Technology',
    food: 'Food & Dining',
    travel: 'Travel & Tourism',
    fitness: 'Fitness & Wellness',
    gaming: 'Gaming & Esports',
    finance: 'Finance & Investing',
    education: 'Education & Learning',
    entertainment: 'Entertainment',
    lifestyle: 'Lifestyle',
    sports: 'Sports & Athletics',
    automotive: 'Automotive',
    health: 'Health & Medical',
    general: 'General',
  };
  return names[industry] || industry;
}

// ============================================
// Geography Utilities
// ============================================

export function getGeographyDisplayName(geography: GeographyType): string {
  const names: Record<GeographyType, string> = {
    us: 'United States',
    uk: 'United Kingdom',
    eu: 'European Union',
    ca: 'Canada',
    au: 'Australia',
    asia: 'Asia Pacific',
    latam: 'Latin America',
    mea: 'Middle East & Africa',
    global: 'Global',
  };
  return names[geography] || geography;
}

// ============================================
// Usage Rights & Exclusivity
// ============================================

export function getUsageRightsDisplayName(usage: UsageRights): string {
  const names: Record<UsageRights, string> = {
    '30_days': '30 Days',
    '90_days': '90 Days',
    '6_months': '6 Months',
    '1_year': '1 Year',
    'in perpetuity': 'In Perpetuity',
  };
  return names[usage] || usage;
}

export function getExclusivityDisplayName(exclusivity: Exclusivity): string {
  const names: Record<Exclusivity, string> = {
    none: 'No Exclusivity',
    category: 'Category Exclusivity',
    brand: 'Brand Exclusivity',
  };
  return names[exclusivity] || exclusivity;
}

export function getCampaignDurationDisplayName(duration: CampaignDuration): string {
  const names: Record<CampaignDuration, string> = {
    one_time: 'One-Time',
    short_term: 'Short Term (1-3 months)',
    long_term: 'Long Term (3-12 months)',
    ongoing: 'Ongoing Partnership',
  };
  return names[duration] || duration;
}

// ============================================
// Currency Utilities
// ============================================

export function getCurrencySymbol(currency: CurrencyCode): string {
  const symbols: Record<CurrencyCode, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
  };
  return symbols[currency] || '$';
}

export function convertCurrency(
  amount: number, 
  from: CurrencyCode, 
  to: CurrencyCode,
  rates: Record<CurrencyCode, number>
): number {
  if (from === to) return amount;
  
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;
  
  return (amount / fromRate) * toRate;
}

// ============================================
// Validation Utilities
// ============================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeString(str: string, maxLength: number = 500): string {
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '');
}

// ============================================
// Array Utilities
// ============================================

export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function uniqueArray<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// ============================================
// Object Utilities
// ============================================

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj } as Omit<T, K>;
  keys.forEach((key) => {
    delete (result as Record<string, unknown>)[key as string];
  });
  return result;
}

// ============================================
// Retry Utilities
// ============================================

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, backoffMultiplier = 2 } = options;
  
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(backoffMultiplier, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// ============================================
// ID Generation
// ============================================

export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================
// Quota Utilities
// ============================================

export function shouldResetQuota(resetAt: Date | string): boolean {
  const reset = typeof resetAt === 'string' ? new Date(resetAt) : resetAt;
  return new Date() >= reset;
}

export function getNextResetDate(): Date {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
}

// ============================================
// Error Handling
// ============================================

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

export function isApiError(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}
