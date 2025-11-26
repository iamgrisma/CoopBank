
import { ChartOfAccountsClient } from "./client-page";
import { supabase } from "@/lib/supabase-client";

export default async function ChartOfAccountsPage() {
    const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .order('code', { ascending: true });

    let fetchedAccounts = [];
    if (error) {
        console.error("Error fetching chart of accounts:", error);
        // Providing a default list in case the table doesn't exist yet
        fetchedAccounts = [
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
    } else {
        fetchedAccounts = data || [];
    }

  return <ChartOfAccountsClient accounts={fetchedAccounts} />;
}
