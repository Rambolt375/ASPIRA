'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { useThemeStore } from '@/stores/themeStore';

export default function ProfilPage() {
  const router = useRouter();
  const { user, clear } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const { theme, setTheme } = useThemeStore();

  function handleLogout() {
    clear();
    router.replace('/login');
  }

  if (!user) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl mx-auto">
          👤
        </div>
        <h1 className="text-xl font-bold text-slate-900">Belum Masuk Akun</h1>
        <p className="text-xs text-slate-500">
          Silakan masuk atau daftar akun untuk mengakses profil, poin kontribusi, dan lencana reputasi Anda.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link href="/login" className="px-5 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow">
            Masuk
          </Link>
          <Link href="/register" className="px-5 py-2.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            Daftar
          </Link>
        </div>
      </main>
    );
  }

  const BADGES = [
    { type: 'REPORTER', label: 'Pelapor Aktif', icon: '📢', desc: 'Konsisten mengirim laporan infrastruktur yang terverifikasi sah' },
    { type: 'HELPER', label: 'Penolong Warga', icon: '🤝', desc: 'Melakukan konfirmasi lapangan dan membantu verifikasi titik' },
    { type: 'TOP_10', label: 'Top 10 Kontributor', icon: '🏆', desc: 'Masuk dalam jajaran warga paling berpengaruh di Kota Bogor' },
  ];

  const LEVEL_INFO = {
    BRONZE: { label: 'Bronze Warga', color: 'bg-amber-100 text-amber-800 border-amber-300', next: 'Silver (100 Poin)' },
    SILVER: { label: 'Silver Warga', color: 'bg-slate-200 text-slate-800 border-slate-300', next: 'Gold (300 Poin)' },
    GOLD: { label: 'Gold Warga', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', next: 'Diamond (1000 Poin)' },
    DIAMOND: { label: 'Diamond Warga', color: 'bg-cyan-100 text-cyan-800 border-cyan-300', next: 'Tingkat Maksimal' },
  };

  const currentLevel = (user.reputationLevel as keyof typeof LEVEL_INFO) || 'BRONZE';
  const levelData = LEVEL_INFO[currentLevel] || LEVEL_INFO.BRONZE;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 pb-24 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-2xl shadow-md shadow-emerald-500/20">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900">{user.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${levelData.color}`}>
                  {levelData.label}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">{user.email}</p>
              <p className="text-xs text-slate-600 font-medium mt-1">
                📍 {user.kelurahan ? `Kel. ${user.kelurahan}, ` : ''}{user.kecamatan ? `Kec. ${user.kecamatan}` : 'Kota Bogor'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="self-start sm:self-auto px-4 py-2 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
          >
            Keluar Akun
          </button>
        </div>

        {/* Reputation & Points Bar */}
        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 block">Poin Kontribusi Sipil:</span>
              <span className="text-2xl font-black text-emerald-800">{user.contributionPoints ?? 10} Poin</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-700 block">Target Level Berikutnya:</span>
              <span className="text-xs font-bold text-emerald-900">{levelData.next}</span>
            </div>
          </div>
          <div className="w-full bg-emerald-200/50 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full"
              style={{ width: `${Math.min(100, ((user.contributionPoints ?? 10) / 300) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Lencana Prestasi Warga</h2>
          <p className="text-xs text-slate-500 mt-0.5">Penghargaan atas partisipasi aktif perbaikan infrastruktur Kota Bogor.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BADGES.map((b) => (
            <div key={b.type} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-2">
              <span className="text-2xl">{b.icon}</span>
              <div>
                <h3 className="text-xs font-bold text-slate-900">{b.label}</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences & Settings */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-900">Pengaturan Aplikasi</h2>

        <div className="space-y-4 text-xs">
          {/* Language Preference */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="font-bold text-slate-800">Bahasa Antarmuka (Language)</p>
              <p className="text-slate-500">Pilih Bahasa Indonesia atau English</p>
            </div>
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  language === 'id' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                🇮🇩 ID
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  language === 'en' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>

          {/* Theme Preference */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="font-bold text-slate-800">Tema Tampilan (Theme)</p>
              <p className="text-slate-500">Mode Terang (Light) atau Gelap (Dark)</p>
            </div>
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors ${
                    theme === t ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
