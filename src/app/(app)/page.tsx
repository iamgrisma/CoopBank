import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { CalendarCard } from "@/components/dashboard/calendar-card";
import { FinancialStatements } from "@/components/dashboard/financial-statements";
import { supabase } from "@/lib/supabase-client";

async function getTransactions() {
  // The tables are defined in supabase/setup.sql
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  return transactions;
}


export default async function DashboardPage() {
  const transactions = await getTransactions();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <OverviewCards />
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
        <RecentTransactions transactions={transactions} />
        <div className="grid gap-4 md:gap-8">
          <CalendarCard />
          <FinancialStatements />
        </div>
      </div>
    </main>
  );
}
