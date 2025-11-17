
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { FinancialStatements } from "@/components/dashboard/financial-statements";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { UpcomingDues } from "@/components/dashboard/upcoming-dues";

async function getDashboardData() {
  const supabase = createSupabaseServerClient();

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
    
  const { data: savings, error: savingsError } = await supabase
    .from('savings')
    .select('amount');
  
  const { data: loans, error: loansError } = await supabase
    .from('loans')
    .select('amount')
    .not('status', 'in', '("Paid Off", "Rejected", "Restructured")');
    
  const { data: activeLoans, error: activeLoansError } = await supabase
    .from('loans')
    .select(`
        *,
        members ( id, name )
    `)
    .in('status', ['Active']);


  if (transactionsError) {
    console.error('Error fetching transactions:', transactionsError);
  }
  if (memberError) {
    console.error('Error fetching member count:', memberError);
  }
  if (sharesError) {
    console.error('Error fetching shares:', sharesError);
  }
  if (savingsError) {
    console.error('Error fetching savings:', savingsError);
  }
   if (loansError) {
    console.error('Error fetching loans:', loansError);
  }
  if (activeLoansError) {
    console.error('Error fetching active loans:', activeLoansError);
  }

  const totalSharesValue = shares ? shares.reduce((acc, share) => acc + (share.number_of_shares * share.face_value), 0) : 0;
  const totalSavingsValue = savings ? savings.reduce((acc, saving) => acc + saving.amount, 0) : 0;
  const totalLoansValue = loans ? loans.reduce((acc, loan) => acc + loan.amount, 0) : 0;

  const overview = {
    members: memberCount ?? 0,
    shares: totalSharesValue,
    savings: totalSavingsValue,
    loans: totalLoansValue,
  }

  return { 
    transactions: transactions || [],
    overview,
    activeLoans: activeLoans || [],
  };
}


export default async function DashboardPage() {
  const { transactions, overview, activeLoans } = await getDashboardData();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewCards overview={overview} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-5">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
            <CashFlowChart transactions={transactions} />
            <UpcomingDues loans={activeLoans} />
        </div>
        <div className="grid auto-rows-max gap-4 md:gap-8 lg:col-span-2">
            <RecentTransactions transactions={transactions} />
            <FinancialStatements />
        </div>
      </div>
    </main>
  );
}
