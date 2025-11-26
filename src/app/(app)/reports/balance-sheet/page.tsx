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
    TableFooter,
    TableRow,
} from "@/components/ui/table"
import { supabase } from "@/lib/supabase-client"
import { formatCurrency } from "@/lib/utils";

type BalanceSheetItem = {
    name: string;
    amount: number;
};

type BalanceSheetData = {
    assets: BalanceSheetItem[];
    liabilities: BalanceSheetItem[];
    equity: BalanceSheetItem[];
};

export default async function BalanceSheetPage() {
    const { data: accounts, error: accountsError } = await supabase
        .from('chart_of_accounts')
        .select('id, name, type');

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
    
    // Calculate account totals
    const accountTotals: Record<string, number> = {};
    for (const item of items) {
        if (!accountTotals[item.chart_of_account_id]) {
            accountTotals[item.chart_of_account_id] = 0;
        }
        const account = accounts.find(a => a.id === item.chart_of_account_id);
        if (!account) continue;

        const multiplier = (['Asset', 'Expense'].includes(account.type) && item.type === 'debit') || (['Liability', 'Equity', 'Revenue'].includes(account.type) && item.type === 'credit') ? 1 : -1;
        accountTotals[item.chart_of_account_id] += item.amount * multiplier;
    }

    // Calculate Net Income to be added to Retained Earnings
    const revenueAccounts = accounts.filter(a => a.type === 'Revenue');
    const expenseAccounts = accounts.filter(a => a.type === 'Expense');
    const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + (accountTotals[acc.id] || 0), 0);
    const totalExpense = expenseAccounts.reduce((sum, acc) => sum + (accountTotals[acc.id] || 0), 0);
    const netIncome = totalRevenue - totalExpense;

    // Group accounts
    const assets = accounts.filter(a => a.type === 'Asset').map(a => ({ name: a.name, amount: accountTotals[a.id] || 0 }));
    const liabilities = accounts.filter(a => a.type === 'Liability').map(a => ({ name: a.name, amount: accountTotals[a.id] || 0 }));
    const equity = accounts.filter(a => a.type === 'Equity').map(a => ({ name: a.name, amount: accountTotals[a.id] || 0 }));
    
    // Find and update Retained Earnings
    const retainedEarnings = equity.find(e => e.name.toLowerCase().includes('retained earnings'));
    if (retainedEarnings) {
        retainedEarnings.amount += netIncome;
    } else {
        equity.push({ name: "Net Income (Retained Earnings)", amount: netIncome });
    }

    const sheetData = { 
        assets: assets.filter(a => a.amount !== 0), 
        liabilities: liabilities.filter(l => l.amount !== 0), 
        equity: equity.filter(e => e.amount !== 0)
    };

    const totalAssets = sheetData.assets.reduce((sum, a) => sum + a.amount, 0);
    const totalLiabilities = sheetData.liabilities.reduce((sum, l) => sum + l.amount, 0);
    const totalEquity = sheetData.equity.reduce((sum, e) => sum + e.amount, 0);
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Balance Sheet</h1>
            </div>
            <Card>
                 <CardHeader>
                    <CardTitle>Statement of Financial Position</CardTitle>
                    <CardDescription>
                        A snapshot of the company's financial health, listing assets, liabilities, and owner's equity.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Assets</h2>
                             <div className="rounded-lg border shadow-sm">
                                <Table>
                                    <TableBody>
                                        {sheetData.assets.map((asset, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{asset.name}</TableCell>
                                                <TableCell className="text-right font-mono">{formatCurrency(asset.amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow className="bg-muted/50 font-bold">
                                            <TableCell>Total Assets</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(totalAssets)}</TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>
                        </div>

                         <div>
                            <h2 className="text-xl font-semibold mb-2">Liabilities</h2>
                             <div className="rounded-lg border shadow-sm">
                                <Table>
                                    <TableBody>
                                        {sheetData.liabilities.map((lia, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{lia.name}</TableCell>
                                                <TableCell className="text-right font-mono">{formatCurrency(lia.amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow className="bg-muted/50 font-bold">
                                            <TableCell>Total Liabilities</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(totalLiabilities)}</TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>

                            <h2 className="text-xl font-semibold mt-6 mb-2">Equity</h2>
                             <div className="rounded-lg border shadow-sm">
                                <Table>
                                    <TableBody>
                                        {sheetData.equity.map((eq, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{eq.name}</TableCell>
                                                <TableCell className="text-right font-mono">{formatCurrency(eq.amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow className="bg-muted/50 font-bold">
                                            <TableCell>Total Equity</TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(totalEquity)}</TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>
                             <div className="mt-4 p-4 rounded-lg bg-secondary text-secondary-foreground font-bold flex justify-between">
                                <span>Total Liabilities & Equity</span>
                                <span className="font-mono">{formatCurrency(totalLiabilitiesAndEquity)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
