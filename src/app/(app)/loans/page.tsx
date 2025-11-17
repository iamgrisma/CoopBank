import React from 'react';
import { AddLoan } from "@/components/loans/add-loan";
import { LoansTable } from "@/components/loans/loans-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { SyncLoanStatuses } from "@/components/loans/sync-loan-statuses";

async function getPageData() {
    const supabase = createSupabaseServerClient();
    const [loansRes, membersRes, loanSchemesRes] = await Promise.all([
        supabase.from('loans').select(`*, members (id, name), loan_schemes (id, name, repayment_frequency, grace_period_months)`).order('disbursement_date', { ascending: false }),
        supabase.from('members').select('id, name').order('name', { ascending: true }),
        supabase.from('loan_schemes').select('*').order('name', { ascending: true })
    ]);
    
    if (loansRes.error) console.error('Error fetching loans:', loansRes.error);
    if (membersRes.error) console.error('Error fetching members:', membersRes.error);
    if (loanSchemesRes.error) console.error('Error fetching loan schemes:', loanSchemesRes.error);

    return {
        loans: loansRes.data || [],
        members: membersRes.data || [],
        loanSchemes: loanSchemesRes.data || [],
    }
}

export default async function LoansPage() {
  const { loans, members, loanSchemes } = await getPageData();

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
