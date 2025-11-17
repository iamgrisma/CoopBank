"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, CalendarIcon } from "lucide-react";
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

const memberFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  join_date: z.date({ required_error: "Join date is required." }),
  dob: z.date().optional(),
  nominee_name: z.string().optional(),
  nominee_relationship: z.string().optional(),
  district_code: z.string().length(2, "Must be 2 digits").regex(/^\d+$/, "Must be digits"),
  local_level_code: z.string().length(2, "Must be 2 digits").regex(/^\d+$/, "Must be digits"),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

async function getNextAccountNumber() {
    const { count, error } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });
    
    if (error) {
        console.error('Error fetching member count for A/C number:', error);
        // Fallback in case of error
        return `0000${Math.floor(Math.random() * 1000)}`.slice(-7);
    }
    
    const nextVal = (count || 0) + 100; // Start from 100
    return nextVal.toString().padStart(7, '0');
}


async function addMemberToDb(member: Omit<MemberFormValues, 'join_date' | 'dob'> & { join_date: string, dob?: string, account_number: string }) {
    const { data, error } = await supabase.from("members").insert([member]).select();
    
    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export function AddMember() {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      join_date: new Date(),
      nominee_name: "",
      nominee_relationship: "",
      district_code: "01",
      local_level_code: "01",
    },
  });

  const onSubmit = async (values: MemberFormValues) => {
    setIsSubmitting(true);
    try {
        const branchCode = "001";
        const nextAccNumPart = await getNextAccountNumber();
        
        // Temporarily using hardcoded '01' for saving type as it's the most common.
        // A more robust solution might involve another form field if needed.
        const savingTypeCode = "01"; 

        const fullAccountNumber = `${branchCode}${values.district_code}${values.local_level_code}${savingTypeCode}${nextAccNumPart}`;

        const memberData = {
            ...values,
            join_date: values.join_date.toISOString(),
            dob: values.dob ? values.dob.toISOString() : undefined,
            account_number: fullAccountNumber,
        }
      await addMemberToDb(memberData);
      toast({
        title: "Member Added",
        description: `${values.name} has been successfully added.`,
      });
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding member",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new member to the cooperative.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Grisma Pokharel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="9800000000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Kathmandu, Nepal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="district_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="local_level_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local Level Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <FormField
              control={form.control}
              name="join_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Join Date</FormLabel>
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
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
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
              name="dob"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth (Optional)</FormLabel>
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
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
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
              name="nominee_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nominee Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nominee_relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nominee Relationship (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Spouse" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding Member..." : "Add Member"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
