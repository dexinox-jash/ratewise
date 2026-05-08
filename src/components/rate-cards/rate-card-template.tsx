'use client';

/**
 * Rate Card Template Component
 * Provides a live preview of the rate card before PDF generation
 */

import React from 'react';
import { RateCard, RateCardItem, BrandingSettings } from '@/types/rate-card';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import '@/styles/rate-card.css';

interface RateCardTemplateProps {
  rateCard: RateCard;
  items: RateCardItem[];
  branding: BrandingSettings;
  isPaidUser?: boolean;
  showWatermark?: boolean;
  className?: string;
}

interface GroupedItems {
  [category: string]: RateCardItem[];
}

export function RateCardTemplate({
  rateCard,
  items,
  branding,
  isPaidUser = false,
  showWatermark = true,
  className = '',
}: RateCardTemplateProps) {
  // Group items by category
  const groupedItems = React.useMemo(() => {
    return items.reduce((acc, item) => {
      const category = item.category || 'Services';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as GroupedItems);
  }, [items]);

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    if (items.length === 0) {
      return { totalServices: 0, startingPrice: 0, averagePrice: 0 };
    }
    const minPrices = items.map((i) => i.minPrice);
    const avgPrices = items.map((i) => (i.minPrice + i.maxPrice) / 2);
    return {
      totalServices: items.length,
      startingPrice: Math.min(...minPrices),
      averagePrice: avgPrices.reduce((a, b) => a + b, 0) / avgPrices.length,
    };
  }, [items]);

  const shouldShowWatermark = !isPaidUser && showWatermark;

  return (
    <div className={`rate-card-preview ${className}`}>
      <div
        className={`rate-card-document ${
          shouldShowWatermark ? 'rate-card-document--watermarked' : ''
        }`}
      >
        {/* Header */}
        <header className="rate-card-header">
          <div className="rate-card-header__brand">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={`${branding.companyName} logo`}
                className="rate-card-header__logo"
              />
            ) : (
              <div
                className="rate-card-header__logo"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: branding.primaryColor || '#3B82F6',
                  color: 'white',
                  fontSize: '24pt',
                  fontWeight: 700,
                }}
              >
                {(branding.companyName || 'C').charAt(0)}
              </div>
            )}
            <div className="rate-card-header__company">
              <h1>{branding.companyName || 'Your Company'}</h1>
              {branding.tagline && (
                <p className="rate-card-header__tagline">{branding.tagline}</p>
              )}
            </div>
          </div>
          <div className="rate-card-header__badge">
            <span className="rate-card-header__badge-label">Rate Card</span>
            <span className="rate-card-header__badge-title">
              {rateCard.title}
            </span>
          </div>
        </header>

        {/* Title Section */}
        <section className="rate-card-title-section">
          <h2>{rateCard.title}</h2>
          {rateCard.description && (
            <p className="rate-card-title-section__subtitle">
              {rateCard.description}
            </p>
          )}
          <div className="rate-card-title-section__meta">
            <span className="rate-card-title-section__meta-item">
              <span>📅</span>
              <span>
                Valid until:{' '}
                {formatDate(
                  rateCard.validUntil ||
                    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                )}
              </span>
            </span>
            <span className="rate-card-title-section__meta-item">
              <span>📋</span>
              <span>{items.length} services</span>
            </span>
            <span className="rate-card-title-section__meta-item">
              <span>🏷️</span>
              <span>{Object.keys(groupedItems).length} categories</span>
            </span>
          </div>
        </section>

        {/* Description */}
        {rateCard.description && (
          <section className="rate-card-description">
            <h3>About This Rate Card</h3>
            <p>{rateCard.description}</p>
          </section>
        )}

        {/* Service Categories */}
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <section key={category} className="rate-card-category">
            <div className="rate-card-category__header">
              <h3>{category}</h3>
              <span className="rate-card-category__count">
                {categoryItems.length}
              </span>
            </div>
            {categoryItems.map((item) => (
              <ServiceItem key={item.id} item={item} />
            ))}
          </section>
        ))}

        {/* Summary Section */}
        <section className="rate-card-summary">
          <h3>📊 Pricing Summary</h3>
          <div className="rate-card-summary__grid">
            <div className="rate-card-summary__item">
              <div className="rate-card-summary__value">
                {summaryStats.totalServices}
              </div>
              <div className="rate-card-summary__label">Total Services</div>
            </div>
            <div className="rate-card-summary__item">
              <div className="rate-card-summary__value">
                {formatCurrency(summaryStats.startingPrice)}
              </div>
              <div className="rate-card-summary__label">Starting Price</div>
            </div>
            <div className="rate-card-summary__item">
              <div className="rate-card-summary__value">
                {formatCurrency(summaryStats.averagePrice)}
              </div>
              <div className="rate-card-summary__label">Average Price</div>
            </div>
          </div>
        </section>

        {/* AI Insights */}
        {rateCard.aiInsights && (
          <section className="rate-card-ai-insights">
            <h4>
              <span>🤖</span> AI Market Insights
            </h4>
            <p>{rateCard.aiInsights}</p>
          </section>
        )}

        {/* Notes Section */}
        <section className="rate-card-notes">
          <h4>📝 Important Notes</h4>
          <ul>
            <li>All prices are in USD and subject to change without notice</li>
            <li>
              Prices may vary based on project complexity and requirements
            </li>
            <li>Contact us for custom quotes and bulk pricing</li>
            <li>Payment terms: Net 30 days unless otherwise specified</li>
          </ul>
        </section>

        {/* Contact Section */}
        <ContactSection branding={branding} />

        {/* Footer */}
        <footer className="rate-card-footer">
          <p>
            This rate card was generated on {formatDate(new Date())} and is
            valid until{' '}
            {formatDate(
              rateCard.validUntil ||
                new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            )}
          </p>
          <p className="rate-card-footer__powered">
            Powered by RateWise - Professional Pricing Intelligence
          </p>
        </footer>
      </div>
    </div>
  );
}

