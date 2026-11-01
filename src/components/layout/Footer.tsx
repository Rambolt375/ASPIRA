import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-lg font-bold text-emerald-600 tracking-tight mb-2">ASPIRA</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Platform pelaporan infrastruktur publik berbasis AI untuk warga Kota Bogor.
              Transparan · Akuntabel · Terverifikasi.
            </p>
          </div>

          {/* Platform */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Platform
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/laporan" className="hover:text-emerald-600 transition-colors">
                  Lihat Laporan
                </Link>
              </li>
              <li>
                <Link href="/laporan/buat" className="hover:text-emerald-600 transition-colors">
                  Buat Laporan
                </Link>
              </li>
            </ul>
          </div>

          {/* Akun */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Akun
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/login" className="hover:text-emerald-600 transition-colors">
                  Masuk
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-emerald-600 transition-colors">
                  Daftar
                </Link>
              </li>
              <li>
                <Link href="/forgot-password" className="hover:text-emerald-600 transition-colors">
                  Lupa Sandi
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Info
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <span className="text-slate-400">Pilot: Kota Bogor</span>
              </li>
              <li>
                <span className="text-slate-400">Web Dev Competition 2026</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} ASPIRA — Platform Pelaporan Infrastruktur Kota Bogor</p>
          <p>Dibuat dengan ❤️ untuk transparansi publik</p>
        </div>
      </div>
    </footer>
  );
}
