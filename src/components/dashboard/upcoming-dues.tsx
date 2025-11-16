"use client"

import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { addMonths, differenceInDays, format, isPast, isToday } from "date-fns"

type Loan = {
  id: string;
  disbursement_date: string;
  loan_term_months: number;
  members: {
    id: string;
    name: string;
  } | null;
};

// Represents a due payment for a loan
type Due = {
  loanId: string;
  memberId: string;
  memberName: string;
  dueDate: Date;
  daysUntilDue: number;
};

const getNextDueDate = (disbursementDate: string, term: number): Date | null => {
  const startDate = new Date(disbursementDate);
  const now = new Date();
  
  for (let i = 1; i <= term; i++) {
    const dueDate = addMonths(startDate, i);
    if (dueDate >= now) {
      return dueDate;
    }
  }
  
  return null; // All dues are in the past
};

const getOverdueDues = (disbursementDate: string, term: number): Date[] => {
    const startDate = new Date(disbursementDate);
    const now = new Date();
    const overdue = [];

    for (let i = 1; i <= term; i++) {
        const dueDate = addMonths(startDate, i);
        if (isPast(dueDate) && !isToday(dueDate)) {
             // Assuming no payments have been made, all past due dates are overdue.
             // A real app would need a 'payments' table to check against.
             overdue.push(dueDate);
        }
    }
    return overdue;
}


export function UpcomingDues({ loans }: { loans: Loan[] }) {
  
  const dues: Due[] = loans.map(loan => {
    const nextDueDate = getNextDueDate(loan.disbursement_date, loan.loan_term_months);
    if (!nextDueDate) return null;

    const daysUntilDue = differenceInDays(nextDueDate, new Date());
    
    // Check for overdue payments
    const overdue = getOverdueDues(loan.disbursement_date, loan.loan_term_months);
    if (overdue.length > 0) {
        const mostRecentOverdue = overdue[overdue.length - 1];
        return {
            loanId: loan.id,
            memberId: loan.members?.id || '',
            memberName: loan.members?.name || 'N/A',
            dueDate: mostRecentOverdue,
            daysUntilDue: differenceInDays(mostRecentOverdue, new Date()), // This will be negative
        }
    }

    // Check for upcoming payments (within 7 days)
    if (daysUntilDue <= 7) {
        return {
            loanId: loan.id,
            memberId: loan.members?.id || '',
            memberName: loan.members?.name || 'N/A',
            dueDate: nextDueDate,
            daysUntilDue: daysUntilDue,
        }
    }
    
    return null;
  }).filter((due): due is Due => due !== null)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue); // Sort by soonest due date first

  
  const getStatusBadge = (days: number) => {
    if (days < 0) {
      return <Badge variant="destructive">Overdue by {-days}d</Badge>;
    }
    if (days === 0) {
      return <Badge variant="destructive" className="bg-orange-500 text-white">Due Today</Badge>;
    }
    if (days <= 7) {
        return <Badge variant="secondary" className="bg-yellow-400 text-black">Due in {days}d</Badge>;
    }
    return null;
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Upcoming & Overdue Payments</CardTitle>
        <CardDescription>
          Loan payments that are due soon or are already past their due date.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dues.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No upcoming or overdue payments.
                    </TableCell>
                </TableRow>
            ) : (
                dues.map((due) => (
                <TableRow key={due.loanId}>
                    <TableCell>
                        <Link href={`/members/${due.memberId}`} className="hover:underline text-primary font-medium">
                            {due.memberName}
                        </Link>
                    </TableCell>
                    <TableCell>{format(due.dueDate, "do MMM, yyyy")}</TableCell>
                    <TableCell>{getStatusBadge(due.daysUntilDue)}</TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
