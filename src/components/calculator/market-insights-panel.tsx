'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MarketData {
  demandLevel: 'low' | 'medium' | 'high';
  competitionLevel: 'low' | 'medium' | 'high';
  marketTrend: 'declining' | 'stable' | 'growing';
  averageRate: number;
  rateRange: { min: number; max: number };
}

export function MarketInsightsPanel() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const response = await fetch('/api/market-data?skill=javascript');
        if (response.ok) {
          const data = await response.json();
          setMarketData(data);
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMarketData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Market Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Demand</span>
            <span className="flex items-center gap-1 text-sm font-medium">
              {marketData?.demandLevel === 'high' ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  High
                </>
              ) : marketData?.demandLevel === 'low' ? (
                <>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Low
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 text-yellow-500" />
                  Medium
                </>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Competition</span>
            <span className="text-sm font-medium capitalize">
              {marketData?.competitionLevel || 'Medium'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Trend</span>
            <span className="text-sm font-medium capitalize">
              {marketData?.marketTrend || 'Stable'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Market Rates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Average Hourly Rate</p>
            <p className="text-2xl font-bold">
              ${marketData?.averageRate?.toFixed(2) || '75.00'}/hr
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rate Range</p>
            <p className="text-sm">
              ${marketData?.rateRange?.min || '50'} - ${marketData?.rateRange?.max || '150'}/hr
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
