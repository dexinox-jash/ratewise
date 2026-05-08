/**
 * Seed Script for Pricing Benchmarks
 * Populates the database with initial pricing benchmark data
 * 
 * Usage: npx ts-node scripts/seed-benchmarks.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Pricing benchmark data
interface BenchmarkData {
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

const benchmarks: BenchmarkData[] = [
  // Web Development
  {
    category: 'Web Development',
    serviceName: 'Landing Page Design',
    description: 'Single-page website design with responsive layout',
    minPrice: 500,
    maxPrice: 5000,
    averagePrice: 2000,
    medianPrice: 1800,
    unit: 'project',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 1250,
    confidence: 0.92,
    lastUpdated: new Date().toISOString(),
    tags: ['web', 'design', 'landing-page', 'responsive'],
  },
  {
    category: 'Web Development',
    serviceName: 'E-commerce Website',
    description: 'Full e-commerce website with payment integration',
    minPrice: 3000,
    maxPrice: 50000,
    averagePrice: 15000,
    medianPrice: 12000,
    unit: 'project',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 890,
    confidence: 0.89,
    lastUpdated: new Date().toISOString(),
    tags: ['web', 'ecommerce', 'shopify', 'woocommerce', 'payment'],
  },
  {
    category: 'Web Development',
    serviceName: 'Custom Web Application',
    description: 'Full-stack custom web application development',
    minPrice: 10000,
    maxPrice: 250000,
    averagePrice: 75000,
    medianPrice: 60000,
    unit: 'project',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 650,
    confidence: 0.85,
    lastUpdated: new Date().toISOString(),
    tags: ['web', 'app', 'fullstack', 'custom'],
  },
  {
    category: 'Web Development',
    serviceName: 'Website Maintenance',
    description: 'Monthly website maintenance and updates',
    minPrice: 100,
    maxPrice: 2000,
    averagePrice: 500,
    medianPrice: 400,
    unit: 'month',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 2100,
    confidence: 0.94,
    lastUpdated: new Date().toISOString(),
    tags: ['web', 'maintenance', 'support'],
  },
  {
    category: 'Web Development',
    serviceName: 'WordPress Development',
    description: 'Custom WordPress theme or plugin development',
    minPrice: 1000,
    maxPrice: 15000,
    averagePrice: 4500,
    medianPrice: 3500,
    unit: 'project',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 1580,
    confidence: 0.91,
    lastUpdated: new Date().toISOString(),
    tags: ['web', 'wordpress', 'cms', 'theme', 'plugin'],
  },

  // Mobile Development
  {
    category: 'Mobile Development',
    serviceName: 'iOS App Development',
    description: 'Native iOS application development',
    minPrice: 15000,
    maxPrice: 300000,
    averagePrice: 85000,
    medianPrice: 70000,
    unit: 'project',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 720,
    confidence: 0.87,
    lastUpdated: new Date().toISOString(),
    tags: ['mobile', 'ios', 'swift', 'native'],
  },
  {
    category: 'Mobile Development',
    serviceName: 'Android App Development',
    description: 'Native Android application development',
    minPrice: 15000,
    maxPrice: 280000,
    averagePrice: 80000,
    medianPrice: 65000,
    unit: 'project',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 680,
    confidence: 0.86,
    lastUpdated: new Date().toISOString(),
    tags: ['mobile', 'android', 'kotlin', 'native'],
  },
  {
    category: 'Mobile Development',
    serviceName: 'React Native Development',
    description: 'Cross-platform mobile app with React Native',
    minPrice: 12000,
    maxPrice: 200000,
    averagePrice: 60000,
    medianPrice: 50000,
    unit: 'project',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 540,
    confidence: 0.84,
    lastUpdated: new Date().toISOString(),
    tags: ['mobile', 'react-native', 'cross-platform'],
  },
  {
    category: 'Mobile Development',
    serviceName: 'Flutter Development',
    description: 'Cross-platform mobile app with Flutter',
    minPrice: 10000,
    maxPrice: 180000,
    averagePrice: 55000,
    medianPrice: 45000,
    unit: 'project',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 420,
    confidence: 0.82,
    lastUpdated: new Date().toISOString(),
    tags: ['mobile', 'flutter', 'cross-platform', 'dart'],
  },
  {
    category: 'Mobile Development',
    serviceName: 'App Maintenance',
    description: 'Monthly mobile app maintenance and updates',
    minPrice: 500,
    maxPrice: 5000,
    averagePrice: 2000,
    medianPrice: 1800,
    unit: 'month',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 890,
    confidence: 0.88,
    lastUpdated: new Date().toISOString(),
    tags: ['mobile', 'maintenance', 'support'],
  },

  // Design Services
  {
    category: 'Design',
    serviceName: 'Logo Design',
    description: 'Professional logo design with revisions',
    minPrice: 200,
    maxPrice: 5000,
    averagePrice: 800,
    medianPrice: 600,
    unit: 'project',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 3200,
    confidence: 0.95,
    lastUpdated: new Date().toISOString(),
    tags: ['design', 'logo', 'branding', 'identity'],
  },
  {
    category: 'Design',
    serviceName: 'Brand Identity Package',
    description: 'Complete brand identity including logo, colors, typography',
    minPrice: 1500,
    maxPrice: 25000,
    averagePrice: 6000,
    medianPrice: 5000,
    unit: 'project',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 980,
    confidence: 0.90,
    lastUpdated: new Date().toISOString(),
    tags: ['design', 'branding', 'identity', 'logo'],
  },
  {
    category: 'Design',
    serviceName: 'UI/UX Design',
    description: 'User interface and experience design',
    minPrice: 1000,
    maxPrice: 50000,
    averagePrice: 12000,
    medianPrice: 10000,
    unit: 'project',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 1450,
    confidence: 0.91,
    lastUpdated: new Date().toISOString(),
    tags: ['design', 'ui', 'ux', 'interface'],
  },
  {
    category: 'Design',
    serviceName: 'Graphic Design - Hourly',
    description: 'General graphic design services',
    minPrice: 25,
    maxPrice: 250,
    averagePrice: 75,
    medianPrice: 65,
    unit: 'hour',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 4500,
    confidence: 0.96,
    lastUpdated: new Date().toISOString(),
    tags: ['design', 'graphic', 'hourly'],
  },
  {
    category: 'Design',
    serviceName: 'Social Media Graphics',
    description: 'Social media post and banner design',
    minPrice: 25,
    maxPrice: 500,
    averagePrice: 100,
    medianPrice: 80,
    unit: 'project',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 2100,
    confidence: 0.93,
    lastUpdated: new Date().toISOString(),
    tags: ['design', 'social-media', 'graphics'],
  },

  // Marketing Services
  {
    category: 'Marketing',
    serviceName: 'SEO Services - Monthly',
    description: 'Monthly SEO optimization and reporting',
    minPrice: 500,
    maxPrice: 10000,
    averagePrice: 2500,
    medianPrice: 2000,
    unit: 'month',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 1680,
    confidence: 0.90,
    lastUpdated: new Date().toISOString(),
    tags: ['marketing', 'seo', 'organic', 'search'],
  },
  {
    category: 'Marketing',
    serviceName: 'PPC Management',
    description: 'Pay-per-click campaign management',
    minPrice: 500,
    maxPrice: 10000,
    averagePrice: 2000,
    medianPrice: 1500,
    unit: 'month',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 1320,
    confidence: 0.88,
    lastUpdated: new Date().toISOString(),
    tags: ['marketing', 'ppc', 'ads', 'google-ads'],
  },
  {
    category: 'Marketing',
    serviceName: 'Social Media Management',
    description: 'Social media content creation and management',
    minPrice: 300,
    maxPrice: 5000,
    averagePrice: 1500,
    medianPrice: 1200,
    unit: 'month',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 1890,
    confidence: 0.91,
    lastUpdated: new Date().toISOString(),
    tags: ['marketing', 'social-media', 'content'],
  },
  {
    category: 'Marketing',
    serviceName: 'Content Writing',
    description: 'Blog post or article writing',
    minPrice: 50,
    maxPrice: 1000,
    averagePrice: 250,
    medianPrice: 200,
    unit: 'article',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 2800,
    confidence: 0.94,
    lastUpdated: new Date().toISOString(),
    tags: ['marketing', 'content', 'writing', 'blog'],
  },
  {
    category: 'Marketing',
    serviceName: 'Email Marketing',
    description: 'Email campaign creation and management',
    minPrice: 300,
    maxPrice: 3000,
    averagePrice: 1000,
    medianPrice: 800,
    unit: 'month',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 1100,
    confidence: 0.87,
    lastUpdated: new Date().toISOString(),
    tags: ['marketing', 'email', 'newsletter'],
  },

  // Consulting Services
  {
    category: 'Consulting',
    serviceName: 'Business Consulting',
    description: 'General business strategy consulting',
    minPrice: 100,
    maxPrice: 1000,
    averagePrice: 300,
    medianPrice: 250,
    unit: 'hour',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 1200,
    confidence: 0.89,
    lastUpdated: new Date().toISOString(),
    tags: ['consulting', 'business', 'strategy'],
  },
  {
    category: 'Consulting',
    serviceName: 'IT Consulting',
    description: 'Information technology consulting services',
    minPrice: 100,
    maxPrice: 500,
    averagePrice: 200,
    medianPrice: 175,
    unit: 'hour',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 980,
    confidence: 0.88,
    lastUpdated: new Date().toISOString(),
    tags: ['consulting', 'it', 'technology'],
  },
  {
    category: 'Consulting',
    serviceName: 'Marketing Consulting',
    description: 'Marketing strategy and planning consulting',
    minPrice: 100,
    maxPrice: 500,
    averagePrice: 200,
    medianPrice: 175,
    unit: 'hour',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 850,
    confidence: 0.86,
    lastUpdated: new Date().toISOString(),
    tags: ['consulting', 'marketing', 'strategy'],
  },
  {
    category: 'Consulting',
    serviceName: 'Financial Consulting',
    description: 'Financial planning and analysis consulting',
    minPrice: 150,
    maxPrice: 800,
    averagePrice: 350,
    medianPrice: 300,
    unit: 'hour',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 720,
    confidence: 0.85,
    lastUpdated: new Date().toISOString(),
    tags: ['consulting', 'financial', 'accounting'],
  },

  // Video & Animation
  {
    category: 'Video & Animation',
    serviceName: 'Explainer Video',
    description: 'Animated explainer video (60-90 seconds)',
    minPrice: 1000,
    maxPrice: 15000,
    averagePrice: 4500,
    medianPrice: 3500,
    unit: 'project',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 650,
    confidence: 0.84,
    lastUpdated: new Date().toISOString(),
    tags: ['video', 'animation', 'explainer'],
  },
  {
    category: 'Video & Animation',
    serviceName: 'Video Editing',
    description: 'Professional video editing services',
    minPrice: 100,
    maxPrice: 2000,
    averagePrice: 500,
    medianPrice: 400,
    unit: 'hour',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 1100,
    confidence: 0.88,
    lastUpdated: new Date().toISOString(),
    tags: ['video', 'editing', 'post-production'],
  },
  {
    category: 'Video & Animation',
    serviceName: 'Motion Graphics',
    description: 'Motion graphics and animation',
    minPrice: 200,
    maxPrice: 5000,
    averagePrice: 1000,
    medianPrice: 800,
    unit: 'hour',
    location: 'United States',
    region: 'North America',
    source: 'market_research',
    dataPoints: 780,
    confidence: 0.86,
    lastUpdated: new Date().toISOString(),
    tags: ['video', 'motion-graphics', 'animation'],
  },
];

async function seedBenchmarks() {
  console.log('🌱 Starting benchmark seeding...\n');

  try {
    // Clear existing benchmarks (optional - remove if you want to keep existing)
    console.log('Clearing existing benchmarks...');
    const { error: deleteError } = await supabase
      .from('pricing_benchmarks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.log('No existing benchmarks to clear or error:', deleteError.message);
    } else {
      console.log('✅ Existing benchmarks cleared\n');
    }

    // Insert benchmarks in batches
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < benchmarks.length; i += batchSize) {
      batches.push(benchmarks.slice(i, i + batchSize));
    }

    let totalInserted = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Inserting batch ${i + 1}/${batches.length} (${batch.length} records)...`);

      const { data, error } = await supabase
        .from('pricing_benchmarks')
        .insert(batch.map(b => ({
          category: b.category,
          service_name: b.serviceName,
          description: b.description,
          min_price: b.minPrice,
          max_price: b.maxPrice,
          average_price: b.averagePrice,
          median_price: b.medianPrice,
          unit: b.unit,
          location: b.location,
          region: b.region,
          source: b.source,
          data_points: b.dataPoints,
          confidence: b.confidence,
          last_updated: b.lastUpdated,
          tags: b.tags,
        })))
        .select();

      if (error) {
        console.error(`❌ Error inserting batch ${i + 1}:`, error.message);
        continue;
      }

      totalInserted += data?.length || 0;
      console.log(`✅ Batch ${i + 1} inserted: ${data?.length || 0} records`);
    }

    console.log(`\n✅ Seeding complete! Total records inserted: ${totalInserted}`);

    // Print summary by category
    console.log('\n📊 Summary by Category:');
    const categorySummary = benchmarks.reduce((acc, b) => {
      acc[b.category] = (acc[b.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(categorySummary)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} benchmarks`);
      });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
seedBenchmarks()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
