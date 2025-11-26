
import { BalanceSheetClient } from "./client-page";
import { supabase } from "@/lib/supabase-client";

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

    return <BalanceSheetClient sheetData={sheetData} />;
}
