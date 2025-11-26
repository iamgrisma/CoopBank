
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountsTable } from "@/components/accounts/accounts-table";
import { supabase } from '@/lib/supabase-client';

type Account = {
  account_number: string | null;
  type: 'Saving' | 'LTD' | 'Loan' | 'Current';
  balance: number;
  scheme_name: string;
};

export type MemberWithAccounts = {
  id: string;
  name: string;
  photo_url: string | null;
  accounts: Account[];
};


export default async function AccountsPage() {
    const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id, name, photo_url, account_number')
        .order('name');

    if (membersError) {
        console.error('Error fetching members:', membersError);
        return <p>Error loading data.</p>;
    }

    const memberIds = members.map(m => m.id);

    const [transactionsRes, savingsRes, loansRes] = await Promise.all([
        supabase.from('transactions').select('member_id, type, amount').in('member_id', memberIds).in('type', ['Savings Deposit', 'Loan Repayment', 'Share Purchase', 'Loan Disbursement', 'Withdrawal']),
        supabase.from('savings').select(`member_id, amount, saving_schemes (name, type)`).in('member_id', memberIds),
        supabase.from('loans').select(`member_id, amount, loan_schemes (name)`).in('member_id', memberIds).in('status', ['Active', 'Pending'])
    ]);

    if (savingsRes.error || loansRes.error || transactionsRes.error) {
        console.error({ savingsError: savingsRes.error, loansError: loansRes.error, transactionsError: transactionsRes.error });
    }

    const membersMap = new Map<string, MemberWithAccounts>();
    const currentBalances = new Map<string, number>();

    if (transactionsRes.data) {
        for (const t of transactionsRes.data) {
            const currentBalance = currentBalances.get(t.member_id) || 0;
            if (['Savings Deposit', 'Share Purchase', 'Loan Repayment'].includes(t.type)) {
                currentBalances.set(t.member_id, currentBalance + t.amount);
            } else if (['Loan Disbursement', 'Withdrawal', 'Savings Withdrawal'].includes(t.type)) {
                currentBalances.set(t.member_id, currentBalance - t.amount);
            }
        }
    }

    for (const member of members) {
        membersMap.set(member.id, {
            id: member.id,
            name: member.name,
            photo_url: member.photo_url,
            accounts: [{
                account_number: member.account_number,
                type: 'Current',
                balance: currentBalances.get(member.id) || 0,
                scheme_name: 'Primary Account'
            }]
        });
    }

    if (savingsRes.data) {
        for (const saving of savingsRes.data) {
            const member = membersMap.get(saving.member_id);
            if (member && saving.saving_schemes) {
                const accountType = saving.saving_schemes.type === 'LTD' ? 'LTD' : 'Saving';
                const existingAccount = member.accounts.find(a => a.scheme_name === saving.saving_schemes!.name && a.type === accountType);
                if (existingAccount) {
                    existingAccount.balance += saving.amount;
                } else {
                    member.accounts.push({
                        account_number: member.accounts[0]?.account_number || null,
                        type: accountType,
                        balance: saving.amount,
                        scheme_name: saving.saving_schemes.name
                    });
                }
            }
        }
    }
    
    if (loansRes.data) {
        for (const loan of loansRes.data) {
            const member = membersMap.get(loan.member_id);
            if (member && loan.loan_schemes) {
                member.accounts.push({
                    account_number: member.accounts[0]?.account_number || null,
                    type: 'Loan',
                    balance: loan.amount,
                    scheme_name: loan.loan_schemes.name
                });
            }
        }
    }
    const allMembersWithAccounts = Array.from(membersMap.values());

    const filterAccounts = (type: Account['type'] | 'All') => {
        if (type === 'All') return allMembersWithAccounts;
        return allMembersWithAccounts
            .map(member => ({
                ...member,
                accounts: member.accounts.filter(acc => acc.type === type)
            }))
            .filter(member => member.accounts.length > 0);
    }
    
    const savingAccounts = filterAccounts('Saving');
    const ltdAccounts = filterAccounts('LTD');
    const loanAccounts = filterAccounts('Loan');
    const currentAccounts = filterAccounts('Current');

    return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
            <h1 className="font-semibold text-lg md:text-2xl">Member Accounts</h1>
        </div>
        
        <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                <TabsTrigger value="all">All Accounts</TabsTrigger>
                <TabsTrigger value="saving">Savings</TabsTrigger>
                <TabsTrigger value="current">Current</TabsTrigger>
                <TabsTrigger value="ltd">LTD</TabsTrigger>
                <TabsTrigger value="loan">Loans</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
                <AccountsTable members={filterAccounts('All')} />
            </TabsContent>
            <TabsContent value="saving">
                <AccountsTable members={savingAccounts} />
            </TabsContent>
             <TabsContent value="current">
                <AccountsTable members={currentAccounts} />
            </TabsContent>
            <TabsContent value="ltd">
                 <AccountsTable members={ltdAccounts} />
            </TabsContent>
            <TabsContent value="loan">
                 <AccountsTable members={loanAccounts} />
            </TabsContent>
        </Tabs>

    </main>
  );
}
