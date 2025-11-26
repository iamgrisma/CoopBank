
import { SavingSchemesTable } from "@/components/savings/saving-schemes-table";
import { AddSavingScheme } from "@/components/savings/add-saving-scheme";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { DefaultSavingScheme } from "@/components/savings/default-saving-scheme";

export default async function SavingSchemesPage() {
    const { data, error } = await supabase
        .from('saving_schemes')
        .select('*')
        .order('name', { ascending: true });
    
    if (error) {
        console.error('Error fetching saving schemes:', error.message);
    }
    
    const savingSchemes = data || [];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Saving Schemes</h1>
        <div className="ml-auto flex items-center gap-2">
          <DefaultSavingScheme allSchemes={savingSchemes} />
          <AddSavingScheme 
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
        <SavingSchemesTable schemes={savingSchemes} />
      </div>
    </main>
  );
}
