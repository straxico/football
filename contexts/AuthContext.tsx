import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { BettingUser } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  bettingUser: BettingUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [bettingUser, setBettingUser] = useState<BettingUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // بررسی session فعلی
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadBettingUser(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // گوش دادن به تغییرات auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadBettingUser(session.user.id);
      } else {
        setBettingUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadBettingUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('betting_users')
        .select('*')
        .eq('id', userId)
        .single();

      // If there's a "not found" / single coercion error (PostgREST 406 / PGRST116),
      // create a profile record for this authenticated user so bettingUser is available.
      if (error) {
        const isNotFound =
          // supabase may return a code string
          (error.code && String(error.code).includes('PGRST116')) ||
          // or details mentioning 0 rows / cannot coerce single object
          (error.details && String(error.details).includes('0 rows')) ||
          (error.message && String(error.message).includes('Cannot coerce'));

        if (!isNotFound) {
          console.error('Error loading betting user:', error);
          setBettingUser(null);
          return;
        }

        // profile not found -> try to create one for the signed-in user
        try {
          const res = await supabase.auth.getUser();
          const email = res.data?.user?.email ?? null;
          const displayName = email ? email.split('@')[0] : 'کاربر';

          const { data: inserted, error: insertError } = await supabase
            .from('betting_users')
            .insert([
              { id: userId, email: email ?? '', display_name: displayName },
            ])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating betting profile:', insertError);
            setBettingUser(null);
            return;
          }

          setBettingUser(inserted || null);
          return;
        } catch (inner) {
          console.error('Error creating betting profile:', inner);
          setBettingUser(null);
          return;
        }
      }

      setBettingUser(data || null);
    } catch (err) {
      console.error('Error loading betting user:', err);
      setBettingUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          // اگر در Supabase تأیید ایمیل را غیرفعال کرده‌اید، کاربر مستقیماً وارد می‌شود
        }
      });

      if (error) throw error;

      if (data.user) {
        // ایجاد پروفایل کاربر
        const { error: profileError } = await supabase
          .from('betting_users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email!,
              display_name: displayName,
            },
          ]);

        if (profileError) {
          // اگر پروفایل از قبل وجود داشت (مثلاً ثبت‌نام قبلی)، مشکلی نیست
          console.warn('Profile may already exist:', profileError);
        }
        
        // ensure local state is updated (if user is auto-signed-in)
        try {
          await loadBettingUser(data.user.id);
        } catch (e) {
          // ignore; loadBettingUser logs errors
        }
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        // try to load/create betting profile immediately
        try {
          await loadBettingUser(data.user.id);
        } catch (e) {
          /* ignored */
        }
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    bettingUser,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
