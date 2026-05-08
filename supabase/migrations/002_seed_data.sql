-- RateWise Database Seed Data
-- Created: 2024
-- Description: Comprehensive seed data for niches, multipliers, and pricing benchmarks

-- ============================================
-- SEED NICHES (22 niches with categories)
-- ============================================

INSERT INTO niches (name, slug, category, description, premium_multiplier, demand_score, competition_level, is_active) VALUES
-- Fashion & Beauty
('Fashion', 'fashion', 'Fashion & Beauty', 'Clothing, styling, and fashion trends content', 1.35, 8, 'high', true),
('Beauty & Makeup', 'beauty-makeup', 'Fashion & Beauty', 'Makeup tutorials, product reviews, and beauty tips', 1.45, 9, 'high', true),
('Skincare', 'skincare', 'Fashion & Beauty', 'Skincare routines, product recommendations, and skin health', 1.40, 8, 'medium', true),

-- Lifestyle
('Lifestyle', 'lifestyle', 'Lifestyle', 'General lifestyle content including daily routines and life hacks', 1.15, 7, 'very_high', true),
('Travel', 'travel', 'Lifestyle', 'Travel destinations, tips, and experiences', 1.25, 7, 'high', true),
('Home & Decor', 'home-decor', 'Lifestyle', 'Interior design, home organization, and decoration', 1.20, 6, 'medium', true),

-- Health & Wellness
('Fitness', 'fitness', 'Health & Wellness', 'Workout routines, fitness tips, and health motivation', 1.30, 8, 'high', true),
('Health & Wellness', 'health-wellness', 'Health & Wellness', 'General health, mental wellness, and self-care', 1.35, 8, 'medium', true),
('Nutrition', 'nutrition', 'Health & Wellness', 'Healthy eating, diet plans, and nutrition advice', 1.25, 7, 'medium', true),

-- Technology
('Tech & Gadgets', 'tech-gadgets', 'Technology', 'Technology reviews, gadget unboxings, and tech news', 1.50, 9, 'high', true),
('Gaming', 'gaming', 'Technology', 'Video game content, streaming, and gaming culture', 1.45, 9, 'very_high', true),
('Software & Apps', 'software-apps', 'Technology', 'App reviews, software tutorials, and productivity tools', 1.35, 7, 'medium', true),

-- Entertainment
('Entertainment', 'entertainment', 'Entertainment', 'Movies, TV shows, celebrity news, and pop culture', 1.20, 8, 'very_high', true),
('Music', 'music', 'Entertainment', 'Music reviews, artist features, and music culture', 1.25, 7, 'high', true),
('Comedy', 'comedy', 'Entertainment', 'Humorous content, skits, and entertainment', 1.15, 7, 'high', true),

-- Business & Finance
('Business', 'business', 'Business & Finance', 'Entrepreneurship, business tips, and corporate content', 1.60, 8, 'medium', true),
('Finance & Investing', 'finance-investing', 'Business & Finance', 'Personal finance, investing advice, and financial education', 1.70, 9, 'medium', true),
('Career & Education', 'career-education', 'Business & Finance', 'Career advice, professional development, and education', 1.40, 7, 'medium', true),

-- Food & Drink
('Food & Cooking', 'food-cooking', 'Food & Drink', 'Recipes, cooking tutorials, and food reviews', 1.20, 8, 'high', true),
('Beverages', 'beverages', 'Food & Drink', 'Drinks, cocktails, coffee, and beverage reviews', 1.15, 6, 'low', true),

-- Family & Parenting
('Parenting', 'parenting', 'Family', 'Parenting advice, family content, and child development', 1.25, 7, 'medium', true),
('Family', 'family', 'Family', 'Family-oriented content and family activities', 1.10, 6, 'medium', true),

-- Other
('Pets & Animals', 'pets-animals', 'Other', 'Pet content, animal videos, and pet care tips', 1.15, 7, 'high', true),
('Sports', 'sports', 'Other', 'Sports content, athletic performance, and sports culture', 1.20, 7, 'high', true),
('Education', 'education', 'Other', 'Educational content, tutorials, and learning resources', 1.10, 6, 'medium', true),
('DIY & Crafts', 'diy-crafts', 'Other', 'Do-it-yourself projects, crafts, and handmade items', 1.05, 5, 'medium', true),
('Automotive', 'automotive', 'Other', 'Cars, automotive reviews, and vehicle content', 1.30, 6, 'low', true),
('Photography', 'photography', 'Other', 'Photography tips, camera reviews, and visual content', 1.25, 6, 'medium', true);

-- ============================================
-- SEED MULTIPLIERS - USAGE RIGHTS (6 values)
-- ============================================

INSERT INTO multipliers (type, name, slug, description, value, display_order, is_active) VALUES
('usage_rights', 'Personal Use Only', 'personal-use', 'Content for personal, non-commercial use only', 1.00, 1, true),
('usage_rights', 'Brand Social Media', 'brand-social', 'Usage on brand social media channels only', 1.25, 2, true),
('usage_rights', 'Website & Digital', 'website-digital', 'Usage on website and all digital platforms', 1.50, 3, true),
('usage_rights', 'Advertising - Digital', 'advertising-digital', 'Digital advertising including paid social and display', 2.00, 4, true),
('usage_rights', 'Advertising - All Media', 'advertising-all', 'All advertising including TV, print, and digital', 3.00, 5, true),
('usage_rights', 'Full Commercial Rights', 'full-commercial', 'Unlimited commercial usage in perpetuity', 4.00, 6, true);

-- ============================================
-- SEED MULTIPLIERS - EXCLUSIVITY (5 values)
-- ============================================

INSERT INTO multipliers (type, name, slug, description, value, display_order, is_active) VALUES
('exclusivity', 'No Exclusivity', 'no-exclusivity', 'Creator can work with competing brands', 1.00, 1, true),
('exclusivity', 'Category Exclusivity - 30 Days', 'category-30', 'Exclusive within product category for 30 days', 1.20, 2, true),
('exclusivity', 'Category Exclusivity - 90 Days', 'category-90', 'Exclusive within product category for 90 days', 1.50, 3, true),
('exclusivity', 'Full Exclusivity - 6 Months', 'full-6mo', 'Complete exclusivity, no competing brands for 6 months', 2.00, 4, true),
('exclusivity', 'Full Exclusivity - 1 Year', 'full-1yr', 'Complete exclusivity, no competing brands for 1 year', 2.50, 5, true);

