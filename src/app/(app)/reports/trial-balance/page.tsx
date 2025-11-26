
import { TrialBalanceClient } from "./client-page";
import { supabase } from "@/lib/supabase-client";

export default async function TrialBalancePage() {
    const { data: accounts, error: accountsError } = await supabase
        .from('chart_of_accounts')
        .select('id, code, name');

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

    const accountBalances: Record<string, {debit: number, credit: number}> = {};

    for (const item of items) {
        if (!accountBalances[item.chart_of_account_id]) {
            accountBalances[item.chart_of_account_id] = { debit: 0, credit: 0 };
        }
        if (item.type === 'debit') {
            accountBalances[item.chart_of_account_id].debit += item.amount;
        } else {
            accountBalances[item.chart_of_account_id].credit += item.amount;
        }
    }
    
    const accountMap = new Map(accounts.map(acc => [acc.id, acc]));

    const balances = Object.entries(accountBalances).map(([accountId, balance]) => {
        const account = accountMap.get(accountId);
        return {
            code: account?.code || 0,
            name: account?.name || 'Unknown Account',
            debit: balance.debit,
            credit: balance.credit,
        };
    }).sort((a, b) => a.code - b.code);

    return <TrialBalanceClient balances={balances} />;
}
