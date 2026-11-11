'use client';

import React from 'react';
import { useThemeStore } from '@/stores/themeStore';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useThemeStore();

  function toggle() {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      title={isDark ? 'Mode Gelap Aktif — Klik untuk Mode Terang' : 'Mode Terang Aktif — Klik untuk Mode Gelap'}
      className={`inline-flex items-center justify-center p-2 rounded-xl transition-all border ${
        isDark
          ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
      } ${className}`}
    >
      {isDark ? (
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
          <span className="text-[11px] font-bold">Terang</span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
          <span className="text-[11px] font-bold">Gelap</span>
        </span>
      )}
    </button>
  );
}
