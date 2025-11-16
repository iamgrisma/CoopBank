"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { calculateEMI, generateAmortizationSchedule, formatCurrency } from "@/lib/loan-utils";
import { Badge } from "../ui/badge";

type Loan = {
  id: string;
  amount: number;
  disbursement_date: string;
  status: string;
  interest_rate: number;
  loan_term_months: number;
};

interface LoanDetailsDialogProps {
  loan: Loan;
  children: React.ReactNode;
}

export function LoanDetailsDialog({ loan, children }: LoanDetailsDialogProps) {
  const [open, setOpen] = React.useState(false);

  const emi = calculateEMI(loan.amount, loan.interest_rate, loan.loan_term_months);
  const schedule = generateAmortizationSchedule(loan.amount, loan.interest_rate, loan.loan_term_months, new Date(loan.disbursement_date));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Loan Repayment Schedule</DialogTitle>
          <DialogDescription>
            Detailed amortization schedule for the selected loan.
          </DialogDescription>
        </DialogHeader>
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

        <ScrollArea className="h-96">
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
      </DialogContent>
    </Dialog>
  );
}
