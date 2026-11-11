'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getReports } from '@/services/reports';
import { REPORT_CATEGORIES } from '@/constants/categories';
import type { Report } from '@/types';

// Load map dynamically with SSR disabled to prevent Leaflet hydration errors
const InteractiveReportMap = dynamic(
  () => import('@/components/map/InteractiveReportMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] rounded-3xl bg-slate-100 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-2">
        <span className="text-3xl">🗺️</span>
        <span className="text-xs font-semibold">Memuat Peta Spasial Kota Bogor...</span>
      </div>
    ),
  },
);

export default function PetaPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    async function fetchReports() {
      try {
        const { reports: data } = await getReports({ limit: 100 });
        setReports(data);
      } catch (err) {
        console.error('Error fetching reports for map:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (selectedCategory === 'ALL') return true;
    return r.category === selectedCategory;
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 pb-24 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Peta Geospasial Infrastruktur Kota Bogor
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1">
            Pantau sebaran titik laporan infrastruktur fisik secara transparan di seluruh wilayah Kota Bogor.
          </p>
        </div>

        <Link
          href="/laporan/buat"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
        >
          + Buat Laporan Baru
        </Link>
      </div>

      {/* Filter Chips */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pr-6 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-300'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Semua ({reports.length})
          </button>

          {Object.entries(REPORT_CATEGORIES).map(([key, cat]) => {
            const count = reports.filter((r) => r.category === key).length;
            const isSelected = selectedCategory === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-2 sm:p-3 relative z-0 isolate overflow-hidden">
        {loading ? (
          <div className="w-full h-[360px] sm:h-[550px] rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-500 font-medium text-xs sm:text-sm">
            Memuat data titik laporan...
          </div>
        ) : (
          <InteractiveReportMap reports={filteredReports} className="w-full h-[360px] sm:h-[550px] rounded-2xl overflow-hidden shadow-xs border border-slate-200" />
        )}
      </div>

      {/* Map Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 shrink-0" />
          <span>Tuntas / Perawatan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0" />
          <span>Dalam Penanganan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-red-600 shrink-0" />
          <span>Urgensi Kritis / Tinggi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0" />
          <span>Diverifikasi</span>
        </div>
      </div>
    </main>
  );
}
