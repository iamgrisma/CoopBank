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
import { formatCurrency } from "@/lib/utils";

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


export function SharesTable({ shares }: { shares: Share[] }) {
  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead className="hidden sm:table-cell">Certificate No.</TableHead>
            <TableHead className="hidden md:table-cell">No. of Shares</TableHead>
            <TableHead className="hidden lg:table-cell">Face Value</TableHead>
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
                <TableCell className="hidden sm:table-cell">{share.certificate_number}</TableCell>
                <TableCell className="hidden md:table-cell">{share.number_of_shares}</TableCell>
                <TableCell className="hidden lg:table-cell">{formatCurrency(share.face_value)}</TableCell>
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
