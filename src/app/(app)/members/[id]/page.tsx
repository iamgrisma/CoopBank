
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import MemberProfileClientPage from "./client-page";

async function getMemberData(id: string) {
    const supabase = createSupabaseServerClient();
    
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
    ] = await Promise.all([
        supabase.from('shares').select('*').eq('member_id', id).order('purchase_date', { ascending: false }),
        supabase.from('savings').select('*, saving_schemes (id, name, type, interest_rate)').eq('member_id', id).order('deposit_date', { ascending: false }),
        supabase.from('loans').select('*, loan_schemes (name, repayment_frequency, grace_period_months), members (id, name)').eq('member_id', id).order('disbursement_date', { ascending: false }),
        supabase.from('loan_schemes').select('*').order('name', { ascending: true }),
        supabase.from('saving_schemes').select('*').order('name', { ascending: true }),
        supabase.from('transactions').select('*').eq('member_id', id).order('date', { ascending: true }),
    ]);

    return {
        member: memberData,
        shares: sharesRes.data || [],
        savings: savingsRes.data || [],
        loans: loansRes.data || [],
        loanSchemes: loanSchemesRes.data || [],
        savingSchemes: savingSchemesRes.data || [],
        transactions: transactionsRes.data || [],
    }
}


export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const data = await getMemberData(params.id);

  return <MemberProfileClientPage {...data} />;
}
