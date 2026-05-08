'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Share2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils/cn';
import { toast } from 'sonner';

interface RateCard {
  id: string;
  name: string;
  description: string | null;
  skills: string[];
  hourly_rate: {
    recommended: number;
  } | null;
  is_public: boolean;
}

export function RateCardList() {
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchRateCards();
  }, []);

  async function fetchRateCards() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('rate_cards')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setRateCards(data);
    }
  }

  async function deleteRateCard(id: string) {
    const { error } = await supabase
      .from('rate_cards')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete rate card');
      return;
    }

    toast.success('Rate card deleted');
    fetchRateCards();
  }

  if (rateCards.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">No rate cards saved yet.</p>
          <Button asChild>
            <Link href="/calculator">Create Your First Rate Card</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rateCards.map((card) => (
        <Card key={card.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{card.name}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteRateCard(card.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {card.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {card.description}
              </p>
            )}
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Skills:</span>{' '}
                {card.skills.join(', ')}
              </p>
              {card.hourly_rate && (
                <p className="text-sm">
                  <span className="font-medium">Rate:</span>{' '}
                  {formatCurrency(card.hourly_rate.recommended)}/hr
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
