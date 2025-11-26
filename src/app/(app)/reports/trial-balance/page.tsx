'use client';
import React from 'react';
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
    TableFooter,
} from "@/components/ui/table"
import { supabase } from "@/lib/supabase-client"
import { formatCurrency } from "@/lib/utils";

type TrialBalanceEntry = {
    code: number;
    name: string;
    debit: number;
    credit: number;
};

export default async function TrialBalancePage() {
    const { data: accounts, error: accountsError } = await supabase
        .from('chart_of_accounts')
        .select('id, code, name');

    if (accountsError) {
        console.error("Error fetching accounts:", accountsError);
        return <p>Error loading data</p>
    }

    const { data: items, error: itemsError } = await supabase
        .from('journal_entry_items')
        .select('chart_of_account_id, type, amount');
        
    if (itemsError) {
        console.error("Error fetching journal items:", itemsError);
        return <p>Error loading data</p>
    }

    const accountBalances: Record<string, {debit: number, credit: number}> = {};

    for (const item of items) {
        if (!accountBalances[item.chart_of_account_id]) {
            accountBalances[item.chart_of_account_id] = { debit: 0, credit: 0 };
        }
        if (item.type === 'debit') {
            accountBalances[item.chart_of_account_id].debit += item.amount;
        } else {
            accountBalances[item.chart_of_account_id].credit += item.amount;
        }
    }
    
    const accountMap = new Map(accounts.map(acc => [acc.id, acc]));

    const balances = Object.entries(accountBalances).map(([accountId, balance]) => {
        const account = accountMap.get(accountId);
        return {
            code: account?.code || 0,
            name: account?.name || 'Unknown Account',
            debit: balance.debit,
            credit: balance.credit,
        };
    }).sort((a, b) => a.code - b.code);

    const totalDebit = balances.reduce((sum, b) => sum + b.debit, 0);
    const totalCredit = balances.reduce((sum, b) => sum + b.credit, 0);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
            <h1 className="font-semibold text-lg md:text-2xl">Trial Balance</h1>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Trial Balance Report</CardTitle>
                <CardDescription>
                    A summary of all accounts and their debit or credit balances to ensure financial records are in balance.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Code</TableHead>
                                    <TableHead>Account</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {balances.map((balance) => (
                                    <TableRow key={balance.code}>
                                        <TableCell>{balance.code}</TableCell>
                                        <TableCell className="font-medium">{balance.name}</TableCell>
                                        <TableCell className="text-right font-mono">{balance.debit > 0 ? formatCurrency(balance.debit) : '-'}</TableCell>
                                        <TableCell className="text-right font-mono">{balance.credit > 0 ? formatCurrency(balance.credit) : '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow className="bg-muted/50 font-bold">
                                    <TableCell colSpan={2}>Total</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(totalDebit)}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(totalCredit)}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    </main>
  )
}
