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

type PnLEntry = {
    name: string;
    amount: number;
};

type PnLData = {
    revenues: PnLEntry[];
    expenses: PnLEntry[];
};

function ProfitLossSkeleton() {
     return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Profit & Loss Statement</h1>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-64" />
                    <Skeleton className="h-4 w-full max-w-lg" />
                </CardHeader>
                <CardContent className="grid gap-8">
                    <div>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <div className="rounded-lg border p-4 space-y-2">
                             {[...Array(2)].map((_, i) => (
                                 <div key={i} className="flex justify-between">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-5 w-24" />
                                 </div>
                             ))}
                        </div>
                    </div>
                    <div>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <div className="rounded-lg border p-4 space-y-2">
                             {[...Array(1)].map((_, i) => (
                                 <div key={i} className="flex justify-between">
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-5 w-24" />
                                 </div>
                             ))}
                        </div>
                    </div>
                    <div className="flex justify-between font-bold text-lg p-4 bg-muted rounded-md">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-6 w-28" />
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}

export default function ProfitAndLossPage() {
    const [pnlData, setPnlData] = useState<PnLData>({ revenues: [], expenses: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getPnLData() {
            setLoading(true);
            const { data: accounts, error: accountsError } = await supabase
                .from('chart_of_accounts')
                .select('id, name, type');
            
            if (accountsError) {
                console.error("Error fetching accounts:", accountsError);
                setLoading(false);
                return;
            }

            const revenueAccountIds = accounts.filter(a => a.type === 'Revenue').map(a => a.id);
            const expenseAccountIds = accounts.filter(a => a.type === 'Expense').map(a => a.id);
            
            const { data: items, error: itemsError } = await supabase
                .from('journal_entry_items')
                .select('chart_of_account_id, type, amount');

            if (itemsError) {
                console.error("Error fetching journal items:", itemsError);
                setLoading(false);
                return;
            }
            
            const accountTotals: Record<string, number> = {};

            for (const item of items) {
                 if (!accountTotals[item.chart_of_account_id]) {
                    accountTotals[item.chart_of_account_id] = 0;
                }
                const multiplier = (revenueAccountIds.includes(item.chart_of_account_id) && item.type === 'credit') || (expenseAccountIds.includes(item.chart_of_account_id) && item.type === 'debit') ? 1 : -1;
                accountTotals[item.chart_of_account_id] += item.amount * multiplier;
            }

            const revenues = revenueAccountIds.map(id => ({
                name: accounts.find(a => a.id === id)?.name || 'Unknown Revenue',
                amount: accountTotals[id] || 0
            })).filter(r => r.amount !== 0);

            const expenses = expenseAccountIds.map(id => ({
                name: accounts.find(a => a.id === id)?.name || 'Unknown Expense',
                amount: accountTotals[id] || 0
            })).filter(e => e.amount !== 0);

            setPnlData({ revenues, expenses });
            setLoading(false);
        }
        getPnLData();
    }, []);

    if (loading) {
        return <ProfitLossSkeleton />;
    }

    const totalRevenues = pnlData.revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = pnlData.expenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalRevenues - totalExpenses;

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Profit & Loss Statement</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Income Statement</CardTitle>
                    <CardDescription>
                        A summary of revenues and expenses for the period, resulting in a net income or loss.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-8">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Revenues</h2>
                        <div className="rounded-lg border shadow-sm">
                            <Table>
                                <TableBody>
                                    {pnlData.revenues.map((revenue, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{revenue.name}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(revenue.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="bg-muted/50 font-bold">
                                        <TableCell>Total Revenues</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(totalRevenues)}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Expenses</h2>
                         <div className="rounded-lg border shadow-sm">
                            <Table>
                                <TableBody>
                                    {pnlData.expenses.map((expense, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{expense.name}</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(expense.amount)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="bg-muted/50 font-bold">
                                        <TableCell>Total Expenses</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(totalExpenses)}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg text-lg font-bold flex justify-between ${netIncome >= 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                        <span>{netIncome >= 0 ? 'Net Income' : 'Net Loss'}</span>
                        <span className="font-mono">{formatCurrency(netIncome)}</span>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}