import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-surface dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className="mb-2 text-lg font-bold tracking-tight text-brand-600 dark:text-brand-400">ASPIRA</p>
            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              Platform pelaporan infrastruktur publik berbasis AI untuk warga Kota Bogor.
              Transparan · Akuntabel · Terverifikasi.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Platform
            </p>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
              <li>
                <Link href="/laporan" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">
                  Lihat Laporan
                </Link>
              </li>
              <li>
                <Link href="/lapor" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">
                  Buat Laporan
                </Link>
              </li>
              <li>
                <Link href="/pantau" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">
                  City Pulse
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Akun
            </p>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
              <li>
                <Link href="/login" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">
                  Masuk
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">
                  Daftar
                </Link>
              </li>
              <li>
                <Link href="/forgot-password" className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">
                  Lupa Sandi
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Info
            </p>
            <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
              <li>Pilot: Kota Bogor</li>
              <li>Web Dev Competition 2026</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-neutral-100 pt-6 text-xs text-neutral-500 sm:flex-row dark:border-neutral-800 dark:text-neutral-400">
          <p>© {new Date().getFullYear()} ASPIRA — Platform Pelaporan Infrastruktur Kota Bogor</p>
          <p>Dibangun untuk transparansi publik</p>
        </div>
      </div>
    </footer>
  );
}
