"use client"

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

type LoanScheme = {
  id: string;
  name: string;
  default_interest_rate: number;
  min_term_months: number;
  max_term_months: number;
  repayment_frequency: string;
  is_active: boolean;
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2,
    }).format(amount).replace('NPR', 'रु');
}


export function LoanSchemesTable({ schemes }: { schemes: LoanScheme[] }) {
  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Scheme Name</TableHead>
            <TableHead className="hidden sm:table-cell">Interest Rate</TableHead>
            <TableHead className="hidden md:table-cell">Term (Months)</TableHead>
            <TableHead className="hidden sm:table-cell">Repayment</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schemes.length === 0 ? (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No loan schemes found.
                </TableCell>
            </TableRow>
          ) : (
            schemes.map((scheme) => (
              <TableRow key={scheme.id}>
                <TableCell className="font-medium">{scheme.name}</TableCell>
                <TableCell className="hidden sm:table-cell">{scheme.default_interest_rate}%</TableCell>
                <TableCell className="hidden md:table-cell">{scheme.min_term_months} - {scheme.max_term_months}</TableCell>
                <TableCell className="hidden sm:table-cell">{scheme.repayment_frequency}</TableCell>
                 <TableCell>
                    <Badge variant={scheme.is_active ? 'default' : 'secondary'}>
                        {scheme.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

    