/**
 * Service Item Component
 */
function ServiceItem({ item }: { item: RateCardItem }) {
  const getComparisonClass = (comparison?: string) => {
    switch (comparison) {
      case 'above_market':
        return 'rate-card-service__comparison--above';
      case 'below_market':
        return 'rate-card-service__comparison--below';
      default:
        return 'rate-card-service__comparison--at-market';
    }
  };

  const getComparisonText = (comparison?: string) => {
    switch (comparison) {
      case 'above_market':
        return '↑ Above Market';
      case 'below_market':
        return '↓ Below Market';
      default:
        return '→ At Market';
    }
  };

  return (
    <div className="rate-card-service">
      <div className="rate-card-service__info">
        <h4>{item.serviceName}</h4>
        {item.description && (
          <p className="rate-card-service__description">{item.description}</p>
        )}
        <div className="rate-card-service__tags">
          {item.isPopular && (
            <span className="rate-card-service__tag rate-card-service__tag--popular">
              ⭐ Popular
            </span>
          )}
          {item.isPremium && (
            <span className="rate-card-service__tag rate-card-service__tag--premium">
              💎 Premium
            </span>
          )}
          {item.unit && <span className="rate-card-service__tag">{item.unit}</span>}
        </div>
      </div>
      <div className="rate-card-service__pricing">
        <div className="rate-card-service__price-range">
          <span className="currency">$</span>
          {formatPrice(item.minPrice)} - {formatPrice(item.maxPrice)}
        </div>
        {item.unit && (
          <div className="rate-card-service__price-unit">per {item.unit}</div>
        )}
        {item.marketComparison && (
          <div
            className={`rate-card-service__comparison ${getComparisonClass(
              item.marketComparison
            )}`}
          >
            {getComparisonText(item.marketComparison)}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Contact Section Component
 */
function ContactSection({ branding }: { branding: BrandingSettings }) {
  const hasContactInfo =
    branding.contactEmail ||
    branding.contactPhone ||
    branding.website ||
    branding.address;

  if (!hasContactInfo) return null;

  return (
    <section className="rate-card-contact">
      <h3>📞 Get In Touch</h3>
      <div className="rate-card-contact__grid">
        {branding.contactEmail && (
          <div className="rate-card-contact__item">
            <div className="rate-card-contact__icon">✉️</div>
            <div className="rate-card-contact__info">
              <span className="rate-card-contact__label">Email</span>
              <span className="rate-card-contact__value">
                {branding.contactEmail}
              </span>
            </div>
          </div>
        )}
        {branding.contactPhone && (
          <div className="rate-card-contact__item">
            <div className="rate-card-contact__icon">📞</div>
            <div className="rate-card-contact__info">
              <span className="rate-card-contact__label">Phone</span>
              <span className="rate-card-contact__value">
                {branding.contactPhone}
              </span>
            </div>
          </div>
        )}
        {branding.website && (
          <div className="rate-card-contact__item">
            <div className="rate-card-contact__icon">🌐</div>
            <div className="rate-card-contact__info">
              <span className="rate-card-contact__label">Website</span>
              <span className="rate-card-contact__value">
                {branding.website}
              </span>
            </div>
          </div>
        )}
        {branding.address && (
          <div className="rate-card-contact__item">
            <div className="rate-card-contact__icon">📍</div>
            <div className="rate-card-contact__info">
              <span className="rate-card-contact__label">Address</span>
              <span className="rate-card-contact__value">
                {branding.address}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Format price with appropriate decimals
 */
function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default RateCardTemplate;
