'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'id' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'id',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'ASPIRA_language' },
  ),
);
