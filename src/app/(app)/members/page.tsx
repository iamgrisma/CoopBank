import { supabase } from "@/lib/supabase-client";
import { MembersTable } from "@/components/members/members-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

async function getMembers() {
  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .order('join_date', { ascending: false });

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }
  return members;
}

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Members</h1>
        <Button className="ml-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>
      <MembersTable members={members} />
    </main>
  );
}
