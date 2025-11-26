
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { UpcomingDues } from "@/components/dashboard/upcoming-dues";
import { FinancialStatements } from "@/components/dashboard/financial-statements";
import { supabase } from "@/lib/supabase-client";

export default async function DashboardPage() {
  const [
    transactionsRes,
    memberCountRes,
    sharesRes,
    savingsRes,
    loansRes,
    activeLoansRes
  ] = await Promise.all([
    supabase.from('transactions').select('*').order('date', { ascending: false }).limit(10),
    supabase.from('members').select('*', { count: 'exact', head: true }),
    supabase.from('shares').select('number_of_shares, face_value'),
    supabase.from('savings').select('amount'),
    supabase.from('loans').select('amount').not('status', 'in', '("Paid Off", "Rejected", "Restructured")'),
    supabase.from('loans').select(`*, members ( id, name )`).in('status', ['Active'])
  ]);

  if (transactionsRes.error) console.error('Error fetching transactions:', transactionsRes.error.message);
  if (memberCountRes.error) console.error('Error fetching member count:', memberCountRes.error.message);
  if (sharesRes.error) console.error('Error fetching shares:', sharesRes.error.message);
  if (savingsRes.error) console.error('Error fetching savings:', savingsRes.error.message);
  if (loansRes.error) console.error('Error fetching loans:', loansRes.error.message);
  if (activeLoansRes.error) console.error('Error fetching active loans:', activeLoansRes.error.message);

  const totalSharesValue = (sharesRes.data || []).reduce((acc, share) => acc + (share.number_of_shares * share.face_value), 0);
  const totalSavingsValue = (savingsRes.data || []).reduce((acc, saving) => acc + saving.amount, 0);
  const totalLoansValue = (loansRes.data || []).reduce((acc, loan) => acc + loan.amount, 0);

  const overview = {
    members: memberCountRes.count ?? 0,
    shares: totalSharesValue,
    savings: totalSavingsValue,
    loans: totalLoansValue,
  };

  const data = {
    transactions: transactionsRes.data || [],
    overview,
    activeLoans: activeLoansRes.data || [],
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewCards overview={data.overview} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-5">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
            <CashFlowChart transactions={data.transactions} />
            <UpcomingDues loans={data.activeLoans} />
        </div>
        <div className="grid auto-rows-max gap-4 md:gap-8 lg:col-span-2">
            <RecentTransactions transactions={data.transactions} />
            <FinancialStatements />
        </div>
      </div>
    </main>
  );
}
