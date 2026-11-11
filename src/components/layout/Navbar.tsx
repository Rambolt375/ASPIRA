'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
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
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-surface/90 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4" aria-label="Navigasi publik">
        <Link
          href={user ? '/beranda' : '/'}
          className="flex items-center gap-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <span className="text-xl font-bold tracking-tight text-brand-600 dark:text-brand-400">ASPIRA</span>
          <span className="hidden rounded-full border border-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-500 sm:inline-block dark:border-neutral-700 dark:text-neutral-400">
            Kota Bogor
          </span>
        </Link>

        <div className="flex items-center gap-1.5 text-sm font-medium sm:gap-2">
          {user ? (
            <>
              <Link
                href="/beranda"
                className="hidden rounded-lg px-3 py-2 text-neutral-600 transition-colors hover:text-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:inline dark:text-neutral-300 dark:hover:text-brand-400"
              >
                Dasbor
              </Link>
              <Link
                href="/lapor"
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <PlusCircle className="h-4 w-4" />
                Buat Laporan
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-neutral-600 transition-colors hover:text-danger-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-300 dark:hover:text-danger-400"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/beranda"
                className="hidden rounded-lg px-3 py-2 text-neutral-600 transition-colors hover:text-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:inline dark:text-neutral-300 dark:hover:text-brand-400"
              >
                Jelajahi
              </Link>
              <Link
                href="/lapor"
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <PlusCircle className="h-4 w-4" />
                Buat Laporan
              </Link>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-neutral-600 transition-colors hover:text-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-300 dark:hover:text-brand-400"
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
