import Link from 'next/link';

/**
 * Layout for auth routes: login, register, forgot-password.
 * Full-screen centered layout — no global Navbar or Footer.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Minimal header */}
      <header className="px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <span className="text-xl font-bold text-emerald-600 tracking-tight">ASPIRA</span>
          <span className="hidden sm:inline-block text-xs text-slate-400 font-medium border border-slate-200 rounded-full px-2 py-0.5">
            Kota Bogor
          </span>
        </Link>
      </header>

      {/* Page content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Minimal footer */}
      <footer className="px-6 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} ASPIRA — Platform Pelaporan Infrastruktur Kota Bogor
      </footer>
    </div>
  );
}
