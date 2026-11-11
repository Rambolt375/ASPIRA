'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getReports } from '@/services/reports';
import ReportCard from '@/components/laporan/ReportCard';
import { REPORT_CATEGORIES, REPORT_STATUSES } from '@/constants/categories';
import type { Report, ReportCategory, ReportStatus } from '@/types';

export default function LaporanPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [status, setStatus] = useState<string>('ALL');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { reports: data, total: count } = await getReports({
          category: category !== 'ALL' ? (category as ReportCategory) : undefined,
          status: status !== 'ALL' ? (status as ReportStatus) : undefined,
          limit: 50,
        });
        setReports(data);
        setTotal(count);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category, status]);

  const filteredReports = reports.filter((r) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(query) ||
      r.address.toLowerCase().includes(query) ||
      r.ticketNumber.toLowerCase().includes(query)
    );
  });

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 pb-24 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Semua Laporan Infrastruktur
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Daftar seluruh aduan kerusakan fasilitas umum di Kota Bogor ({total} Laporan).
          </p>
        </div>

        <Link
          href="/laporan/buat"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
        >
          + Buat Laporan Baru
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Pencarian Cepat
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul laporan, nomor tiket, atau nama jalan di Bogor..."
            className="w-full p-3.5 rounded-2xl border border-slate-300 text-slate-900 placeholder:text-slate-500 font-medium text-xs sm:text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 bg-slate-50/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Filter Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
            >
              <option value="ALL">Semua Kategori</option>
              {Object.entries(REPORT_CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key} className="text-slate-800 py-1">
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Filter Status Penanganan
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
            >
              <option value="ALL">Semua Status</option>
              {Object.entries(REPORT_STATUSES).map(([key, st]) => (
                <option key={key} value={key} className="text-slate-800 py-1">
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
          Tidak ada laporan yang sesuai dengan filter pencarian.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </main>
  );
}
