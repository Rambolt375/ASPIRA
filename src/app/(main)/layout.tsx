import { AppSidebar, MobileHeader, MobileNav } from '@/components/layout/AppShell';

/**
 * Layout for authenticated main app routes: /beranda, /komunitas, /lapor, /dinas, etc.
 * Provides the sidebar (desktop) + mobile header + bottom nav with full theme support.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-150">
      {/* Mobile top bar — sticky, h-14 (56px) */}
      <MobileHeader />

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-neutral-200 dark:border-neutral-800 bg-surface dark:bg-neutral-900 transition-colors duration-150 z-20">
          <AppSidebar />
        </aside>

        {/* Main content
            - Mobile: offset top for sticky MobileHeader (pt-14) + bottom for MobileNav (pb-24)
            - Desktop: no top offset (sidebar not sticky-top), bottom padding 6
        */}
        <main className="flex-1 min-w-0 md:ml-64 pt-14 md:pt-0 pb-24 md:pb-8 min-h-screen overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — fixed bottom-0, h-16 (64px) */}
      <MobileNav />
    </div>
  );
}
