
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";


type Account = {
  account_number: string | null;
  type: 'Saving' | 'LTD' | 'Loan' | 'Current';
  balance: number;
  scheme_name: string;
};

type MemberWithAccounts = {
  id: string;
  name: string;
  photo_url: string | null;
  accounts: Account[];
};

const getInitials = (name: string | undefined) => {
  if (!name) return "U";
  const names = name.split(' ');
  if (names.length > 1) {
    return names[0][0] + names[names.length - 1][0];
  }
  return name.substring(0, 2);
};

const formatAccountNumber = (accountNumber: string | null) => {
    if (!accountNumber) return 'N/A';
    const match = accountNumber.match(/^(\d{3})(\d{2})(\d{2})(\d{2})(\d{7})$/);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}-${match[4]}-${match[5]}`;
    }
    return accountNumber;
}

async function getMemberAccounts(): Promise<MemberWithAccounts[]> {
    const supabase = createSupabaseServerClient();
    
    const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id, name, photo_url, account_number')
        .order('name');

    if (membersError) {
        console.error('Error fetching members:', membersError);
        return [];
    }

    const memberIds = members.map(m => m.id);

    // Fetch all relevant transactions for all members at once
    const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('member_id, type, amount')
        .in('member_id', memberIds)
        .in('type', ['Savings Deposit', 'Loan Repayment', 'Share Purchase', 'Loan Disbursement', 'Withdrawal']);

    const { data: savings, error: savingsError } = await supabase
        .from('savings')
        .select(`
            member_id,
            amount,
            saving_schemes (name, type)
        `)
        .in('member_id', memberIds);

    const { data: loans, error: loansError } = await supabase
        .from('loans')
        .select(`
            member_id,
            amount,
            loan_schemes (name)
        `)
        .in('member_id', memberIds)
        .in('status', ['Active', 'Pending']);
    
    if (savingsError || loansError || transactionsError) {
        console.error({ savingsError, loansError, transactionsError });
    }

    const membersMap = new Map<string, MemberWithAccounts>();

    // Calculate current account balances from transactions
    const currentBalances = new Map<string, number>();
    if (transactions) {
        for (const t of transactions) {
            const currentBalance = currentBalances.get(t.member_id) || 0;
            if (t.type === 'Savings Deposit' || t.type === 'Share Purchase' || t.type === 'Loan Repayment') {
                // These are credits to the current account before being allocated
                currentBalances.set(t.member_id, currentBalance + t.amount);
            } else if (t.type === 'Loan Disbursement' || t.type === 'Withdrawal') {
                 // These are debits from the current account
                currentBalances.set(t.member_id, currentBalance - t.amount);
            }
        }
    }


    for (const member of members) {
        membersMap.set(member.id, {
            id: member.id,
            name: member.name,
            photo_url: member.photo_url,
            accounts: [
                 {
                    account_number: member.account_number,
                    type: 'Current',
                    balance: currentBalances.get(member.id) || 0,
                    scheme_name: 'Primary Account'
                }
            ]
        });
    }

    if (savings) {
        for (const saving of savings) {
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
    
    if (loans) {
        for (const loan of loans) {
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

    return Array.from(membersMap.values());
}


function AccountsTable({ members }: { members: MemberWithAccounts[] }) {
    return (
         <div className="rounded-lg border shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead className="hidden sm:table-cell">Account Number</TableHead>
                        <TableHead>Account Type</TableHead>
                        <TableHead className="hidden md:table-cell">Scheme</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                   {members.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No accounts found for this type.
                            </TableCell>
                        </TableRow>
                    ) : (
                        members.map(member => (
                            member.accounts.map((account, index) => (
                                <TableRow key={`${member.id}-${account.scheme_name}-${account.type}`}>
                                    {index === 0 ? (
                                        <TableCell rowSpan={member.accounts.length} className="font-medium align-top py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="hidden h-9 w-9 sm:flex">
                                                    {member.photo_url && <AvatarImage src={member.photo_url} alt={member.name} />}
                                                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                                </Avatar>
                                                <Link href={`/members/${member.id}`} className="hover:underline text-primary font-medium leading-tight">
                                                    {member.name}
                                                </Link>
                                            </div>
                                        </TableCell>
                                    ) : null}
                                    <TableCell className="hidden sm:table-cell">{formatAccountNumber(account.account_number)}</TableCell>
                                    <TableCell>
                                         <Badge variant={
                                            account.type === 'Loan' ? 'destructive' :
                                            account.type === 'LTD' ? 'outline' : 
                                            account.type === 'Current' ? 'default' : 'secondary'
                                         }>
                                            {account.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{account.scheme_name}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                                </TableRow>
                            ))
                        ))
                   )}
                </TableBody>
            </Table>
        </div>
    )
}

export default async function AccountsPage() {
    const allMembersWithAccounts = await getMemberAccounts();

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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
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
