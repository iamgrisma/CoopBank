import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { FinancialStatements } from "@/components/dashboard/financial-statements";
import { supabase } from "@/lib/supabase-client";

async function getDashboardData() {
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .limit(10);

  const { count: memberCount, error: memberError } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true });

  const { data: shares, error: sharesError } = await supabase
    .from('shares')
    .select('number_of_shares, face_value');

  if (transactionsError) {
    console.error('Error fetching transactions:', transactionsError);
  }
  if (memberError) {
    console.error('Error fetching member count:', memberError);
  }
  if (sharesError) {
    console.error('Error fetching shares:', sharesError);
  }

  const totalSharesValue = shares ? shares.reduce((acc, share) => acc + (share.number_of_shares * share.face_value), 0) : 0;

  // Note: Savings and Loans data is static for now.
  // We will make these dynamic in future modules.
  const overview = {
    members: memberCount ?? 0,
    shares: totalSharesValue,
    savings: 12234000,
    loans: 8543000,
  }

  return { 
    transactions: transactions || [],
    overview
  };
}


export default async function DashboardPage() {
  const { transactions, overview } = await getDashboardData();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <OverviewCards overview={overview} />
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <CashFlowChart transactions={transactions} />
        </div>
        <div className="grid gap-4 md:gap-8">
            <RecentTransactions transactions={transactions} />
            <FinancialStatements />
        </div>
      </div>
    </main>
  );
}
