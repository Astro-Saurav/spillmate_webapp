import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/shared/supabase';
import { AuthOtpResponse, Session } from '@supabase/supabase-js';

// --- TYPE DEFINITIONS ---
interface User {
  id: string;
  email: string;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  role: 'free_user' | 'premium_user' | 'admin';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithOtp: (email: string) => Promise<AuthOtpResponse>;
  signOut: () => Promise<void>;
  refreshProfile: (authedUser: User | null) => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Profile Management Functions (Memoized) ---
  const refreshProfile = useCallback(async (authedUser: User | null): Promise<Profile | null> => {
    if (!authedUser) {
      setProfile(null);
      return null;
    }

    try {
      const response = await fetch(`/api/profile?user_id=${authedUser.id}`);
      if (!response.ok) {
        setProfile(null);
        return null;
      }
      const data: Profile = await response.json();
      setProfile(data);
      return data;
    } catch (error) { // <-- THIS IS THE FIX
      console.error('Error fetching profile:', error);
      setProfile(null);
      return null;
    }
  }, []);

  const createProfile = useCallback(async (authedUser: User) => {
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: authedUser.id, email: authedUser.email, role: 'free_user' })
      });
      await refreshProfile(authedUser);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  }, [refreshProfile]);

  // --- Main Authentication Effect ---
  useEffect(() => {
    const handleSession = async (session: Session | null) => {
      setLoading(true);
      const currentUser = session?.user ? {
        id: session.user.id,
        email: session.user.email || '',
        created_at: session.user.created_at || new Date().toISOString(),
      } : null;

      setUser(currentUser);
      
      if (currentUser) {
        const existingProfile = await refreshProfile(currentUser);
        if (!existingProfile) {
          await createProfile(currentUser);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshProfile, createProfile]);

  // --- Auth Methods ---
  const signInWithOtp = (email: string) => {
    const redirectTo = process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
      : `${window.location.origin}/dashboard`;

    return supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };
  
  const value: AuthContextType = {
    user,
    profile,
    loading,
    signInWithOtp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
