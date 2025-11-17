'use client';
import React, { useState, useEffect } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';

type TrialBalanceEntry = {
    code: number;
    name: string;
    debit: number;
    credit: number;
};

function TrialBalanceSkeleton() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Trial Balance</h1>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-full max-w-md" />
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border shadow-sm p-4">
                        <div className="space-y-4">
                             <div className="grid grid-cols-4 gap-4 font-medium text-muted-foreground">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-5 w-24 ml-auto" />
                                <Skeleton className="h-5 w-24 ml-auto" />
                            </div>
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="grid grid-cols-4 gap-4 items-center">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-20 ml-auto" />
                                    <Skeleton className="h-4 w-20 ml-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}

export default function TrialBalancePage() {
    const [balances, setBalances] = useState<TrialBalanceEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getTrialBalance() {
            setLoading(true);
            const { data: accounts, error: accountsError } = await supabase
                .from('chart_of_accounts')
                .select('code, name');

            if (accountsError) {
                console.error("Error fetching accounts:", accountsError);
                setLoading(false);
                return;
            }

            const { data: items, error: itemsError } = await supabase
                .from('journal_entry_items')
                .select('chart_of_account_id, type, amount');
                
            if (itemsError) {
                console.error("Error fetching journal items:", itemsError);
                setLoading(false);
                return;
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

            const { data: accountsMapData, error: mapError } = await supabase.from('chart_of_accounts').select('id, code, name');
            if(mapError) {
                console.error("Error fetching account map", mapError);
                setLoading(false);
                return;
            }
            const accountMap = new Map(accountsMapData.map(acc => [acc.id, acc]));

            const trialBalanceData = Object.entries(accountBalances).map(([accountId, balance]) => {
                const account = accountMap.get(accountId);
                return {
                    code: account?.code || 0,
                    name: account?.name || 'Unknown Account',
                    debit: balance.debit,
                    credit: balance.credit,
                };
            }).sort((a, b) => a.code - b.code);

            setBalances(trialBalanceData);
            setLoading(false);
        }

        getTrialBalance();
    }, []);

    if (loading) {
        return <TrialBalanceSkeleton />;
    }

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
