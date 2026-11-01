'use client';

import { useEffect } from 'react';
import { useAuthListener } from '@/hooks/useAuthListener';

/**
 * Mounts the Firebase auth listener once at the root of the tree.
 * This is a client component wrapper so the root layout stays a Server Component.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthListener();
  return <>{children}</>;
}
