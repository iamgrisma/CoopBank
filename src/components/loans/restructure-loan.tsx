
"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase-client";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { RepaymentFrequency, formatCurrency } from "@/lib/loan-utils";

type LoanScheme = {
  id: string;
  name: string;
  default_interest_rate: number;
  max_term_months: number;
  min_term_months: number;
  grace_period_months: number;
  repayment_frequency: string;
  is_active: boolean;
};

type OriginalLoan = {
  id: string;
  interest_rate: number;
  members: { name: string, id: string } | null;
};

const restructureFormSchema = z.object({
  loan_scheme_id: z.string().min(1, { message: "Please select a loan scheme." }),
  amount: z.coerce.number(), // This will be the capitalized principal, read-only
  interest_rate: z.coerce.number().positive({ message: "Interest rate must be a positive number." }),
  loan_term_months: z.coerce.number().int().min(1, { message: "Term must be at least 1 month." }),
  disbursement_date: z.date({ required_error: "Restructure date is required." }),
  description: z.string().optional(),
});

type RestructureFormValues = z.infer<typeof restructureFormSchema>;

async function restructureLoanInDb(
    originalLoanId: string,
    outstandingPrincipal: number,
    accruedInterest: number,
    newLoanData: Omit<RestructureFormValues, 'disbursement_date'> & {
        member_id: string;
        member_name: string;
        disbursement_date: string;
        grace_period_months: number;
        repayment_frequency: string;
    }
) {
    // 1. Update the old loan status to 'Restructured'
    const { error: updateError } = await supabase
        .from('loans')
        .update({ status: 'Restructured' })
        .eq('id', originalLoanId);

    if (updateError) throw new Error(`Failed to update original loan: ${updateError.message}`);
    
    // 2. Create the new loan record with the capitalized amount
    const { data: newLoan, error: newLoanError } = await supabase
        .from('loans')
        .insert({
            member_id: newLoanData.member_id,
            loan_scheme_id: newLoanData.loan_scheme_id,
            amount: newLoanData.amount, // This is the capitalized principal
            interest_rate: newLoanData.interest_rate,
            loan_term_months: newLoanData.loan_term_months,
            disbursement_date: newLoanData.disbursement_date,
            status: 'Active',
            description: `Restructured from loan ${originalLoanId}. ${newLoanData.description || ''}`,
            repayment_frequency: newLoanData.repayment_frequency,
            grace_period_months: newLoanData.grace_period_months,
        }).select().single();
    
    if (newLoanError) throw new Error(`Failed to create new loan: ${newLoanError.message}`);

    // 3. Create transactions to balance the books
    const totalSettlementAmount = outstandingPrincipal + accruedInterest;
    const transactions = [
        // A non-cash transaction to "pay off" the old loan's principal and accrued interest
        {
            member_id: newLoanData.member_id,
            member_name: newLoanData.member_name,
            type: 'Loan Restructured',
            amount: totalSettlementAmount,
            date: newLoanData.disbursement_date,
            status: 'Completed',
            description: `Settlement of loan ${originalLoanId} for restructuring.`
        },
        // Debit transaction for the new loan disbursement (same capitalized amount)
        {
            member_id: newLoanData.member_id,
            member_name: newLoanData.member_name,
            type: 'Loan Disbursement',
            amount: newLoanData.amount,
            date: newLoanData.disbursement_date,
            status: 'Completed',
            description: `New loan from restructuring. Principal: ${formatCurrency(outstandingPrincipal)}, Capitalized Interest: ${formatCurrency(accruedInterest)}`
        }
    ];

    const { error: transactionError } = await supabase.from('transactions').insert(transactions);
    if (transactionError) console.error(`Loan restructured, but failed to create transactions: ${transactionError.message}`);

    return newLoan;
}

interface RestructureLoanDialogProps {
  originalLoan: OriginalLoan;
  outstandingPrincipal: number;
  accruedInterest: number;
  capitalizedPrincipal: number;
  allLoanSchemes: LoanScheme[];
  isLoanOverdue: boolean;
  isLoanActive: boolean;
  onRestructureComplete: () => void;
  trigger: React.ReactNode;
}

