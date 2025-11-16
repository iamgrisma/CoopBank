import { supabase } from "@/lib/supabase-client";
import { MembersTable } from "@/components/members/members-table";
import { AddMember } from "@/components/members/add-member";

// This page is now revalidated on-demand when a member is added.
// See the revalidatePath function in the AddMember component.
async function getMembers() {
  // The tables are defined in supabase/setup.sql
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
        <div className="ml-auto">
          <AddMember />
        </div>
      </div>
      <MembersTable members={members} />
    </main>
  );
}
