
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
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { format } from "date-fns"
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

async function getJournalEntries() {
    const supabase = createSupabaseServerClient();
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
        return [];
    }
    return data;
}

export default async function JournalsPage() {
    const entries = await getJournalEntries();

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
                                            <TableCell className="font-semibold">
                                                {format(new Date(entry.date), "do MMM, yyyy")}
                                            </TableCell>
                                            <TableCell colSpan={3} className="text-sm text-muted-foreground">
                                                {entry.description}
                                            </TableCell>
                                        </TableRow>
                                        {entry.journal_entry_items.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell></TableCell>
                                                <TableCell className="pl-8">{item.chart_of_accounts?.name || 'N/A'}</TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {item.type === 'debit' ? formatCurrency(item.amount) : ''}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
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
            </CardContent>
        </Card>
    </main>
  )
}
