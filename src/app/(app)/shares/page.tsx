
import { AddShare } from "@/components/shares/add-share";
import { SharesTable } from "@/components/shares/shares-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

export default async function SharesPage() {
    const [sharesRes, membersRes] = await Promise.all([
        supabase.from('shares').select(`*, members (id, name)`).order('purchase_date', { ascending: false }),
        supabase.from('members').select('id, name').order('name', { ascending: true })
    ]);

    if (sharesRes.error) console.error('Error fetching shares:', sharesRes.error);
    if (membersRes.error) console.error('Error fetching members:', membersRes.error);

    const shares = sharesRes.data || [];
    const members = membersRes.data || [];
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Share Certificates</h1>
        <div className="ml-auto">
          <AddShare 
            members={members}
            triggerButton={
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Share
              </Button>
            }
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <SharesTable shares={shares} />
      </div>
    </main>
  );
}
