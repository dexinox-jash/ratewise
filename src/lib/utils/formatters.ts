/**
 * Formatting Utilities for RateWise
 * Helper functions for formatting currency, dates, and other values
 */

// ============================================
// Currency Formatters
// ============================================

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  options: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Format a price range
 */
export function formatPriceRange(
  min: number,
  max: number,
  options: {
    currency?: string;
    locale?: string;
  } = {}
): string {
  const { currency = 'USD', locale = 'en-US' } = options;

  if (min === max) {
    return formatCurrency(min, { currency, locale });
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return `${formatter.format(min)} - ${formatter.format(max)}`;
}

/**
 * Format a compact currency (e.g., $1.2K, $1M)
 */
export function formatCompactCurrency(
  amount: number,
  options: {
    currency?: string;
    locale?: string;
  } = {}
): string {
  const { currency = 'USD', locale = 'en-US' } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Format a number with appropriate decimal places
 */
export function formatNumber(
  value: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
  } = {}
): string {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    locale = 'en-US',
  } = options;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

// ============================================
// Date Formatters
// ============================================

/**
 * Format a date
 */
export function formatDate(
  date: Date | string | number,
  options: {
    format?: 'short' | 'medium' | 'long' | 'relative';
    locale?: string;
  } = {}
): string {
  const { format = 'medium', locale = 'en-US' } = options;
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;

  if (format === 'relative') {
    return formatRelativeDate(dateObj);
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
  }[format];

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
}

/**
 * Format a date with time
 */
export function formatDateTime(
  date: Date | string | number,
  options: {
    locale?: string;
  } = {}
): string {
  const { locale = 'en-US' } = options;
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Format a relative date (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeDate(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;
  
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffSecs) < 60) {
    return rtf.format(diffSecs, 'second');
  } else if (Math.abs(diffMins) < 60) {
    return rtf.format(diffMins, 'minute');
  } else if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour');
  } else if (Math.abs(diffDays) < 30) {
    return rtf.format(diffDays, 'day');
  } else if (Math.abs(diffDays) < 365) {
    return rtf.format(Math.round(diffDays / 30), 'month');
  } else {
    return rtf.format(Math.round(diffDays / 365), 'year');
  }
}

/**
 * Check if a date is expired
 */
export function isExpired(date: Date | string | number): boolean {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;
  return dateObj.getTime() < Date.now();
}

/**
 * Get days until expiration
 */
export function getDaysUntilExpiration(date: Date | string | number): number {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;
  const diffMs = dateObj.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// ============================================
// String Formatters
// ============================================

/**
 * Truncate a string
 */
export function truncate(
  str: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Convert a string to slug format
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Capitalize the first letter of each word
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format a phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

// ============================================
// Number Formatters
// ============================================

/**
 * Format a percentage
 */
export function formatPercentage(
  value: number,
  options: {
    decimals?: number;
    locale?: string;
  } = {}
): string {
  const { decimals = 0, locale = 'en-US' } = options;

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format a number with units (K, M, B)
 */
export function formatWithUnits(
  value: number,
  options: {
    decimals?: number;
  } = {}
): string {
  const { decimals = 1 } = options;

  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(decimals)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(decimals)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(decimals)}K`;
  }
  return value.toString();
}

// ============================================
// File Formatters
// ============================================

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ============================================
// Color Formatters
// ============================================

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Lighten or darken a color
 */
export function adjustColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const { r, g, b } = rgb;
  const adjustedR = Math.min(255, Math.max(0, r + (r * percent) / 100));
  const adjustedG = Math.min(255, Math.max(0, g + (g * percent) / 100));
  const adjustedB = Math.min(255, Math.max(0, b + (b * percent) / 100));

  return rgbToHex(Math.round(adjustedR), Math.round(adjustedG), Math.round(adjustedB));
}

// ============================================
// Export default
// ============================================

export default {
  formatCurrency,
  formatPriceRange,
  formatCompactCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  formatRelativeDate,
  isExpired,
  getDaysUntilExpiration,
  truncate,
  slugify,
  titleCase,
  formatPhoneNumber,
  formatPercentage,
  formatWithUnits,
  formatFileSize,
  hexToRgb,
  rgbToHex,
  adjustColor,
};
