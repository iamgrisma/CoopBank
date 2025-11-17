
"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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


export function LoanSchemesTable({ schemes }: { schemes: LoanScheme[] }) {
  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scheme Name</TableHead>
                <TableHead>Interest Rate</TableHead>
                <TableHead>Term (Months)</TableHead>
                <TableHead>Repayment</TableHead>
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
                    <TableCell className="font-medium whitespace-nowrap">{scheme.name}</TableCell>
                    <TableCell>{scheme.default_interest_rate}%</TableCell>
                    <TableCell>{scheme.min_term_months} - {scheme.max_term_months}</TableCell>
                    <TableCell>{scheme.repayment_frequency}</TableCell>
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
    </div>
  )
}
