/**
 * PDF Generator for RateWise Rate Cards
 * Uses Puppeteer for server-side PDF generation with professional templates
 */

import puppeteer from 'puppeteer';
import { RateCard, RateCardItem, BrandingSettings } from '@/types/rate-card';
import { formatCurrency, formatDate } from './formatters';

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

/**
 * Generate a professional rate card PDF
 */
export async function generateRateCardPDF(
  options: PDFGenerationOptions
): Promise<PDFGenerationResult> {
  const { rateCard, items, branding, isPaidUser, watermark = 'RateWise' } = options;

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();

    // Generate HTML content
    const htmlContent = generateRateCardHTML({
      rateCard,
      items,
      branding,
      isPaidUser,
      watermark,
    });

    // Set page content
    await page.setContent(htmlContent, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
    });

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
      preferCSSPageSize: true,
    });

    // Get page count
    const pageCount = await page.evaluate(() => {
      return document.querySelectorAll('.page').length;
    });

    const fileName = `${rateCard.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;

    return {
      pdfBuffer: Buffer.from(pdfBuffer),
      fileName,
      pageCount,
    };
  } finally {
    await browser.close();
  }
}

/**
 * Generate HTML template for rate card
 */
function generateRateCardHTML(options: {
  rateCard: RateCard;
  items: RateCardItem[];
  branding: BrandingSettings;
  isPaidUser: boolean;
  watermark: string;
}): string {
  const { rateCard, items, branding, isPaidUser, watermark } = options;

  const primaryColor = branding.primaryColor || '#3B82F6';
  const secondaryColor = branding.secondaryColor || '#1E40AF';
  const accentColor = branding.accentColor || '#10B981';

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Services';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, RateCardItem[]>);

  const watermarkStyle = !isPaidUser
    ? `
    <div class="watermark">
      <span>${watermark}</span>
    </div>
  `
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${rateCard.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1f2937;
      background: white;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      position: relative;
      page-break-after: always;
      background: white;
    }

    .page:last-child {
      page-break-after: auto;
    }

    ${!isPaidUser ? `
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 72pt;
      font-weight: 800;
      color: rgba(0, 0, 0, 0.05);
      pointer-events: none;
      z-index: 1000;
      white-space: nowrap;
      letter-spacing: 0.2em;
    }
    ` : ''}

    /* Header Section */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid ${primaryColor};
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
      border-radius: 8px;
    }

    .company-info h1 {
      font-size: 24pt;
      font-weight: 700;
      color: ${primaryColor};
      margin-bottom: 5px;
    }

    .company-info .tagline {
      font-size: 10pt;
      color: #6b7280;
      font-style: italic;
    }

    .rate-card-badge {
      background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      text-align: center;
    }

    .rate-card-badge .label {
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.9;
    }

    .rate-card-badge .title {
      font-size: 14pt;
      font-weight: 700;
    }

    /* Title Section */
    .title-section {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #f8fafc, #e2e8f0);
      border-radius: 12px;
    }

    .title-section h2 {
      font-size: 28pt;
      font-weight: 800;
      color: ${primaryColor};
      margin-bottom: 10px;
    }

    .title-section .subtitle {
      font-size: 12pt;
      color: #6b7280;
    }

    .title-section .meta {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 15px;
      font-size: 9pt;
      color: #9ca3af;
    }

    .title-section .meta span {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* Description Section */
    .description {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid ${accentColor};
    }

    .description h3 {
      font-size: 12pt;
      font-weight: 600;
      color: ${secondaryColor};
      margin-bottom: 10px;
    }

    .description p {
      font-size: 10pt;
      color: #4b5563;
      line-height: 1.6;
    }

    /* Category Sections */
    .category {
      margin-bottom: 30px;
    }

    .category-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid ${primaryColor};
    }

    .category-header h3 {
      font-size: 14pt;
      font-weight: 700;
      color: ${secondaryColor};
    }

    .category-header .count {
      background: ${primaryColor};
      color: white;
      font-size: 8pt;
      padding: 2px 8px;
      border-radius: 10px;
    }

    /* Service Items */
    .service-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 15px;
      margin-bottom: 10px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .service-item:hover {
      border-color: ${primaryColor};
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
    }

    .service-info {
      flex: 1;
      padding-right: 20px;
    }

    .service-info h4 {
      font-size: 11pt;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 5px;
    }

    .service-info .description {
      font-size: 9pt;
      color: #6b7280;
      background: none;
      padding: 0;
      border: none;
      margin: 0;
    }

    .service-info .tags {
      display: flex;
      gap: 5px;
      margin-top: 8px;
      flex-wrap: wrap;
    }

    .tag {
      font-size: 7pt;
      padding: 2px 6px;
      border-radius: 4px;
      background: #e5e7eb;
      color: #4b5563;
    }

    .tag.popular {
      background: ${accentColor};
      color: white;
    }

    .tag.premium {
      background: #f59e0b;
      color: white;
    }

    .service-pricing {
      text-align: right;
      min-width: 150px;
    }

    .price-range {
      font-size: 14pt;
      font-weight: 700;
      color: ${primaryColor};
    }

    .price-range .currency {
      font-size: 10pt;
      font-weight: 500;
    }

    .price-unit {
      font-size: 8pt;
      color: #9ca3af;
      margin-top: 2px;
    }

    .market-comparison {
      font-size: 8pt;
      margin-top: 5px;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
    }

    .market-comparison.above {
      background: #fef3c7;
      color: #92400e;
    }

    .market-comparison.below {
      background: #d1fae5;
      color: #065f46;
    }

    .market-comparison.at-market {
      background: #dbeafe;
      color: #1e40af;
    }

    /* Summary Section */
    .summary-section {
      background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
      color: white;
      padding: 25px;
      border-radius: 12px;
      margin-top: 30px;
    }

    .summary-section h3 {
      font-size: 14pt;
      font-weight: 700;
      margin-bottom: 15px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .summary-item {
      text-align: center;
      padding: 15px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }

    .summary-item .value {
      font-size: 20pt;
      font-weight: 700;
    }

    .summary-item .label {
      font-size: 9pt;
      opacity: 0.9;
      margin-top: 5px;
    }

    /* Contact Section */
    .contact-section {
      margin-top: 30px;
      padding: 25px;
      background: #f8fafc;
      border-radius: 12px;
      border: 2px solid ${primaryColor};
    }

    .contact-section h3 {
      font-size: 14pt;
      font-weight: 700;
      color: ${secondaryColor};
      margin-bottom: 15px;
      text-align: center;
    }

    .contact-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      background: white;
      border-radius: 8px;
    }

    .contact-item .icon {
      width: 36px;
      height: 36px;
      background: ${primaryColor};
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14pt;
    }

    .contact-item .info {
      flex: 1;
    }

    .contact-item .label {
      font-size: 8pt;
      color: #9ca3af;
      text-transform: uppercase;
    }

    .contact-item .value {
      font-size: 10pt;
      font-weight: 600;
      color: #1f2937;
    }

    /* Footer */
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }

    .footer p {
      font-size: 8pt;
      color: #9ca3af;
    }

    .footer .powered-by {
      margin-top: 10px;
      font-size: 8pt;
      color: #d1d5db;
    }

    /* Notes Section */
    .notes-section {
      margin-top: 20px;
      padding: 15px;
      background: #fef3c7;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
    }

    .notes-section h4 {
      font-size: 10pt;
      font-weight: 600;
      color: #92400e;
      margin-bottom: 8px;
    }

    .notes-section ul {
      font-size: 9pt;
      color: #92400e;
      padding-left: 20px;
    }

    .notes-section li {
      margin-bottom: 4px;
    }

    /* AI Insights Section */
    .ai-insights {
      margin-top: 20px;
      padding: 20px;
      background: linear-gradient(135deg, #ede9fe, #ddd6fe);
      border-radius: 12px;
      border: 1px solid #c4b5fd;
    }

    .ai-insights h4 {
      font-size: 11pt;
      font-weight: 700;
      color: #5b21b6;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ai-insights p {
      font-size: 9pt;
      color: #6d28d9;
      line-height: 1.6;
    }

    /* Print optimizations */
    @media print {
      .page {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  ${watermarkStyle}
  
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="logo-section">
        ${branding.logoUrl ? `<img src="${branding.logoUrl}" alt="Logo" class="logo" />` : ''}
        <div class="company-info">
          <h1>${branding.companyName || 'Your Company'}</h1>
          ${branding.tagline ? `<p class="tagline">${branding.tagline}</p>` : ''}
        </div>
      </div>
      <div class="rate-card-badge">
        <div class="label">Rate Card</div>
        <div class="title">${rateCard.title}</div>
      </div>
    </div>

    <!-- Title Section -->
    <div class="title-section">
      <h2>${rateCard.title}</h2>
      ${rateCard.description ? `<p class="subtitle">${rateCard.description}</p>` : ''}
      <div class="meta">
        <span>📅 Valid until: ${formatDate(rateCard.validUntil || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))}</span>
        <span>📋 ${items.length} services</span>
        <span>🏷️ ${Object.keys(groupedItems).length} categories</span>
      </div>
    </div>

    <!-- Description -->
    ${rateCard.description ? `
    <div class="description">
      <h3>About This Rate Card</h3>
      <p>${rateCard.description}</p>
    </div>
    ` : ''}

    <!-- Service Categories -->
    ${Object.entries(groupedItems)
      .map(
        ([category, categoryItems]) => `
      <div class="category">
        <div class="category-header">
          <h3>${category}</h3>
          <span class="count">${categoryItems.length}</span>
        </div>
        ${categoryItems
          .map(
            (item) => `
          <div class="service-item">
            <div class="service-info">
              <h4>${item.serviceName}</h4>
              ${item.description ? `<p class="description">${item.description}</p>` : ''}
              <div class="tags">
                ${item.isPopular ? '<span class="tag popular">⭐ Popular</span>' : ''}
                ${item.isPremium ? '<span class="tag premium">💎 Premium</span>' : ''}
                ${item.unit ? `<span class="tag">${item.unit}</span>` : ''}
              </div>
            </div>
            <div class="service-pricing">
              <div class="price-range">
                <span class="currency">$</span>${formatPrice(item.minPrice)} - ${formatPrice(item.maxPrice)}
              </div>
              ${item.unit ? `<div class="price-unit">per ${item.unit}</div>` : ''}
              ${item.marketComparison ? `
                <div class="market-comparison ${getComparisonClass(item.marketComparison)}">
                  ${getComparisonText(item.marketComparison)}
                </div>
              ` : ''}
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `
      )
      .join('')}

    <!-- Summary Section -->
    <div class="summary-section">
      <h3>📊 Pricing Summary</h3>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="value">${items.length}</div>
          <div class="label">Total Services</div>
        </div>
        <div class="summary-item">
          <div class="value">$${formatPrice(Math.min(...items.map((i) => i.minPrice)))}</div>
          <div class="label">Starting Price</div>
        </div>
        <div class="summary-item">
          <div class="value">$${formatPrice(items.reduce((sum, i) => sum + i.maxPrice, 0) / items.length)}</div>
          <div class="label">Average Price</div>
        </div>
      </div>
    </div>

    <!-- AI Insights (if available) -->
    ${rateCard.aiInsights ? `
    <div class="ai-insights">
      <h4>🤖 AI Market Insights</h4>
      <p>${rateCard.aiInsights}</p>
    </div>
    ` : ''}

    <!-- Notes Section -->
    <div class="notes-section">
      <h4>📝 Important Notes</h4>
      <ul>
        <li>All prices are in USD and subject to change without notice</li>
        <li>Prices may vary based on project complexity and requirements</li>
        <li>Contact us for custom quotes and bulk pricing</li>
        <li>Payment terms: Net 30 days unless otherwise specified</li>
      </ul>
    </div>

    <!-- Contact Section -->
    <div class="contact-section">
      <h3>📞 Get In Touch</h3>
      <div class="contact-grid">
        ${branding.contactEmail ? `
        <div class="contact-item">
          <div class="icon">✉️</div>
          <div class="info">
            <div class="label">Email</div>
            <div class="value">${branding.contactEmail}</div>
          </div>
        </div>
        ` : ''}
        ${branding.contactPhone ? `
        <div class="contact-item">
          <div class="icon">📞</div>
          <div class="info">
            <div class="label">Phone</div>
            <div class="value">${branding.contactPhone}</div>
          </div>
        </div>
        ` : ''}
        ${branding.website ? `
        <div class="contact-item">
          <div class="icon">🌐</div>
          <div class="info">
            <div class="label">Website</div>
            <div class="value">${branding.website}</div>
          </div>
        </div>
        ` : ''}
        ${branding.address ? `
        <div class="contact-item">
          <div class="icon">📍</div>
          <div class="info">
            <div class="label">Address</div>
            <div class="value">${branding.address}</div>
          </div>
        </div>
        ` : ''}
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>This rate card was generated on ${formatDate(new Date())} and is valid until ${formatDate(rateCard.validUntil || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))}</p>
      <p class="powered-by">Powered by RateWise - Professional Pricing Intelligence</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Format price with appropriate decimals
 */
