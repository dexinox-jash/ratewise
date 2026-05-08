'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils/cn';

interface RateCard {
  id: string;
  name: string;
  skills: string[];
  hourly_rate: {
    recommended: number;
  } | null;
}

export function SavedRateCards() {
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRateCards() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('rate_cards')
        .select('id, name, skills, hourly_rate')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setRateCards(data);
      }
    }

    fetchRateCards();
  }, [supabase]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Saved Rate Cards</CardTitle>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/calculator">
            <Plus className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {rateCards.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No rate cards saved yet.
          </div>
        ) : (
          <div className="space-y-4">
            {rateCards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{card.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {card.skills.slice(0, 2).join(', ')}
                    {card.skills.length > 2 && '...'}
                  </p>
                </div>
                <div className="text-right">
                  {card.hourly_rate && (
                    <p className="font-medium">
                      {formatCurrency(card.hourly_rate.recommended)}/hr
                    </p>
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/rate-cards">View All</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
