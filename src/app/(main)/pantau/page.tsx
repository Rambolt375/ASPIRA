'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { REPORT_CATEGORIES, REPORT_STATUSES } from '@/constants/categories';
import type { CityPulseStats } from '@/services/db/stats';

export default function PantauPage() {
  const [stats, setStats] = useState<CityPulseStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch City Pulse stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 pb-24 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <span>🏛️</span> Transparansi Kota Bogor
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            City Pulse — Pemantauan Publik Terbuka
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1">
            Data statistik real-time penanganan aduan infrastruktur fisik di seluruh wilayah Kota Bogor.
          </p>
        </div>

        <Link
          href="/peta"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
        >
          🗺️ Buka Peta Geospasial
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Top Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 block mb-1 truncate">Total Laporan Warga</span>
              <p className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">{stats.totalReports}</p>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-1.5 leading-tight">Seluruh kategori fasilitas</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-emerald-700 block mb-1 truncate">Laju Penyelesaian Kota</span>
              <p className="text-2xl sm:text-4xl font-black text-emerald-600 leading-tight">{stats.resolutionRate}%</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full"
                  style={{ width: `${stats.resolutionRate}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-amber-700 block mb-1 truncate">Sedang Ditangani Dinas</span>
              <p className="text-2xl sm:text-4xl font-black text-amber-600 leading-tight">{stats.inProgressReports}</p>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-1.5 leading-tight">Pekerjaan & survei fisik</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs min-w-0">
              <span className="text-[11px] sm:text-xs font-bold text-blue-700 block mb-1 truncate">Tuntas Diatasi / Dirawat</span>
              <p className="text-2xl sm:text-4xl font-black text-blue-600 leading-tight">{stats.resolvedReports}</p>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-1.5 leading-tight">Sebelum-sesudah terverifikasi</p>
            </div>
          </div>

          {/* Breakdown by Status (8-Pipeline) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-6 sm:p-8 space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Distribusi Siklus 8-Status</h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Jumlah laporan aktif pada tiap tahapan penanganan resmi.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {Object.entries(stats.statusBreakdown).map(([st, count]) => (
                <div
                  key={st}
                  className="p-3 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/70 flex flex-col justify-between"
                >
                  <span className="text-[11px] sm:text-xs font-bold text-slate-700 leading-tight truncate">
                    {REPORT_STATUSES[st as keyof typeof REPORT_STATUSES]?.label ?? st}
                  </span>
                  <div className="mt-2 sm:mt-3 flex items-baseline justify-between">
                    <span className="text-lg sm:text-xl font-black text-slate-900">{count}</span>
                    <span className="text-[10px] sm:text-xs text-slate-500 font-bold">
                      {stats.totalReports > 0 ? Math.round((count / stats.totalReports) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category & Regional Distribution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Category Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-6 sm:p-8 space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Distribusi Kategori Kerusakan</h2>
              <div className="space-y-3 pt-1 sm:pt-2">
                {Object.entries(stats.categoryBreakdown).map(([catKey, count]) => {
                  const cat = REPORT_CATEGORIES[catKey as keyof typeof REPORT_CATEGORIES];
                  const percent = stats.totalReports > 0 ? Math.round((count / stats.totalReports) * 100) : 0;
                  return (
                    <div key={catKey} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-slate-800">
                          <span>{cat?.icon ?? '📋'}</span>
                          <span>{cat?.label ?? catKey}</span>
                        </span>
                        <span className="text-slate-600 font-semibold">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kecamatan Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-6 sm:p-8 space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Sebaran Wilayah Kecamatan Kota Bogor</h2>
              <div className="space-y-3 pt-1 sm:pt-2">
                {Object.entries(stats.kecamatanBreakdown).map(([kec, count]) => {
                  const percent = stats.totalReports > 0 ? Math.round((count / stats.totalReports) * 100) : 0;
                  return (
                    <div key={kec} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800">Kecamatan {kec}</span>
                        <span className="text-slate-600 font-semibold">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-slate-800 h-2 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-slate-400">Tidak ada data statistik tersedia.</div>
      )}
    </main>
  );
}

