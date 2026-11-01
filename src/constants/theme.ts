// Civic palette — Slate / Emerald / Amber
// Use these Tailwind class names consistently across components

export const palette = {
  // Primary brand — civic green
  primary: {
    DEFAULT: 'emerald-600',
    light: 'emerald-50',
    dark: 'emerald-700',
    text: 'text-emerald-600',
    bg: 'bg-emerald-600',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-600',
    hover: 'hover:bg-emerald-700',
    ring: 'focus:ring-emerald-500',
  },
  // Accent — alert / pending
  accent: {
    DEFAULT: 'amber-500',
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-400',
  },
  // Neutral base
  neutral: {
    surface: 'bg-slate-50',
    card: 'bg-white',
    border: 'border-slate-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-500',
    textMuted: 'text-slate-400',
  },
  // Status colors
  status: {
    DITERIMA: 'bg-slate-100 text-slate-700',
    VERIFIKASI: 'bg-amber-100 text-amber-700',
    DICEK: 'bg-blue-100 text-blue-700',
    DITUGASKAN: 'bg-indigo-100 text-indigo-700',
    DALAM_PENANGANAN: 'bg-orange-100 text-orange-700',
    DIATASI: 'bg-emerald-100 text-emerald-700',
    PENINJAUAN: 'bg-teal-100 text-teal-700',
    PERAWATAN: 'bg-green-100 text-green-700',
    DITOLAK: 'bg-red-100 text-red-700',
    DIBUKA_KEMBALI: 'bg-rose-100 text-rose-700',
  },
} as const;
