'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import MemberProfileClientPage from "./client-page";
import { Skeleton } from '@/components/ui/skeleton';

function MemberProfileSkeleton() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="w-full overflow-hidden rounded-lg border">
                <div className="flex flex-col md:flex-row items-start">
                    <Skeleton className="w-full md:w-48 h-32 md:h-48 shrink-0" />
                    <div className="flex-grow p-6 space-y-4">
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                    </div>
                </div>
            </div>
            <div className="rounded-lg border p-4 mt-4">
                <div className="flex gap-2 mb-4">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-24" />)}
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        </main>
    );
}

export default function MemberProfilePage() {
    const params = useParams();
    const id = params.id as string;
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (!id) return;

        async function getMemberData(id: string) {
            setLoading(true);
            
            const { data: memberData, error: memberError } = await supabase
              .from("members")
              .select(`*`)
              .eq("id", id)
              .single();
            
            if (memberError || !memberData) {
              console.error("Error fetching member:", memberError?.message);
              setLoading(false);
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
                supabase.from('savings').select('*, saving_schemes (id, name, type, interest_rate)').eq('member_id', id).order('deposit_date', { ascending: false }),
                supabase.from('loans').select('*, loan_schemes (name, repayment_frequency, grace_period_months), members (id, name)').eq('member_id', id).order('disbursement_date', { ascending: false }),
                supabase.from('loan_schemes').select('*').order('name', { ascending: true }),
                supabase.from('saving_schemes').select('*').order('name', { ascending: true }),
                supabase.from('transactions').select('*').eq('member_id', id).order('date', { ascending: true }),
                supabase.from('loan_repayments').select('*').eq('member_id', id).order('payment_date', { ascending: true }),
            ]);

            setData({
                member: memberData,
                shares: sharesRes.data || [],
                savings: savingsRes.data || [],
                loans: loansRes.data || [],
                loanSchemes: loanSchemesRes.data || [],
                savingSchemes: savingSchemesRes.data || [],
                transactions: transactionsRes.data || [],
                repayments: repaymentsRes.data || [],
            });
            setLoading(false);
        }

        getMemberData(id);
    }, [id]);


    if (loading) {
        return <MemberProfileSkeleton />;
    }

    if (!data) {
        return notFound();
    }

    return <MemberProfileClientPage {...data} />;
}