-- ============================================
-- SEED MULTIPLIERS - PLATFORM (7 platforms)
-- ============================================

INSERT INTO multipliers (type, name, slug, description, value, platform, display_order, is_active) VALUES
-- TikTok
('platform', 'TikTok Standard', 'tiktok-standard', 'Standard TikTok content multiplier', 1.00, 'tiktok', 1, true),
('platform', 'TikTok Premium', 'tiktok-premium', 'Premium TikTok content with high engagement', 1.30, 'tiktok', 2, true),

-- Instagram
('platform', 'Instagram Standard', 'instagram-standard', 'Standard Instagram content multiplier', 1.10, 'instagram', 1, true),
('platform', 'Instagram Premium', 'instagram-premium', 'Premium Instagram content with high engagement', 1.40, 'instagram', 2, true),

-- YouTube
('platform', 'YouTube Standard', 'youtube-standard', 'Standard YouTube content multiplier', 1.20, 'youtube', 1, true),
('platform', 'YouTube Premium', 'youtube-premium', 'Premium YouTube content with high engagement', 1.50, 'youtube', 2, true),

-- OnlyFans
('platform', 'OnlyFans Standard', 'onlyfans-standard', 'Standard OnlyFans content multiplier', 1.80, 'onlyfans', 1, true),
('platform', 'OnlyFans Premium', 'onlyfans-premium', 'Premium OnlyFans content with high engagement', 2.20, 'onlyfans', 2, true),

-- Twitter/X
('platform', 'Twitter Standard', 'twitter-standard', 'Standard Twitter/X content multiplier', 0.90, 'twitter', 1, true),
('platform', 'Twitter Premium', 'twitter-premium', 'Premium Twitter/X content with high engagement', 1.20, 'twitter', 2, true),

-- LinkedIn
('platform', 'LinkedIn Standard', 'linkedin-standard', 'Standard LinkedIn content multiplier', 1.50, 'linkedin', 1, true),
('platform', 'LinkedIn Premium', 'linkedin-premium', 'Premium LinkedIn content with high engagement', 2.00, 'linkedin', 2, true),

-- UGC
('platform', 'UGC Standard', 'ugc-standard', 'Standard User Generated Content multiplier', 0.80, 'ugc', 1, true),
('platform', 'UGC Premium', 'ugc-premium', 'Premium UGC content with high engagement', 1.10, 'ugc', 2, true);

-- ============================================
-- SEED MULTIPLIERS - ENGAGEMENT (5 ranges)
-- ============================================

INSERT INTO multipliers (type, name, slug, description, value, min_threshold, max_threshold, display_order, is_active) VALUES
('engagement', 'Low Engagement', 'low-engagement', 'Below average engagement rate', 0.85, 0, 2, 1, true),
('engagement', 'Average Engagement', 'avg-engagement', 'Average engagement rate for platform', 1.00, 2, 5, 2, true),
('engagement', 'Good Engagement', 'good-engagement', 'Above average engagement rate', 1.25, 5, 8, 3, true),
('engagement', 'High Engagement', 'high-engagement', 'High engagement rate', 1.60, 8, 12, 4, true),
('engagement', 'Viral Engagement', 'viral-engagement', 'Exceptional engagement rate', 2.20, 12, 100, 5, true);

-- ============================================
-- SEED PRICING BENCHMARKS (150+ rows)
-- ============================================

-- First, get niche IDs for reference (we'll use subqueries)

-- TIKTOK BENCHMARKS (25 rows)
INSERT INTO pricing_benchmarks (platform, creator_tier, content_type, niche_id, min_price, max_price, avg_price, median_price, sample_size, data_collection_date, data_source, region, currency, confidence_score, volatility_index, seasonal_multiplier, is_active) VALUES
-- TikTok Nano (1K-10K followers)
('tiktok', 'nano', 'video', (SELECT id FROM niches WHERE slug = 'fashion'), 25.00, 75.00, 45.00, 40.00, 450, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.85, 1.15, 1.00, true),
('tiktok', 'nano', 'video', (SELECT id FROM niches WHERE slug = 'beauty-makeup'), 30.00, 90.00, 55.00, 50.00, 380, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.85, 1.20, 1.00, true),
('tiktok', 'nano', 'story', (SELECT id FROM niches WHERE slug = 'lifestyle'), 15.00, 45.00, 28.00, 25.00, 320, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.80, 1.10, 1.00, true),
('tiktok', 'nano', 'reel', (SELECT id FROM niches WHERE slug = 'gaming'), 20.00, 60.00, 38.00, 35.00, 290, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.82, 1.25, 1.00, true),
('tiktok', 'nano', 'live', (SELECT id FROM niches WHERE slug = 'entertainment'), 40.00, 120.00, 75.00, 70.00, 180, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.78, 1.30, 1.00, true),

-- TikTok Micro (10K-100K followers)
('tiktok', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'fashion'), 100.00, 300.00, 185.00, 175.00, 520, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.88, 1.20, 1.00, true),
('tiktok', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 150.00, 450.00, 280.00, 265.00, 340, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.87, 1.25, 1.00, true),
('tiktok', 'micro', 'reel', (SELECT id FROM niches WHERE slug = 'fitness'), 120.00, 360.00, 225.00, 210.00, 410, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.86, 1.15, 1.00, true),
('tiktok', 'micro', 'story', (SELECT id FROM niches WHERE slug = 'food-cooking'), 60.00, 180.00, 115.00, 110.00, 280, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.84, 1.10, 1.00, true),
('tiktok', 'micro', 'carousel', (SELECT id FROM niches WHERE slug = 'travel'), 80.00, 240.00, 155.00, 150.00, 220, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.83, 1.20, 1.00, true),

