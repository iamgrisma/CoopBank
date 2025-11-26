
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import MemberProfileClientPage from "./client-page";

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
    const id = params.id;

    if (!id) {
        return notFound();
    }
    
    // Call the new RPC function to get all member data in one go
    const { data: memberDetails, error: rpcError } = await supabase
      .rpc('get_member_details', { member_id_param: id })
      .single();

    if (rpcError || !memberDetails) {
      console.error("Error fetching member details via RPC:", rpcError?.message);
      return notFound();
    }

    const {
        member_data,
        shares_data,
        savings_data,
        loans_data,
        transactions_data,
        repayments_data,
        loan_schemes_data,
        saving_schemes_data
    } = memberDetails;
    
    if (!member_data) {
        return notFound();
    }

    const data = {
        member: member_data,
        shares: shares_data || [],
        savings: savings_data || [],
        loans: loans_data || [],
        loanSchemes: loan_schemes_data || [],
        savingSchemes: saving_schemes_data || [],
        transactions: transactions_data || [],
        repayments: repayments_data || [],
    };

    return <MemberProfileClientPage {...data} />;
}