export function RestructureLoanDialog({ 
    originalLoan,
    outstandingPrincipal,
    accruedInterest,
    capitalizedPrincipal,
    allLoanSchemes,
    isLoanOverdue,
    isLoanActive,
    onRestructureComplete,
    trigger 
}: RestructureLoanDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<RestructureFormValues>({
    resolver: zodResolver(restructureFormSchema),
    defaultValues: {
      loan_scheme_id: "",
      amount: capitalizedPrincipal,
      interest_rate: originalLoan.interest_rate,
      loan_term_months: 12,
      disbursement_date: new Date(),
      description: "",
    },
  });

  const selectedSchemeId = form.watch("loan_scheme_id");

  React.useEffect(() => {
    if (selectedSchemeId) {
      const scheme = allLoanSchemes.find(s => s.id === selectedSchemeId);
      if (scheme) {
        form.setValue("interest_rate", scheme.default_interest_rate);
        form.setValue("loan_term_months", scheme.max_term_months);
      }
    } else {
        form.setValue("interest_rate", originalLoan.interest_rate)
    }
  }, [selectedSchemeId, allLoanSchemes, form, originalLoan.interest_rate]);
  
  React.useEffect(() => {
    if (open) {
      form.reset({
        loan_scheme_id: "",
        amount: capitalizedPrincipal,
        interest_rate: originalLoan.interest_rate,
        loan_term_months: 12,
        disbursement_date: new Date(),
        description: "",
      });
    }
  }, [open, capitalizedPrincipal, originalLoan.interest_rate, form]);

  const onSubmit = async (values: RestructureFormValues) => {
    setIsSubmitting(true);
    try {
        const selectedScheme = allLoanSchemes.find(s => s.id === values.loan_scheme_id);
        if (!selectedScheme && values.loan_scheme_id) { // User selected a scheme but it's not found
             throw new Error("Selected scheme not found.");
        }

        // If no new scheme is selected, we need to find the original scheme to get its properties
        // This is a simplification; a real app would fetch the original loan's full scheme data.
        // For now, we assume the client has enough info if no new scheme is chosen.

        const newLoanData = {
            ...values,
            member_id: originalLoan.members!.id,
            member_name: originalLoan.members?.name || 'N/A',
            disbursement_date: values.disbursement_date.toISOString().split('T')[0],
            // Use new scheme's properties if available, otherwise this logic needs original scheme data.
            // Simplified for now: Assume Monthly/0 if no new scheme is chosen.
            repayment_frequency: selectedScheme?.repayment_frequency || 'Monthly',
            grace_period_months: selectedScheme?.repayment_frequency === 'Monthly' ? (selectedScheme.grace_period_months || 0) : 0,
        };

        await restructureLoanInDb(originalLoan.id, outstandingPrincipal, accruedInterest, newLoanData);

        toast({
            title: "Loan Restructured Successfully",
            description: `Old loan closed and new loan created for ${originalLoan.members?.name}.`,
        });

        setOpen(false);
        onRestructureComplete();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error restructuring loan",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedScheme = allLoanSchemes.find(s => s.id === selectedSchemeId);
  const canRestructure = isLoanActive && !isLoanOverdue;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => { e.stopPropagation(); if (canRestructure) setOpen(true); else e.preventDefault(); }}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restructure Loan</DialogTitle>
          <DialogDescription>
            Port remaining principal to a new loan for {originalLoan.members?.name}.
          </DialogDescription>
        </DialogHeader>
        {!canRestructure && open && ( // Show alert only if dialog is open and user can't restructure
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Restructuring Not Allowed</AlertTitle>
                <AlertDescription>
                    This loan cannot be restructured. Ensure the loan is 'Active' and has no overdue payments.
                </AlertDescription>
            </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Loan Principal (Capitalized)</FormLabel>
                  <FormControl>
                    <Input type="text" value={formatCurrency(field.value)} readOnly className="font-bold bg-muted" />
                  </FormControl>
                  <FormDescription className="flex gap-2 items-center">
                    <Info className="h-3 w-3" />
                    <span>
                        Outstanding: {formatCurrency(outstandingPrincipal)} + Accrued Interest: {formatCurrency(accruedInterest)}
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="loan_scheme_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Loan Scheme (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Keep existing terms or select new" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allLoanSchemes.filter(s => s.is_active).map(scheme => (
                        <SelectItem key={scheme.id} value={scheme.id}>
                          {scheme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                   <FormDescription>Leave blank to keep similar terms to the original loan.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedSchemeId && selectedScheme && (
                <div className="grid gap-3 rounded-md border p-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Repayment Frequency</span>
                        <span className="font-medium">{selectedScheme.repayment_frequency}</span>
                    </div>
                     {selectedScheme.repayment_frequency === 'Monthly' && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">First Payment Delay</span>
                            <span className="font-medium">{selectedScheme.grace_period_months} Month(s)</span>
                        </div>
                    )}
                </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="interest_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="loan_term_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Term (Months)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                       {selectedScheme && <FormDescription>Max: {selectedScheme.max_term_months} months</FormDescription>}
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <FormField
              control={form.control}
              name="disbursement_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Restructure / New Disbursement Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Restructuring..." : "Confirm Restructure"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    