-- TikTok Mid (100K-500K followers)
('tiktok', 'mid', 'video', (SELECT id FROM niches WHERE slug = 'beauty-makeup'), 500.00, 1500.00, 950.00, 900.00, 380, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.90, 1.25, 1.00, true),
('tiktok', 'mid', 'video', (SELECT id FROM niches WHERE slug = 'gaming'), 600.00, 1800.00, 1150.00, 1100.00, 420, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.91, 1.30, 1.00, true),
('tiktok', 'mid', 'reel', (SELECT id FROM niches WHERE slug = 'finance-investing'), 800.00, 2400.00, 1550.00, 1500.00, 180, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.88, 1.35, 1.00, true),
('tiktok', 'mid', 'live', (SELECT id FROM niches WHERE slug = 'entertainment'), 1000.00, 3000.00, 1900.00, 1850.00, 250, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.87, 1.40, 1.00, true),
('tiktok', 'mid', 'post', (SELECT id FROM niches WHERE slug = 'lifestyle'), 400.00, 1200.00, 750.00, 720.00, 310, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.85, 1.15, 1.00, true),

-- TikTok Macro (500K-1M followers)
('tiktok', 'macro', 'video', (SELECT id FROM niches WHERE slug = 'fashion'), 2000.00, 6000.00, 3800.00, 3600.00, 180, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.89, 1.30, 1.00, true),
('tiktok', 'macro', 'video', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 2500.00, 7500.00, 4800.00, 4600.00, 150, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.90, 1.35, 1.00, true),
('tiktok', 'macro', 'reel', (SELECT id FROM niches WHERE slug = 'skincare'), 2200.00, 6600.00, 4250.00, 4000.00, 140, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.88, 1.25, 1.00, true),
('tiktok', 'macro', 'live', (SELECT id FROM niches WHERE slug = 'gaming'), 3000.00, 9000.00, 5800.00, 5500.00, 95, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.86, 1.45, 1.00, true),
('tiktok', 'macro', 'custom', (SELECT id FROM niches WHERE slug = 'business'), 3500.00, 10500.00, 6750.00, 6500.00, 75, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.85, 1.40, 1.00, true),

-- TikTok Mega (1M+ followers)
('tiktok', 'mega', 'video', (SELECT id FROM niches WHERE slug = 'entertainment'), 8000.00, 25000.00, 15500.00, 15000.00, 85, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.92, 1.50, 1.00, true),
('tiktok', 'mega', 'video', (SELECT id FROM niches WHERE slug = 'beauty-makeup'), 10000.00, 30000.00, 19000.00, 18500.00, 65, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.93, 1.45, 1.00, true),
('tiktok', 'mega', 'reel', (SELECT id FROM niches WHERE slug = 'fashion'), 9000.00, 27000.00, 17000.00, 16500.00, 70, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.91, 1.40, 1.00, true),
('tiktok', 'mega', 'live', (SELECT id FROM niches WHERE slug = 'gaming'), 12000.00, 36000.00, 22500.00, 22000.00, 45, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.89, 1.55, 1.00, true),
('tiktok', 'mega', 'custom', (SELECT id FROM niches WHERE slug = 'finance-investing'), 15000.00, 45000.00, 28500.00, 28000.00, 30, '2024-01-15', 'Creator Economy Report 2024', 'global', 'USD', 0.87, 1.60, 1.00, true);

-- INSTAGRAM BENCHMARKS (25 rows)
INSERT INTO pricing_benchmarks (platform, creator_tier, content_type, niche_id, min_price, max_price, avg_price, median_price, sample_size, data_collection_date, data_source, region, currency, confidence_score, volatility_index, seasonal_multiplier, is_active) VALUES
-- Instagram Nano
('instagram', 'nano', 'post', (SELECT id FROM niches WHERE slug = 'fashion'), 30.00, 90.00, 55.00, 50.00, 520, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.86, 1.15, 1.00, true),
('instagram', 'nano', 'story', (SELECT id FROM niches WHERE slug = 'beauty-makeup'), 20.00, 60.00, 38.00, 35.00, 480, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.85, 1.10, 1.00, true),
('instagram', 'nano', 'reel', (SELECT id FROM niches WHERE slug = 'lifestyle'), 35.00, 105.00, 65.00, 60.00, 450, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.84, 1.20, 1.00, true),
('instagram', 'nano', 'carousel', (SELECT id FROM niches WHERE slug = 'travel'), 40.00, 120.00, 75.00, 70.00, 320, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.83, 1.15, 1.00, true),
('instagram', 'nano', 'video', (SELECT id FROM niches WHERE slug = 'fitness'), 45.00, 135.00, 85.00, 80.00, 380, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.85, 1.18, 1.00, true),

-- Instagram Micro
('instagram', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'fashion'), 150.00, 450.00, 285.00, 270.00, 580, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.89, 1.20, 1.00, true),
('instagram', 'micro', 'story', (SELECT id FROM niches WHERE slug = 'skincare'), 80.00, 240.00, 155.00, 145.00, 420, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.87, 1.12, 1.00, true),
('instagram', 'micro', 'reel', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 200.00, 600.00, 385.00, 370.00, 350, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.88, 1.25, 1.00, true),
('instagram', 'micro', 'carousel', (SELECT id FROM niches WHERE slug = 'food-cooking'), 120.00, 360.00, 235.00, 225.00, 310, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.85, 1.10, 1.00, true),
('instagram', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'home-decor'), 180.00, 540.00, 350.00, 335.00, 280, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.86, 1.15, 1.00, true),

-- Instagram Mid
('instagram', 'mid', 'post', (SELECT id FROM niches WHERE slug = 'beauty-makeup'), 600.00, 1800.00, 1150.00, 1100.00, 420, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.91, 1.25, 1.00, true),
('instagram', 'mid', 'story', (SELECT id FROM niches WHERE slug = 'fashion'), 350.00, 1050.00, 675.00, 650.00, 380, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.89, 1.15, 1.00, true),
('instagram', 'mid', 'reel', (SELECT id FROM niches WHERE slug = 'gaming'), 800.00, 2400.00, 1550.00, 1500.00, 290, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.90, 1.30, 1.00, true),
('instagram', 'mid', 'carousel', (SELECT id FROM niches WHERE slug = 'travel'), 500.00, 1500.00, 950.00, 920.00, 250, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.87, 1.20, 1.00, true),
('instagram', 'mid', 'video', (SELECT id FROM niches WHERE slug = 'fitness'), 700.00, 2100.00, 1350.00, 1300.00, 340, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.88, 1.22, 1.00, true),

