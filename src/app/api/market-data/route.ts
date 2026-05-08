import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { scrapeMarketData } from '@/lib/scrapers/market-scraper';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(req.url);
    
    const skill = searchParams.get('skill');
    const location = searchParams.get('location');
    const experienceLevel = searchParams.get('experienceLevel');

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill parameter is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${skill}-${location || 'global'}-${experienceLevel || 'all'}`;
    const { data: cachedData } = await supabase
      .from('market_data_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cachedData) {
      return NextResponse.json(cachedData.data);
    }

    // Fetch fresh data
    const marketData = await scrapeMarketData({
      skill,
      location,
      experienceLevel,
    });

    // Cache the result
    await supabase.from('market_data_cache').insert({
      cache_key: cacheKey,
      data: marketData,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    });

    return NextResponse.json(marketData);
  } catch (error) {
    console.error('Market data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
