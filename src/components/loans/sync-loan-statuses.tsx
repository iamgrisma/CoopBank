
"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { RefreshCcw } from "lucide-react";

async function batchUpdateLoanStatusesAction() {
    // 1. Fetch all active loans
    const { data: activeLoans, error: fetchError } = await supabase
      .from('loans')
      .select('id, amount')
      .in('status', ['Active']);

    if (fetchError) {
      throw new Error(`Failed to fetch active loans: ${fetchError.message}`);
    }

    if (!activeLoans || activeLoans.length === 0) {
      return { updatedCount: 0, errorCount: 0, errors: [] };
    }

    // 2. Fetch all repayments for those active loans
    const loanIds = activeLoans.map(l => l.id);
    const { data: allRepayments, error: repaymentError } = await supabase
      .from('loan_repayments')
      .select('loan_id, principal_paid')
      .in('loan_id', loanIds);
    
    if (repaymentError) {
        throw new Error(`Failed to fetch repayments: ${repaymentError.message}`);
    }

    // 3. Group repayments by loan_id
    const repaymentsByLoan = (allRepayments || []).reduce((acc, p) => {
        if (!acc[p.loan_id]) {
            acc[p.loan_id] = [];
        }
        acc[p.loan_id].push(p);
        return acc;
    }, {} as Record<string, typeof allRepayments>);

    // 4. Identify loans to be updated
    const loansToUpdate: string[] = [];
    for (const loan of activeLoans) {
        const principalPaid = (repaymentsByLoan[loan.id] || []).reduce((sum, p) => sum + p.principal_paid, 0);
        if (principalPaid >= loan.amount) {
            loansToUpdate.push(loan.id);
        }
    }

    if (loansToUpdate.length === 0) {
        return { updatedCount: 0, errorCount: 0, errors: [] };
    }

    // 5. Batch update the identified loans
    const { error: updateError } = await supabase
      .from('loans')
      .update({ status: 'Paid Off' })
      .in('id', loansToUpdate);

    if (updateError) {
        throw new Error(`Failed to update loan statuses: ${updateError.message}`);
    }
    
    return { updatedCount: loansToUpdate.length, errorCount: 0, errors: [] };
}


export function SyncLoanStatuses() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await batchUpdateLoanStatusesAction();
      if (result.updatedCount > 0) {
        toast({
          title: "Sync Successful",
          description: `${result.updatedCount} loan(s) were updated to 'Paid Off'.`,
        });
      } else {
         toast({
          title: "No Updates Needed",
          description: "All active loan statuses are already correct.",
        });
      }
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: error.message,
      });
    } finally {
        setIsSyncing(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isSyncing}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          {isSyncing ? "Syncing..." : "Sync Loan Statuses"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to sync loan statuses?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will check all 'Active' loans. If a loan's total principal paid is equal to or greater than its original amount, its status will be automatically updated to 'Paid Off'. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSync}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