-- Instagram Macro
('instagram', 'macro', 'post', (SELECT id FROM niches WHERE slug = 'fashion'), 2500.00, 7500.00, 4850.00, 4700.00, 200, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.90, 1.30, 1.00, true),
('instagram', 'macro', 'story', (SELECT id FROM niches WHERE slug = 'lifestyle'), 1500.00, 4500.00, 2900.00, 2800.00, 180, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.88, 1.20, 1.00, true),
('instagram', 'macro', 'reel', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 3500.00, 10500.00, 6750.00, 6600.00, 140, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.91, 1.35, 1.00, true),
('instagram', 'macro', 'carousel', (SELECT id FROM niches WHERE slug = 'business'), 2000.00, 6000.00, 3900.00, 3800.00, 110, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.87, 1.25, 1.00, true),
('instagram', 'macro', 'live', (SELECT id FROM niches WHERE slug = 'entertainment'), 4000.00, 12000.00, 7750.00, 7600.00, 85, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.89, 1.40, 1.00, true),

-- Instagram Mega
('instagram', 'mega', 'post', (SELECT id FROM niches WHERE slug = 'beauty-makeup'), 12000.00, 36000.00, 23000.00, 22500.00, 75, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.93, 1.45, 1.00, true),
('instagram', 'mega', 'reel', (SELECT id FROM niches WHERE slug = 'fashion'), 15000.00, 45000.00, 28500.00, 28000.00, 60, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.92, 1.50, 1.00, true),
('instagram', 'mega', 'story', (SELECT id FROM niches WHERE slug = 'skincare'), 8000.00, 24000.00, 15500.00, 15200.00, 65, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.90, 1.35, 1.00, true),
('instagram', 'mega', 'carousel', (SELECT id FROM niches WHERE slug = 'travel'), 10000.00, 30000.00, 19000.00, 18700.00, 50, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.89, 1.40, 1.00, true),
('instagram', 'mega', 'video', (SELECT id FROM niches WHERE slug = 'gaming'), 18000.00, 54000.00, 34500.00, 34000.00, 40, '2024-01-15', 'Instagram Creator Report 2024', 'global', 'USD', 0.91, 1.55, 1.00, true);

-- YOUTUBE BENCHMARKS (25 rows)
INSERT INTO pricing_benchmarks (platform, creator_tier, content_type, niche_id, min_price, max_price, avg_price, median_price, sample_size, data_collection_date, data_source, region, currency, confidence_score, volatility_index, seasonal_multiplier, is_active) VALUES
-- YouTube Nano
('youtube', 'nano', 'video', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 50.00, 150.00, 95.00, 90.00, 280, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.85, 1.20, 1.00, true),
('youtube', 'nano', 'video', (SELECT id FROM niches WHERE slug = 'gaming'), 40.00, 120.00, 75.00, 70.00, 350, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.84, 1.25, 1.00, true),
('youtube', 'nano', 'video', (SELECT id FROM niches WHERE slug = 'education'), 30.00, 90.00, 55.00, 52.00, 220, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.82, 1.10, 1.00, true),
('youtube', 'nano', 'custom', (SELECT id FROM niches WHERE slug = 'fitness'), 60.00, 180.00, 115.00, 110.00, 190, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.83, 1.15, 1.00, true),
('youtube', 'nano', 'video', (SELECT id FROM niches WHERE slug = 'music'), 35.00, 105.00, 65.00, 62.00, 240, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.81, 1.18, 1.00, true),

-- YouTube Micro
('youtube', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 300.00, 900.00, 575.00, 550.00, 320, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.89, 1.25, 1.00, true),
('youtube', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'gaming'), 250.00, 750.00, 485.00, 470.00, 380, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.88, 1.30, 1.00, true),
('youtube', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'finance-investing'), 400.00, 1200.00, 775.00, 750.00, 180, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.87, 1.35, 1.00, true),
('youtube', 'micro', 'custom', (SELECT id FROM niches WHERE slug = 'business'), 350.00, 1050.00, 675.00, 650.00, 150, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.86, 1.28, 1.00, true),
('youtube', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'beauty-makeup'), 280.00, 840.00, 545.00, 530.00, 290, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.87, 1.22, 1.00, true),

-- YouTube Mid
('youtube', 'mid', 'video', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 1200.00, 3600.00, 2300.00, 2250.00, 240, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.91, 1.30, 1.00, true),
('youtube', 'mid', 'video', (SELECT id FROM niches WHERE slug = 'gaming'), 1000.00, 3000.00, 1900.00, 1850.00, 280, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.90, 1.35, 1.00, true),
('youtube', 'mid', 'video', (SELECT id FROM niches WHERE slug = 'education'), 600.00, 1800.00, 1150.00, 1120.00, 200, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.88, 1.20, 1.00, true),
('youtube', 'mid', 'custom', (SELECT id FROM niches WHERE slug = 'fitness'), 800.00, 2400.00, 1550.00, 1520.00, 220, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.89, 1.25, 1.00, true),
('youtube', 'mid', 'video', (SELECT id FROM niches WHERE slug = 'travel'), 700.00, 2100.00, 1350.00, 1320.00, 180, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.87, 1.22, 1.00, true),

-- YouTube Macro
('youtube', 'macro', 'video', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 5000.00, 15000.00, 9500.00, 9300.00, 120, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.92, 1.35, 1.00, true),
('youtube', 'macro', 'video', (SELECT id FROM niches WHERE slug = 'gaming'), 4500.00, 13500.00, 8650.00, 8500.00, 140, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.91, 1.40, 1.00, true),
('youtube', 'macro', 'video', (SELECT id FROM niches WHERE slug = 'finance-investing'), 7000.00, 21000.00, 13450.00, 13200.00, 70, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.90, 1.45, 1.00, true),
('youtube', 'macro', 'custom', (SELECT id FROM niches WHERE slug = 'business'), 6000.00, 18000.00, 11550.00, 11300.00, 65, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.89, 1.38, 1.00, true),
('youtube', 'macro', 'video', (SELECT id FROM niches WHERE slug = 'entertainment'), 4000.00, 12000.00, 7750.00, 7600.00, 160, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.90, 1.42, 1.00, true),

