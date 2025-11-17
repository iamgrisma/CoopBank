
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";

type Member = {
  id: string;
  name: string;
};

const withdrawalFormSchema = z.object({
  member_id: z.string().min(1, { message: "Please select a member." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  withdrawal_date: z.date({ required_error: "Withdrawal date is required." }),
  notes: z.string().optional(),
});

type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;

async function addWithdrawalToDb(withdrawal: Omit<WithdrawalFormValues, 'withdrawal_date'> & { withdrawal_date: string, member_name: string }) {
  // 1. Add the withdrawal record
  const { data: withdrawalData, error: withdrawalError } = await supabase
    .from("withdrawals")
    .insert({
      member_id: withdrawal.member_id,
      amount: withdrawal.amount,
      withdrawal_date: withdrawal.withdrawal_date,
      notes: withdrawal.notes,
    })
    .select();

  if (withdrawalError) {
    throw new Error(`Error adding withdrawal: ${withdrawalError.message}`);
  }

  // 2. Create a corresponding transaction
  const { error: transactionError } = await supabase
    .from("transactions")
    .insert({
      member_id: withdrawal.member_id,
      member_name: withdrawal.member_name,
      type: 'Savings Withdrawal',
      amount: withdrawal.amount,
      date: withdrawal.withdrawal_date,
      status: 'Completed',
      description: `Savings withdrawal. ${withdrawal.notes || ''}`
    });

  if (transactionError) {
    console.error(`Withdrawal added, but failed to create transaction: ${transactionError.message}`);
    throw new Error(`Withdrawal added, but failed to create transaction: ${transactionError.message}`);
  }

  return withdrawalData;
}

interface AddWithdrawalProps {
  members?: Member[];
  defaultMember?: Member;
  triggerButton: React.ReactNode;
}

export function AddWithdrawal({ members, defaultMember, triggerButton }: AddWithdrawalProps) {
  const [open, setOpen] = React.useState(false);
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      member_id: defaultMember?.id,
      amount: 0,
      withdrawal_date: new Date(),
      notes: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        member_id: defaultMember?.id,
        amount: 0,
        withdrawal_date: new Date(),
        notes: "",
      });
    }
  }, [open, defaultMember, form]);

  const onSubmit = async (values: WithdrawalFormValues) => {
    setIsSubmitting(true);
    try {
      const allMembers = members || (defaultMember ? [defaultMember] : []);
      const memberName = allMembers.find(m => m.id === values.member_id)?.name || 'Unknown Member';

      const withdrawalData = {
        ...values,
        withdrawal_date: values.withdrawal_date.toISOString().split('T')[0], // format as YYYY-MM-DD
        member_name: memberName
      }
      await addWithdrawalToDb(withdrawalData);
      toast({
        title: "Withdrawal Recorded",
        description: `Successfully recorded withdrawal for ${memberName}.`,
      });
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error recording withdrawal",
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
          <DialogTitle>Record Savings Withdrawal</DialogTitle>
          <DialogDescription>
            Record a new withdrawal from a member's savings.
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
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
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
                                  value={member.name}
                                  key={member.id}
                                  onSelect={() => {
                                    form.setValue("member_id", member.id);
                                    setPopoverOpen(false);
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="withdrawal_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Withdrawal Date</FormLabel>
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
                    <Textarea placeholder="e.g. Personal use" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Recording..." : "Record Withdrawal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
