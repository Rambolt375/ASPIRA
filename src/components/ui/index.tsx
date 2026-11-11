import React from 'react';

// ─── Utilities ────────────────────────────────────────────────────────────────

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 focus-visible:ring-brand-500',
  secondary:
    'bg-surface text-neutral-700 border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 focus-visible:ring-brand-500',
  outline:
    'bg-transparent text-neutral-700 border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 focus-visible:ring-brand-500',
  ghost:
    'bg-transparent text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-brand-500',
  danger:
    'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 focus-visible:ring-danger-500',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-inherit',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading && <Spinner className="w-4 h-4" aria-hidden="true" />}
      {children}
    </button>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeTone = 'neutral' | 'brand' | 'accent' | 'danger' | 'info' | 'success';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  tone?: BadgeTone;
}

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  accent: 'bg-accent-50 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300',
  info: 'bg-info-50 text-info-600 dark:bg-info-900/40 dark:text-info-300',
  success: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
};

export function Badge({ children, className = '', tone = 'neutral' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}

export function Card({ children, className = '', padded = true }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs',
        padded && 'p-4 sm:p-5',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
}

export function Input({ label, helper, error, id, className = '', ...props }: InputProps) {
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {label}
        </label>
      )}
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : helperId}
        className={cn(
          'w-full rounded-lg border border-neutral-300 bg-surface px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100',
          'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-transparent',
          'disabled:bg-neutral-50 disabled:text-neutral-400 dark:disabled:bg-neutral-800',
          error && 'border-danger-500 focus-visible:ring-danger-500',
          className,
        )}
        {...props}
      />
      {helper && !error && (
        <p id={helperId} className="text-xs text-neutral-500 dark:text-neutral-400">
          {helper}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helper?: string;
  error?: string;
}

export function Textarea({ label, helper, error, id, className = '', ...props }: TextareaProps) {
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : helperId}
        className={cn(
          'w-full rounded-lg border border-neutral-300 bg-surface px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100',
          'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-transparent',
          'disabled:bg-neutral-50 disabled:text-neutral-400 dark:disabled:bg-neutral-800',
          error && 'border-danger-500 focus-visible:ring-danger-500',
          className,
        )}
        {...props}
      />
      {helper && !error && (
        <p id={helperId} className="text-xs text-neutral-500 dark:text-neutral-400">
          {helper}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helper?: string;
  error?: string;
}

export function Select({ label, helper, error, id, className = '', children, ...props }: SelectProps) {
  const helperId = helper ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {label}
        </label>
      )}
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : helperId}
        className={cn(
          'w-full rounded-lg border border-neutral-300 bg-surface px-3 py-2.5 text-sm text-neutral-900 dark:text-neutral-100',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-transparent',
          'disabled:bg-neutral-50 disabled:text-neutral-400 dark:disabled:bg-neutral-800',
          error && 'border-danger-500 focus-visible:ring-danger-500',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {helper && !error && (
        <p id={helperId} className="text-xs text-neutral-500 dark:text-neutral-400">
          {helper}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800',
        className,
      )}
      aria-hidden="true"
    />
  );
}

// ─── Empty / Error states ─────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-4">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  retry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Terjadi kesalahan',
  description = 'Gagal memuat data. Silakan coba lagi.',
  retry,
  retryLabel = 'Coba lagi',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-danger-200 dark:border-danger-800 bg-danger-50 dark:bg-danger-950/40 p-5 text-center"
    >
      <p className="text-sm font-semibold text-danger-700 dark:text-danger-300">{title}</p>
      <p className="mt-1 text-xs text-danger-600/90 dark:text-danger-400">{description}</p>
      {retry && (
        <Button variant="danger" size="sm" className="mt-4" onClick={retry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon?: React.ReactNode;
  tone?: BadgeTone;
}

const statTones: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300',
  brand: 'bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300',
  accent: 'bg-accent-50 dark:bg-accent-900/40 text-accent-600 dark:text-accent-300',
  danger: 'bg-danger-50 dark:bg-danger-900/40 text-danger-600 dark:text-danger-300',
  info: 'bg-info-50 dark:bg-info-900/40 text-info-600 dark:text-info-300',
  success: 'bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300',
};

export function StatCard({ label, value, sub, icon, tone = 'neutral' }: StatCardProps) {
  return (
    <div className="bg-surface rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 sm:p-5 flex items-start gap-2.5 sm:gap-4 min-w-0 shadow-xs transition-colors">
      {icon && (
        <div
          className={cn(
            'w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0',
            statTones[tone],
          )}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight">
          {value}
        </p>
        <p className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate mt-0.5">
          {label}
        </p>
        {sub && (
          <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium truncate mt-0.5">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
