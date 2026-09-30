import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured, syncProfileToSupabase, fetchProfileFromSupabase } from '../services/supabase';
import { StorageService } from '../services/storageService';
import { UserProfile } from '../types/fitness';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isGuest: boolean;
  loading: boolean;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  updateProfile: (profile: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        // Load local profile first
        const cachedProfile = await StorageService.getProfile();
        if (mounted && cachedProfile) {
          setProfile(cachedProfile);
        }

        if (isSupabaseConfigured()) {
          const supabase = getSupabase();
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          if (mounted && initialSession) {
            setSession(initialSession);
            setUser(initialSession.user);

            // Fetch cloud profile if exists
            const cloudProfile = await fetchProfileFromSupabase(initialSession.user.id);
            if (cloudProfile && mounted) {
              setProfile(cloudProfile);
              await StorageService.saveProfile(cloudProfile);
            }
          }

          // Subscribe to auth state updates
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (!mounted) return;
            setSession(newSession);
            setUser(newSession?.user ?? null);
            if (newSession?.user) {
              setIsGuest(false);
              const cloudProfile = await fetchProfileFromSupabase(newSession.user.id);
              if (cloudProfile) {
                setProfile(cloudProfile);
                await StorageService.saveProfile(cloudProfile);
              }
            }
          });

          return () => {
            subscription.unsubscribe();
          };
        }
      } catch (e) {
        console.warn('Auth initialization error:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase is not configured yet. You can continue as a Guest or set up Supabase in Settings.' };
    }
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };

      setUser(data.user);
      setSession(data.session);
      setIsGuest(false);

      if (data.user) {
        const cloudProfile = await fetchProfileFromSupabase(data.user.id);
        if (cloudProfile) {
          setProfile(cloudProfile);
          await StorageService.saveProfile(cloudProfile);
        }
      }
      return { error: null };
    } catch (e) {
      return { error: (e as Error).message };
    }
  };

  const signUp = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase is not configured yet. You can continue as a Guest or set up Supabase in Settings.' };
    }
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };

      if (data.session) {
        setUser(data.user);
        setSession(data.session);
        setIsGuest(false);
      }
      return { error: null };
    } catch (e) {
      return { error: (e as Error).message };
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('SignOut error:', e);
    } finally {
      setUser(null);
      setSession(null);
      setIsGuest(false);
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    await StorageService.saveProfile(newProfile);
    if (user?.id && isSupabaseConfigured()) {
      await syncProfileToSupabase(newProfile, user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isGuest,
        loading,
        profile,
        signIn,
        signUp,
        signOut,
        continueAsGuest,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
