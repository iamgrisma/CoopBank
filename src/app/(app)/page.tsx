
"use client";

import React, { useState, useEffect } from 'react';
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { UpcomingDues } from "@/components/dashboard/upcoming-dues";
import { FinancialStatements } from "@/components/dashboard/financial-statements";
import { supabase } from "@/lib/supabase-client";
import { Skeleton } from '@/components/ui/skeleton';

type Transaction = {
  id: string;
  member_name: string;
  type: string;
  status: 'Completed' | 'Pending';
  date: string;
  amount: number;
};

type OverviewData = {
  members: number;
  shares: number;
  savings: number;
  loans: number;
};

type Loan = {
  id: string;
  disbursement_date: string;
  loan_term_months: number;
  members: {
    id: string;
    name: string;
  } | null;
};

function DashboardSkeleton() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-5">
                <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-96" />
                </div>
                <div className="grid auto-rows-max gap-4 md:gap-8 lg:col-span-2">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        </main>
    );
}


export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDashboardData() {
      setLoading(true);
      const { data: transactionsData, error: transactionsError } = await supabase
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
        
      const { data: activeLoansData, error: activeLoansError } = await supabase
        .from('loans')
        .select(`*, members ( id, name )`)
        .in('status', ['Active']);

      if (transactionsError || memberError || sharesError || savingsError || loansError || activeLoansError) {
        console.error({ transactionsError, memberError, sharesError, savingsError, loansError, activeLoansError });
      }

      const totalSharesValue = shares ? shares.reduce((acc, share) => acc + (share.number_of_shares * share.face_value), 0) : 0;
      const totalSavingsValue = savings ? savings.reduce((acc, saving) => acc + saving.amount, 0) : 0;
      const totalLoansValue = loans ? loans.reduce((acc, loan) => acc + loan.amount, 0) : 0;

      setTransactions(transactionsData || []);
      setOverview({
        members: memberCount ?? 0,
        shares: totalSharesValue,
        savings: totalSavingsValue,
        loans: totalLoansValue,
      });
      setActiveLoans(activeLoansData || []);
      setLoading(false);
    }

    getDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {overview && <OverviewCards overview={overview} />}
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
