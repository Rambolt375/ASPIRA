'use client';

import { useEffect } from 'react';
import { subscribeToAuthState, getUserProfile } from '@/services/auth';
import { useAuthStore } from '@/stores/authStore';

/**
 * Syncs Firebase auth state into the Zustand authStore.
 * Mount once at the top of the component tree via AuthProvider.
 */
export function useAuthListener() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [setUser, setLoading]);
}
