'use client';
import React from 'react';
import { AddSaving } from "@/components/savings/add-saving";
import { SavingsTable } from "@/components/savings/savings-table";
import { Button } from "@/components/ui/button";
import { MinusCircle, PlusCircle } from "lucide-react";
import { AddWithdrawal } from "@/components/savings/withdrawals/add-withdrawal";
import { supabase } from "@/lib/supabase-client";

export default async function SavingsPage() {
    const [savingsRes, membersRes, savingSchemesRes] = await Promise.all([
        supabase.from('savings').select(`*, members (id, name), saving_schemes (id, name)`).order('deposit_date', { ascending: false }),
        supabase.from('members').select('id, name').order('name', { ascending: true }),
        supabase.from('saving_schemes').select('*').order('name', { ascending: true })
    ]);
    
    if (savingsRes.error) console.error('Error fetching savings:', savingsRes.error);
    if (membersRes.error) console.error('Error fetching members:', membersRes.error);
    if (savingSchemesRes.error) console.error('Error fetching saving schemes:', savingSchemesRes.error);

    const savings = savingsRes.data || [];
    const members = membersRes.data || [];
    const savingSchemes = savingSchemesRes.data || [];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">All Saving Deposits</h1>
        <div className="ml-auto flex items-center gap-2">
          <AddWithdrawal 
            members={members}
            triggerButton={
              <Button variant="outline">
                <MinusCircle className="mr-2 h-4 w-4" />
                Withdraw
              </Button>
            }
          />
          <AddSaving 
            members={members}
            savingSchemes={savingSchemes}
            triggerButton={
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Deposit
              </Button>
            }
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <SavingsTable savings={savings} />
      </div>
    </main>
  );
}
