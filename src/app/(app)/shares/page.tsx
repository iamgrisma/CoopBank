import { supabase } from "@/lib/supabase-client";
import { AddShare } from "@/components/shares/add-share";
import { SharesTable } from "@/components/shares/shares-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

async function getShares() {
  const { data: shares, error } = await supabase
    .from('shares')
    .select(`
      *,
      members (
        id,
        name
      )
    `)
    .order('purchase_date', { ascending: false });

  if (error) {
    console.error('Error fetching shares:', error);
    return [];
  }
  return shares;
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

export default async function SharesPage() {
  const shares = await getShares();
  const members = await getMembers();

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
      <SharesTable shares={shares} />
    </main>
  );
}
