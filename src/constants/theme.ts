// Civic palette — Emerald (brand), Amber (accent), Slate (neutral)
// Tokens are defined in src/app/globals.css and exposed through Tailwind v4 @theme.

export const palette = {
  primary: {
    DEFAULT: 'bg-brand-600',
    text: 'text-brand-600',
    textHover: 'hover:text-brand-700',
    bg: 'bg-brand-600',
    bgHover: 'hover:bg-brand-700',
    bgLight: 'bg-brand-50 dark:bg-brand-950/40',
    border: 'border-brand-600',
    ring: 'focus-visible:ring-brand-500',
  },
  accent: {
    text: 'text-accent-600',
    bg: 'bg-accent-50 dark:bg-accent-900/40',
    border: 'border-accent-200 dark:border-accent-800',
  },
  neutral: {
    surface: 'bg-surface',
    muted: 'bg-neutral-50 dark:bg-neutral-900',
    border: 'border-neutral-200 dark:border-neutral-800',
    textPrimary: 'text-neutral-900 dark:text-neutral-100',
    textSecondary: 'text-neutral-500 dark:text-neutral-400',
  },
  status: {
    DITERIMA: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200',
    VERIFIKASI: 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-200',
    DICEK: 'bg-info-100 text-info-700 dark:bg-info-900/40 dark:text-info-200',
    DITUGASKAN: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200',
    DALAM_PENANGANAN: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200',
    DIATASI: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
    PENINJAUAN: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200',
    PERAWATAN: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200',
    DITOLAK: 'bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-200',
    DIBUKA_KEMBALI: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
  },
} as const;

export type ReportStatusTone = {
  DITERIMA: 'neutral';
  VERIFIKASI: 'accent';
  DICEK: 'info';
  DITUGASKAN: 'info';
  DALAM_PENANGANAN: 'accent';
  DIATASI: 'success';
  PENINJAUAN: 'success';
  PERAWATAN: 'success';
  DITOLAK: 'danger';
  DIBUKA_KEMBALI: 'danger';
};

export const statusTone = {
  DITERIMA: 'neutral',
  VERIFIKASI: 'accent',
  DICEK: 'info',
  DITUGASKAN: 'info',
  DALAM_PENANGANAN: 'accent',
  DIATASI: 'success',
  PENINJAUAN: 'success',
  PERAWATAN: 'success',
  DITOLAK: 'danger',
  DIBUKA_KEMBALI: 'danger',
} as const satisfies ReportStatusTone;
