import { supabase } from "@/lib/supabase-client";
import { AddSaving } from "@/components/savings/add-saving";
import { SavingsTable } from "@/components/savings/savings-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

async function getSavings() {
  const { data: savings, error } = await supabase
    .from('savings')
    .select(`
      *,
      members (
        id,
        name
      )
    `)
    .order('deposit_date', { ascending: false });

  if (error) {
    console.error('Error fetching savings:', error);
    return [];
  }
  return savings;
}

async function getMembers() {
  const { data: members, error } = await supabase
    .from('members')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }
  return members;
}

export default async function SavingsPage() {
  const savings = await getSavings();
  const members = await getMembers();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Daily Savings</h1>
        <div className="ml-auto">
          <AddSaving 
            members={members}
            triggerButton={
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Deposit
              </Button>
            }
          />
        </div>
      </div>
      <SavingsTable savings={savings} />
    </main>
  );
}
