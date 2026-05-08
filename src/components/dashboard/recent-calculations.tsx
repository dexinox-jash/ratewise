'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils/cn';

interface Calculation {
  id: string;
  created_at: string;
  input_data: {
    skills: string[];
    location: string;
  };
  result_data: {
    hourlyRate: {
      recommended: number;
    };
  };
}

interface RecentCalculationsProps {
  className?: string;
}

export function RecentCalculations({ className }: RecentCalculationsProps) {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCalculations() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('calculations')
        .select('id, created_at, input_data, result_data')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setCalculations(data);
      }
    }

    fetchCalculations();
  }, [supabase]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Calculations</CardTitle>
      </CardHeader>
      <CardContent>
        {calculations.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No calculations yet.{' '}
            <Link href="/calculator" className="text-primary hover:underline">
              Calculate your first rate
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {calculations.map((calc) => (
              <div
                key={calc.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">
                    {calc.input_data.skills.slice(0, 3).join(', ')}
                    {calc.input_data.skills.length > 3 && '...'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {calc.input_data.location} • {formatDate(calc.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(calc.result_data.hourlyRate.recommended)}/hr
                  </p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/history">View All</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