-- YouTube Mega
('youtube', 'mega', 'video', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 25000.00, 75000.00, 47500.00, 47000.00, 45, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.94, 1.50, 1.00, true),
('youtube', 'mega', 'video', (SELECT id FROM niches WHERE slug = 'gaming'), 20000.00, 60000.00, 38500.00, 38000.00, 55, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.93, 1.55, 1.00, true),
('youtube', 'mega', 'video', (SELECT id FROM niches WHERE slug = 'beauty-makeup'), 18000.00, 54000.00, 34500.00, 34000.00, 40, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.92, 1.48, 1.00, true),
('youtube', 'mega', 'custom', (SELECT id FROM niches WHERE slug = 'fashion'), 22000.00, 66000.00, 42500.00, 42000.00, 35, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.91, 1.52, 1.00, true),
('youtube', 'mega', 'video', (SELECT id FROM niches WHERE slug = 'finance-investing'), 35000.00, 105000.00, 67000.00, 66500.00, 25, '2024-01-15', 'YouTube Partner Program Data 2024', 'global', 'USD', 0.93, 1.60, 1.00, true);


-- ONLYFANS BENCHMARKS (20 rows)
INSERT INTO pricing_benchmarks (platform, creator_tier, content_type, niche_id, min_price, max_price, avg_price, median_price, sample_size, data_collection_date, data_source, region, currency, confidence_score, volatility_index, seasonal_multiplier, is_active) VALUES
-- OnlyFans Nano
('onlyfans', 'nano', 'post', (SELECT id FROM niches WHERE slug = 'lifestyle'), 50.00, 150.00, 95.00, 90.00, 180, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.78, 1.35, 1.00, true),
('onlyfans', 'nano', 'video', (SELECT id FROM niches WHERE slug = 'fitness'), 100.00, 300.00, 195.00, 185.00, 150, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.76, 1.40, 1.00, true),
('onlyfans', 'nano', 'custom', (SELECT id FROM niches WHERE slug = 'fashion'), 75.00, 225.00, 145.00, 140.00, 120, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.75, 1.32, 1.00, true),
('onlyfans', 'nano', 'live', (SELECT id FROM niches WHERE slug = 'entertainment'), 150.00, 450.00, 295.00, 285.00, 95, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.74, 1.45, 1.00, true),

-- OnlyFans Micro
('onlyfans', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'lifestyle'), 300.00, 900.00, 575.00, 560.00, 220, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.82, 1.38, 1.00, true),
('onlyfans', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'fitness'), 500.00, 1500.00, 975.00, 950.00, 190, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.80, 1.42, 1.00, true),
('onlyfans', 'micro', 'custom', (SELECT id FROM niches WHERE slug = 'beauty-makeup'), 400.00, 1200.00, 775.00, 760.00, 160, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.79, 1.35, 1.00, true),
('onlyfans', 'micro', 'live', (SELECT id FROM niches WHERE slug = 'gaming'), 600.00, 1800.00, 1150.00, 1120.00, 130, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.78, 1.48, 1.00, true),

-- OnlyFans Mid
('onlyfans', 'mid', 'post', (SELECT id FROM niches WHERE slug = 'fashion'), 1200.00, 3600.00, 2300.00, 2250.00, 140, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.85, 1.40, 1.00, true),
('onlyfans', 'mid', 'video', (SELECT id FROM niches WHERE slug = 'fitness'), 2000.00, 6000.00, 3850.00, 3800.00, 120, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.84, 1.45, 1.00, true),
('onlyfans', 'mid', 'custom', (SELECT id FROM niches WHERE slug = 'lifestyle'), 1500.00, 4500.00, 2900.00, 2850.00, 110, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.83, 1.38, 1.00, true),
('onlyfans', 'mid', 'live', (SELECT id FROM niches WHERE slug = 'entertainment'), 2500.00, 7500.00, 4850.00, 4800.00, 85, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.82, 1.52, 1.00, true),

-- OnlyFans Macro
('onlyfans', 'macro', 'post', (SELECT id FROM niches WHERE slug = 'beauty-makeup'), 5000.00, 15000.00, 9750.00, 9600.00, 70, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.87, 1.45, 1.00, true),
('onlyfans', 'macro', 'video', (SELECT id FROM niches WHERE slug = 'fitness'), 8000.00, 24000.00, 15500.00, 15300.00, 55, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.86, 1.50, 1.00, true),
('onlyfans', 'macro', 'custom', (SELECT id FROM niches WHERE slug = 'fashion'), 6000.00, 18000.00, 11550.00, 11400.00, 60, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.85, 1.42, 1.00, true),
('onlyfans', 'macro', 'live', (SELECT id FROM niches WHERE slug = 'lifestyle'), 10000.00, 30000.00, 19250.00, 19000.00, 40, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.84, 1.55, 1.00, true),

-- OnlyFans Mega
('onlyfans', 'mega', 'post', (SELECT id FROM niches WHERE slug = 'entertainment'), 25000.00, 75000.00, 47500.00, 47000.00, 25, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.88, 1.55, 1.00, true),
('onlyfans', 'mega', 'video', (SELECT id FROM niches WHERE slug = 'fitness'), 35000.00, 105000.00, 67000.00, 66500.00, 20, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.87, 1.60, 1.00, true),
('onlyfans', 'mega', 'custom', (SELECT id FROM niches WHERE slug = 'beauty-makeup'), 30000.00, 90000.00, 57500.00, 57000.00, 22, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.86, 1.52, 1.00, true),
('onlyfans', 'mega', 'live', (SELECT id FROM niches WHERE slug = 'fashion'), 40000.00, 120000.00, 77000.00, 76500.00, 15, '2024-01-15', 'Creator Platform Analytics 2024', 'global', 'USD', 0.85, 1.65, 1.00, true);

