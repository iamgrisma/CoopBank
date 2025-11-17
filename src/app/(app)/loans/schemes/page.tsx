
"use client";

import React, { useState, useEffect } from 'react';
import { LoanSchemesTable } from "@/components/loans/loan-schemes-table";
import { AddLoanScheme } from "@/components/loans/add-loan-scheme";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { Skeleton } from '@/components/ui/skeleton';

function LoanSchemesPageSkeleton() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <Skeleton className="h-8 w-44" />
                <div className="ml-auto">
                    <Skeleton className="h-10 w-36" />
                </div>
            </div>
            <div className="rounded-lg border shadow-sm overflow-hidden">
                <Skeleton className="h-96 w-full" />
            </div>
        </main>
    );
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
      return <LoanSchemesPageSkeleton />;
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
      <LoanSchemesTable schemes={loanSchemes} />
    </main>
  );
}