function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Get comparison CSS class
 */
function getComparisonClass(comparison: string): string {
  switch (comparison) {
    case 'above_market':
      return 'above';
    case 'below_market':
      return 'below';
    default:
      return 'at-market';
  }
}

/**
 * Get comparison display text
 */
function getComparisonText(comparison: string): string {
  switch (comparison) {
    case 'above_market':
      return '↑ Above Market';
    case 'below_market':
      return '↓ Below Market';
    default:
      return '→ At Market';
  }
}

/**
 * Generate a simple PDF from HTML string (for custom templates)
 */
export async function generateCustomPDF(
  htmlContent: string,
  options: {
    fileName?: string;
    format?: 'A4' | 'Letter' | 'Legal';
  } = {}
): Promise<PDFGenerationResult> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');

    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    });

    const pageCount = await page.evaluate(() =>
      document.querySelectorAll('.page').length
    );

    return {
      pdfBuffer: Buffer.from(pdfBuffer),
      fileName: options.fileName || `document-${Date.now()}.pdf`,
      pageCount,
    };
  } finally {
    await browser.close();
  }
}

/**
 * Validate PDF generation options
 */
export function validatePDFOptions(options: PDFGenerationOptions): string[] {
  const errors: string[] = [];

  if (!options.rateCard) {
    errors.push('Rate card is required');
  }

  if (!options.items || options.items.length === 0) {
    errors.push('At least one rate card item is required');
  }

  if (!options.branding) {
    errors.push('Branding settings are required');
  }

  return errors;
}

export default generateRateCardPDF;
