import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/shared/supabase'; // Ensure this path is correct
import { AuthOtpResponse, Session, User as SupabaseUser } from '@supabase/supabase-js';

// --- TYPE DEFINITIONS ---
interface User {
  id: string;
  email?: string;
  created_at: string;
}

// --- THIS IS THE FIX ---
// The Profile interface now correctly includes the optional `display_name` property.
interface Profile {
  id: string; 
  email?: string;
  display_name?: string; // <<< ADD THIS LINE
  role: 'free_user' | 'premium_user' | 'admin';
  created_at: string;
  updated_at: string;
}
// -----------------------


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
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      return null;
    }
  }, []);

  // --- THIS IS THE SECOND PART OF THE FIX ---
  // When a new profile is created, we also set a default display_name.
  const createProfile = useCallback(async (authedUser: User) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: authedUser.id, 
          email: authedUser.email, 
          role: 'free_user',
          display_name: 'New User' // <<< ADD THIS LINE
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }
      
      await refreshProfile(authedUser);

    } catch (error) {
      console.error('Error creating profile:', error);
    }
  }, [refreshProfile]);


  // --- MAIN AUTHENTICATION EFFECT ---
  // This logic correctly handles the session and profile fetching. No changes needed here.
  useEffect(() => {
    const handleSession = async (session: Session | null) => {
      setLoading(true);
      const supabaseUser: SupabaseUser | null = session?.user ?? null;
      
      const currentUser: User | null = supabaseUser ? {
        id: supabaseUser.id,
        email: supabaseUser.email,
        created_at: supabaseUser.created_at,
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


  const signInWithOtp = (email: string) => {
    return supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };
  
  const value = {
    user,
    profile,
    loading,
    signInWithOtp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}