'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getReport } from '@/services/reports';
import ReportDetailClient from '@/components/reports/ReportDetailClient';
import type { Report } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

export default function ReportDetailPage({ params }: Props) {
  const { id } = use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        const data = await getReport(id);
        if (data) {
          setReport(data);
        } else {
          setError('Laporan tidak ditemukan.');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Gagal memuat laporan.');
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Memuat rincian laporan & linimasa pelacakan...</p>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h1 className="text-lg font-bold text-slate-800">Laporan Tidak Ditemukan</h1>
        <p className="text-xs text-slate-500">
          {error || 'Laporan yang Anda cari mungkin sudah dipindahkan atau nomor tiket tidak terdaftar.'}
        </p>
        <Link
          href="/laporan"
          className="inline-block px-5 py-2.5 rounded-full bg-emerald-600 text-white font-bold text-xs"
        >
          ← Kembali ke Semua Laporan
        </Link>
      </main>
    );
  }

  return <ReportDetailClient initialReport={report} />;
}
