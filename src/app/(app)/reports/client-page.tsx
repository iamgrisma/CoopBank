'use client';
import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils";

type FinancialSummary = {
    shareCapital: number;
    totalSavings: number;
    totalLoans: number;
    interestIncome: number;
    penaltyIncome: number;
};

export function FinancialSummaryClient({ summary }: { summary: FinancialSummary }) {
    return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
            <h1 className="font-semibold text-lg md:text-2xl">Financial Reports</h1>
        </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Share Capital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.shareCapital)}</div>
            <p className="text-xs text-muted-foreground">
              Total value of all member shares.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalSavings)}</div>
            <p className="text-xs text-muted-foreground">
              Total deposits from all members.
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Loans (Principal)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalLoans)}</div>
            <p className="text-xs text-muted-foreground">
              Total principal amount disbursed.
            </p>
          </CardContent>
        </Card>
         <Card className="bg-green-50 dark:bg-green-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-400">
              Interest Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency(summary.interestIncome)}</div>
            <p className="text-xs text-green-600 dark:text-green-500">
              Total interest earned from loans.
            </p>
          </CardContent>
        </Card>
         <Card className="bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
              Penalty Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{formatCurrency(summary.penaltyIncome)}</div>
            <p className="text-xs text-yellow-600 dark:text-yellow-500">
              Total penalties collected from overdue loans.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
