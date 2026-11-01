'use client';

import { useLanguageStore } from '@/stores/languageStore';
import { translations } from '@/constants/translations';

/**
 * Returns typed translation strings for the currently selected language.
 * Language preference is persisted in localStorage via Zustand.
 */
export function useTranslation() {
  const { language } = useLanguageStore();
  return { t: translations[language], language };
}
