
import { MembersTable } from "@/components/members/members-table";
import { AddMember } from "@/components/members/add-member";
import { supabase } from "@/lib/supabase-client";

export default async function MembersPage() {
  const { data, error } = await supabase
    .from('members')
    .select(`*`)
    .order('join_date', { ascending: false });

  if (error) {
    console.error('Error fetching members:', error);
  }
  
  const members = data || [];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Members</h1>
        <div className="ml-auto">
          <AddMember />
        </div>
      </div>
      <div className="overflow-x-auto">
        <MembersTable members={members} />
      </div>
    </main>
  );
}
