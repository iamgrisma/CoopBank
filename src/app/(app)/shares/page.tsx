'use client';
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
                <h1 className="font-semibold text-lg md:text-2xl">Share Certificates</h1>
                <div className="ml-auto">
                    <Button disabled>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Share
                    </Button>
                </div>
            </div>
             <div className="rounded-lg border shadow-sm overflow-x-auto">
                <div className="p-4 space-y-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="grid grid-cols-6 items-center space-x-4">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/4 ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}


export default function SharesPage() {
    const [loading, setLoading] = useState(true);
    const [pageData, setPageData] = useState({
        shares: [],
        members: [],
    });

    useEffect(() => {
        async function getPageData() {
            setLoading(true);
            const [sharesRes, membersRes] = await Promise.all([
                supabase.from('shares').select(`*, members (id, name)`).order('purchase_date', { ascending: false }),
                supabase.from('members').select('id, name').order('name', { ascending: true })
            ]);

            if (sharesRes.error) console.error('Error fetching shares:', sharesRes.error);
            if (membersRes.error) console.error('Error fetching members:', membersRes.error);

            setPageData({
                shares: sharesRes.data || [],
                members: membersRes.data || [],
            });
            setLoading(false);
        }
        getPageData();
    }, []);

    if (loading) {
        return <SharesPageSkeleton />;
    }

  const { shares, members } = pageData;

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
