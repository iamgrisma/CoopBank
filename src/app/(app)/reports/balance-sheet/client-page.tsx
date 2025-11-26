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

type BalanceSheetItem = {
    name: string;
    amount: number;
};

type BalanceSheetData = {
    assets: BalanceSheetItem[];
    liabilities: BalanceSheetItem[];
    equity: BalanceSheetItem[];
};

export function BalanceSheetClient({ sheetData }: { sheetData: BalanceSheetData }) {
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
