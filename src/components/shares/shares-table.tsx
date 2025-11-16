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

type Share = {
  id: string;
  certificate_number: string;
  number_of_shares: number;
  face_value: number;
  purchase_date: string;
  members: {
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

export function SharesTable({ shares }: { shares: Share[] }) {
  return (
    <div className="rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Certificate No.</TableHead>
            <TableHead>No. of Shares</TableHead>
            <TableHead>Face Value</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shares.length === 0 ? (
            <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    No share certificates found.
                </TableCell>
            </TableRow>
          ) : (
            shares.map((share) => (
              <TableRow key={share.id}>
                <TableCell>
                  {share.members ? (
                     <Link href={`/members/${share.members.id}`} className="hover:underline text-primary font-medium">
                        {share.members.name}
                     </Link>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell>{share.certificate_number}</TableCell>
                <TableCell>{share.number_of_shares}</TableCell>
                <TableCell>{formatCurrency(share.face_value)}</TableCell>
                <TableCell>
                  {format(new Date(share.purchase_date), "yyyy-MM-dd")}
                </TableCell>
                 <TableCell className="text-right">{formatCurrency(share.number_of_shares * share.face_value)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
