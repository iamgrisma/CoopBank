
"use client";

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
                <Skeleton className="h-8 w-32" />
                <div className="ml-auto">
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
            <div className="rounded-lg border shadow-sm overflow-hidden">
                <Skeleton className="h-96 w-full" />
            </div>
        </main>
    );
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
      <MembersTable members={members} />
    </main>
  );
}
