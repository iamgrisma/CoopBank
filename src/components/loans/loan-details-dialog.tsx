
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
import { generateDynamicAmortizationSchedule, formatCurrency, calculateTotalRepaid, Repayment, AmortizationEntry, generateIdealSchedule, RepaymentFrequency, calculateAccruedInterestToDate } from "@/lib/loan-utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { AddRepaymentForm } from "./add-repayment";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { RestructureLoanDialog } from "./restructure-loan";


type LoanScheme = {
  id: string;
  name: string;
  default_interest_rate: number;
  max_term_months: number;
  grace_period_months: number;
  repayment_frequency: string;
  is_active: boolean;
};

type Loan = {
  id: string;
  amount: number;
  disbursement_date: string;
  status: string;
  interest_rate: number;
  loan_term_months: number;
  repayment_frequency: RepaymentFrequency;
  grace_period_months: number;
  members: { id: string; name: string; } | null;
  loan_schemes: {
      name: string;
      repayment_frequency: RepaymentFrequency;
      grace_period_months: number;
  } | null;
};

interface LoanDetailsDialogProps {
  loan: Loan;
  allLoanSchemes: LoanScheme[];
  trigger?: React.ReactNode;
}

export function LoanDetailsDialog({ loan, allLoanSchemes, trigger }: LoanDetailsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [repayments, setRepayments] = React.useState<Repayment[]>([]);
  const [schedule, setSchedule] = React.useState<AmortizationEntry[]>([]);
  const [idealSchedule, setIdealSchedule] = React.useState<any[]>([]); // Using any to avoid type errors with ideal schedule generation
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchLoanData = React.useCallback(async () => {
    if (!loan.id) return;
    setIsLoading(true);
    
    try {
      const { data: repaymentData, error: repaymentError } = await supabase
        .from('loan_repayments')
        .select('*')
        .eq('loan_id', loan.id)
        .order('payment_date', { ascending: true });

      if (repaymentError) {
        toast({
            variant: "destructive",
            title: "Database Error",
            description: "Could not fetch repayment history. The database may be out of date. Please run 'npm run db:full-setup' in your terminal and try again.",
            duration: 10000,
        });
        setRepayments([]);
        setSchedule([]);
        setIdealSchedule([]);
        return;
      }

      const fetchedRepayments = repaymentData || [];
      setRepayments(fetchedRepayments);
      
      const frequency = loan.repayment_frequency || loan.loan_schemes?.repayment_frequency || 'Monthly';
      const gracePeriod = loan.grace_period_months ?? loan.loan_schemes?.grace_period_months ?? 0;

      const dynamicSchedule = generateDynamicAmortizationSchedule(
          loan.amount,
          loan.interest_rate,
          loan.loan_term_months,
          new Date(loan.disbursement_date),
          fetchedRepayments,
          frequency,
          gracePeriod
      );
      setSchedule(dynamicSchedule);

      const ideal = generateIdealSchedule(
          loan.amount,
          loan.interest_rate,
          loan.loan_term_months,
          new Date(loan.disbursement_date),
          frequency,
          gracePeriod
      );
      setIdealSchedule(ideal);

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Application Error",
            description: `An unexpected error occurred: ${error.message}`,
            duration: 10000,
        });
        setRepayments([]);
        setSchedule([]);
        setIdealSchedule([]);
    } finally {
      setIsLoading(false);
    }
  }, [loan, toast]);


  React.useEffect(() => {
    if (open) {
      fetchLoanData();
    }
  }, [open, fetchLoanData]);
  
  const handleActionCompleted = () => {
      fetchLoanData();
      router.refresh();
  }

  const totalRepaid = calculateTotalRepaid(repayments);
  const totalPrincipalRepaid = repayments.reduce((acc, p) => acc + p.principal_paid, 0);
  const outstandingBalance = loan.amount - totalPrincipalRepaid;
  const totalInterestPaid = repayments.reduce((acc, p) => acc + p.interest_paid, 0);
  const totalPenalInterestPaid = repayments.reduce((acc, p) => acc + (p.penal_interest_paid || 0), 0);
  const totalPenaltyPaid = repayments.reduce((acc, p) => acc + p.penalty_paid, 0);
  
  const totalDueToday = schedule.filter(s => s.status === 'DUE' || s.status === 'OVERDUE' || s.status === 'PARTIALLY_PAID').reduce((acc, s) => acc + s.totalDue, 0);
  const isLoanOverdue = totalDueToday > 0;
  const isLoanActive = loan.status === 'Active';

  const lastPaymentDate = repayments.length > 0 ? new Date(repayments[repayments.length - 1].payment_date) : new Date(loan.disbursement_date);
  const accruedInterest = calculateAccruedInterestToDate(outstandingBalance, loan.interest_rate, lastPaymentDate, new Date());
  const capitalizedPrincipal = outstandingBalance + accruedInterest;

  const getStatusBadge = (status: AmortizationEntry['status']) => {
    switch (status) {
        case 'PAID':
            return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Paid</Badge>;
        case 'DUE':
            return <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">Due Today</Badge>;
        case 'OVERDUE':
            return <Badge variant="destructive">Overdue</Badge>;
        case 'PARTIALLY_PAID':
            return <Badge variant="secondary" className="bg-yellow-400 text-black hover:bg-yellow-500">Partially Paid</Badge>;
        case 'UPCOMING':
            return <Badge variant="secondary">Upcoming</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>
    }
  }

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
      {trigger ? <div onClick={(e) => { e.stopPropagation(); setOpen(true); }}>{trigger}</div> : defaultTrigger}
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Loan Details & Ledger</DialogTitle>
          <DialogDescription>
            Loan for {loan.members?.name}. Total amount: {formatCurrency(loan.amount)}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 text-sm">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Principal</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-bold text-lg text-red-600">{formatCurrency(outstandingBalance)}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Due Today</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-bold text-lg text-orange-600">{formatCurrency(totalDueToday)}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Repaid</CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="font-bold text-lg text-green-600">{formatCurrency(totalRepaid)}</p>
                </CardContent>
            </Card>
             <div className="flex items-center justify-center gap-2">
                <AddRepaymentForm 
                    loanId={loan.id}
                    memberId={loan.members?.id || ''}
                    memberName={loan.members?.name || 'N/A'}
                    schedule={schedule}
                    onRepaymentAdded={handleActionCompleted}
                    triggerButton={
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Repayment</Button>
                    }
                />
                 <RestructureLoanDialog 
                    originalLoan={loan}
                    outstandingPrincipal={outstandingBalance}
                    accruedInterest={accruedInterest}
                    capitalizedPrincipal={capitalizedPrincipal}
                    allLoanSchemes={allLoanSchemes}
                    isLoanOverdue={isLoanOverdue}
                    isLoanActive={isLoanActive}
                    onRestructureComplete={handleActionCompleted}
                    trigger={
                        <Button variant="secondary" disabled={!isLoanActive || isLoanOverdue}>Restructure</Button>
                    }
                 />
            </div>
        </div>

        <Accordion type="single" collapsible className="w-full" defaultValue="live-amortization">
           <AccordionItem value="ideal-schedule">
                <AccordionTrigger className="text-base font-semibold">Ideal Repayment Schedule</AccordionTrigger>
                <AccordionContent>
                    <ScrollArea className="h-64">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background">
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="text-right">EPI</TableHead>
                                    <TableHead className="text-right">Principal</TableHead>
                                    <TableHead className="text-right">Interest</TableHead>
                                    <TableHead className="text-right">Ending Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading schedule...</TableCell></TableRow>
                                ) : idealSchedule.length > 0 ? idealSchedule.map((entry) => (
                                    <TableRow key={entry.month}>
                                        <TableCell>{entry.month}</TableCell>
                                        <TableCell>{format(entry.paymentDate, "do MMM, yyyy")}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(entry.emi)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(entry.principal)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(entry.interest)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(entry.endingBalance)}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={6} className="h-24 text-center">No ideal schedule to display.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="live-amortization">
                <AccordionTrigger className="text-base font-semibold">Live Amortization Schedule</AccordionTrigger>
                <AccordionContent>
                    <ScrollArea className="h-72">
                        <Table>
                        <TableHeader className="sticky top-0 bg-background">
                            <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Principal Due</TableHead>
                            <TableHead className="text-right">Interest Due</TableHead>
                            <TableHead className="text-right">Penal Interest</TableHead>
                            <TableHead className="text-right">Fine Due</TableHead>
                            <TableHead className="text-right">Total Due</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={7} className="h-24 text-center">Loading schedule...</TableCell></TableRow>
                        ) : schedule.length > 0 ? schedule.map((entry) => (
                            <TableRow key={entry.month} className={entry.status === 'OVERDUE' ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                                <TableCell>{format(entry.paymentDate, "do MMM, yyyy")}</TableCell>
                                <TableCell>{getStatusBadge(entry.status)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(Math.max(0, entry.principal - entry.principalPaid))}</TableCell>
                                <TableCell className="text-right">{formatCurrency(Math.max(0, entry.interest - entry.interestPaid))}</TableCell>
                                <TableCell className="text-right">{formatCurrency(Math.max(0, entry.penalInterest - entry.penalInterestPaid))}</TableCell>
                                <TableCell className="text-right">{formatCurrency(Math.max(0, entry.penalty - entry.penaltyPaid))}</TableCell>
                                <TableCell className="text-right font-semibold">{formatCurrency(entry.totalDue)}</TableCell>
                            </TableRow>
                            )) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No schedule to display. This might be due to an error fetching data.
                                </TableCell>
                            </TableRow>
                            )
                        }
                        </TableBody>
                        </Table>
                    </ScrollArea>
                </AccordionContent>
            </AccordionItem>
          
            <AccordionItem value="repayment-history">
                <AccordionTrigger className="text-base font-semibold">Repayment History</AccordionTrigger>
                <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 text-sm">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Principal Paid</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-bold text-lg">{formatCurrency(totalPrincipalRepaid)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Interest Paid</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-bold text-lg">{formatCurrency(totalInterestPaid)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Penal Interest Paid</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-bold text-lg">{formatCurrency(totalPenalInterestPaid)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Fines Paid</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-bold text-lg">{formatCurrency(totalPenaltyPaid)}</p>
                            </CardContent>
                        </Card>
                    </div>
                    <ScrollArea className="h-64">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                            <TableHead>Payment Date</TableHead>
                            <TableHead className="text-right">Principal</TableHead>
                            <TableHead className="text-right">Interest</TableHead>
                            <TableHead className="text-right">Penal Int.</TableHead>
                            <TableHead className="text-right">Fine</TableHead>
                            <TableHead className="text-right">Total Paid</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading history...</TableCell></TableRow>
                        ) : repayments.length > 0 ? repayments.map((entry) => (
                            <TableRow key={entry.id}>
                            <TableCell>{format(new Date(entry.payment_date), "do MMM, yyyy")}</TableCell>
                            <TableCell className="text-right">{formatCurrency(entry.principal_paid)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(entry.interest_paid)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(entry.penal_interest_paid)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(entry.penalty_paid)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(entry.amount_paid)}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No repayments recorded yet.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </ScrollArea>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}
