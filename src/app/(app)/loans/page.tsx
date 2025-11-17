'use client';

import React, { useState, useEffect } from 'react';
import { AddLoan } from "@/components/loans/add-loan";
import { LoansTable } from "@/components/loans/loans-table";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCcw } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { SyncLoanStatuses } from "@/components/loans/sync-loan-statuses";
import { Skeleton } from '@/components/ui/skeleton';

function LoansPageSkeleton() {
    return (
         <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Loan Accounts</h1>
                <div className="ml-auto flex items-center gap-2">
                    <Button disabled variant="outline"><RefreshCcw className="mr-2 h-4 w-4"/> Sync Loan Statuses</Button>
                    <Button disabled><PlusCircle className="mr-2 h-4 w-4" /> Add Loan</Button>
                </div>
            </div>
            <div className="rounded-lg border shadow-sm overflow-x-auto">
                <div className="p-4 space-y-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                             <div className="space-y-2 flex-1 text-right">
                                <Skeleton className="h-4 w-1/4 ml-auto" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}

export default function LoansPage() {
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState({
      loans: [],
      members: [],
      loanSchemes: [],
  });
  
  useEffect(() => {
    async function getPageData() {
        setLoading(true);
        const [loansRes, membersRes, loanSchemesRes] = await Promise.all([
            supabase.from('loans').select(`*, members (id, name), loan_schemes (id, name, repayment_frequency, grace_period_months)`).order('disbursement_date', { ascending: false }),
            supabase.from('members').select('id, name').order('name', { ascending: true }),
            supabase.from('loan_schemes').select('*').order('name', { ascending: true })
        ]);
        
        if (loansRes.error) console.error('Error fetching loans:', loansRes.error);
        if (membersRes.error) console.error('Error fetching members:', membersRes.error);
        if (loanSchemesRes.error) console.error('Error fetching loan schemes:', loanSchemesRes.error);

        setPageData({
            loans: loansRes.data || [],
            members: membersRes.data || [],
            loanSchemes: loanSchemesRes.data || [],
        });
        setLoading(false);
    }
    getPageData();
  }, []);

  if (loading) {
    return <LoansPageSkeleton />;
  }

  const { loans, members, loanSchemes } = pageData;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Loan Accounts</h1>
        <div className="ml-auto flex items-center gap-2">
           <SyncLoanStatuses />
          <AddLoan 
            members={members}
            loanSchemes={loanSchemes}
            triggerButton={
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Loan
              </Button>
            }
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <LoansTable loans={loans} allLoanSchemes={loanSchemes} />
      </div>
    </main>
  );
}
