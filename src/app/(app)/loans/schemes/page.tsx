'use client';
import React, { useState, useEffect } from 'react';
import { LoanSchemesTable } from "@/components/loans/loan-schemes-table";
import { AddLoanScheme } from "@/components/loans/add-loan-scheme";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { Skeleton } from '@/components/ui/skeleton';

function LoanSchemesSkeleton() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <h1 className="font-semibold text-lg md:text-2xl">Loan Schemes</h1>
                <div className="ml-auto">
                    <Button disabled>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Scheme
                    </Button>
                </div>
            </div>
             <div className="rounded-lg border shadow-sm overflow-x-auto">
                <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="grid grid-cols-5 items-center space-x-4">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}

export default function LoanSchemesPage() {
    const [loanSchemes, setLoanSchemes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getLoanSchemes() {
            setLoading(true);
            const { data, error } = await supabase
                .from('loan_schemes')
                .select('*')
                .order('name', { ascending: true });
            
            if (error) {
                console.error('Error fetching loan schemes:', error);
            } else {
                setLoanSchemes(data || []);
            }
            setLoading(false);
        }
        getLoanSchemes();
    }, []);

    if (loading) {
        return <LoanSchemesSkeleton />;
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Loan Schemes</h1>
        <div className="ml-auto">
          <AddLoanScheme 
            triggerButton={
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Scheme
              </Button>
            }
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <LoanSchemesTable schemes={loanSchemes} />
      </div>
    </main>
  );
}
