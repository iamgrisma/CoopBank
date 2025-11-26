
import { FinancialSummaryClient } from "./client-page";
import { supabase } from "@/lib/supabase-client";

export default async function ReportsPage() {
    const [sharesRes, savingsRes, loansRes, transactionsRes] = await Promise.all([
        supabase.from('shares').select('number_of_shares, face_value'),
        supabase.from('savings').select('amount'),
        supabase.from('loans').select('amount'),
        supabase.from('transactions').select('type, amount')
    ]);
    
    let summary = { shareCapital: 0, totalSavings: 0, totalLoans: 0, interestIncome: 0, penaltyIncome: 0 };
    if (sharesRes.error || savingsRes.error || loansRes.error || transactionsRes.error) {
        console.error({ sharesError: sharesRes.error, savingsError: savingsRes.error, loansError: loansRes.error, transactionsError: transactionsRes.error });
    } else {
        const shareCapital = (sharesRes.data || []).reduce((acc: number, s: any) => acc + (s.number_of_shares * s.face_value), 0);
        const totalSavings = (savingsRes.data || []).reduce((acc: number, s: any) => acc + s.amount, 0);
        const totalLoans = (loansRes.data || []).reduce((acc: number, l: any) => acc + l.amount, 0);
        const interestIncome = (transactionsRes.data || [])
            .filter(t => t.type === 'Loan Interest')
            .reduce((acc, t) => acc + t.amount, 0);
        const penaltyIncome = (transactionsRes.data || [])
            .filter(t => t.type === 'Penalty Income')
            .reduce((acc, t) => acc + t.amount, 0);
        
        summary = { shareCapital, totalSavings, totalLoans, interestIncome, penaltyIncome };
    }

    return <FinancialSummaryClient summary={summary} />;
}
