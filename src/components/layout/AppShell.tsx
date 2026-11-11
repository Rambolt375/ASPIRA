'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { logoutUser } from '@/services/auth';
import { getRoleWorkspace } from '@/lib/roles';
import ThemeToggle from '@/components/theme/ThemeToggle';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function getNavItems(role?: string): NavItem[] {
  const workspaceItem: NavItem =
    role === 'ADMIN'
      ? {
          href: '/admin',
          label: 'Panel Admin',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.27.1.06-.12l-.773.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.27-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        }
      : role === 'LOCAL_GOVERNMENT'
      ? {
          href: '/dinas',
          label: 'Portal Dinas',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.333A2.25 2.25 0 0018.25 8.25H5.75A2.25 2.25 0 003.5 10.333V21h17z" />
            </svg>
          ),
        }
      : role === 'PETUGAS'
      ? {
          href: '/petugas',
          label: 'Workspace Petugas',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        }
      : {
          href: '/beranda',
          label: 'Beranda',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          ),
        };

  return [
    workspaceItem,
    {
      href: '/laporan',
      label: 'Daftar Laporan',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      href: '/komunitas',
      label: 'Komunitas',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
    },
    {
      href: '/lapor',
      label: 'Buat Laporan',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      href: '/peta',
      label: 'Peta',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
      ),
    },
    {
      href: '/pantau',
      label: 'City Pulse',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      href: '/asisten',
      label: 'Asisten AI',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      ),
    },
    {
      href: '/profil',
      label: 'Profil',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
  ];
}

function isRouteActive(currentPath: string, targetHref: string): boolean {
  if (targetHref === '/beranda') {
    return currentPath === '/beranda';
  }
  if (targetHref === '/lapor') {
    return currentPath === '/lapor' || currentPath === '/laporan/buat';
  }
  if (targetHref === '/laporan') {
    return currentPath === '/laporan' || (currentPath.startsWith('/laporan/') && currentPath !== '/laporan/buat');
  }
  return currentPath === targetHref || currentPath.startsWith(targetHref + '/');
}

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = isRouteActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={[
        'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all',
        isActive
          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
      ].join(' ')}
    >
      <span className={isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}>
        {item.icon}
      </span>
      <span>{item.label}</span>
    </Link>
  );
}

export function AppSidebar({ hideLogo = false, onNavigate }: { hideLogo?: boolean; onNavigate?: () => void }) {
  const router = useRouter();
  const { user, clear } = useAuthStore();

  async function handleLogout() {
    await logoutUser();
    clear();
    router.push('/login');
  }

  const permittedNavItems = getNavItems(user?.role);
  const isDinas = user?.role === 'PETUGAS' || user?.role === 'LOCAL_GOVERNMENT' || user?.role === 'ADMIN';
  const visibleNavItems = permittedNavItems.filter((item) => (item.href === '/dinas' ? isDinas : true));

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Logo & Theme Toggle */}
      {!hideLogo && (
        <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Link href={getRoleWorkspace(user?.role)} onClick={onNavigate} className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">ASPIRA</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-700 rounded-full px-2 py-0.5">
              Kota Bogor
            </span>
          </Link>
          <ThemeToggle />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => (
          <NavLink key={item.href} item={item} onClick={onNavigate} />
        ))}
      </nav>

      {/* User section */}
      {user ? (
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.role || user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Keluar Sesi
          </button>
        </div>
      ) : (
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <Link
            href="/login"
            onClick={onNavigate}
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            onClick={onNavigate}
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Daftar
          </Link>
        </div>
      )}
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Hide bottom nav on report creation wizard to give full ergonomic space to form actions
  if (pathname === '/lapor' || pathname === '/laporan/buat') {
    return null;
  }

  const currentNav = getNavItems(user?.role);
  const primaryWorkspace = currentNav[0];
  const isSpecializedRole = user?.role && user.role !== 'USER' && user.role !== 'WARGA';

  const mobileItems = [
    { href: primaryWorkspace.href, label: primaryWorkspace.label, icon: primaryWorkspace.icon },
    ...(isSpecializedRole ? [{ href: '/beranda', label: 'Beranda', icon: getNavItems('USER')[0].icon }] : []),
    { href: '/laporan', label: 'Laporan', icon: currentNav.find((i) => i.href === '/laporan')?.icon },
    { href: '/komunitas', label: 'Komunitas', icon: currentNav.find((i) => i.href === '/komunitas')?.icon },
    { href: '/peta', label: 'Peta', icon: currentNav.find((i) => i.href === '/peta')?.icon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 flex md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)] min-h-[3.75rem] items-center">
      {mobileItems.map((item) => {
        const isActive = isRouteActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium"
          >
            <span className={isActive ? 'text-emerald-600 dark:text-emerald-400 scale-105 transition-transform' : 'text-slate-400 dark:text-slate-500'}>
              {item.icon}
            </span>
            <span className={isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-400 font-medium'}>
              {item.label}
            </span>
          </Link>
        );
      })}
      {/* FAB for report creation */}
      {(() => {
        const isLaporActive = isRouteActive(pathname, '/lapor');
        return (
          <Link
            href="/lapor"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 text-[11px]"
          >
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm transition-transform active:scale-95 ${isLaporActive ? 'bg-emerald-700 ring-2 ring-emerald-300' : 'bg-emerald-600'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              Lapor
            </span>
          </Link>
        );
      })()}
    </nav>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close drawer on route change (render-time state adjustment)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      {/* Top bar — mobile only */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 h-14 flex items-center justify-between shadow-xs">
        <Link href="/beranda" className="flex items-center gap-2">
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">ASPIRA</span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-0.5">
            Kota Bogor
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 transition-colors"
            aria-label="Buka menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </header>

      {/* Drawer overlay with iOS Safari GPU hardware acceleration */}
      {open && (
        <div
          className="fixed inset-0 z-[99999] md:hidden mobile-gpu-layer"
          style={{ transform: 'translate3d(0, 0, 0)', WebkitTransform: 'translate3d(0, 0, 0)' }}
        >
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-20 animate-in slide-in-from-left duration-200 mobile-gpu-layer"
            style={{ transform: 'translate3d(0, 0, 0)', WebkitTransform: 'translate3d(0, 0, 0)' }}
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <Link href="/beranda" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">ASPIRA</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 rounded-full px-2 py-0.5">
                  Kota Bogor
                </span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Tutup menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AppSidebar hideLogo onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
