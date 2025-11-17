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
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";

const applicabilityOptions = [
    { id: 'members', label: 'Members' },
    { id: 'outsiders', label: 'Outsiders' },
]

const schemeFormSchema = z.object({
  name: z.string().min(2, { message: "Scheme name must be at least 2 characters." }),
  default_interest_rate: z.coerce.number().min(0, "Interest rate cannot be negative."),
  max_term_months: z.coerce.number().int().positive("Max term must be a positive integer."),
  min_term_months: z.coerce.number().int().positive("Min term must be a positive integer."),
  applicable_to: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one applicability option.",
  }),
  repayment_frequency: z.string().min(1, "Please select a repayment frequency."),
  processing_fee_percentage: z.coerce.number().min(0, "Processing fee cannot be negative.").optional(),
  late_payment_penalty: z.coerce.number().min(0, "Late payment penalty cannot be negative.").optional(),
  offer_start_date: z.date().optional(),
  offer_end_date: z.date().optional(),
  is_active: z.boolean().default(true),
});

type SchemeFormValues = z.infer<typeof schemeFormSchema>;

async function addSchemeToDb(scheme: Omit<SchemeFormValues, 'offer_start_date' | 'offer_end_date'> & { offer_start_date?: string, offer_end_date?: string }) {
    const { data, error } = await supabase.from("loan_schemes").insert([scheme]).select();
    if (error) throw new Error(error.message);
    return data;
}

interface AddLoanSchemeProps {
  triggerButton: React.ReactNode;
}

export function AddLoanScheme({ triggerButton }: AddLoanSchemeProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SchemeFormValues>({
    resolver: zodResolver(schemeFormSchema),
    defaultValues: {
      name: "",
      default_interest_rate: 12,
      max_term_months: 60,
      min_term_months: 6,
      applicable_to: ["members"],
      repayment_frequency: "Monthly",
      processing_fee_percentage: 1,
      late_payment_penalty: 500,
      is_active: true,
    },
  });

  const onSubmit = async (values: SchemeFormValues) => {
    setIsSubmitting(true);
    try {
      const schemeData = {
        ...values,
        offer_start_date: values.offer_start_date?.toISOString(),
        offer_end_date: values.offer_end_date?.toISOString(),
      };
      await addSchemeToDb(schemeData);
      toast({
        title: "Loan Scheme Created",
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Loan Scheme</DialogTitle>
          <DialogDescription>
            Define the parameters for a new loan product.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="max-h-[70vh] p-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheme Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Personal Loan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="default_interest_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interest Rate (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="min_term_months"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Term (Months)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="max_term_months"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Term (Months)</FormLabel>
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
                    name="repayment_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repayment Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                            <SelectItem value="Quarterly">Quarterly</SelectItem>
                            <SelectItem value="Half-Yearly">Half-Yearly</SelectItem>
                            <SelectItem value="Yearly">Yearly</SelectItem>
                            <SelectItem value="One-Time">One-Time (Bullet)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="processing_fee_percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Processing Fee (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="late_payment_penalty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Late Payment Penalty (Fixed Amt)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="offer_start_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Offer Start Date (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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
                    <FormField
                      control={form.control}
                      name="offer_end_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Offer End Date (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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
                </div>
                
                <FormField
                  control={form.control}
                  name="applicable_to"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Applicability</FormLabel>
                        <FormDescription>
                          Who is this loan scheme available to?
                        </FormDescription>
                      </div>
                      {applicabilityOptions.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="applicable_to"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <DialogFooter className="pt-4">
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
