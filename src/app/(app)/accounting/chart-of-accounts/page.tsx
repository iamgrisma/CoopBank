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
} from "@/components/ui/table"
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Badge } from "@/components/ui/badge";

async function getChartOfAccounts() {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .order('code', { ascending: true });

    if (error) {
        console.error("Error fetching chart of accounts:", error);
        // Providing a default list in case the table doesn't exist yet
        return [
            { code: 1010, name: 'Cash', type: 'Asset' },
            { code: 1100, name: 'Loans Receivable', type: 'Asset' },
            { code: 2010, name: 'Savings Deposits', type: 'Liability' },
            { code: 2100, name: 'Interest Payable', type: 'Liability' },
            { code: 3010, name: 'Share Capital', type: 'Equity' },
            { code: 3100, name: 'Retained Earnings', type: 'Equity' },
            { code: 4010, name: 'Interest Income from Loans', type: 'Revenue' },
            { code: 4020, name: 'Penalty Income', type: 'Revenue' },
            { code: 5010, name: 'Interest Expense on Savings', type: 'Expense' },
        ];
    }
    return data || [];
}

export default async function ChartOfAccountsPage() {
    const accounts = await getChartOfAccounts();

    const accountsByType = accounts.reduce((acc, account) => {
        const type = account.type || 'Uncategorized';
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(account);
        return acc;
    }, {} as Record<string, typeof accounts>);

    const typeOrder: (keyof typeof accountsByType)[] = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'Uncategorized'];

    const getBadgeVariant = (type: string) => {
        switch (type) {
            case 'Asset': return 'default';
            case 'Liability': return 'destructive';
            case 'Equity': return 'outline';
            case 'Revenue': return 'secondary';
            case 'Expense': return 'secondary';
            default: return 'secondary';
        }
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
            <h1 className="font-semibold text-lg md:text-2xl">Chart of Accounts</h1>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Accounts</CardTitle>
                <CardDescription>
                    The list of all financial accounts in the system.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {typeOrder.map(type => (
                        accountsByType[type] && (
                             <div key={type}>
                                <h2 className="text-xl font-semibold mb-2">{type}s</h2>
                                <div className="rounded-lg border shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[100px]">Code</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Type</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {accountsByType[type].map(account => (
                                                    <TableRow key={account.code}>
                                                        <TableCell>{account.code}</TableCell>
                                                        <TableCell className="font-medium">{account.name}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={getBadgeVariant(account.type)}>{account.type}</Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </CardContent>
        </Card>
    </main>
  )
}
