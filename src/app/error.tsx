'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-3xl mb-4">
        ⚠️
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
        Terjadi Kesalahan Sistem
      </h1>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        Mohon maaf, terjadi kendala saat memproses permintaan Anda. Silakan coba lagi atau kembali ke halaman utama.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
        >
          Coba Lagi
        </button>
        <Link
          href="/beranda"
          className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
        >
          Ke Beranda
        </Link>
      </div>
    </div>
  );
}

