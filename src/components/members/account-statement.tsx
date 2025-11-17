
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

type Transaction = {
  id: string;
  date: string;
  description: string | null;
  type: string;
  amount: number;
};

// These types are considered credits to the member's main account
const CREDIT_TYPES = ['Loan Disbursement', 'Savings Withdrawal'];
// These types are considered debits from the member's main account
const DEBIT_TYPES = ['Loan Repayment', 'Savings Deposit', 'Share Purchase', 'Penal Interest', 'Penalty Income', 'Loan Interest'];


export function AccountStatement({ transactions }: { transactions: Transaction[] }) {
  let runningBalance = 0;

  const processedTransactions = transactions.map(t => {
    let debit = 0;
    let credit = 0;

    if (DEBIT_TYPES.includes(t.type)) {
      debit = t.amount;
      runningBalance -= t.amount;
    } else if (CREDIT_TYPES.includes(t.type)) {
      credit = t.amount;
      runningBalance += t.amount;
    } else {
        // Fallback for unknown types. Assume it's a credit if it's income-related for the bank,
        // otherwise a debit (money out from member's perspective)
        if (t.type.toLowerCase().includes('income')) {
            credit = t.amount;
            runningBalance += t.amount;
        } else {
            debit = t.amount;
            runningBalance -= t.amount;
        }
    }
    
    return {
      ...t,
      debit,
      credit,
      balance: runningBalance,
    };
  });

  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No transactions found for this member.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={4}>Opening Balance</TableCell>
                    <TableCell className="text-right">{formatCurrency(0)}</TableCell>
                  </TableRow>
                  {processedTransactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap">{format(new Date(t.date), "dd-MMM-yy")}</TableCell>
                      <TableCell>{t.description || t.type}</TableCell>
                      <TableCell className="text-right font-mono text-red-600 whitespace-nowrap">
                        {t.debit > 0 ? formatCurrency(t.debit) : ""}
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600 whitespace-nowrap">
                        {t.credit > 0 ? formatCurrency(t.credit) : ""}
                      </TableCell>
                      <TableCell className="text-right font-mono whitespace-nowrap">{formatCurrency(t.balance)}</TableCell>
                    </TableRow>
                  ))}
                   <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={4}>Closing Balance</TableCell>
                    <TableCell className="text-right">{formatCurrency(runningBalance)}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
    </div>
  );
}
