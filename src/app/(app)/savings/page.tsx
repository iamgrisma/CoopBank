import { AddSaving } from "@/components/savings/add-saving";
import { SavingsTable } from "@/components/savings/savings-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function getSavings() {
  const supabase = createSupabaseServerClient();
  const { data: savings, error } = await supabase
    .from('savings')
    .select(`
      *,
      members (
        id,
        name
      ),
      saving_schemes (
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
  const supabase = createSupabaseServerClient();
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

async function getSavingSchemes() {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('saving_schemes')
        .select('*')
        .order('name', { ascending: true });
    
    if (error) {
        console.error('Error fetching saving schemes:', error);
        return [];
    }
    return data;
}

export default async function SavingsPage() {
  const savings = await getSavings();
  const members = await getMembers();
  const savingSchemes = await getSavingSchemes();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">All Saving Deposits</h1>
        <div className="ml-auto">
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
      <SavingsTable savings={savings} />
    </main>
  );
}
