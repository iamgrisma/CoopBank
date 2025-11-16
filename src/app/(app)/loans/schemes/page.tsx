import { LoanSchemesTable } from "@/components/loans/loan-schemes-table";
import { AddLoanScheme } from "@/components/loans/add-loan-scheme";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase-server";

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

export default async function LoanSchemesPage() {
  const loanSchemes = await getLoanSchemes();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Loan Schemes</h1>
        <div className="ml-auto">
          <AddLoanScheme 
            triggerButton={
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Scheme
              </Button>
            }
          />
        </div>
      </div>
      <LoanSchemesTable schemes={loanSchemes} />
    </main>
  );
}
