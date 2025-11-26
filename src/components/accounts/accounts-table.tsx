'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { MemberWithAccounts } from "@/app/(app)/accounts/page";

const getInitials = (name: string | undefined) => {
  if (!name) return "U";
  const names = name.split(' ');
  if (names.length > 1) {
    return names[0][0] + names[names.length - 1][0];
  }
  return name.substring(0, 2);
};

const formatAccountNumber = (accountNumber: string | null) => {
    if (!accountNumber) return 'N/A';
    const match = accountNumber.match(/^(\d{3})(\d{2})(\d{2})(\d{2})(\d{7})$/);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}-${match[4]}-${match[5]}`;
    }
    return accountNumber;
}

export function AccountsTable({ members }: { members: MemberWithAccounts[] }) {
    return (
         <div className="rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Account Number</TableHead>
                            <TableHead>Account Type</TableHead>
                            <TableHead>Scheme</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                       {members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No accounts found for this type.
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map(member => (
                                member.accounts.map((account, index) => (
                                    <TableRow key={`${member.id}-${account.scheme_name}-${account.type}`}>
                                        {index === 0 ? (
                                            <TableCell rowSpan={member.accounts.length} className="font-medium align-top py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="hidden h-9 w-9 sm:flex">
                                                        {member.photo_url && <AvatarImage src={member.photo_url} alt={member.name} />}
                                                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <Link href={`/members/${member.id}`} className="hover:underline text-primary font-medium leading-tight">
                                                        {member.name}
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        ) : null}
                                        <TableCell className="whitespace-nowrap">{formatAccountNumber(account.account_number)}</TableCell>
                                        <TableCell>
                                             <Badge variant={
                                                account.type === 'Loan' ? 'destructive' :
                                                account.type === 'LTD' ? 'outline' : 
                                                account.type === 'Current' ? 'default' : 'secondary'
                                             }>
                                                {account.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">{account.scheme_name}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap">{formatCurrency(account.balance)}</TableCell>
                                    </TableRow>
                                ))
                            ))
                       )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
