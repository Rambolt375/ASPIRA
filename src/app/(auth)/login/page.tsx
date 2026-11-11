'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/services/auth';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  // Redirect already-authenticated users
  useEffect(() => {
    if (user) router.replace('/beranda');
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await loginUser(email.trim(), password);
      setUser(loggedUser);
      router.replace('/beranda');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Email atau kata sandi tidak sesuai.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-none p-8 sm:p-10 transition-colors">

        {/* Heading */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 mb-4">
            <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Masuk ke ASPIRA</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Belum punya akun?{' '}
            <Link href="/register" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">
              Daftar gratis
            </Link>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
          />

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Kata Sandi
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                aria-label={showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPass ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3">
              <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </Button>
        </form>

        {/* Quick Role Fillers for Evaluation */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
            Pilihan Akun Uji Coba:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('warga@aspira.id');
                setPassword('Warga123!');
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition-colors"
            >
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">👤 Warga</span>
              <span className="block text-[10px] text-slate-400 truncate">warga@aspira.id</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('petugas@pupr.bogor.go.id');
                setPassword('Petugas123!');
              }}
              className="p-2 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/40 hover:bg-blue-100/60 text-left transition-colors"
            >
              <span className="block text-xs font-bold text-blue-700 dark:text-blue-300">🛠️ Petugas</span>
              <span className="block text-[10px] text-blue-500/80 truncate">PUPR Lapangan</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@aspira.bogor.go.id');
                setPassword('Admin123!');
              }}
              className="p-2 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/40 hover:bg-purple-100/60 text-left transition-colors"
            >
              <span className="block text-xs font-bold text-purple-700 dark:text-purple-300">🏛️ Pimpinan</span>
              <span className="block text-[10px] text-purple-500/80 truncate">Pemkot Bogor</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs text-slate-400 font-medium">atau</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Guest link */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Ingin melihat laporan terlebih dahulu?{' '}
          <Link href="/beranda" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">
            Jelajahi tanpa akun
          </Link>
        </p>
      </div>
    </div>
  );
}
