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

// --- THIS IS THE FIX ---
// The AuthContextType interface now correctly defines the `refreshProfile` function's signature.
// It takes a User object (or null) and can return the profile (or null).
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithOtp: (email: string) => Promise<AuthOtpResponse>;
  signOut: () => Promise<void>;
  refreshProfile: (authedUser: User | null) => Promise<Profile | null>; // Corrected Signature
}
// -----------------------


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
        setProfile(null); // Clear profile if fetch fails or user has no profile yet
        return null;
      }
      const data: Profile = await response.json();
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      return null;
    }
  }, []); // Empty dependency array as it has no external dependencies

  const createProfile = useCallback(async (authedUser: User) => {
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: authedUser.id, email: authedUser.email, role: 'free_user' })
      });
      // After creating, call refreshProfile to fetch and set the new profile state
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
          // If no profile was found, create one.
          await createProfile(currentUser);
        }
      } else {
        // Ensure profile is cleared on sign out
        setProfile(null);
      }
      
      setLoading(false);
    };

    // Check for session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for subsequent auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshProfile, createProfile]);


  // --- Auth Methods ---
  const signInWithOtp = (email: string) => {
    return supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null); // Explicitly clear state
    setProfile(null);
  };
  
  // The value provided to the context, now perfectly matching the AuthContextType
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