/**
 * Stripe Products Setup Script
 * Creates Stripe products and prices for RateWise subscription plans
 * 
 * Usage: npx ts-node scripts/setup-stripe.ts
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ Missing STRIPE_SECRET_KEY environment variable');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
});

// Plan configurations
interface PlanConfig {
  name: string;
  description: string;
  features: string[];
  monthlyPrice: number;
  yearlyPrice: number;
  metadata: Record<string, string>;
}

const plans: PlanConfig[] = [
  {
    name: 'Free',
    description: 'Get started with basic pricing tools',
    features: [
      '3 rate cards',
      'Basic PDF export (with watermark)',
      'Limited pricing benchmarks',
      'Community support',
    ],
    monthlyPrice: 0,
    yearlyPrice: 0,
    metadata: {
      plan_type: 'free',
      rate_cards_limit: '3',
      ai_insights: 'false',
      watermark: 'true',
      custom_branding: 'false',
    },
  },
  {
    name: 'Pro',
    description: 'Perfect for freelancers and small businesses',
    features: [
      'Unlimited rate cards',
      'PDF export (no watermark)',
      'Full pricing benchmarks',
      'AI price insights',
      'Custom branding',
      'Priority support',
    ],
    monthlyPrice: 2900, // $29.00
    yearlyPrice: 29000, // $290.00 (2 months free)
    metadata: {
      plan_type: 'pro',
      rate_cards_limit: 'unlimited',
      ai_insights: 'true',
      watermark: 'false',
      custom_branding: 'true',
    },
  },
  {
    name: 'Enterprise',
    description: 'For teams and agencies with advanced needs',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'API access',
      'White-label options',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    monthlyPrice: 9900, // $99.00
    yearlyPrice: 99000, // $990.00 (2 months free)
    metadata: {
      plan_type: 'enterprise',
      rate_cards_limit: 'unlimited',
      ai_insights: 'true',
      watermark: 'false',
      custom_branding: 'true',
      team_collaboration: 'true',
      api_access: 'true',
    },
  },
];

async function setupStripeProducts() {
  console.log('🏗️  Setting up Stripe products and prices...\n');

  const createdProducts: Array<{
    name: string;
    productId: string;
    monthlyPriceId?: string;
    yearlyPriceId?: string;
  }> = [];

  for (const plan of plans) {
    console.log(`\n📦 Processing plan: ${plan.name}`);

    try {
      // Check if product already exists
      const existingProducts = await stripe.products.list({
        limit: 10,
      });

      const existingProduct = existingProducts.data.find(
        (p) => p.name === `RateWise ${plan.name}`
      );

      let product: Stripe.Product;

      if (existingProduct) {
        console.log(`  ℹ️  Product already exists: ${existingProduct.id}`);
        product = existingProduct;

        // Update product if needed
        product = await stripe.products.update(product.id, {
          description: plan.description,
          metadata: plan.metadata,
        });
        console.log(`  ✅ Product updated`);
      } else {
        // Create new product
        product = await stripe.products.create({
          name: `RateWise ${plan.name}`,
          description: plan.description,
          metadata: plan.metadata,
        });
        console.log(`  ✅ Product created: ${product.id}`);
      }

      const productEntry: typeof createdProducts[0] = {
        name: plan.name,
        productId: product.id,
      };

      // Create monthly price (skip for free plan)
      if (plan.monthlyPrice > 0) {
        const monthlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.monthlyPrice,
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
          metadata: {
            ...plan.metadata,
            billing_interval: 'monthly',
          },
        });
        console.log(`  ✅ Monthly price created: ${monthlyPrice.id}`);
        productEntry.monthlyPriceId = monthlyPrice.id;
      }

      // Create yearly price (skip for free plan)
      if (plan.yearlyPrice > 0) {
        const yearlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.yearlyPrice,
          currency: 'usd',
          recurring: {
            interval: 'year',
          },
          metadata: {
            ...plan.metadata,
            billing_interval: 'yearly',
          },
        });
        console.log(`  ✅ Yearly price created: ${yearlyPrice.id}`);
        productEntry.yearlyPriceId = yearlyPrice.id;
      }

      createdProducts.push(productEntry);

    } catch (error) {
      console.error(`  ❌ Error processing ${plan.name}:`, error);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SETUP SUMMARY');
  console.log('='.repeat(60));

  for (const product of createdProducts) {
    console.log(`\n${product.name}:`);
    console.log(`  Product ID: ${product.productId}`);
    if (product.monthlyPriceId) {
      console.log(`  Monthly Price ID: ${product.monthlyPriceId}`);
    }
    if (product.yearlyPriceId) {
      console.log(`  Yearly Price ID: ${product.yearlyPriceId}`);
    }
  }

  // Generate environment variables output
  console.log('\n' + '='.repeat(60));
  console.log('🔧 ENVIRONMENT VARIABLES');
  console.log('='.repeat(60));
  console.log('\nAdd these to your .env.local file:\n');

  const proPlan = createdProducts.find((p) => p.name === 'Pro');
  const enterprisePlan = createdProducts.find((p) => p.name === 'Enterprise');

  if (proPlan) {
    console.log(`# Pro Plan`);
    console.log(`NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID=${proPlan.productId}`);
    if (proPlan.monthlyPriceId) {
      console.log(`NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=${proPlan.monthlyPriceId}`);
    }
    if (proPlan.yearlyPriceId) {
      console.log(`NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=${proPlan.yearlyPriceId}`);
    }
  }

  if (enterprisePlan) {
    console.log(`\n# Enterprise Plan`);
    console.log(`NEXT_PUBLIC_STRIPE_ENTERPRISE_PRODUCT_ID=${enterprisePlan.productId}`);
    if (enterprisePlan.monthlyPriceId) {
      console.log(`NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=${enterprisePlan.monthlyPriceId}`);
    }
    if (enterprisePlan.yearlyPriceId) {
      console.log(`NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID=${enterprisePlan.yearlyPriceId}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Setup complete!');
  console.log('='.repeat(60));
}

// Additional utility functions

async function archiveAllProducts() {
  console.log('🗑️  Archiving all RateWise products...\n');

  const products = await stripe.products.list({ limit: 100 });
  const ratewiseProducts = products.data.filter((p) =>
    p.name.startsWith('RateWise')
  );

  for (const product of ratewiseProducts) {
    try {
      await stripe.products.update(product.id, { active: false });
      console.log(`  ✅ Archived: ${product.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to archive ${product.name}:`, error);
    }
  }

  console.log(`\n✅ Archived ${ratewiseProducts.length} products`);
}

async function listAllProducts() {
  console.log('📋 Listing all RateWise products...\n');

  const products = await stripe.products.list({ limit: 100 });
  const ratewiseProducts = products.data.filter((p) =>
    p.name.startsWith('RateWise')
  );

  for (const product of ratewiseProducts) {
    console.log(`\n${product.name}:`);
    console.log(`  ID: ${product.id}`);
    console.log(`  Active: ${product.active}`);
    console.log(`  Description: ${product.description}`);

    const prices = await stripe.prices.list({
      product: product.id,
      limit: 10,
    });

    for (const price of prices.data) {
      const amount = (price.unit_amount || 0) / 100;
      const interval = price.recurring?.interval || 'one-time';
      console.log(`  Price: $${amount} ${price.currency.toUpperCase()}/${interval} (${price.id})`);
    }
  }
}

// Main execution
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'archive':
      await archiveAllProducts();
      break;
    case 'list':
      await listAllProducts();
      break;
    case 'setup':
    default:
      await setupStripeProducts();
      break;
  }
}

main()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
