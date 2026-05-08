'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils/cn';

interface Calculation {
  id: string;
  created_at: string;
  input_data: {
    skills: string[];
    experienceLevel: string;
    location: string;
  };
  result_data: {
    hourlyRate: {
      min: number;
      max: number;
      recommended: number;
    };
  };
}

export function CalculationHistoryTable() {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCalculations() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('calculations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setCalculations(data);
      }
    }

    fetchCalculations();
  }, [supabase]);

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calculations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No calculations found.
                </TableCell>
              </TableRow>
            ) : (
              calculations.map((calc) => (
                <TableRow key={calc.id}>
                  <TableCell>{formatDate(calc.created_at)}</TableCell>
                  <TableCell>{calc.input_data.skills.join(', ')}</TableCell>
                  <TableCell className="capitalize">
                    {calc.input_data.experienceLevel}
                  </TableCell>
                  <TableCell>{calc.input_data.location}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(calc.result_data.hourlyRate.recommended)}/hr
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
