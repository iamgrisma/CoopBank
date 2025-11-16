"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Info } from "lucide-react";
import { format } from "date-fns";

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
import { Textarea } from "../ui/textarea";
import { AmortizationEntry, allocatePayment, formatCurrency } from "@/lib/loan-utils";
import { Checkbox } from "../ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

type Allocation = {
  principal: number;
  interest: number;
  penalty: number;
  savings: number;
}

const repaymentFormSchema = z.object({
  loan_id: z.string(),
  member_id: z.string(),
  amount_paid: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  payment_date: z.date({ required_error: "Payment date is required." }),
  notes: z.string().optional(),
  waive_penalty: z.boolean().default(false),
});

type RepaymentFormValues = z.infer<typeof repaymentFormSchema>;

async function addRepaymentToDb(repayment: Omit<RepaymentFormValues, 'payment_date'> & { payment_date: string, member_name: string, allocation: Allocation }) {
  const { allocation, ...commonDetails } = repayment;

  // 1. Add the main repayment record with detailed breakdown
  const { data: repaymentData, error: repaymentError } = await supabase
    .from("loan_repayments")
    .insert({
      loan_id: commonDetails.loan_id,
      amount_paid: commonDetails.amount_paid,
      payment_date: commonDetails.payment_date,
      notes: commonDetails.notes,
      principal_paid: allocation.principal,
      interest_paid: allocation.interest,
      penalty_paid: repayment.waive_penalty ? 0 : allocation.penalty, // Record 0 if waived
    })
    .select();

  if (repaymentError) throw new Error(`Error adding repayment: ${repaymentError.message}`);

  // 2. Create corresponding transaction entries for income tracking
  const transactions = [];
  if (allocation.interest > 0) {
    transactions.push({
      member_id: commonDetails.member_id,
      member_name: commonDetails.member_name,
      type: 'Loan Interest',
      amount: allocation.interest,
      date: commonDetails.payment_date,
      status: 'Completed',
      description: `Interest portion of repayment for loan ${commonDetails.loan_id}`
    });
  }
  if (allocation.penalty > 0 && !repayment.waive_penalty) {
    transactions.push({
      member_id: commonDetails.member_id,
      member_name: commonDetails.member_name,
      type: 'Penalty Income',
      amount: allocation.penalty,
      date: commonDetails.payment_date,
      status: 'Completed',
      description: `Penalty portion of repayment for loan ${commonDetails.loan_id}`
    });
  }
   // Add principal repayment transaction as well
   if (allocation.principal > 0) {
    transactions.push({
      member_id: commonDetails.member_id,
      member_name: commonDetails.member_name,
      type: 'Loan Repayment',
      amount: allocation.principal,
      date: commonDetails.payment_date,
      status: 'Completed',
      description: `Principal portion of repayment for loan ${commonDetails.loan_id}`
    });
   }


  if (transactions.length > 0) {
    const { error: transactionError } = await supabase.from("transactions").insert(transactions);
    if (transactionError) console.error(`Repayment added, but failed to create transactions: ${transactionError.message}`);
  }

  // 3. If there's an excess, add it to savings
  if (allocation.savings > 0) {
    const { error: savingsError } = await supabase.from("savings").insert({
        member_id: commonDetails.member_id,
        amount: allocation.savings,
        deposit_date: commonDetails.payment_date,
        notes: `Excess from loan repayment (Loan ID: ${commonDetails.loan_id})`,
    });
    if (savingsError) console.error(`Failed to deposit excess amount to savings: ${savingsError.message}`);

    const { error: transactionError } = await supabase.from("transactions").insert({
        member_id: commonDetails.member_id,
        member_name: commonDetails.member_name,
        type: 'Savings Deposit',
        amount: allocation.savings,
        date: commonDetails.payment_date,
        status: 'Completed',
        description: `Excess from loan repayment (Loan ID: ${commonDetails.loan_id})`,
    });
    if (transactionError) console.error(`Failed to create savings transaction: ${transactionError.message}`);
  }

  return repaymentData;
}


