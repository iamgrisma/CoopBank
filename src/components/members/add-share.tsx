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
import { revalidatePath } from "next/cache";

const shareFormSchema = z.object({
    certificate_number: z.string().min(1, { message: "Certificate number is required." }),
    number_of_shares: z.coerce.number().int().min(1, { message: "Number of shares must be at least 1." }),
    face_value: z.coerce.number().positive({ message: "Face value must be a positive number." }),
    purchase_date: z.date({ required_error: "Purchase date is required." }),
});

type ShareFormValues = z.infer<typeof shareFormSchema>;

async function addShareToDb(share: Omit<ShareFormValues, 'purchase_date'> & { purchase_date: string, member_id: string, member_name: string }) {
    
    // 1. Add the share record
    const { data: shareData, error: shareError } = await supabase
        .from("shares")
        .insert({
            member_id: share.member_id,
            certificate_number: share.certificate_number,
            number_of_shares: share.number_of_shares,
            face_value: share.face_value,
            purchase_date: share.purchase_date,
        })
        .select();
    
    if (shareError) {
        throw new Error(`Error adding share: ${shareError.message}`);
    }

    // 2. Create a corresponding transaction
    const transactionAmount = share.number_of_shares * share.face_value;
    const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
            member_id: share.member_id,
            member_name: share.member_name,
            type: 'Share Purchase',
            amount: transactionAmount,
            date: share.purchase_date,
            status: 'Completed',
            description: `Purchased ${share.number_of_shares} shares (Cert: ${share.certificate_number})`
        });
    
    if (transactionError) {
        // This is not ideal, as the share is already created.
        // In a real-world app, we'd use a database transaction.
        throw new Error(`Share added, but failed to create transaction: ${transactionError.message}`);
    }

    return shareData;
}

export function AddShare({ memberId, memberName }: { memberId: string, memberName: string }) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ShareFormValues>({
    resolver: zodResolver(shareFormSchema),
    defaultValues: {
      certificate_number: "",
      number_of_shares: 1,
      face_value: 100,
      purchase_date: new Date(),
    },
  });

  const onSubmit = async (values: ShareFormValues) => {
    setIsSubmitting(true);
    try {
        const shareData = {
            ...values,
            purchase_date: values.purchase_date.toISOString().split('T')[0], // format as YYYY-MM-DD
            member_id: memberId,
            member_name: memberName
        }
      await addShareToDb(shareData);
      toast({
        title: "Share Purchase Added",
        description: `Successfully recorded share purchase for ${memberName}.`,
      });
      form.reset();
      setOpen(false);
      router.refresh(); // Re-fetches data on the page
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding share purchase",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Share Purchase</DialogTitle>
          <DialogDescription>
            Record a new share purchase for {memberName}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="certificate_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. SH-101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="number_of_shares"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Shares</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="face_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Face Value (per share)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchase_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Purchase Date</FormLabel>
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
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Purchase"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
