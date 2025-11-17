'use client';

import React, { useState, useEffect } from 'react';
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { UpcomingDues } from "@/components/dashboard/upcoming-dues";
import { FinancialStatements } from "@/components/dashboard/financial-statements";
import { supabase } from "@/lib/supabase-client";
import { Skeleton } from '@/components/ui/skeleton';

function DashboardSkeleton() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-5">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
          <div className="rounded-lg border p-4">
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-[250px] w-full" />
          </div>
          <div className="rounded-lg border p-4">
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
        <div className="grid auto-rows-max gap-4 md:gap-8 lg:col-span-2">
          <div className="rounded-lg border p-4">
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
           <FinancialStatements />
        </div>
      </div>
    </main>
  )
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    transactions: [],
    overview: { members: 0, shares: 0, savings: 0, loans: 0 },
    activeLoans: [],
  });

  useEffect(() => {
    async function getDashboardData() {
      setLoading(true);
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

      setData({
        transactions: transactionsRes.data || [],
        overview,
        activeLoans: activeLoansRes.data || [],
      });
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
