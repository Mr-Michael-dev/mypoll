"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

export const AuthProvider = ({
  children,
  serverSession,
}: {
  children: React.ReactNode;
  serverSession: Session | null;
}) => {
  const [session, setSession] = useState<Session | null>(serverSession);
  const [user, setUser] = useState<User | null>(serverSession?.user ?? null);
  // Set initial loading state based on serverSession.
  const [loading, setLoading] = useState(!serverSession || !user);

  useEffect( () => {
    const findUser = async () => {
      if (user) return;
      else {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      }
    }
    
    findUser();
    // const supabase = createServerComponentClient({ cookies });
  }, [user]);

  useEffect(() => {
    // Only fetch session on the client if no session was provided by the server.
    // This handles cases where the user navigates directly to a client-rendered page
    // or when the server session is missing.
    if (!user && !serverSession) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        // setUser(session?.user ?? null);
        setLoading(false);
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        // setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [serverSession, user]);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
