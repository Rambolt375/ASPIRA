'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppUser } from '@/types';

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  setUser: (user: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:    null,
      loading: true,
      setUser:    (user)    => set({ user }),
      setLoading: (loading) => set({ loading }),
      clear:  ()            => set({ user: null, loading: false }),
    }),
    {
      name:    'ASPIRA_auth',
      // Only persist the user profile, not the loading flag
      partialize: (s) => ({ user: s.user }),
    },
  ),
);
