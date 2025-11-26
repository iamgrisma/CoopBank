import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import MemberProfileClientPage from "./client-page";

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
    const id = params.id;

    if (!id) {
        return notFound();
    }
    
    const { data: memberData, error: memberError } = await supabase
      .from("members")
      .select(`*`)
      .eq("id", id)
      .single();
    
    if (memberError || !memberData) {
      console.error("Error fetching member:", memberError?.message);
      return notFound();
    }

    const [
        sharesRes,
        savingsRes,
        loansRes,
        loanSchemesRes,
        savingSchemesRes,
        transactionsRes,
        repaymentsRes,
    ] = await Promise.all([
        supabase.from('shares').select('*').eq('member_id', id).order('purchase_date', { ascending: false }),
        supabase.from('savings').select('*, saving_schemes (id, name, type, interest_rate, lock_in_period_years)').eq('member_id', id).order('deposit_date', { ascending: false }),
        supabase.from('loans').select('*, loan_schemes (name, repayment_frequency, grace_period_months), members (id, name)').eq('member_id', id).order('disbursement_date', { ascending: false }),
        supabase.from('loan_schemes').select('*').order('name', { ascending: true }),
        supabase.from('saving_schemes').select('*').order('name', { ascending: true }),
        supabase.from('transactions').select('*').eq('member_id', id).order('date', { ascending: true }),
        supabase.from('loan_repayments').select('*').in('loan_id', (await supabase.from('loans').select('id').eq('member_id', id)).data?.map(l => l.id) || []),
    ]);

    const data = {
        member: memberData,
        shares: sharesRes.data || [],
        savings: savingsRes.data || [],
        loans: loansRes.data || [],
        loanSchemes: loanSchemesRes.data || [],
        savingSchemes: savingSchemesRes.data || [],
        transactions: transactionsRes.data || [],
        repayments: repaymentsRes.data || [],
    };

    return <MemberProfileClientPage {...data} />;
}
