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

type SavingScheme = {
  id: string;
  name: string;
  interest_rate: number;
  type: string;
  lock_in_period_years: number | null;
  is_active: boolean;
};

export function SavingSchemesTable({ schemes }: { schemes: SavingScheme[] }) {
  return (
    <div className="rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Scheme Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Interest Rate</TableHead>
            <TableHead>Lock-in Period</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!schemes || schemes.length === 0 ? (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No saving schemes found.
                </TableCell>
            </TableRow>
          ) : (
            schemes.map((scheme) => (
              <TableRow key={scheme.id}>
                <TableCell className="font-medium">{scheme.name}</TableCell>
                <TableCell>
                    <Badge variant={scheme.type === 'LTD' ? 'destructive' : scheme.type === 'Current' ? 'outline' : 'secondary'}>{scheme.type}</Badge>
                </TableCell>
                <TableCell>{scheme.interest_rate}%</TableCell>
                <TableCell>{scheme.lock_in_period_years ? `${scheme.lock_in_period_years} years` : 'N/A'}</TableCell>
                 <TableCell>
                    <Badge variant={scheme.is_active ? 'default' : 'outline'}>
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
