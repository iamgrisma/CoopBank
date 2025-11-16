"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

type Member = {
  id: string;
  name: string;
};

type LoanScheme = {
  id: string;
  name: string;
  default_interest_rate: number;
  max_term_months: number;
};

const loanFormSchema = z.object({
  member_id: z.string().min(1, { message: "Please select a member." }),
  loan_scheme_id: z.string().min(1, { message: "Please select a loan scheme." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  interest_rate: z.coerce.number().positive({ message: "Interest rate must be a positive number." }),
  loan_term_months: z.coerce.number().int().min(1, { message: "Term must be at least 1 month." }),
  disbursement_date: z.date({ required_error: "Disbursement date is required." }),
  status: z.string().min(1, { message: "Please select a status." }),
  description: z.string().optional(),
});

type LoanFormValues = z.infer<typeof loanFormSchema>;

async function addLoanToDb(loan: Omit<LoanFormValues, 'disbursement_date'> & { disbursement_date: string, member_name: string }) {
  // 1. Add the loan record
  const { data: loanData, error: loanError } = await supabase
    .from("loans")
    .insert({
      member_id: loan.member_id,
      loan_scheme_id: loan.loan_scheme_id,
      amount: loan.amount,
      interest_rate: loan.interest_rate,
      loan_term_months: loan.loan_term_months,
      disbursement_date: loan.disbursement_date,
      status: loan.status,
      description: loan.description,
    })
    .select();

  if (loanError) {
    throw new Error(`Error adding loan: ${loanError.message}`);
  }

  // 2. Create a corresponding transaction if the loan is disbursed
  if (loan.status === 'Active') {
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        member_id: loan.member_id,
        member_name: loan.member_name,
        type: 'Loan Disbursement',
        amount: loan.amount,
        date: loan.disbursement_date,
        status: 'Completed',
        description: `Loan disbursed. ${loan.description || ''}`
      });

    if (transactionError) {
      console.error(`Loan added, but failed to create transaction: ${transactionError.message}`);
      throw new Error(`Loan added, but failed to create transaction: ${transactionError.message}`);
    }
  }

  return loanData;
}

interface AddLoanProps {
  members?: Member[];
  loanSchemes: LoanScheme[];
  defaultMember?: Member;
  triggerButton: React.ReactNode;
}

export function AddLoan({ members, loanSchemes, defaultMember, triggerButton }: AddLoanProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      member_id: defaultMember?.id,
      loan_scheme_id: "",
      amount: 0,
      interest_rate: 0,
      loan_term_months: 12,
      disbursement_date: new Date(),
      status: 'Pending',
      description: ""
    },
  });

  const selectedSchemeId = form.watch("loan_scheme_id");

  React.useEffect(() => {
    if (selectedSchemeId) {
      const scheme = loanSchemes.find(s => s.id === selectedSchemeId);
      if (scheme) {
        form.setValue("interest_rate", scheme.default_interest_rate);
        form.setValue("loan_term_months", scheme.max_term_months);
      }
    }
  }, [selectedSchemeId, loanSchemes, form]);
  
  React.useEffect(() => {
    if (open) {
      form.reset({
        member_id: defaultMember?.id,
        loan_scheme_id: "",
        amount: 0,
        interest_rate: 0,
        loan_term_months: 12,
        disbursement_date: new Date(),
        status: 'Pending',
        description: ""
      });
    }
  }, [open, defaultMember, form]);

  const onSubmit = async (values: LoanFormValues) => {
    setIsSubmitting(true);
    try {
      const allMembers = members || (defaultMember ? [defaultMember] : []);
      const memberName = allMembers.find(m => m.id === values.member_id)?.name || 'Unknown Member';

      const loanData = {
        ...values,
        disbursement_date: values.disbursement_date.toISOString().split('T')[0], // format as YYYY-MM-DD
        member_name: memberName
      }
      await addLoanToDb(loanData);
      toast({
        title: "Loan Application Added",
        description: `Successfully recorded loan for ${memberName}.`,
      });
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding loan",
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
          <DialogTitle>Add New Loan</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new loan application.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            {!defaultMember && members && (
              <FormField
                control={form.control}
                name="member_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Member</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? members.find(
                                (member) => member.id === field.value
                              )?.name
                              : "Select member"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search member..." />
                          <CommandList>
                            <CommandEmpty>No member found.</CommandEmpty>
                            <CommandGroup>
                              {members.map((member) => (
                                <CommandItem
                                  value={member.id}
                                  key={member.id}
                                  onSelect={(currentValue) => {
                                    form.setValue("member_id", currentValue === field.value ? "" : currentValue)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      member.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {member.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="loan_scheme_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Scheme</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a loan scheme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loanSchemes.map(scheme => (
                        <SelectItem key={scheme.id} value={scheme.id}>
                          {scheme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                      <FormLabel>Term (Months)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
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
                  <FormLabel>Disbursement Date</FormLabel>
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Set loan status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Paid Off">Paid Off</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. Loan for emergency medical expenses" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding Loan..." : "Add Loan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
