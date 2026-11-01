import { AppSidebar, MobileHeader, MobileNav } from '@/components/layout/AppShell';

/**
 * Layout for authenticated main app routes: /beranda, /komunitas, /lapor, etc.
 * Provides the sidebar (desktop) + mobile header + bottom nav.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile top bar */}
      <MobileHeader />

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 bg-white">
          <AppSidebar />
        </aside>

        {/* Main content — offset for sidebar on desktop, bottom nav on mobile */}
        <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
