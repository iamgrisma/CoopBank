
"use client"

import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { Badge } from "../ui/badge";
import { LoanDetailsDialog } from "./loan-details-dialog";
import { RepaymentFrequency } from "@/lib/loan-utils";

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
  members: {
    id: string;
    name: string;
  } | null;
  loan_schemes: {
    id: string;
    name: string;
    repayment_frequency: RepaymentFrequency;
    grace_period_months: number;
  } | null;
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2,
    }).format(amount).replace('NPR', 'रु');
}

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'Active':
            return 'default';
        case 'Pending':
            return 'secondary';
        case 'Paid Off':
            return 'outline';
        case 'Rejected':
            return 'destructive';
        case 'Restructured':
            return 'secondary';
        default:
            return 'secondary';
    }
}


export function LoansTable({ loans, allLoanSchemes }: { loans: Loan[], allLoanSchemes: LoanScheme[] }) {
  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead className="hidden sm:table-cell">Scheme</TableHead>
            <TableHead className="hidden md:table-cell">Disbursed</TableHead>
            <TableHead className="hidden lg:table-cell">Term</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.length === 0 ? (
            <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                    No loans found.
                </TableCell>
            </TableRow>
          ) : (
            loans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell>
                  {loan.members ? (
                     <Link href={`/members/${loan.members.id}`} className="hover:underline text-primary font-medium">
                        {loan.members.name}
                     </Link>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell className="hidden sm:table-cell">{loan.loan_schemes?.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {format(new Date(loan.disbursement_date), "yyyy-MM-dd")}
                </TableCell>
                 <TableCell className="hidden lg:table-cell">{loan.loan_term_months} months</TableCell>
                 <TableCell>
                    <Badge variant={getStatusBadgeVariant(loan.status)}>
                        {loan.status}
                    </Badge>
                </TableCell>
                 <TableCell className="text-right">{formatCurrency(loan.amount)}</TableCell>
                 <TableCell className="text-right">
                    <LoanDetailsDialog loan={loan} allLoanSchemes={allLoanSchemes} />
                 </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

    