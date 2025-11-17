
"use client";

import React, { useState, useEffect } from 'react';
import { AddShare } from "@/components/shares/add-share";
import { SharesTable } from "@/components/shares/shares-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { Skeleton } from '@/components/ui/skeleton';

function SharesPageSkeleton() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <Skeleton className="h-8 w-48" />
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

export default function SharesPage() {
  const [shares, setShares] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getPageData() {
        setLoading(true);
        const [sharesRes, membersRes] = await Promise.all([
            supabase.from('shares').select(`*, members (id, name)`).order('purchase_date', { ascending: false }),
            supabase.from('members').select('id, name').order('name', { ascending: true })
        ]);

        if (sharesRes.error) console.error('Error fetching shares:', sharesRes.error);
        if (membersRes.error) console.error('Error fetching members:', membersRes.error);

        setShares(sharesRes.data || []);
        setMembers(membersRes.data || []);
        setLoading(false);
    }
    getPageData();
  }, []);

  if (loading) {
      return <SharesPageSkeleton />;
  }

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
