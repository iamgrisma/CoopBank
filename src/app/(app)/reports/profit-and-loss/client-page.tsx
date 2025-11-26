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
import { formatCurrency } from "@/lib/utils";

type PnLEntry = {
    name: string;
    amount: number;
};

type PnLData = {
    revenues: PnLEntry[];
    expenses: PnLEntry[];
};

export function ProfitAndLossClient({ pnlData }: { pnlData: PnLData }) {
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
