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
  CommandList
} from "@/components/ui/command";
import { Textarea } from "../ui/textarea";

type Member = {
  id: string;
  name: string;
};

const savingFormSchema = z.object({
  member_id: z.string().min(1, { message: "Please select a member." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  deposit_date: z.date({ required_error: "Deposit date is required." }),
  notes: z.string().optional(),
});

type SavingFormValues = z.infer<typeof savingFormSchema>;

async function addSavingToDb(saving: Omit<SavingFormValues, 'deposit_date'> & { deposit_date: string, member_name: string }) {
  // 1. Add the saving record
  const { data: savingData, error: savingError } = await supabase
    .from("savings")
    .insert({
      member_id: saving.member_id,
      amount: saving.amount,
      deposit_date: saving.deposit_date,
      notes: saving.notes,
    })
    .select();

  if (savingError) {
    throw new Error(`Error adding saving: ${savingError.message}`);
  }

  // 2. Create a corresponding transaction
  const { error: transactionError } = await supabase
    .from("transactions")
    .insert({
      member_id: saving.member_id,
      member_name: saving.member_name,
      type: 'Savings Deposit',
      amount: saving.amount,
      date: saving.deposit_date,
      status: 'Completed',
      description: `Daily saving deposit. ${saving.notes || ''}`
    });

  if (transactionError) {
    console.error(`Saving added, but failed to create transaction: ${transactionError.message}`);
    throw new Error(`Saving added, but failed to create transaction: ${transactionError.message}`);
  }

  return savingData;
}

interface AddSavingProps {
  members?: Member[];
  defaultMember?: Member;
  triggerButton: React.ReactNode;
}

export function AddSaving({ members, defaultMember, triggerButton }: AddSavingProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SavingFormValues>({
    resolver: zodResolver(savingFormSchema),
    defaultValues: {
      member_id: defaultMember?.id,
      amount: 0,
      deposit_date: new Date(),
      notes: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        member_id: defaultMember?.id,
        amount: 0,
        deposit_date: new Date(),
        notes: "",
      });
    }
  }, [open, defaultMember, form]);

  const onSubmit = async (values: SavingFormValues) => {
    setIsSubmitting(true);
    try {
      const allMembers = members || (defaultMember ? [defaultMember] : []);
      const memberName = allMembers.find(m => m.id === values.member_id)?.name || 'Unknown Member';

      const savingData = {
        ...values,
        deposit_date: values.deposit_date.toISOString().split('T')[0], // format as YYYY-MM-DD
        member_name: memberName
      }
      await addSavingToDb(savingData);
      toast({
        title: "Savings Deposit Added",
        description: `Successfully recorded deposit for ${memberName}.`,
      });
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      // Supabase unique constraint violation error code is '23505'
      if (error.message.includes("23505")) {
         toast({
          variant: "destructive",
          title: "Duplicate Record",
          description: "This record seems to be a duplicate. Please check the details.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error adding deposit",
          description: error.message,
        });
      }
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
          <DialogTitle>Add Savings Deposit</DialogTitle>
          <DialogDescription>
            Record a new daily savings deposit for a member.
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
                                  value={member.name}
                                  key={member.id}
                                  onSelect={() => {
                                    form.setValue("member_id", member.id)
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
              name="deposit_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Deposit Date</FormLabel>
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
                    <Textarea placeholder="e.g. Daily collection" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Deposit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
