"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase-client';
import { type User, type AuthChangeEvent, type Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          if (session.user.email === 'iamgrisma@gmail.com') {
            setUser(session.user);
            router.push('/');
          } else {
            toast({
              variant: "destructive",
              title: "Unauthorized",
              description: "You are not authorized to access this application.",
            });
            await supabase.auth.signOut();
            setUser(null);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/login');
        }
        setLoading(false);
      }
    );

    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
         if (session.user.email === 'iamgrisma@gmail.com') {
            setUser(session.user);
          } else {
            await supabase.auth.signOut();
            setUser(null);
          }
      }
      setLoading(false);
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [router, toast]);

  const value = {
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(_AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Workaround for React Refresh limitations
const _AuthContext = AuthContext;
