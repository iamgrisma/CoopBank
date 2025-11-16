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

type Loan = {
  id: string;
  amount: number;
  disbursement_date: string;
  status: string;
  interest_rate: number;
  loan_term_months: number;
  members: {
    id: string;
    name: string;
  } | null;
  loan_schemes: {
    id: string;
    name: string;
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
        default:
            return 'secondary';
    }
}


export function LoansTable({ loans }: { loans: Loan[] }) {
  return (
    <div className="rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Scheme</TableHead>
            <TableHead>Disbursement Date</TableHead>
            <TableHead>Term</TableHead>
            <TableHead>Interest</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loans.length === 0 ? (
            <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
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
                <TableCell>{loan.loan_schemes?.name}</TableCell>
                <TableCell>
                  {format(new Date(loan.disbursement_date), "yyyy-MM-dd")}
                </TableCell>
                 <TableCell>{loan.loan_term_months} months</TableCell>
                 <TableCell>{loan.interest_rate}%</TableCell>
                 <TableCell>
                    <Badge variant={getStatusBadgeVariant(loan.status)}>
                        {loan.status}
                    </Badge>
                </TableCell>
                 <TableCell className="text-right">{formatCurrency(loan.amount)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
