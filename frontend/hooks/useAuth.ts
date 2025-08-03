'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    auth.getUser().then((user) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await auth.signIn(email, password);
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await auth.signUp(email, password);
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await auth.signInWithGoogle();
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await auth.resetPassword(email);
    return { data, error };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };
}