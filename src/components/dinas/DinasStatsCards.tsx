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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {/* 1. Laporan Mendesak / Kritis */}
      <div
        onClick={onFilterUrgent}
        className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-red-50/60 dark:from-rose-950/30 dark:to-red-900/20 border border-rose-200/80 dark:border-rose-900/50 cursor-pointer hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
            Prioritas Kritis
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
        </div>
        <p className="mt-3 text-3xl font-extrabold text-rose-800 dark:text-rose-300">
          {stats.criticalCount}
        </p>
        <p className="mt-1 text-xs text-rose-600/80 dark:text-rose-400/80">
          {stats.slaBreachedCount > 0 ? (
            <span className="font-semibold text-red-600 dark:text-red-400">
              ⚠️ {stats.slaBreachedCount} Melewati Batas SLA
            </span>
          ) : (
            'Tingkat Tinggi & Kritis aktif'
          )}
        </p>
      </div>

      {/* 2. Menunggu Verifikasi & Survei */}
      <div
        onClick={onFilterPending}
        className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50/60 dark:from-amber-950/30 dark:to-yellow-900/20 border border-amber-200/80 dark:border-amber-900/50 cursor-pointer hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            Butuh Verifikasi
          </span>
          <span className="text-lg">⏳</span>
        </div>
        <p className="mt-3 text-3xl font-extrabold text-amber-800 dark:text-amber-300">
          {stats.pendingVerification}
        </p>
        <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/80">
          Status Diterima / Menunggu Cek
        </p>
      </div>

      {/* 3. Sedang Ditangani Dinas */}
      <div
        onClick={onFilterHandling}
        className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-blue-950/30 dark:to-indigo-900/20 border border-blue-200/80 dark:border-blue-900/50 cursor-pointer hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
            Dalam Penanganan
          </span>
          <span className="text-lg">🛠️</span>
        </div>
        <p className="mt-3 text-3xl font-extrabold text-blue-800 dark:text-blue-300">
          {stats.activeHandling}
        </p>
        <p className="mt-1 text-xs text-blue-600/80 dark:text-blue-400/80">
          Pekerjaan fisik sedang berjalan
        </p>
      </div>

      {/* 4. Total Selesai / Teratasi */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/60 dark:from-emerald-950/30 dark:to-teal-900/20 border border-emerald-200/80 dark:border-emerald-900/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Tuntas / Perawatan
          </span>
          <span className="text-lg">✅</span>
        </div>
        <p className="mt-3 text-3xl font-extrabold text-emerald-800 dark:text-emerald-300">
          {stats.resolvedCount}
        </p>
        <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80">
          Dari total {stats.totalReports} laporan masuk
        </p>
      </div>
    </div>
  );
}
