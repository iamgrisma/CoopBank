"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
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

const repaymentFormSchema = z.object({
  loan_id: z.string(),
  amount_paid: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  payment_date: z.date({ required_error: "Payment date is required." }),
  notes: z.string().optional(),
});

type RepaymentFormValues = z.infer<typeof repaymentFormSchema>;

async function addRepaymentToDb(repayment: Omit<RepaymentFormValues, 'payment_date'> & { payment_date: string, member_name: string }) {
  // 1. Add the repayment record
  const { data: repaymentData, error: repaymentError } = await supabase
    .from("loan_repayments")
    .insert({
      loan_id: repayment.loan_id,
      amount_paid: repayment.amount_paid,
      payment_date: repayment.payment_date,
      notes: repayment.notes,
    })
    .select();

  if (repaymentError) {
    throw new Error(`Error adding repayment: ${repaymentError.message}`);
  }

  // 2. Create a corresponding transaction
  const { error: transactionError } = await supabase
    .from("transactions")
    .insert({
      // We don't have member_id directly, but we can log member_name
      member_name: repayment.member_name,
      type: 'Loan Repayment',
      amount: repayment.amount_paid,
      date: repayment.payment_date,
      status: 'Completed',
      description: `Loan repayment. ${repayment.notes || ''}`
    });

  if (transactionError) {
    console.error(`Repayment added, but failed to create transaction: ${transactionError.message}`);
    // Not throwing error here as the primary action (repayment) succeeded.
  }

  return repaymentData;
}

interface AddRepaymentFormProps {
  loanId: string;
  loanAmount: number;
  memberName: string;
  onRepaymentAdded: () => void;
  triggerButton: React.ReactNode;
}

export function AddRepaymentForm({ loanId, memberName, onRepaymentAdded, triggerButton }: AddRepaymentFormProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<RepaymentFormValues>({
    resolver: zodResolver(repaymentFormSchema),
    defaultValues: {
      loan_id: loanId,
      amount_paid: 0,
      payment_date: new Date(),
      notes: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        loan_id: loanId,
        amount_paid: 0,
        payment_date: new Date(),
        notes: "",
      });
    }
  }, [open, loanId, form]);

  const onSubmit = async (values: RepaymentFormValues) => {
    setIsSubmitting(true);
    try {
      const repaymentData = {
        ...values,
        payment_date: values.payment_date.toISOString().split('T')[0], // format as YYYY-MM-DD
        member_name: memberName
      }
      await addRepaymentToDb(repaymentData);
      toast({
        title: "Repayment Recorded",
        description: `Successfully recorded payment of ${values.amount_paid}.`,
      });
      form.reset();
      setOpen(false);
      onRepaymentAdded(); // Callback to refresh parent component
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Loan Repayment</DialogTitle>
          <DialogDescription>
            Record a new payment for {memberName}.
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
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
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
