'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * Initializes and syncs authentication state in the Zustand authStore.
 */
export function useAuthListener() {
  const { setLoading } = useAuthStore();

  useEffect(() => {
    // Session state is loaded and hydrated via Zustand persist middleware
    setLoading(false);
  }, [setLoading]);
}
