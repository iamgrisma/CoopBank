
import { ProfitAndLossClient } from "./client-page";
import { supabase } from "@/lib/supabase-client";

export default async function ProfitAndLossPage() {
    const { data: accounts, error: accountsError } = await supabase
        .from('chart_of_accounts')
        .select('id, name, type');
    
    if (accountsError) {
        console.error("Error fetching accounts:", accountsError);
        return <p>Error loading data</p>;
    }

    const revenueAccountIds = accounts.filter(a => a.type === 'Revenue').map(a => a.id);
    const expenseAccountIds = accounts.filter(a => a.type === 'Expense').map(a => a.id);
    
    const { data: items, error: itemsError } = await supabase
        .from('journal_entry_items')
        .select('chart_of_account_id, type, amount');

    if (itemsError) {
        console.error("Error fetching journal items:", itemsError);
        return <p>Error loading data</p>;
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

    const pnlData = { revenues, expenses };

    return <ProfitAndLossClient pnlData={pnlData} />;
}