-- TWITTER/X BENCHMARKS (20 rows)
INSERT INTO pricing_benchmarks (platform, creator_tier, content_type, niche_id, min_price, max_price, avg_price, median_price, sample_size, data_collection_date, data_source, region, currency, confidence_score, volatility_index, seasonal_multiplier, is_active) VALUES
-- Twitter Nano
('twitter', 'nano', 'post', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 15.00, 45.00, 28.00, 26.00, 320, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.82, 1.15, 1.00, true),
('twitter', 'nano', 'post', (SELECT id FROM niches WHERE slug = 'finance-investing'), 25.00, 75.00, 48.00, 45.00, 180, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.80, 1.20, 1.00, true),
('twitter', 'nano', 'post', (SELECT id FROM niches WHERE slug = 'entertainment'), 12.00, 36.00, 22.00, 20.00, 380, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.81, 1.12, 1.00, true),
('twitter', 'nano', 'video', (SELECT id FROM niches WHERE slug = 'gaming'), 20.00, 60.00, 38.00, 35.00, 290, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.83, 1.18, 1.00, true),

-- Twitter Micro
('twitter', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 80.00, 240.00, 155.00, 150.00, 280, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.86, 1.20, 1.00, true),
('twitter', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'finance-investing'), 120.00, 360.00, 235.00, 230.00, 150, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.84, 1.25, 1.00, true),
('twitter', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'business'), 100.00, 300.00, 195.00, 190.00, 140, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.85, 1.22, 1.00, true),
('twitter', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'gaming'), 150.00, 450.00, 295.00, 290.00, 220, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.87, 1.28, 1.00, true),

-- Twitter Mid
('twitter', 'mid', 'post', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 350.00, 1050.00, 675.00, 660.00, 180, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.88, 1.25, 1.00, true),
('twitter', 'mid', 'post', (SELECT id FROM niches WHERE slug = 'finance-investing'), 500.00, 1500.00, 975.00, 960.00, 95, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.86, 1.30, 1.00, true),
('twitter', 'mid', 'post', (SELECT id FROM niches WHERE slug = 'business'), 400.00, 1200.00, 775.00, 760.00, 110, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.87, 1.28, 1.00, true),
('twitter', 'mid', 'video', (SELECT id FROM niches WHERE slug = 'entertainment'), 450.00, 1350.00, 875.00, 860.00, 140, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.88, 1.32, 1.00, true),

-- Twitter Macro
('twitter', 'macro', 'post', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 1500.00, 4500.00, 2900.00, 2850.00, 85, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.89, 1.30, 1.00, true),
('twitter', 'macro', 'post', (SELECT id FROM niches WHERE slug = 'finance-investing'), 2200.00, 6600.00, 4250.00, 4200.00, 45, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.87, 1.35, 1.00, true),
('twitter', 'macro', 'post', (SELECT id FROM niches WHERE slug = 'business'), 1800.00, 5400.00, 3450.00, 3400.00, 55, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.88, 1.32, 1.00, true),
('twitter', 'macro', 'video', (SELECT id FROM niches WHERE slug = 'gaming'), 2000.00, 6000.00, 3850.00, 3800.00, 70, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.89, 1.38, 1.00, true),

-- Twitter Mega
('twitter', 'mega', 'post', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 7000.00, 21000.00, 13450.00, 13300.00, 30, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.90, 1.40, 1.00, true),
('twitter', 'mega', 'post', (SELECT id FROM niches WHERE slug = 'finance-investing'), 10000.00, 30000.00, 19250.00, 19000.00, 18, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.88, 1.45, 1.00, true),
('twitter', 'mega', 'post', (SELECT id FROM niches WHERE slug = 'business'), 8000.00, 24000.00, 15400.00, 15200.00, 22, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.89, 1.42, 1.00, true),
('twitter', 'mega', 'video', (SELECT id FROM niches WHERE slug = 'entertainment'), 9000.00, 27000.00, 17350.00, 17100.00, 25, '2024-01-15', 'X Creator Revenue Data 2024', 'global', 'USD', 0.90, 1.48, 1.00, true);

-- LINKEDIN BENCHMARKS (20 rows)
INSERT INTO pricing_benchmarks (platform, creator_tier, content_type, niche_id, min_price, max_price, avg_price, median_price, sample_size, data_collection_date, data_source, region, currency, confidence_score, volatility_index, seasonal_multiplier, is_active) VALUES
-- LinkedIn Nano
('linkedin', 'nano', 'post', (SELECT id FROM niches WHERE slug = 'business'), 40.00, 120.00, 75.00, 72.00, 220, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.84, 1.18, 1.00, true),
('linkedin', 'nano', 'post', (SELECT id FROM niches WHERE slug = 'career-education'), 30.00, 90.00, 58.00, 55.00, 180, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.82, 1.12, 1.00, true),
('linkedin', 'nano', 'post', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 50.00, 150.00, 95.00, 92.00, 150, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.83, 1.20, 1.00, true),
('linkedin', 'nano', 'video', (SELECT id FROM niches WHERE slug = 'finance-investing'), 80.00, 240.00, 155.00, 150.00, 120, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.85, 1.25, 1.00, true),

-- LinkedIn Micro
('linkedin', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'business'), 200.00, 600.00, 385.00, 375.00, 190, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.88, 1.22, 1.00, true),
('linkedin', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'career-education'), 150.00, 450.00, 290.00, 285.00, 160, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.86, 1.18, 1.00, true),
('linkedin', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 250.00, 750.00, 485.00, 475.00, 130, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.87, 1.25, 1.00, true),
('linkedin', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'finance-investing'), 400.00, 1200.00, 775.00, 760.00, 90, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.89, 1.30, 1.00, true),

-- LinkedIn Mid
('linkedin', 'mid', 'post', (SELECT id FROM niches WHERE slug = 'business'), 800.00, 2400.00, 1550.00, 1520.00, 120, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.90, 1.28, 1.00, true),
('linkedin', 'mid', 'post', (SELECT id FROM niches WHERE slug = 'career-education'), 600.00, 1800.00, 1150.00, 1120.00, 100, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.88, 1.22, 1.00, true),
('linkedin', 'mid', 'post', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 1000.00, 3000.00, 1925.00, 1900.00, 85, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.89, 1.32, 1.00, true),
('linkedin', 'mid', 'video', (SELECT id FROM niches WHERE slug = 'finance-investing'), 1600.00, 4800.00, 3100.00, 3050.00, 60, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.91, 1.38, 1.00, true),

