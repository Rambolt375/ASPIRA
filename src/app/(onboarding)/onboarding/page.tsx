'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

export default function OnboardingPage() {
  const router = useRouter();
  const [kecamatan, setKecamatan] = useState('Bogor Tengah');
  const [kelurahan, setKelurahan] = useState('');
  const [saving, setSaving] = useState(false);

  const KECAMATAN_BOGOR = [
    'Bogor Tengah',
    'Bogor Selatan',
    'Bogor Utara',
    'Bogor Timur',
    'Bogor Barat',
    'Tanah Sareal',
  ];

  function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // Profile updated, continue to beranda
    setTimeout(() => {
      router.replace('/beranda');
    }, 400);
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/20">
          🏛️
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Selamat Datang di ASPIRA!</h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Platform civic-tech kolaboratif pemantauan infrastruktur dan transparansi Kota Bogor.
          </p>
        </div>

        <form onSubmit={handleComplete} className="text-left space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kecamatan Domisili Anda
            </label>
            <select
              value={kecamatan}
              onChange={(e) => setKecamatan(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-300 text-xs bg-white outline-none focus:border-emerald-500"
            >
              {KECAMATAN_BOGOR.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kelurahan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Pabaton / Baranangsiang"
              value={kelurahan}
              onChange={(e) => setKelurahan(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-300 text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Menyiapkan Dasbor...' : 'Mulai Jelajahi ASPIRA →'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
