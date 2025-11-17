'use client';
import React, { useState, useEffect } from 'react';
import { MembersTable } from "@/components/members/members-table";
import { AddMember } from "@/components/members/add-member";
import { supabase } from "@/lib/supabase-client";
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

function MembersPageSkeleton() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
       <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Members</h1>
        <div className="ml-auto">
           <Button disabled>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Member
            </Button>
        </div>
      </div>
       <div className="rounded-lg border shadow-sm overflow-x-auto">
        <div className="p-4 space-y-4">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                     <Skeleton className="h-4 w-1/4" />
                </div>
            ))}
        </div>
      </div>
    </main>
  )
}


export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getMembers() {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select(`*`)
        .order('join_date', { ascending: false });

      if (error) {
        console.error('Error fetching members:', error);
      } else {
        setMembers(data || []);
      }
      setLoading(false);
    }
    getMembers();
  }, []);

  if (loading) {
    return <MembersPageSkeleton />;
  }

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
