"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { addSchemeToDb } from "./add-saving-scheme";
import { supabase } from "@/lib/supabase-client";

type SavingScheme = {
  id: string;
  name: string;
};

interface DefaultSavingSchemeProps {
  allSchemes: SavingScheme[];
}

export function DefaultSavingScheme({ allSchemes }: DefaultSavingSchemeProps) {
  const { toast } = useToast();
  const router = useRouter();

  const defaultSchemeExists = allSchemes.some(s => s.name === "General Savings");

  if (defaultSchemeExists) {
    return null; // Don't render the button if the scheme already exists
  }

  const handleCreateDefault = async () => {
    try {
      await addSchemeToDb({
        name: "General Savings",
        interest_rate: 1, // A nominal interest rate
        type: "Daily",
        lock_in_period_years: 0,
        is_active: true,
      });
      toast({
        title: "Default Scheme Created",
        description: "'General Savings' scheme has been created for automated deposits.",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create default scheme",
        description: error.message,
      });
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Create Default Scheme</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create 'General Savings' Scheme?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will create a default savings scheme named "General Savings".
            This scheme is required for automated deposits, such as when a member overpays on a loan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleCreateDefault}>Create</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
