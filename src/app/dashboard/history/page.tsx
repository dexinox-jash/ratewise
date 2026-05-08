import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { CalculationHistoryTable } from '@/components/dashboard/calculation-history-table';

export const metadata: Metadata = {
  title: 'Calculation History',
  description: 'View your complete calculation history',
};

export default async function HistoryPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Calculation History"
        text="View and manage all your past rate calculations."
      />
      <CalculationHistoryTable />
    </DashboardShell>
  );
}
