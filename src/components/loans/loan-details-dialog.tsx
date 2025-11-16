
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { calculateEMI, generateAmortizationSchedule, formatCurrency, calculateTotalRepaid, Repayment } from "@/lib/loan-utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { AddRepaymentForm } from "./add-repayment";
import { useToast } from "@/hooks/use-toast";

type Loan = {
  id: string;
  amount: number;
  disbursement_date: string;
  status: string;
  interest_rate: number;
  loan_term_months: number;
  members: { name: string; } | null;
};

interface LoanDetailsDialogProps {
  loan: Loan;
  trigger?: React.ReactNode;
}

export function LoanDetailsDialog({ loan, trigger }: LoanDetailsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [repayments, setRepayments] = React.useState<Repayment[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    if (open) {
      fetchRepayments();
    }
  }, [open, loan.id]);

  const fetchRepayments = async () => {
    const { data, error } = await supabase
      .from('loan_repayments')
      .select('*')
      .eq('loan_id', loan.id)
      .order('payment_date', { ascending: false });
    
    if (error) {
      // Check for a specific error code that indicates a missing table
      if (error.code === '42P01') {
         toast({
            variant: "destructive",
            title: "Database Out of Date",
            description: "The 'loan_repayments' table is missing. Please run 'npm run db:full-setup' in your terminal and try again.",
            duration: 10000,
         });
      } else {
        console.error("Error fetching repayments:", error);
      }
    } else {
      setRepayments(data);
    }
  };
  
  const handleRepaymentAdded = () => {
      fetchRepayments(); // Refetch repayments
      router.refresh(); // Refresh server-side props if needed
  }

  const emi = calculateEMI(loan.amount, loan.interest_rate, loan.loan_term_months);
  const schedule = generateAmortizationSchedule(loan.amount, loan.interest_rate, loan.loan_term_months, new Date(loan.disbursement_date));
  const totalRepaid = calculateTotalRepaid(repayments);
  const outstandingBalance = loan.amount - totalRepaid;


  const defaultTrigger = (
     <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setOpen(true)}>View Details</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <div onClick={() => setOpen(true)}>{trigger}</div> : defaultTrigger}
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Loan Details & Repayments</DialogTitle>
          <DialogDescription>
            Loan for {loan.members?.name}. Total amount: {formatCurrency(loan.amount)}.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="repayments">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="repayments">Repayment History</TabsTrigger>
            <TabsTrigger value="schedule">Amortization Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="repayments">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 text-sm">
                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <h3 className="text-muted-foreground">Principal Amount</h3>
                    <p className="font-bold text-lg">{formatCurrency(loan.amount)}</p>
                </div>
                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <h3 className="text-muted-foreground">Total Repaid</h3>
                    <p className="font-bold text-lg text-green-600">{formatCurrency(totalRepaid)}</p>
                </div>
                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <h3 className="text-muted-foreground">Outstanding Balance</h3>
                    <p className="font-bold text-lg text-red-600">{formatCurrency(outstandingBalance)}</p>
                </div>
                 <div className="flex items-center justify-center">
                    <AddRepaymentForm 
                        loanId={loan.id}
                        loanAmount={loan.amount}
                        memberName={loan.members?.name || 'N/A'}
                        onRepaymentAdded={handleRepaymentAdded}
                        triggerButton={
                            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Repayment</Button>
                        }
                    />
                </div>
            </div>
            <ScrollArea className="h-72">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Amount Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repayments.length > 0 ? repayments.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{format(new Date(entry.payment_date), "do MMM, yyyy")}</TableCell>
                      <TableCell>{entry.notes}</TableCell>
                      <TableCell className="text-right">{formatCurrency(entry.amount_paid)}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                            No repayments recorded yet.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="schedule">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 text-sm">
                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <h3 className="text-muted-foreground">Principal Amount</h3>
                    <p className="font-bold text-lg">{formatCurrency(loan.amount)}</p>
                </div>
                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <h3 className="text-muted-foreground">Interest Rate</h3>
                    <p className="font-bold text-lg">{loan.interest_rate}% p.a.</p>
                </div>
                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <h3 className="text-muted-foreground">Term</h3>
                    <p className="font-bold text-lg">{loan.loan_term_months} months</p>
                </div>
                <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <h3 className="text-muted-foreground">Monthly EMI</h3>
                    <p className="font-bold text-lg">{formatCurrency(emi)}</p>
                </div>
            </div>

            <ScrollArea className="h-72">
                <Table>
                <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead className="text-right">Principal</TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead className="text-right">EMI</TableHead>
                    <TableHead className="text-right">Ending Balance</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {schedule.map((entry) => (
                    <TableRow key={entry.month}>
                        <TableCell>{entry.month}</TableCell>
                        <TableCell>{entry.paymentDate}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.principal)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.interest)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.emi)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.endingBalance)}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