interface AddRepaymentFormProps {
  loanId: string;
  memberId: string;
  memberName: string;
  schedule: AmortizationEntry[];
  onRepaymentAdded: () => void;
  triggerButton: React.ReactNode;
}

export function AddRepaymentForm({ loanId, memberId, memberName, schedule, onRepaymentAdded, triggerButton }: AddRepaymentFormProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [allocation, setAllocation] = React.useState<Allocation | null>(null);
  const { toast } = useToast();

  const overdueInstallments = schedule.filter(inst => inst.status === 'OVERDUE' || inst.status === 'DUE');
  const totalDue = overdueInstallments.reduce((acc, inst) => acc + inst.totalDue, 0);

  const form = useForm<RepaymentFormValues>({
    resolver: zodResolver(repaymentFormSchema),
    defaultValues: {
      loan_id: loanId,
      member_id: memberId,
      amount_paid: parseFloat(totalDue.toFixed(2)) || 0,
      payment_date: new Date(),
      notes: "",
      waive_penalty: false,
    },
  });

  const watchAmount = form.watch("amount_paid");
  const watchWaivePenalty = form.watch("waive_penalty");

  React.useEffect(() => {
    if (watchAmount > 0) {
      const calculatedAllocation = allocatePayment(watchAmount, overdueInstallments, watchWaivePenalty);
      setAllocation(calculatedAllocation);
    } else {
      setAllocation(null);
    }
  }, [watchAmount, watchWaivePenalty, overdueInstallments]);

  React.useEffect(() => {
    if (open) {
      const newTotalDue = schedule.filter(inst => inst.status === 'OVERDUE' || inst.status === 'DUE').reduce((acc, inst) => acc + inst.totalDue, 0);
      form.reset({
        loan_id: loanId,
        member_id: memberId,
        amount_paid: parseFloat(newTotalDue.toFixed(2)) || 0,
        payment_date: new Date(),
        notes: "",
        waive_penalty: false,
      });
    }
  }, [open, loanId, memberId, schedule, form]);

  const onSubmit = async (values: RepaymentFormValues) => {
    if (!allocation) {
      toast({ variant: "destructive", title: "Cannot submit", description: "Payment allocation is not calculated."});
      return;
    }
    setIsSubmitting(true);
    try {
      const repaymentData = {
        ...values,
        payment_date: values.payment_date.toISOString().split('T')[0], // format as YYYY-MM-DD
        member_name: memberName,
        allocation,
      }
      await addRepaymentToDb(repaymentData);
      toast({
        title: "Repayment Recorded",
        description: `Successfully recorded payment of ${formatCurrency(values.amount_paid)}.`,
      });
      form.reset();
      setOpen(false);
      onRepaymentAdded();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding repayment",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Loan Repayment</DialogTitle>
          <DialogDescription>
            Record a new payment for {memberName}. Total amount due is {formatCurrency(totalDue)}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="amount_paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount Paid</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Payment Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {allocation && (
                <div className="p-3 rounded-md border border-dashed text-sm grid gap-2">
                    <h4 className="font-semibold text-base">Payment Allocation</h4>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Penalty:</span>
                        <span className={cn(form.getValues("waive_penalty") && "line-through text-muted-foreground")}>{formatCurrency(allocation.penalty)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Interest:</span>
                        <span>{formatCurrency(allocation.interest)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Principal:</span>
                        <span>{formatCurrency(allocation.principal)}</span>
                    </div>
                    {allocation.savings > 0 && (
                         <div className="flex justify-between items-center text-green-600">
                            <span className="font-semibold">Excess to Savings:</span>
                            <span className="font-semibold">{formatCurrency(allocation.savings)}</span>
                        </div>
                    )}
                </div>
            )}
            
            <FormField
              control={form.control}
              name="waive_penalty"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Waive Penalty
                    </FormLabel>
                    <FormDescription>
                      Check this to waive the calculated penalty amount.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. Monthly installment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Recording..." : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
