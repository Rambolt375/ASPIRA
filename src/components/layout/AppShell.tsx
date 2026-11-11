'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  BarChart3,
  Building2,
  FileText,
  Home,
  LogOut,
  Map,
  Menu,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';
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
      ? { href: '/admin', label: 'Panel Admin', icon: <ShieldCheck className="w-5 h-5" /> }
      : role === 'LOCAL_GOVERNMENT'
        ? { href: '/dinas', label: 'Portal Dinas', icon: <Building2 className="w-5 h-5" /> }
        : role === 'PETUGAS'
          ? { href: '/petugas', label: 'Workspace Petugas', icon: <ShieldCheck className="w-5 h-5" /> }
          : { href: '/beranda', label: 'Beranda', icon: <Home className="w-5 h-5" /> };

  return [
    workspaceItem,
    { href: '/laporan', label: 'Daftar Laporan', icon: <FileText className="w-5 h-5" /> },
    { href: '/komunitas', label: 'Komunitas', icon: <Users className="w-5 h-5" /> },
    { href: '/lapor', label: 'Buat Laporan', icon: <PlusCircle className="w-5 h-5" /> },
    { href: '/peta', label: 'Peta', icon: <Map className="w-5 h-5" /> },
    { href: '/pantau', label: 'City Pulse', icon: <BarChart3 className="w-5 h-5" /> },
    { href: '/asisten', label: 'Asisten AI', icon: <Sparkles className="w-5 h-5" /> },
    { href: '/profil', label: 'Profil', icon: <User className="w-5 h-5" /> },
  ];
}

function isRouteActive(currentPath: string, targetHref: string): boolean {
  if (targetHref === '/beranda') return currentPath === '/beranda';
  if (targetHref === '/lapor') return currentPath === '/lapor' || currentPath === '/laporan/buat';
  if (targetHref === '/laporan')
    return currentPath === '/laporan' || (currentPath.startsWith('/laporan/') && currentPath !== '/laporan/buat');
  return currentPath === targetHref || currentPath.startsWith(targetHref + '/');
}

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = isRouteActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors',
        isActive
          ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-bold'
          : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white',
      ].join(' ')}
    >
      <span className={isActive ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-400 dark:text-neutral-500'}>
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
    <aside className="flex flex-col h-full bg-surface text-neutral-800 dark:text-neutral-100 transition-colors">
      {!hideLogo && (
        <div className="px-4 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <Link href={getRoleWorkspace(user?.role)} onClick={onNavigate} className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400 tracking-tight">ASPIRA</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium border border-neutral-200 dark:border-neutral-700 rounded-full px-2 py-0.5">
              Kota Bogor
            </span>
          </Link>
          <ThemeToggle />
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Navigasi utama">
        {visibleNavItems.map((item) => (
          <NavLink key={item.href} item={item} onClick={onNavigate} />
        ))}
      </nav>

      {user ? (
        <div className="px-3 py-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/60 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-brand-700 dark:text-brand-300">
                {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user.role || user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4 text-neutral-400" />
            Keluar Sesi
          </button>
        </div>
      ) : (
        <div className="px-3 py-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
          <Link
            href="/login"
            onClick={onNavigate}
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            onClick={onNavigate}
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
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
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200/90 dark:border-neutral-800 flex md:hidden shadow-xs pb-[env(safe-area-inset-bottom,0px)] min-h-[3.75rem] items-center"
      aria-label="Navigasi bawah"
    >
      {mobileItems.map((item) => {
        const isActive = isRouteActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium"
          >
            <span className={isActive ? 'text-brand-600 dark:text-brand-400 scale-105 transition-transform' : 'text-neutral-400 dark:text-neutral-500'}>
              {item.icon}
            </span>
            <span className={isActive ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-neutral-600 dark:text-neutral-400 font-medium'}>
              {item.label}
            </span>
          </Link>
        );
      })}
      <Link
        href="/lapor"
        aria-label="Buat laporan"
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 text-[11px]"
      >
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm transition-transform active:scale-95 ${
            isRouteActive(pathname, '/lapor') ? 'bg-brand-700 ring-2 ring-brand-300' : 'bg-brand-600'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
        </span>
        <span className="text-brand-700 dark:text-brand-400 font-bold">Lapor</span>
      </Link>
    </nav>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 bg-surface/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 h-14 flex items-center justify-between shadow-xs">
        <Link href="/beranda" className="flex items-center gap-2">
          <span className="text-xl font-black text-brand-600 dark:text-brand-400 tracking-tight">ASPIRA</span>
          <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full px-2 py-0.5">
            Kota Bogor
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 transition-colors"
            aria-label="Buka menu"
            aria-expanded={open}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-[99999] md:hidden mobile-gpu-layer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
        >
          <div
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-surface dark:bg-neutral-900 shadow-2xl flex flex-col z-20 animate-in slide-in-from-left duration-200 mobile-gpu-layer">
            <div className="flex items-center justify-between px-5 h-16 border-b border-neutral-100 dark:border-neutral-800 bg-surface dark:bg-neutral-900 shrink-0">
              <Link href="/beranda" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <span className="text-xl font-black text-brand-600 dark:text-brand-400 tracking-tight">ASPIRA</span>
                <span className="text-xs text-neutral-600 dark:text-neutral-300 font-bold border border-neutral-200 dark:border-neutral-700 rounded-full px-2 py-0.5">
                  Kota Bogor
                </span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
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
