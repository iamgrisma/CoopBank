"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";

const schemeFormSchema = z.object({
  name: z.string().min(2, { message: "Scheme name must be at least 2 characters." }),
  interest_rate: z.coerce.number().min(0, "Interest rate cannot be negative."),
  type: z.string().min(1, "Please select a scheme type."),
  lock_in_period_years: z.coerce.number().int().min(0, "Lock-in period must be 0 or more.").optional(),
  is_active: z.boolean().default(true),
});

type SchemeFormValues = z.infer<typeof schemeFormSchema>;

async function addSchemeToDb(scheme: SchemeFormValues) {
    const { data, error } = await supabase.from("saving_schemes").insert([scheme]).select();
    if (error) throw new Error(error.message);
    return data;
}

interface AddSavingSchemeProps {
  triggerButton: React.ReactNode;
}

export function AddSavingScheme({ triggerButton }: AddSavingSchemeProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SchemeFormValues>({
    resolver: zodResolver(schemeFormSchema),
    defaultValues: {
      name: "",
      interest_rate: 4.5,
      type: "Daily",
      lock_in_period_years: 0,
      is_active: true,
    },
  });

  const watchType = form.watch("type");

  const onSubmit = async (values: SchemeFormValues) => {
    setIsSubmitting(true);
    try {
      await addSchemeToDb(values);
      toast({
        title: "Saving Scheme Created",
        description: `Successfully created the ${values.name} scheme.`,
      });
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating scheme",
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Saving Scheme</DialogTitle>
          <DialogDescription>
            Define the parameters for a new saving product.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheme Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Regular Savings" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheme Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Daily">Daily Savings</SelectItem>
                      <SelectItem value="LTD">Long Term Deposit (LTD)</SelectItem>
                      <SelectItem value="Current">Current Account</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of saving account.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interest_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Rate (% p.a.)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} disabled={watchType === 'Current'} />
                  </FormControl>
                   {watchType === 'Current' && <FormDescription>Current accounts have 0% interest.</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchType === 'LTD' && (
              <FormField
                control={form.control}
                name="lock_in_period_years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lock-in Period (Years)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      For how many years the deposit will be locked.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Activate Scheme
                    </FormLabel>
                    <FormDescription>
                      Allow new deposits under this scheme.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating Scheme..." : "Create Scheme"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