-- LinkedIn Macro
('linkedin', 'macro', 'post', (SELECT id FROM niches WHERE slug = 'business'), 3200.00, 9600.00, 6200.00, 6100.00, 55, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.91, 1.32, 1.00, true),
('linkedin', 'macro', 'post', (SELECT id FROM niches WHERE slug = 'career-education'), 2400.00, 7200.00, 4650.00, 4600.00, 45, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.89, 1.28, 1.00, true),
('linkedin', 'macro', 'post', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 4000.00, 12000.00, 7700.00, 7600.00, 40, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.90, 1.35, 1.00, true),
('linkedin', 'macro', 'video', (SELECT id FROM niches WHERE slug = 'finance-investing'), 6400.00, 19200.00, 12400.00, 12200.00, 28, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.92, 1.42, 1.00, true),

-- LinkedIn Mega
('linkedin', 'mega', 'post', (SELECT id FROM niches WHERE slug = 'business'), 15000.00, 45000.00, 29000.00, 28600.00, 20, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.92, 1.40, 1.00, true),
('linkedin', 'mega', 'post', (SELECT id FROM niches WHERE slug = 'career-education'), 11000.00, 33000.00, 21500.00, 21200.00, 18, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.90, 1.35, 1.00, true),
('linkedin', 'mega', 'post', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 18000.00, 54000.00, 35500.00, 35000.00, 15, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.91, 1.45, 1.00, true),
('linkedin', 'mega', 'video', (SELECT id FROM niches WHERE slug = 'finance-investing'), 28000.00, 84000.00, 54500.00, 54000.00, 10, '2024-01-15', 'LinkedIn Creator Economy Report 2024', 'global', 'USD', 0.93, 1.50, 1.00, true);

-- UGC BENCHMARKS (20 rows)
INSERT INTO pricing_benchmarks (platform, creator_tier, content_type, niche_id, min_price, max_price, avg_price, median_price, sample_size, data_collection_date, data_source, region, currency, confidence_score, volatility_index, seasonal_multiplier, is_active) VALUES
-- UGC Nano
('ugc', 'nano', 'video', (SELECT id FROM niches WHERE slug = 'fashion'), 30.00, 90.00, 58.00, 55.00, 280, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.82, 1.12, 1.00, true),
('ugc', 'nano', 'video', (SELECT id FROM niches WHERE slug = 'beauty-makeup'), 40.00, 120.00, 78.00, 75.00, 250, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.83, 1.15, 1.00, true),
('ugc', 'nano', 'post', (SELECT id FROM niches WHERE slug = 'lifestyle'), 20.00, 60.00, 38.00, 36.00, 300, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.81, 1.10, 1.00, true),
('ugc', 'nano', 'carousel', (SELECT id FROM niches WHERE slug = 'food-cooking'), 25.00, 75.00, 48.00, 46.00, 220, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.80, 1.08, 1.00, true),

-- UGC Micro
('ugc', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'fashion'), 120.00, 360.00, 235.00, 230.00, 320, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.86, 1.15, 1.00, true),
('ugc', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'beauty-makeup'), 160.00, 480.00, 315.00, 310.00, 290, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.87, 1.18, 1.00, true),
('ugc', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 200.00, 600.00, 395.00, 390.00, 240, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.88, 1.22, 1.00, true),
('ugc', 'micro', 'carousel', (SELECT id FROM niches WHERE slug = 'home-decor'), 100.00, 300.00, 195.00, 192.00, 200, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.85, 1.12, 1.00, true),

-- UGC Mid
('ugc', 'mid', 'video', (SELECT id FROM niches WHERE slug = 'fashion'), 500.00, 1500.00, 975.00, 960.00, 220, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.89, 1.20, 1.00, true),
('ugc', 'mid', 'video', (SELECT id FROM niches WHERE slug = 'beauty-makeup'), 650.00, 1950.00, 1275.00, 1260.00, 200, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.90, 1.22, 1.00, true),
('ugc', 'mid', 'video', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 800.00, 2400.00, 1575.00, 1560.00, 170, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.91, 1.25, 1.00, true),
('ugc', 'mid', 'custom', (SELECT id FROM niches WHERE slug = 'fitness'), 600.00, 1800.00, 1175.00, 1160.00, 180, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.88, 1.18, 1.00, true),

-- UGC Macro
('ugc', 'macro', 'video', (SELECT id FROM niches WHERE slug = 'fashion'), 2000.00, 6000.00, 3900.00, 3860.00, 100, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.90, 1.25, 1.00, true),
('ugc', 'macro', 'video', (SELECT id FROM niches WHERE slug = 'beauty-makeup'), 2600.00, 7800.00, 5100.00, 5050.00, 90, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.91, 1.28, 1.00, true),
('ugc', 'macro', 'video', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 3200.00, 9600.00, 6300.00, 6250.00, 75, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.92, 1.32, 1.00, true),
('ugc', 'macro', 'custom', (SELECT id FROM niches WHERE slug = 'business'), 2800.00, 8400.00, 5500.00, 5450.00, 65, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.89, 1.28, 1.00, true),

-- UGC Mega
('ugc', 'mega', 'video', (SELECT id FROM niches WHERE slug = 'fashion'), 8000.00, 24000.00, 15500.00, 15350.00, 35, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.92, 1.35, 1.00, true),
('ugc', 'mega', 'video', (SELECT id FROM niches WHERE slug = 'beauty-makeup'), 10000.00, 30000.00, 19500.00, 19300.00, 30, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.93, 1.38, 1.00, true),
('ugc', 'mega', 'video', (SELECT id FROM niches WHERE slug = 'tech-gadgets'), 12000.00, 36000.00, 23500.00, 23300.00, 25, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.94, 1.42, 1.00, true),
('ugc', 'mega', 'custom', (SELECT id FROM niches WHERE slug = 'finance-investing'), 15000.00, 45000.00, 29500.00, 29300.00, 18, '2024-01-15', 'UGC Creator Market Report 2024', 'global', 'USD', 0.93, 1.45, 1.00, true);

-- ============================================
-- ADDITIONAL BENCHMARKS FOR REMAINING NICHES (25 rows)
-- ============================================

