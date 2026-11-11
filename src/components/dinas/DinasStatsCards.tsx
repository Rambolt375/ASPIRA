'use client';

import React from 'react';

interface StatsProps {
  stats: {
    totalReports: number;
    pendingVerification: number;
    activeHandling: number;
    resolvedCount: number;
    criticalCount: number;
    slaBreachedCount: number;
    announcementsCount: number;
  };
  onFilterUrgent?: () => void;
  onFilterPending?: () => void;
  onFilterHandling?: () => void;
}

export default function DinasStatsCards({
  stats,
  onFilterUrgent,
  onFilterPending,
  onFilterHandling,
}: StatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      {/* 1. Prioritas Kritis */}
      <div
        onClick={onFilterUrgent}
        className="group relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-300 dark:hover:border-rose-800 hover:shadow-md transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Prioritas Kritis
          </span>
          <span className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-sm">
            🚨
          </span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.criticalCount}
          </p>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
            Kasus Mendesak
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          {stats.slaBreachedCount > 0 ? (
            <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              {stats.slaBreachedCount} Melewati SLA
            </span>
          ) : (
            'Respons tanggap darurat'
          )}
        </div>
      </div>

      {/* 2. Butuh Verifikasi */}
      <div
        onClick={onFilterPending}
        className="group relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-800 hover:shadow-md transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Butuh Verifikasi
          </span>
          <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center text-sm">
            ⏳
          </span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.pendingVerification}
          </p>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
            Laporan Masuk
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Tahap Diterima & Validasi Lapangan
        </p>
      </div>

      {/* 3. Dalam Penanganan */}
      <div
        onClick={onFilterHandling}
        className="group relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-md transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Dalam Pengerjaan
          </span>
          <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-sm">
            🛠️
          </span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.activeHandling}
          </p>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            Pekerjaan Fisik
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Regu teknis dinas sedang bertugas
        </p>
      </div>

      {/* 4. Tuntas & Pemeliharaan */}
      <div className="group relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Tuntas / Perawatan
          </span>
          <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-sm">
            ✅
          </span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.resolvedCount}
          </p>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Selesai 100%
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Dari total {stats.totalReports} akumulasi laporan
        </p>
      </div>
    </div>
  );
}
