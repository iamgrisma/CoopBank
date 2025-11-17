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

type Saving = {
  id: string;
  amount: number;
  deposit_date: string;
  notes: string | null;
  members: {
    id: string;
    name: string;
  } | null;
  saving_schemes: {
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

export function SavingsTable({ savings }: { savings: Saving[] }) {
  return (
    <div className="rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Scheme</TableHead>
            <TableHead>Deposit Date</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {savings.length === 0 ? (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No savings deposits found.
                </TableCell>
            </TableRow>
          ) : (
            savings.map((saving) => (
              <TableRow key={saving.id}>
                <TableCell>
                  {saving.members ? (
                     <Link href={`/members/${saving.members.id}`} className="hover:underline text-primary font-medium">
                        {saving.members.name}
                     </Link>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell>{saving.saving_schemes?.name}</TableCell>
                <TableCell>
                  {format(new Date(saving.deposit_date), "yyyy-MM-dd")}
                </TableCell>
                 <TableCell>{saving.notes}</TableCell>
                 <TableCell className="text-right">{formatCurrency(saving.amount)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
