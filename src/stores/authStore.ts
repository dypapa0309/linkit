import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../utils/supabase';

interface AuthState {
  initialized: boolean;
  session: Session | null;
  user: User | null;
  setSession: (session: Session | null) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  initialized: false,
  session: null,
  user: null,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setInitialized: (initialized) => set({ initialized }),
  logout: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    set({ session: null, user: null });
  },
}));