INSERT INTO pricing_benchmarks (platform, creator_tier, content_type, niche_id, min_price, max_price, avg_price, median_price, sample_size, data_collection_date, data_source, region, currency, confidence_score, volatility_index, seasonal_multiplier, is_active) VALUES
-- Additional niche coverage
('instagram', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'health-wellness'), 180.00, 540.00, 350.00, 340.00, 250, '2024-01-15', 'Health & Wellness Creator Report 2024', 'global', 'USD', 0.86, 1.15, 1.00, true),
('instagram', 'mid', 'video', (SELECT id FROM niches WHERE slug = 'health-wellness'), 750.00, 2250.00, 1450.00, 1420.00, 180, '2024-01-15', 'Health & Wellness Creator Report 2024', 'global', 'USD', 0.88, 1.20, 1.00, true),
('youtube', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'health-wellness'), 320.00, 960.00, 625.00, 610.00, 200, '2024-01-15', 'Health & Wellness Creator Report 2024', 'global', 'USD', 0.87, 1.18, 1.00, true),
('tiktok', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'health-wellness'), 140.00, 420.00, 275.00, 265.00, 320, '2024-01-15', 'Health & Wellness Creator Report 2024', 'global', 'USD', 0.86, 1.15, 1.00, true),

('instagram', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'nutrition'), 130.00, 390.00, 255.00, 248.00, 180, '2024-01-15', 'Nutrition Creator Report 2024', 'global', 'USD', 0.84, 1.12, 1.00, true),
('youtube', 'mid', 'video', (SELECT id FROM niches WHERE slug = 'nutrition'), 650.00, 1950.00, 1250.00, 1220.00, 150, '2024-01-15', 'Nutrition Creator Report 2024', 'global', 'USD', 0.87, 1.18, 1.00, true),

('instagram', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'software-apps'), 220.00, 660.00, 430.00, 420.00, 160, '2024-01-15', 'Tech Creator Report 2024', 'global', 'USD', 0.88, 1.22, 1.00, true),
('youtube', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'software-apps'), 380.00, 1140.00, 745.00, 730.00, 140, '2024-01-15', 'Tech Creator Report 2024', 'global', 'USD', 0.89, 1.25, 1.00, true),

('instagram', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'music'), 140.00, 420.00, 275.00, 268.00, 220, '2024-01-15', 'Music Creator Report 2024', 'global', 'USD', 0.85, 1.15, 1.00, true),
('tiktok', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'music'), 160.00, 480.00, 315.00, 305.00, 280, '2024-01-15', 'Music Creator Report 2024', 'global', 'USD', 0.86, 1.18, 1.00, true),

('instagram', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'comedy'), 110.00, 330.00, 215.00, 210.00, 260, '2024-01-15', 'Entertainment Creator Report 2024', 'global', 'USD', 0.84, 1.12, 1.00, true),
('youtube', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'comedy'), 280.00, 840.00, 545.00, 535.00, 200, '2024-01-15', 'Entertainment Creator Report 2024', 'global', 'USD', 0.86, 1.18, 1.00, true),

('instagram', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'parenting'), 160.00, 480.00, 315.00, 308.00, 190, '2024-01-15', 'Family Creator Report 2024', 'global', 'USD', 0.85, 1.12, 1.00, true),
('youtube', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'parenting'), 320.00, 960.00, 625.00, 615.00, 160, '2024-01-15', 'Family Creator Report 2024', 'global', 'USD', 0.87, 1.15, 1.00, true),

('instagram', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'pets-animals'), 100.00, 300.00, 195.00, 190.00, 240, '2024-01-15', 'Pet Creator Report 2024', 'global', 'USD', 0.83, 1.10, 1.00, true),
('tiktok', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'pets-animals'), 130.00, 390.00, 255.00, 248.00, 300, '2024-01-15', 'Pet Creator Report 2024', 'global', 'USD', 0.84, 1.12, 1.00, true),

('instagram', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'sports'), 150.00, 450.00, 295.00, 288.00, 170, '2024-01-15', 'Sports Creator Report 2024', 'global', 'USD', 0.85, 1.15, 1.00, true),
('youtube', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'sports'), 300.00, 900.00, 585.00, 575.00, 150, '2024-01-15', 'Sports Creator Report 2024', 'global', 'USD', 0.87, 1.18, 1.00, true),

('instagram', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'diy-crafts'), 85.00, 255.00, 165.00, 162.00, 150, '2024-01-15', 'DIY Creator Report 2024', 'global', 'USD', 0.81, 1.08, 1.00, true),
('youtube', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'diy-crafts'), 200.00, 600.00, 395.00, 388.00, 130, '2024-01-15', 'DIY Creator Report 2024', 'global', 'USD', 0.84, 1.12, 1.00, true),

('instagram', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'automotive'), 200.00, 600.00, 395.00, 388.00, 120, '2024-01-15', 'Automotive Creator Report 2024', 'global', 'USD', 0.87, 1.18, 1.00, true),
('youtube', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'automotive'), 420.00, 1260.00, 825.00, 810.00, 110, '2024-01-15', 'Automotive Creator Report 2024', 'global', 'USD', 0.89, 1.22, 1.00, true),

('instagram', 'micro', 'post', (SELECT id FROM niches WHERE slug = 'photography'), 180.00, 540.00, 355.00, 348.00, 140, '2024-01-15', 'Photography Creator Report 2024', 'global', 'USD', 0.86, 1.15, 1.00, true),
('youtube', 'micro', 'video', (SELECT id FROM niches WHERE slug = 'photography'), 360.00, 1080.00, 705.00, 695.00, 120, '2024-01-15', 'Photography Creator Report 2024', 'global', 'USD', 0.88, 1.20, 1.00, true);

-- ============================================
-- SEED DATA VERIFICATION QUERY (for reference)
-- ============================================

-- Uncomment to verify seed data counts after running:
/*
SELECT 
    'niches' as table_name, COUNT(*) as row_count FROM niches
UNION ALL
SELECT 
    'multipliers' as table_name, COUNT(*) as row_count FROM multipliers
UNION ALL
SELECT 
    'pricing_benchmarks' as table_name, COUNT(*) as row_count FROM pricing_benchmarks;
*/
