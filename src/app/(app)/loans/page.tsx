
import { AddLoan } from "@/components/loans/add-loan";
import { LoansTable } from "@/components/loans/loans-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function getLoans() {
  const supabase = createSupabaseServerClient();
  const { data: loans, error } = await supabase
    .from('loans')
    .select(`
      *,
      members (
        id,
        name
      ),
      loan_schemes (
        id,
        name,
        repayment_frequency,
        grace_period_months
      )
    `)
    .order('disbursement_date', { ascending: false });

  if (error) {
    console.error('Error fetching loans:', error);
    return [];
  }
  return loans;
}

async function getMembers() {
  const supabase = createSupabaseServerClient();
  const { data: members, error } = await supabase
    .from('members')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }
  return members;
}

async function getLoanSchemes() {
    const supabase = createSupabaseServerClient();
    const { data: schemes, error } = await supabase
        .from('loan_schemes')
        .select('*')
        .order('name', { ascending: true });
    
    if (error) {
        console.error('Error fetching loan schemes:', error);
        return [];
    }
    return schemes;
}

export default async function LoansPage() {
  const loans = await getLoans();
  const members = await getMembers();
  const loanSchemes = await getLoanSchemes();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Loan Accounts</h1>
        <div className="ml-auto">
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
      <LoansTable loans={loans} allLoanSchemes={loanSchemes} />
    </main>
  );
}

    