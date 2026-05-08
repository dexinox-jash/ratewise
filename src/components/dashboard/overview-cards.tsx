'use client';

import { useEffect, useState } from 'react';
import { Calculator, CreditCard, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

interface Stats {
  totalCalculations: number;
  savedRateCards: number;
  averageRate: number;
  lastCalculation: string | null;
}

export function OverviewCards() {
  const [stats, setStats] = useState<Stats>({
    totalCalculations: 0,
    savedRateCards: 0,
    averageRate: 0,
    lastCalculation: null,
  });
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch calculations count
      const { count: calculationsCount } = await supabase
        .from('calculations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

      // Fetch rate cards count
      const { count: rateCardsCount } = await supabase
        .from('rate_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

      // Fetch last calculation
      const { data: lastCalc } = await supabase
        .from('calculations')
        .select('created_at, result_data')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setStats({
        totalCalculations: calculationsCount || 0,
        savedRateCards: rateCardsCount || 0,
        averageRate: lastCalc?.result_data?.hourlyRate?.recommended || 0,
        lastCalculation: lastCalc?.created_at || null,
      });
    }

    fetchStats();
  }, [supabase]);

  const cards = [
    {
      title: 'Total Calculations',
      value: stats.totalCalculations.toString(),
      icon: Calculator,
    },
    {
      title: 'Saved Rate Cards',
      value: stats.savedRateCards.toString(),
      icon: CreditCard,
    },
    {
      title: 'Average Rate',
      value: stats.averageRate > 0 ? `$${stats.averageRate}/hr` : '-',
      icon: TrendingUp,
    },
    {
      title: 'Last Calculation',
      value: stats.lastCalculation
        ? new Date(stats.lastCalculation).toLocaleDateString()
        : '-',
      icon: Clock,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
