import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../api/client';
import { ensurePublicUser } from '../../api/auth';

interface AuthContextType {
  session: Session | null;
  publicUserId: number | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [publicUserId, setPublicUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const syncFromSession = async (s: Session | null) => {
      if (cancelled) return;
      setSession(s);
      if (s?.user?.id) {
        const uid = await ensurePublicUser(s.user.id);
        if (!cancelled) setPublicUserId(uid);
      } else {
        if (!cancelled) setPublicUserId(null);
      }
    };

    supabase.auth.getSession().then(async ({ data: { session: initial } }) => {
      await syncFromSession(initial);
      if (!cancelled) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      syncFromSession(s);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, publicUserId, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
