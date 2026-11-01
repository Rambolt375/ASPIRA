'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { logoutUser } from '@/services/auth';

export default function Navbar() {
  const router = useRouter();
  const { user, clear } = useAuthStore();

  async function handleLogout() {
    await logoutUser();
    clear();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Wordmark */}
        <Link href={user ? '/beranda' : '/'} className="flex items-center gap-2">
          <span className="text-xl font-bold text-emerald-600 tracking-tight">ASPIRA</span>
          <span className="hidden sm:inline-block text-xs text-slate-400 font-medium border border-slate-200 rounded-full px-2 py-0.5">
            Kota Bogor
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-3 text-sm font-medium">
          {user ? (
            <>
              <Link
                href="/beranda"
                className="text-slate-600 hover:text-emerald-600 transition-colors hidden sm:inline"
              >
                Dasbor
              </Link>
              <Link
                href="/lapor"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Buat Laporan
              </Link>
              <button
                onClick={handleLogout}
                className="text-slate-600 hover:text-red-600 transition-colors"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/beranda"
                className="text-slate-600 hover:text-emerald-600 transition-colors hidden sm:inline"
              >
                Jelajahi
              </Link>
              <Link
                href="/lapor"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Buat Laporan
              </Link>
              <Link
                href="/login"
                className="text-slate-600 hover:text-emerald-600 transition-colors"
              >
                Masuk
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
