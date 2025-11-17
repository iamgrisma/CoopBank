
"use client";

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
} from "@/components/ui/table"
import { supabase } from "@/lib/supabase-client"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from '@/components/ui/skeleton';

function JournalsPageSkeleton() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <Skeleton className="h-8 w-56" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-full max-w-md" />
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border shadow-sm overflow-hidden">
                        <Skeleton className="h-96 w-full" />
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}

export default function JournalsPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function getJournalEntries() {
            setLoading(true);
            const { data, error } = await supabase
                .from('journal_entries')
                .select(`
                    id,
                    date,
                    description,
                    reference_id,
                    reference_type,
                    journal_entry_items (
                        id,
                        type,
                        amount,
                        chart_of_accounts (
                            name,
                            code
                        )
                    )
                `)
                .order('date', { ascending: false })
                .limit(50); // Limit for performance

            if (error) {
                console.error("Error fetching journal entries:", error);
                setEntries([]);
            } else {
                setEntries(data);
            }
            setLoading(false);
        }
        getJournalEntries();
    }, []);

    if (loading) {
        return <JournalsPageSkeleton />;
    }

    return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
            <h1 className="font-semibold text-lg md:text-2xl">Journal Entries</h1>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                    A log of all debit and credit entries in the system.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="rounded-lg border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Account</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No journal entries found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    entries.map(entry => (
                                        <React.Fragment key={entry.id}>
                                            <TableRow className="bg-muted/50">
                                                <TableCell className="font-semibold whitespace-nowrap">
                                                    {format(new Date(entry.date), "do MMM, yyyy")}
                                                </TableCell>
                                                <TableCell colSpan={3} className="text-sm text-muted-foreground">
                                                    {entry.description}
                                                </TableCell>
                                            </TableRow>
                                            {entry.journal_entry_items.map((item: any) => (
                                                <TableRow key={item.id}>
                                                    <TableCell></TableCell>
                                                    <TableCell className="pl-8 whitespace-nowrap">{item.chart_of_accounts?.name || 'N/A'}</TableCell>
                                                    <TableCell className="text-right font-mono whitespace-nowrap">
                                                        {item.type === 'debit' ? formatCurrency(item.amount) : ''}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono whitespace-nowrap">
                                                         {item.type === 'credit' ? formatCurrency(item.amount) : ''}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </React.Fragment>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    </main>
  )
}
